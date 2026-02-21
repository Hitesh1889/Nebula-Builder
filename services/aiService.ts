/**
 * VISINARO AI SERVICE v4
 * Provider cascade: Groq (primary) → OpenRouter free models (fallback)
 * Pure fetch — no SDK required.
 */
import { buildSystemInstruction } from '../constants';
import { GeneratedContent } from '../types';
import { CONTACT_TEMPLATE, FOOTER_TEMPLATE, AUTH_TEMPLATE, AUTH_SCRIPTS } from '../templates';

// ─── Safe storage (works even when tracking prevention blocks localStorage) ───
const SS = {
  get(k: string) { try { return localStorage.getItem(k)||''; } catch { try { return sessionStorage.getItem(k)||''; } catch { return ''; } } },
  set(k: string, v: string) { try { localStorage.setItem(k,v); } catch {} try { sessionStorage.setItem(k,v); } catch {} },
  del(k: string) { try { localStorage.removeItem(k); } catch {} try { sessionStorage.removeItem(k); } catch {} },
};

const K_GROQ = 'visinaro_groq_key';
const K_OR   = 'visinaro_or_key';

// Read from env (baked in at build) or from storage
const envGet = (key: string) => { try { return (import.meta as any).env?.[key] || ''; } catch { return ''; } };

export const getGroqKey       = (): string => { const e = envGet('VITE_GROQ_API_KEY'); return (e && e.length > 10) ? e : SS.get(K_GROQ); };
export const getOpenRouterKey = (): string => { const e = envGet('VITE_OPENROUTER_API_KEY'); return (e && e.length > 10) ? e : SS.get(K_OR); };
export const saveGroqKey       = (k: string) => SS.set(K_GROQ, k.trim());
export const saveOpenRouterKey = (k: string) => SS.set(K_OR, k.trim());
export const clearGroqKey      = () => SS.del(K_GROQ);
export const clearOpenRouterKey= () => SS.del(K_OR);
export const hasGroqKey        = () => getGroqKey().length > 10;
export const hasOpenRouterKey  = () => getOpenRouterKey().length > 10;
export const hasAnyKey         = () => hasGroqKey() || hasOpenRouterKey();

// Legacy shims used by other components
export const getApiKey   = getGroqKey;
export const saveApiKey  = saveGroqKey;
export const clearApiKey = () => { clearGroqKey(); clearOpenRouterKey(); };
export const hasApiKey   = hasAnyKey;

// ─── Provider cascade ─────────────────────────────────────────────────────────
interface Model { provider: 'groq'|'openrouter'; id: string; name: string; sec: number; }

const CASCADE: Model[] = [
  // Groq — fastest (300+ tok/s, LPU hardware), verified model IDs
  { provider:'groq',       id:'llama-3.3-70b-versatile',            name:'Llama 3.3 70B',    sec:5  },
  { provider:'groq',       id:'llama-3.1-8b-instant',               name:'Llama 3.1 8B',     sec:3  },
  { provider:'groq',       id:'mixtral-8x7b-32768',                 name:'Mixtral 8x7B',     sec:6  },
  // OpenRouter — verified FREE model IDs (as of Feb 2026)
  { provider:'openrouter', id:'deepseek/deepseek-chat:free',        name:'DeepSeek V3',      sec:20 },
  { provider:'openrouter', id:'meta-llama/llama-3.1-8b-instruct:free', name:'Llama 3.1 8B', sec:18 },
  { provider:'openrouter', id:'mistralai/mistral-7b-instruct:free', name:'Mistral 7B',       sec:15 },
  { provider:'openrouter', id:'qwen/qwen-2-7b-instruct:free',       name:'Qwen2 7B',         sec:16 },
  { provider:'openrouter', id:'google/gemma-2-9b-it:free',          name:'Gemma 2 9B',       sec:17 },
];

// ─── Quota tracker ────────────────────────────────────────────────────────────
const blocked: Record<string,number> = {};
const block    = (id:string, ms=90_000) => { blocked[id] = Date.now()+ms; };
const isBlocked= (id:string) => (blocked[id]||0) > Date.now();
export const getQuotaWaitSeconds = (id:string) => Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));

// ─── Stream one model ─────────────────────────────────────────────────────────
async function stream(m: Model, system: string, user: string, onChunk:(t:string)=>void): Promise<string> {
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
    headers['HTTP-Referer'] = 'https://visinaro.com';
    headers['X-Title']      = 'Visinaro';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model:           m.id,
      messages:        [{ role:'system', content:system },{ role:'user', content:user }],
      temperature:     0.25,
      max_tokens:      6000,
      stream:          true,
      response_format: { type:'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(()=>'');
    throw new Error(`HTTP_${res.status}|${body.slice(0,120)}`);
  }

  const reader  = res.body!.getReader();
  const decoder = new TextDecoder();
  let full='', buf='';

  while(true){
    const {done,value} = await reader.read();
    if(done) break;
    buf += decoder.decode(value,{stream:true});
    const lines = buf.split('\n'); buf = lines.pop()??'';
    for(const line of lines){
      if(!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if(raw==='[DONE]') continue;
      try{ full += JSON.parse(raw)?.choices?.[0]?.delta?.content??''; onChunk(full); }catch{}
    }
  }
  return full;
}

// ─── Main generation ──────────────────────────────────────────────────────────
export interface GenerateResult { content:GeneratedContent; usedModel:string; usedProvider:string; }

export const generateWebsite = async (
  prompt: string,
  _pref: string,
  onProgress?: (partial:string, name?:string) => void,
): Promise<GenerateResult> => {
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');

  const system = buildSystemInstruction(prompt);
  let lastErr: unknown;

  for(const m of CASCADE){
    if(m.provider==='groq'       && !hasGroqKey())       continue;
    if(m.provider==='openrouter' && !hasOpenRouterKey()) continue;
    if(isBlocked(m.id)) continue;

    try{
      onProgress?.('', m.name);
      const raw = await stream(m, system, prompt, chunk => onProgress?.(chunk, m.name));

      let parsed: GeneratedContent;
      try{ parsed = JSON.parse(raw); }
      catch{ const match = raw.match(/\{[\s\S]*\}/); if(!match) throw new Error('No JSON in response.'); parsed=JSON.parse(match[0]); }

      if(!parsed?.html || parsed.html.trim().length < 200) throw new Error('Response too short or empty.');

      return { content: inject(parsed), usedModel: m.name, usedProvider: m.provider };

    }catch(err:any){
      lastErr = err;
      const msg = String(err?.message||err).toLowerCase();
      if(msg.includes('no_key:')) continue;
      if(msg.includes('401')||msg.includes('403')||msg.includes('authentication')||msg.includes('invalid api key')){ CASCADE.filter(x=>x.provider===m.provider).forEach(x=>block(x.id,300_000)); continue; }
      if(msg.includes('429')||msg.includes('rate')||msg.includes('quota')||msg.includes('too many')){ block(m.id,90_000); continue; }
      if(msg.includes('404')||msg.includes('not found')||msg.includes('no endpoints')){ block(m.id,24*3600_000); continue; }
      if(msg.includes('503')||msg.includes('502')||msg.includes('overloaded')){ block(m.id,60_000); continue; }
      block(m.id,30_000);
    }
  }

  // All failed — friendly message
  const m = String((lastErr as any)?.message||'').toLowerCase();
  if(m.includes('429')||m.includes('rate')||m.includes('quota')) throw new Error('All AI providers are rate-limited right now. Please wait a moment and try again.');
  if(m.includes('401')||m.includes('403')) throw new Error('API key was rejected. Please update your keys.');
  throw new Error('Generation failed — all providers unavailable. Please try again in a few seconds.');
};

// ─── SEO ─────────────────────────────────────────────────────────────────────
export const optimizeSEO = async (html:string, prompt:string): Promise<{improvedHtml:string;seoReport:string}> => {
  const m = CASCADE.find(m=>!isBlocked(m.id)&&((m.provider==='groq'&&hasGroqKey())||(m.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return {improvedHtml:html,seoReport:'No model available.'};
  try{
    const raw = await stream(m,'You are an SEO expert. Return ONLY JSON: {"improvedHtml":"...","seoReport":"..."}',`Intent: ${prompt}\n\nHTML:\n${html.slice(0,5000)}`,()=>{});
    const r = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||'{}');
    return {improvedHtml:r.improvedHtml||html, seoReport:r.seoReport||'Done.'};
  }catch{return {improvedHtml:html,seoReport:'Unavailable.'};}
};

// ─── Prompt enhancer ──────────────────────────────────────────────────────────
export const enhancePrompt = async (idea:string): Promise<string> => {
  const m = CASCADE.find(m=>!isBlocked(m.id)&&((m.provider==='groq'&&hasGroqKey())||(m.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return idea;
  try{ const r = await stream(m,'Expand the idea into a detailed website prompt. Output ONLY the expanded prompt text.', `Expand: ${idea}`,()=>{}); return r.trim()||idea; }
  catch{ return idea; }
};

// ─── Template injection ───────────────────────────────────────────────────────
function inject(c: GeneratedContent): GeneratedContent {
  if(!c.html) return c;
  c.html = c.html
    .replace(/<!--__TEMPLATE_AUTH__-->/g,    AUTH_TEMPLATE+AUTH_SCRIPTS)
    .replace(/<!--__TEMPLATE_CONTACT__-->/g, CONTACT_TEMPLATE)
    .replace(/<!--__TEMPLATE_FOOTER__-->/g,  FOOTER_TEMPLATE);
  if(!c.html.includes('id="login"'))   c.html = c.html.replace('</body>', AUTH_TEMPLATE+AUTH_SCRIPTS+'</body>');
  if(!c.html.includes('id="contact"')) c.html = c.html.replace('</body>', CONTACT_TEMPLATE+'</body>');
  if(!c.html.includes('<footer'))      c.html = c.html.replace('</body>', FOOTER_TEMPLATE+'</body>');
  return c;
}
