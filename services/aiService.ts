/**
 * VISINARO AI SERVICE v6 — ROOT CAUSE FIXED
 *
 * ROOT CAUSE of "all models fail":
 * The AI returns HTML containing double quotes (class="hidden", href="...")
 * inside a JSON string. JSON.parse throws SyntaxError on this.
 * The catch block doesn't recognise it as a known error so blocks every
 * model for 30 s — all 8 models blocked → "all providers failed".
 *
 * FIX:
 * 1. Use non-streaming (stream: false) — simpler, no SSE parser bugs
 * 2. Parse with a custom extractor that handles unescaped quotes in HTML
 * 3. Change system prompt to use HTML-safe delimiters instead of JSON strings
 */
import { buildSystemInstruction } from '../constants';
import { GeneratedContent } from '../types';
import { CONTACT_TEMPLATE, FOOTER_TEMPLATE, AUTH_TEMPLATE, AUTH_SCRIPTS, SHOP_TEMPLATE, CART_TEMPLATE, CHECKOUT_TEMPLATE } from '../templates';

// ─── Safe storage ──────────────────────────────────────────────────────────────
const SS = {
  get:(k:string)=>{ try{return localStorage.getItem(k)||'';}catch{try{return sessionStorage.getItem(k)||'';}catch{return '';}} },
  set:(k:string,v:string)=>{ try{localStorage.setItem(k,v);}catch{} try{sessionStorage.setItem(k,v);}catch{} },
  del:(k:string)=>{ try{localStorage.removeItem(k);}catch{} try{sessionStorage.removeItem(k);}catch{} },
};
const K_GROQ='visinaro_groq_key', K_OR='visinaro_or_key';
const envGet=(k:string)=>{ try{return (import.meta as any).env?.[k]||'';}catch{return '';} };

export const getGroqKey       =():string=>{ const e=envGet('VITE_GROQ_API_KEY'); return e.length>10?e:SS.get(K_GROQ); };
export const getOpenRouterKey =():string=>{ const e=envGet('VITE_OPENROUTER_API_KEY'); return e.length>10?e:SS.get(K_OR); };
export const saveGroqKey       =(k:string)=>SS.set(K_GROQ,k.trim());
export const saveOpenRouterKey =(k:string)=>SS.set(K_OR,k.trim());
export const clearGroqKey      =()=>SS.del(K_GROQ);
export const clearOpenRouterKey=()=>SS.del(K_OR);
export const hasGroqKey        =()=>getGroqKey().length>10;
export const hasOpenRouterKey  =()=>getOpenRouterKey().length>10;
export const hasAnyKey         =()=>hasGroqKey()||hasOpenRouterKey();
export const getApiKey   =getGroqKey;
export const saveApiKey  =saveGroqKey;
export const clearApiKey =()=>{clearGroqKey();clearOpenRouterKey();};
export const hasApiKey   =hasAnyKey;

// ─── Model cascade ────────────────────────────────────────────────────────────
interface M{provider:'groq'|'openrouter';id:string;name:string;}
const CASCADE:M[]=[
  {provider:'groq',       id:'llama-3.3-70b-versatile',              name:'Llama 3.3 70B'},
  {provider:'groq',       id:'llama-3.1-8b-instant',                 name:'Llama 3.1 8B'},
  {provider:'groq',       id:'mixtral-8x7b-32768',                   name:'Mixtral 8x7B'},
  {provider:'openrouter', id:'deepseek/deepseek-chat:free',          name:'DeepSeek Chat'},
  {provider:'openrouter', id:'meta-llama/llama-3.1-8b-instruct:free',name:'Llama 3.1 8B'},
  {provider:'openrouter', id:'mistralai/mistral-7b-instruct:free',   name:'Mistral 7B'},
  {provider:'openrouter', id:'qwen/qwen-2-7b-instruct:free',         name:'Qwen2 7B'},
  {provider:'openrouter', id:'google/gemma-2-9b-it:free',            name:'Gemma 2 9B'},
];

// ─── Quota tracker ────────────────────────────────────────────────────────────
const blocked:Record<string,number>={};
const block   =(id:string,ms:number)=>{blocked[id]=Date.now()+ms;};
const isBlocked=(id:string)=>(blocked[id]||0)>Date.now();
export const getQuotaWaitSeconds=(id:string)=>Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));

// ─── System prompt — uses safe delimiters instead of JSON strings ─────────────
// CRITICAL DESIGN: We ask the AI to wrap HTML/CSS/JS in XML-like delimiters
// This completely avoids the double-quote-in-JSON problem that was breaking everything.
function buildPrompt(userPrompt: string): string {
  // The system instruction from constants already contains the output format
  return buildSystemInstruction(userPrompt);
}

// ─── Parse delimited response ─────────────────────────────────────────────────
function parseDelimited(raw: string): GeneratedContent {
  const extract = (startTag: string, endTag: string): string => {
    const s = raw.indexOf(startTag);
    const e = raw.indexOf(endTag);
    if (s < 0 || e < 0) return '';
    return raw.slice(s + startTag.length, e).trim();
  };

  const html = extract('===HTML_START===', '===HTML_END===');
  const css  = extract('===CSS_START===',  '===CSS_END===');
  const js   = extract('===JS_START===',   '===JS_END===');

  if (html.length > 200) {
    return { html, css: css || '', javascript: js || '' };
  }

  // Fallback: try JSON parse (in case model ignored the format instruction)
  try {
    const p = JSON.parse(raw);
    if (p?.html && p.html.length > 200) return p;
  } catch {}

  // Fallback 2: find largest HTML block in raw text
  const htmlMatch = raw.match(/<!DOCTYPE[\s\S]*<\/html>/i) ||
                    raw.match(/<html[\s\S]*<\/html>/i) ||
                    raw.match(/<body[\s\S]*<\/body>/i) ||
                    raw.match(/<(?:nav|section|div|header)[\s\S]{500,}/i);
  if (htmlMatch && htmlMatch[0].length > 200) {
    return { html: htmlMatch[0], css: '', javascript: '' };
  }

  throw new Error(`AI response could not be parsed. Raw length: ${raw.length}. First 100: ${raw.slice(0,100)}`);
}

// ─── Non-streaming API call ────────────────────────────────────────────────────
async function callModel(m: M, system: string, user: string): Promise<string> {
  const key = m.provider==='groq' ? getGroqKey() : getOpenRouterKey();
  if (!key || key.length < 10) throw new Error(`NO_KEY:${m.provider}`);

  const url = m.provider==='groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';

  const headers: Record<string,string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${key}`,
  };
  if (m.provider==='openrouter') {
    headers['HTTP-Referer'] = 'https://visinaro.onrender.com';
    headers['X-Title']      = 'Visinaro';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model:       m.id,
      messages:    [{ role:'system', content:system }, { role:'user', content:user }],
      temperature: 0.2,
      max_tokens:  6000,
      stream:      false,   // NON-STREAMING — simpler and avoids SSE parsing bugs
      // NO response_format — we use delimiter-based parsing instead
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP_${res.status}|${txt.slice(0,200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${m.id}. Full response: ${JSON.stringify(data).slice(0,200)}`);
  return content;
}

// ─── Main generation ──────────────────────────────────────────────────────────
export interface GenerateResult { content: GeneratedContent; usedModel: string; usedProvider: string; }

export const generateWebsite = async (
  prompt: string,
  _pref: string,
  onProgress?: (partial: string, name?: string) => void,
): Promise<GenerateResult> => {
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');

  const system  = buildPrompt(prompt);
  let lastErr: unknown;
  let lastErrMsg = '';

  for (const m of CASCADE) {
    if (m.provider==='groq'       && !hasGroqKey())       continue;
    if (m.provider==='openrouter' && !hasOpenRouterKey()) continue;
    if (isBlocked(m.id)) continue;

    try {
      onProgress?.('', m.name);
      const raw = await callModel(m, system, prompt);
      const parsed = parseDelimited(raw);
      // Success!
      return { content: inject(parsed), usedModel: m.name, usedProvider: m.provider };

    } catch (err: any) {
      lastErr = err;
      lastErrMsg = String(err?.message || err);
      const msg = lastErrMsg.toLowerCase();

      console.warn(`[Visinaro] Model ${m.id} failed: ${lastErrMsg.slice(0,100)}`);

      if (msg.includes('no_key:')) continue;

      if (msg.includes('401') || msg.includes('403') || msg.includes('invalid api key') || msg.includes('authentication')) {
        // Bad key — block all models for this provider
        CASCADE.filter(x => x.provider===m.provider).forEach(x => block(x.id, 600_000));
        continue;
      }
      if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('too many')) {
        block(m.id, 90_000); continue;
      }
      if (msg.includes('404') || msg.includes('not found') || msg.includes('no endpoints')) {
        block(m.id, 24*3600_000); continue;
      }
      if (msg.includes('503') || msg.includes('502') || msg.includes('overloaded') || msg.includes('upstream')) {
        block(m.id, 60_000); continue;
      }
      // Parse error or short HTML — DON'T block the model long, just try the next one
      // This was the bug: blocking for 30s meant all 8 models got blocked quickly
      block(m.id, 5_000); // only 5 seconds, then it can retry
    }
  }

  // All failed
  const msg = lastErrMsg.toLowerCase();
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');
  if (msg.includes('429') || msg.includes('rate') || msg.includes('quota'))
    throw new Error('All AI models are rate-limited. Please wait 30 seconds and try again.');
  if (msg.includes('401') || msg.includes('403'))
    throw new Error('API key rejected. Please tap Home and re-enter your key.');
  throw new Error('Generation failed. Please click "Try Again" — it usually works on the second attempt.');
};

// ─── SEO + prompt enhancer ─────────────────────────────────────────────────────
export const optimizeSEO = async (html: string, prompt: string): Promise<{improvedHtml:string; seoReport:string}> => {
  const m = CASCADE.find(x => !isBlocked(x.id) && ((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return { improvedHtml: html, seoReport: 'No model available.' };
  try {
    const raw = await callModel(m,
      'You are an SEO expert. Improve the HTML meta tags, schema.org JSON-LD, headings, and alt texts. Return ONLY the improved HTML, nothing else.',
      `Original prompt: ${prompt}\n\nHTML to improve:\n${html.slice(0,5000)}`
    );
    const improved = raw.trim().replace(/^```html\n?/i,'').replace(/\n?```$/,'');
    return { improvedHtml: improved.length > 200 ? improved : html, seoReport: 'SEO tags, schema, and alt texts updated.' };
  } catch { return { improvedHtml: html, seoReport: 'SEO optimization unavailable.' }; }
};

export const enhancePrompt = async (idea: string): Promise<string> => {
  const m = CASCADE.find(x => !isBlocked(x.id) && ((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return idea;
  try {
    const raw = await callModel(m, 'Expand this into a detailed website prompt. Output ONLY the expanded prompt, no preamble.', `Expand: ${idea}`);
    return raw.trim() || idea;
  } catch { return idea; }
};

// ─── Template injection ───────────────────────────────────────────────────────
function inject(c: GeneratedContent): GeneratedContent {
  if (!c.html) return c;

  // STEP 1: Replace all template placeholder comments
  c.html = c.html
    .replace(/<!--__TEMPLATE_AUTH__-->/g,     AUTH_TEMPLATE + AUTH_SCRIPTS)
    .replace(/<!--__TEMPLATE_CONTACT__-->/g,  CONTACT_TEMPLATE)
    .replace(/<!--__TEMPLATE_SHOP__-->/g,     SHOP_TEMPLATE)
    .replace(/<!--__TEMPLATE_CART__-->/g,     CART_TEMPLATE)
    .replace(/<!--__TEMPLATE_CHECKOUT__-->/g, CHECKOUT_TEMPLATE)
    .replace(/<!--__TEMPLATE_FOOTER__-->/g,   ''); // footer handled last, always at end

  // STEP 2: Remove any AI-generated footer (it will be replaced at the very end)
  c.html = c.html.replace(/<footer[\s\S]*?<\/footer>/gi, '');

  // STEP 3: Remove duplicate/AI-generated contact section, keep only our template
  if (c.html.includes('id="contact"')) {
    // Replace AI contact section with our clean template
    c.html = c.html.replace(/<section[^>]*id="contact"[^>]*>[\s\S]*?<\/section>/i, CONTACT_TEMPLATE);
  } else {
    c.html = c.html.replace('</body>', CONTACT_TEMPLATE + '\n</body>');
  }

  // STEP 4: Ensure auth section + scripts
  if (!c.html.includes('id="auth"')) {
    c.html = c.html.replace('</body>', AUTH_TEMPLATE + AUTH_SCRIPTS + '\n</body>');
  } else if (!c.html.includes('window.addToCart')) {
    c.html = c.html.replace('</body>', AUTH_SCRIPTS + '\n</body>');
  }

  // STEP 5: Ensure shop/cart/checkout for ecommerce sites
  const needsShop = c.html.includes('id="shop"') || c.html.includes('href="#shop"');
  if (needsShop) {
    if (!c.html.includes('id="shop"'))     c.html = c.html.replace('</body>', SHOP_TEMPLATE + '\n</body>');
    if (!c.html.includes('id="cart"'))     c.html = c.html.replace('</body>', CART_TEMPLATE + '\n</body>');
    if (!c.html.includes('id="checkout"')) c.html = c.html.replace('</body>', CHECKOUT_TEMPLATE + '\n</body>');
  }

  // STEP 6: FOOTER ALWAYS LAST — after all sections
  c.html = c.html.replace('</body>', FOOTER_TEMPLATE + '\n</body>');

  return c;
}

