
/**
 * VISINARO AI SERVICE — Groq + OpenRouter (No Gemini)
 * ─────────────────────────────────────────────────────
 * Provider chain (in order, automatic failover):
 *
 * 1. GROQ  — blazing fast (300+ tokens/sec, LPU hardware)
 *    ↳ llama-3.3-70b-versatile   → 14,400 req/day  best quality
 *    ↳ llama-3.1-8b-instant      → 14,400 req/day  fastest fallback
 *
 * 2. OPENROUTER free models  — 6 different models as fallback chain
 *    ↳ deepseek/deepseek-chat-v3-0324:free       → most capable
 *    ↳ meta-llama/llama-3.3-70b-instruct:free    → strong quality
 *    ↳ mistralai/mistral-small-3.1-24b-instruct:free
 *    ↳ qwen/qwen3-30b-a3b:free
 *    ↳ microsoft/phi-4-reasoning-plus:free
 *    ↳ google/gemma-3-27b-it:free
 *
 * Both providers use the standard OpenAI-compatible REST API.
 * No SDKs needed — pure fetch.
 */

import { buildSystemInstruction } from "../constants";
import { GeneratedContent } from "../types";
import { AUTH_TEMPLATE, SHOP_TEMPLATE, CART_TEMPLATE, CHECKOUT_TEMPLATE, CONTACT_TEMPLATE, FOOTER_TEMPLATE } from "../templates";

// ─────────────────────────────────────────────────────────────────────────────
// KEY STORAGE
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_KEY_STORAGE   = 'visinaro_groq_key';
const OR_KEY_STORAGE     = 'visinaro_or_key';

const readLS = (key: string) => { try { return localStorage.getItem(key) || ''; } catch { return ''; } };
const writeLS = (key: string, val: string) => { try { localStorage.setItem(key, val.trim()); } catch {} };
const removeLS = (key: string) => { try { localStorage.removeItem(key); } catch {} };

export const getGroqKey = (): string => {
  const env = process.env.GROQ_API_KEY || '';
  if (env && env.length > 10) return env;
  return readLS(GROQ_KEY_STORAGE);
};
export const getOpenRouterKey = (): string => {
  const env = process.env.OPENROUTER_API_KEY || '';
  if (env && env.length > 10) return env;
  return readLS(OR_KEY_STORAGE);
};

export const saveGroqKey       = (k: string) => writeLS(GROQ_KEY_STORAGE, k);
export const saveOpenRouterKey = (k: string) => writeLS(OR_KEY_STORAGE, k);
export const clearGroqKey      = () => removeLS(GROQ_KEY_STORAGE);
export const clearOpenRouterKey= () => removeLS(OR_KEY_STORAGE);

export const hasGroqKey       = () => getGroqKey().length > 10;
export const hasOpenRouterKey = () => getOpenRouterKey().length > 10;
export const hasAnyKey        = () => hasGroqKey() || hasOpenRouterKey();

// Legacy compat shims (so App.tsx doesn't need refactoring)
export const getApiKey  = getGroqKey;
export const saveApiKey = saveGroqKey;
export const clearApiKey = () => { clearGroqKey(); clearOpenRouterKey(); };
export const hasApiKey  = hasAnyKey;

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface ModelSpec {
  provider: 'groq' | 'openrouter';
  modelId: string;
  displayName: string;
  tokensPerSec: number;   // approximate
  reqPerDay: number;
}

// The full cascade list — tried top-to-bottom
const MODEL_CASCADE: ModelSpec[] = [
  // ── GROQ (fastest) ─────────────────────────────────────────────────────
  { provider: 'groq', modelId: 'llama-3.3-70b-versatile',   displayName: '⚡ Groq Llama 3.3 70B',  tokensPerSec: 280, reqPerDay: 14400 },
  { provider: 'groq', modelId: 'llama-3.1-8b-instant',      displayName: '⚡ Groq Llama 3.1 8B',   tokensPerSec: 750, reqPerDay: 14400 },
  // ── OPENROUTER free models (fallback) ──────────────────────────────────
  { provider: 'openrouter', modelId: 'deepseek/deepseek-chat-v3-0324:free',          displayName: '🤖 DeepSeek V3',       tokensPerSec: 60,  reqPerDay: 200 },
  { provider: 'openrouter', modelId: 'meta-llama/llama-3.3-70b-instruct:free',       displayName: '🦙 Llama 3.3 70B',     tokensPerSec: 50,  reqPerDay: 200 },
  { provider: 'openrouter', modelId: 'mistralai/mistral-small-3.1-24b-instruct:free',displayName: '🌊 Mistral Small 3.1', tokensPerSec: 70,  reqPerDay: 200 },
  { provider: 'openrouter', modelId: 'qwen/qwen3-30b-a3b:free',                      displayName: '🔮 Qwen3 30B',         tokensPerSec: 60,  reqPerDay: 200 },
  { provider: 'openrouter', modelId: 'microsoft/phi-4-reasoning-plus:free',          displayName: '🔷 Phi-4 Reasoning',   tokensPerSec: 55,  reqPerDay: 200 },
  { provider: 'openrouter', modelId: 'google/gemma-3-27b-it:free',                   displayName: '💎 Gemma 3 27B',       tokensPerSec: 65,  reqPerDay: 200 },
];

// Exported for UI display
export const PROVIDERS = [
  { id: 'groq',        name: '⚡ Groq',        speed: '300+ tok/s', limit: '14,400 req/day', badge: 'Fastest' },
  { id: 'openrouter',  name: '🔀 OpenRouter',  speed: '50-70 tok/s', limit: '200 req/day × 6 models', badge: 'Backup' },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUOTA TRACKING  (per modelId)
// ─────────────────────────────────────────────────────────────────────────────

const quotaMap: Record<string, number> = {};  // modelId → unblock timestamp
const markBlocked  = (id: string, ms = 90_000) => { quotaMap[id] = Date.now() + ms; };
const isBlocked    = (id: string) => (quotaMap[id] || 0) > Date.now();

export const getQuotaWaitSeconds = (modelId: string): number =>
  Math.max(0, Math.ceil(((quotaMap[modelId] || 0) - Date.now()) / 1000));

// ─────────────────────────────────────────────────────────────────────────────
// HTTP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_URL         = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_URL   = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL         = 'https://visinaro.com';

const makeHeaders = (spec: ModelSpec): Record<string, string> => {
  const key = spec.provider === 'groq' ? getGroqKey() : getOpenRouterKey();
  const h: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${key}`,
  };
  if (spec.provider === 'openrouter') {
    h['HTTP-Referer'] = SITE_URL;
    h['X-Title']      = 'Visinaro AI Web Builder';
  }
  return h;
};

const endpointFor = (spec: ModelSpec) =>
  spec.provider === 'groq' ? GROQ_URL : OPENROUTER_URL;

// ─────────────────────────────────────────────────────────────────────────────
// STREAMING PARSER  (standard OpenAI SSE format)
// ─────────────────────────────────────────────────────────────────────────────

async function streamCompletion(
  spec: ModelSpec,
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const key = spec.provider === 'groq' ? getGroqKey() : getOpenRouterKey();
  if (!key) throw new Error(spec.provider === 'groq' ? 'NO_GROQ_KEY' : 'NO_OR_KEY');

  const res = await fetch(endpointFor(spec), {
    method: 'POST',
    headers: makeHeaders(spec),
    body: JSON.stringify({
      model:    spec.modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature:         0.3,
      max_tokens:          4096,
      stream:              true,
      // JSON mode — both Groq and OpenRouter honour this for capable models
      response_format:     { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP_${res.status}: ${body.slice(0, 300)}`);
  }

  const reader  = res.body!.getReader();
  const decoder = new TextDecoder();
  let   full    = '';
  let   buf     = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';               // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') continue;
      try {
        const delta = JSON.parse(raw)?.choices?.[0]?.delta?.content ?? '';
        full += delta;
        onChunk(full);
      } catch { /* ignore malformed SSE line */ }
    }
  }

  return full;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateResult {
  content:       GeneratedContent;
  usedModel:     string;
  usedProvider:  string;
  tokensPerSec:  number;
}

export const generateWebsite = async (
  prompt: string,
  _preferredModelId: string,   // kept for API compat — we always start from top of cascade
  onProgress?: (partial: string, activeModelName?: string) => void,
): Promise<GenerateResult> => {

  let lastError: unknown;

  for (const spec of MODEL_CASCADE) {
    // Skip if no key for this provider
    if (spec.provider === 'groq'        && !hasGroqKey())       continue;
    if (spec.provider === 'openrouter'  && !hasOpenRouterKey()) continue;
    // Skip if quota-blocked
    if (isBlocked(spec.modelId)) continue;

    try {
      onProgress?.('', spec.displayName);

      const systemInstruction = buildSystemInstruction(prompt);
      const raw = await streamCompletion(
        spec,
        systemInstruction,
        prompt,
        (partial) => onProgress?.(partial, spec.displayName),
      );

      // Parse JSON — be lenient (extract first {...} block if model adds preamble)
      let parsed: GeneratedContent;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('AI returned no JSON object.');
        parsed = JSON.parse(match[0]);
      }

      if (!parsed?.html) throw new Error('AI returned empty HTML.');

      return {
        content:      injectTemplates(parsed, prompt),
        usedModel:    spec.modelId,
        usedProvider: spec.provider,
        tokensPerSec: spec.tokensPerSec,
      };

    } catch (err: any) {
      lastError = err;
      const msg = (err?.message || String(err)).toLowerCase();
      console.warn(`[${spec.provider}/${spec.modelId}] failed:`, msg.slice(0, 150));

      // Auth errors — no point retrying this provider
      if (msg.includes('401') || msg.includes('403') || msg.includes('no_groq_key') || msg.includes('no_or_key')) {
        // Mark all models of this provider as temporarily blocked
        MODEL_CASCADE.filter(m => m.provider === spec.provider).forEach(m => markBlocked(m.modelId, 0));
        continue;
      }

      // Quota / rate limit — block this model for 90s and try next
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('resource exhausted')) {
        markBlocked(spec.modelId, 90_000);
        continue;
      }

      // Model not found — skip permanently
      if (msg.includes('404') || msg.includes('not found')) {
        markBlocked(spec.modelId, 24 * 3600_000);
        continue;
      }

      // Network / server error — skip this model for 30s
      markBlocked(spec.modelId, 30_000);
    }
  }

  // ── All models exhausted ───────────────────────────────────────────────
  // Check if it's a key issue
  if (!hasGroqKey() && !hasOpenRouterKey()) throw new Error('API_KEY_MISSING');

  // Check if all are quota-blocked
  const available = MODEL_CASCADE.filter(s =>
    (s.provider === 'groq' && hasGroqKey()) || (s.provider === 'openrouter' && hasOpenRouterKey())
  );
  const allBlocked = available.every(s => isBlocked(s.modelId));
  if (allBlocked) {
    const minWait = Math.min(...available.map(s => getQuotaWaitSeconds(s.modelId)));
    throw new Error(`QUOTA_ALL_BLOCKED:${minWait}`);
  }

  const msg = (lastError as any)?.message || 'All AI providers failed. Please try again.';
  throw new Error(msg);
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO AGENT  (uses first available model)
// ─────────────────────────────────────────────────────────────────────────────

export const optimizeSEO = async (
  html: string,
  userPrompt: string,
): Promise<{ improvedHtml: string; seoReport: string }> => {
  const spec = MODEL_CASCADE.find(s =>
    !isBlocked(s.modelId) &&
    ((s.provider === 'groq' && hasGroqKey()) || (s.provider === 'openrouter' && hasOpenRouterKey()))
  );
  if (!spec) return { improvedHtml: html, seoReport: 'No model available for SEO.' };

  const seoSystemPrompt = `You are an elite SEO specialist. Analyze the HTML and:
1. Add/improve meta tags (title, description, og:tags, twitter:card, canonical)
2. Add JSON-LD structured data (WebPage or LocalBusiness)
3. Fix semantic HTML (h1→h6 hierarchy, aria-labels, img alt texts)
4. Add rel="noopener noreferrer" to external links
Return ONLY valid JSON: { "improvedHtml": "...", "seoReport": "bullet list of changes" }`;

  try {
    const raw = await streamCompletion(
      spec,
      seoSystemPrompt,
      `Website Intent: ${userPrompt}\n\nHTML:\n${html.slice(0, 6000)}`,
      () => {},
    );
    const result = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}');
    return {
      improvedHtml: result.improvedHtml || html,
      seoReport:    result.seoReport    || 'No changes made.',
    };
  } catch {
    return { improvedHtml: html, seoReport: 'SEO optimization unavailable.' };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function injectTemplates(c: GeneratedContent): GeneratedContent {
  if (!c.html) return c;
  
  const { isEcommerce } = analyzePromptForTemplates(c.html);

  // Replace template placeholders
  c.html = c.html
    .replace(/<!--__TEMPLATE_AUTH__-->/g,     AUTH_TEMPLATE)
    .replace(/<!--__TEMPLATE_SHOP__-->/g,     isEcommerce ? SHOP_TEMPLATE : '')
    .replace(/<!--__TEMPLATE_CART__-->/g,     isEcommerce ? CART_TEMPLATE : '')
    .replace(/<!--__TEMPLATE_CHECKOUT__-->/g, isEcommerce ? CHECKOUT_TEMPLATE : '')
    .replace(/<!--__TEMPLATE_CONTACT__-->/g,  CONTACT_TEMPLATE)
    .replace(/<!--__TEMPLATE_FOOTER__-->/g,   FOOTER_TEMPLATE);

  // Ensure auth is always present (AI sometimes omits the placeholder)
  if (!c.html.includes('id="auth"')) {
    c.html = c.html.replace('</body>', AUTH_TEMPLATE + '\n</body>');
  }
  // Ensure contact is present
  if (!c.html.includes('id="contact"')) {
    c.html = c.html.replace('</body>', CONTACT_TEMPLATE + '\n</body>');
  }
  // Ensure footer is present
  if (!c.html.includes('<footer')) {
    c.html = c.html.replace('</body>', FOOTER_TEMPLATE + '\n</body>');
  }
  // Ecommerce: ensure shop/cart/checkout if needed
  if (isEcommerce) {
    if (!c.html.includes('id="shop"'))    c.html = c.html.replace('</body>', SHOP_TEMPLATE + '\n</body>');
    if (!c.html.includes('id="cart"'))    c.html = c.html.replace('</body>', CART_TEMPLATE + '\n</body>');
    if (!c.html.includes('id="checkout"')) c.html = c.html.replace('</body>', CHECKOUT_TEMPLATE + '\n</body>');
  }

  return c;
}

function analyzePromptForTemplates(html: string) {
  const h = html.toLowerCase();
  const isEcommerce = /shop|cart|checkout|product|store|ecommerce/.test(h);
  return { isEcommerce };
}


export const enhancePrompt = async (simpleIdea: string): Promise<string> => {
  const spec = MODEL_CASCADE.find(s =>
    !isBlocked(s.modelId) &&
    ((s.provider === 'groq' && hasGroqKey()) || (s.provider === 'openrouter' && hasOpenRouterKey()))
  );
  if (!spec) return simpleIdea;
  try {
    const result = await streamCompletion(
      spec,
      'You are an expert web consultant. Expand the user\'s short idea into a detailed, professional website prompt in 3-4 sentences. Output ONLY the expanded prompt text, nothing else.',
      `Expand: ${simpleIdea}`,
      () => {},
    );
    return result.trim() || simpleIdea;
  } catch { return simpleIdea; }
};
