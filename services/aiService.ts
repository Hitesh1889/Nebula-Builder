/**
 * VISINARO AI SERVICE v3
 * ─────────────────────────────────────────────────────
 * Provider cascade (auto-failover):
 * 1. Groq  — blazing fast, 14,400 req/day, Llama 3.3 70B
 * 2. OpenRouter free models — 6 models as fallback chain
 *
 * Both providers use OpenAI-compatible REST API (pure fetch, no SDK).
 */

import { buildSystemInstruction } from '../constants';
import { GeneratedContent } from '../types';
import { CONTACT_TEMPLATE, FOOTER_TEMPLATE, AUTH_TEMPLATE, AUTH_SCRIPTS } from '../templates';

// ─── Key Storage ──────────────────────────────────────────────────────────────
const LS = { get:(k:string)=>{ try{return localStorage.getItem(k)||'';}catch{return '';} },
             set:(k:string,v:string)=>{ try{localStorage.setItem(k,v.trim());}catch{} },
             del:(k:string)=>{ try{localStorage.removeItem(k);}catch{} } };

const K_GROQ = 'visinaro_groq_key';
const K_OR   = 'visinaro_or_key';

export const getGroqKey       = () => { const e=import.meta.env?.VITE_GROQ_API_KEY||''; return (e&&e.length>10)?e:LS.get(K_GROQ); };
export const getOpenRouterKey = () => { const e=import.meta.env?.VITE_OPENROUTER_API_KEY||''; return (e&&e.length>10)?e:LS.get(K_OR); };
export const saveGroqKey       = (k:string) => LS.set(K_GROQ,k);
export const saveOpenRouterKey = (k:string) => LS.set(K_OR,k);
export const clearGroqKey      = () => LS.del(K_GROQ);
export const clearOpenRouterKey= () => LS.del(K_OR);
export const hasGroqKey       = () => getGroqKey().length > 10;
export const hasOpenRouterKey = () => getOpenRouterKey().length > 10;
export const hasAnyKey        = () => hasGroqKey() || hasOpenRouterKey();

// Legacy shims
export const getApiKey   = getGroqKey;
export const saveApiKey  = saveGroqKey;
export const clearApiKey = () => { clearGroqKey(); clearOpenRouterKey(); };
export const hasApiKey   = hasAnyKey;

// ─── Provider Definitions ─────────────────────────────────────────────────────
interface ModelSpec {
  provider: 'groq' | 'openrouter';
  modelId:  string;
  name:     string;
  estimatedSec: number;
}

const CASCADE: ModelSpec[] = [
  // Groq — fastest (300+ tok/s, LPU hardware)
  { provider:'groq',        modelId:'llama-3.3-70b-versatile',                        name:'Groq Llama 3.3 70B',   estimatedSec:5  },
  { provider:'groq',        modelId:'llama-3.1-8b-instant',                           name:'Groq Llama 3.1 8B',    estimatedSec:3  },
  // OpenRouter free — used only when Groq fails or key missing
  { provider:'openrouter',  modelId:'deepseek/deepseek-chat-v3-0324:free',            name:'DeepSeek V3',          estimatedSec:18 },
  { provider:'openrouter',  modelId:'meta-llama/llama-3.3-70b-instruct:free',         name:'Llama 3.3 70B',        estimatedSec:20 },
  { provider:'openrouter',  modelId:'mistralai/mistral-small-3.1-24b-instruct:free',  name:'Mistral Small 3.1',    estimatedSec:16 },
  { provider:'openrouter',  modelId:'qwen/qwen3-30b-a3b:free',                        name:'Qwen3 30B',            estimatedSec:18 },
  { provider:'openrouter',  modelId:'google/gemma-3-27b-it:free',                     name:'Gemma 3 27B',          estimatedSec:18 },
  { provider:'openrouter',  modelId:'microsoft/phi-4-reasoning-plus:free',            name:'Phi-4 Reasoning',      estimatedSec:20 },
];

// ─── Quota Tracking ───────────────────────────────────────────────────────────
const blocked: Record<string, number> = {};
const block    = (id:string, ms=90_000) => { blocked[id] = Date.now()+ms; };
const isBlocked= (id:string) => (blocked[id]||0) > Date.now();
export const getQuotaWaitSeconds = (id:string) => Math.max(0, Math.ceil(((blocked[id]||0)-Date.now())/1000));

// ─── Streaming completion ─────────────────────────────────────────────────────
async function streamCompletion(
  spec: ModelSpec,
  system: string,
  user: string,
  onChunk: (text:string) => void
): Promise<string> {
  const key = spec.provider==='groq' ? getGroqKey() : getOpenRouterKey();
  if (!key || key.length < 10) throw new Error(`NO_KEY:${spec.provider}`);

  const url = spec.provider==='groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';

  const headers: Record<string,string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${key}`,
  };
  if (spec.provider==='openrouter') {
    headers['HTTP-Referer'] = 'https://visinaro.com';
    headers['X-Title']      = 'Visinaro AI Web Builder';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model:           spec.modelId,
      messages:        [{ role:'system', content:system }, { role:'user', content:user }],
      temperature:     0.25,
      max_tokens:      6000,
      stream:          true,
      response_format: { type:'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(()=>'');
    throw new Error(`HTTP_${res.status}: ${body.slice(0,200)}`);
  }

  const reader  = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '', buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream:true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') continue;
      try {
        const delta = JSON.parse(raw)?.choices?.[0]?.delta?.content ?? '';
        full += delta;
        onChunk(full);
      } catch { /* malformed SSE line — skip */ }
    }
  }
  return full;
}

// ─── Generate Website ─────────────────────────────────────────────────────────
export interface GenerateResult {
  content:      GeneratedContent;
  usedModel:    string;
  usedProvider: string;
}

export const generateWebsite = async (
  prompt: string,
  _preferredModel: string,
  onProgress?: (partial:string, modelName?:string) => void,
): Promise<GenerateResult> => {
  const system = buildSystemInstruction(prompt);
  let lastError: unknown;

  for (const spec of CASCADE) {
    // Skip if no key for this provider
    if (spec.provider==='groq'       && !hasGroqKey())       continue;
    if (spec.provider==='openrouter' && !hasOpenRouterKey()) continue;
    // Skip if quota-blocked
    if (isBlocked(spec.modelId)) continue;

    try {
      onProgress?.('', spec.name);
      const raw = await streamCompletion(spec, system, prompt, chunk => onProgress?.(chunk, spec.name));

      // Parse — be lenient
      let parsed: GeneratedContent;
      try { parsed = JSON.parse(raw); }
      catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) throw new Error('AI returned no JSON object.');
        parsed = JSON.parse(m[0]);
      }
      if (!parsed?.html || parsed.html.trim().length < 100) throw new Error('AI returned empty or too-short HTML.');

      return { content: inject(parsed), usedModel: spec.name, usedProvider: spec.provider };

    } catch (err:any) {
      lastError = err;
      const msg = (err?.message || String(err)).toLowerCase();

      if (msg.includes('no_key:')) continue; // no key for this provider

      if (msg.includes('401') || msg.includes('403') || msg.includes('invalid_api_key') || msg.includes('authentication')) {
        // Auth error — block entire provider
        CASCADE.filter(m=>m.provider===spec.provider).forEach(m=>block(m.modelId,0));
        continue;
      }
      if (msg.includes('429') || msg.includes('rate') || msg.includes('quota') || msg.includes('resource exhausted') || msg.includes('too many') || msg.includes('upstream')) {
        block(spec.modelId, 90_000); continue;
      }
      if (msg.includes('404') || msg.includes('not found') || msg.includes('no endpoints')) {
        block(spec.modelId, 24*3600_000); continue;
      }
      // Other error — skip for 30s
      block(spec.modelId, 30_000);
    }
  }

  // All failed — produce friendly error
  if (!hasGroqKey() && !hasOpenRouterKey()) throw new Error('API_KEY_MISSING');
  const friendlyMsg = (() => {
    const m = (lastError as any)?.message || '';
    if (m.includes('429') || m.includes('rate') || m.includes('quota')) return 'All AI providers are rate-limited right now. Please wait 60 seconds and try again.';
    if (m.includes('401') || m.includes('403')) return 'API key rejected. Please check your keys in Settings.';
    if (m.includes('503') || m.includes('502')) return 'AI providers are temporarily overloaded. Please try again in a moment.';
    return 'Generation failed. Please try again — providers auto-retry through 8 models.';
  })();
  throw new Error(friendlyMsg);
};

// ─── SEO Agent ────────────────────────────────────────────────────────────────
export const optimizeSEO = async (html:string, prompt:string): Promise<{improvedHtml:string; seoReport:string}> => {
  const spec = CASCADE.find(s => !isBlocked(s.modelId) && ((s.provider==='groq'&&hasGroqKey())||(s.provider==='openrouter'&&hasOpenRouterKey())));
  if (!spec) return { improvedHtml:html, seoReport:'No model available.' };
  const sys = `You are an SEO expert. Improve the HTML with proper meta tags, JSON-LD schema, semantic headings, and alt texts. Return ONLY JSON: { "improvedHtml": "...", "seoReport": "list of changes" }`;
  try {
    const raw = await streamCompletion(spec, sys, `Intent: ${prompt}\n\nHTML:\n${html.slice(0,5000)}`, ()=>{});
    const r = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||'{}');
    return { improvedHtml: r.improvedHtml||html, seoReport: r.seoReport||'No changes.' };
  } catch { return { improvedHtml:html, seoReport:'SEO optimization unavailable.' }; }
};

// ─── Prompt Enhancer ─────────────────────────────────────────────────────────
export const enhancePrompt = async (idea:string): Promise<string> => {
  const spec = CASCADE.find(s => !isBlocked(s.modelId) && ((s.provider==='groq'&&hasGroqKey())||(s.provider==='openrouter'&&hasOpenRouterKey())));
  if (!spec) return idea;
  try {
    const raw = await streamCompletion(spec, 'Expand the idea into a detailed website prompt. Output ONLY the expanded prompt, no quotes or preamble.', `Expand: ${idea}`, ()=>{});
    return raw.trim() || idea;
  } catch { return idea; }
};

// ─── Template Injection ───────────────────────────────────────────────────────
function inject(c: GeneratedContent): GeneratedContent {
  if (!c.html) return c;
  c.html = c.html
    .replace(/<!--__TEMPLATE_AUTH__-->/g,    AUTH_TEMPLATE + AUTH_SCRIPTS)
    .replace(/<!--__TEMPLATE_CONTACT__-->/g, CONTACT_TEMPLATE)
    .replace(/<!--__TEMPLATE_FOOTER__-->/g,  FOOTER_TEMPLATE);
  // Guarantee auth, contact, footer exist
  if (!c.html.includes('id="login"'))   c.html = c.html.replace('</body>', AUTH_TEMPLATE + AUTH_SCRIPTS + '</body>');
  if (!c.html.includes('id="contact"')) c.html = c.html.replace('</body>', CONTACT_TEMPLATE + '</body>');
  if (!c.html.includes('<footer'))      c.html = c.html.replace('</body>', FOOTER_TEMPLATE + '</body>');
  return c;
}
