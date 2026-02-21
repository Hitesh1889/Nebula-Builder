/**
 * VISINARO AI SERVICE — Complete rewrite
 * 
 * New approach: Ask the AI to generate ONE complete self-contained HTML file.
 * No SPA router injection. No template system. No delimiter parsing complexity.
 * The AI generates a full working website in a single <html> document.
 * Navigation works via plain JS show/hide — written BY the AI, not injected by us.
 */

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

const blocked:Record<string,number>={};
const block   =(id:string,ms:number)=>{blocked[id]=Date.now()+ms;};
const isBlocked=(id:string)=>(blocked[id]||0)>Date.now();
export const getQuotaWaitSeconds=(id:string)=>Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
// CRITICAL DESIGN RULES for reliable navigation:
// 1. Nav uses inline style="display:flex" - NOT Tailwind class="hidden md:flex" which breaks
// 2. All nav links use onclick="goTo('id');return false;" - NOT href="#id"  
// 3. goTo() is a plain function that shows/hides .pg divs - simple and bulletproof
const SYSTEM = `You are a web developer. Generate a complete, beautiful website as a SINGLE self-contained HTML file.

OUTPUT RULES — CRITICAL:
- Start with <!DOCTYPE html> — nothing before it
- No markdown, no code fences, no explanation, just raw HTML
- Include ALL content: hero, about, services, portfolio, contact, footer

════════════════════════════════════════════
NAVIGATION — COPY THIS EXACT PATTERN
════════════════════════════════════════════

Use this navigation system. DO NOT deviate from it:

NAVBAR (use inline styles, NOT Tailwind responsive classes for the links div):
<nav style="position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(10px);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;box-shadow:0 1px 0 rgba(255,255,255,0.08)">
  <span onclick="goTo('home')" style="color:white;font-weight:800;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem">
    [BRAND SVG ICON] [BRAND NAME]
  </span>
  <!-- IMPORTANT: use inline style="display:flex" NOT class="hidden md:flex" -->
  <div style="display:flex;align-items:center;gap:2rem" id="nav-links">
    <span onclick="goTo('home')" class="nav-link" style="color:white;cursor:pointer;font-size:0.9rem;font-weight:600;padding:0.25rem 0;border-bottom:2px solid white;transition:opacity 0.2s">Home</span>
    <span onclick="goTo('about')" class="nav-link" style="color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;font-weight:500;padding:0.25rem 0;border-bottom:2px solid transparent;transition:opacity 0.2s">About</span>
    <span onclick="goTo('services')" class="nav-link" style="color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;font-weight:500;padding:0.25rem 0;border-bottom:2px solid transparent;transition:opacity 0.2s">Services</span>
    <span onclick="goTo('portfolio')" class="nav-link" style="color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;font-weight:500;padding:0.25rem 0;border-bottom:2px solid transparent;transition:opacity 0.2s">Portfolio</span>
    <span onclick="goTo('contact')" class="nav-link" style="color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;font-weight:500;padding:0.25rem 0;border-bottom:2px solid transparent;transition:opacity 0.2s">Contact</span>
  </div>
</nav>

SECTIONS (only home visible at start — use display:block/none with inline style):
<div id="home" class="pg" style="display:block;padding-top:64px">[HOME CONTENT]</div>
<div id="about" class="pg" style="display:none;padding-top:64px">[ABOUT CONTENT]</div>
<div id="services" class="pg" style="display:none;padding-top:64px">[SERVICES CONTENT]</div>
<div id="portfolio" class="pg" style="display:none;padding-top:64px">[PORTFOLIO CONTENT]</div>
<div id="contact" class="pg" style="display:none;padding-top:64px">[CONTACT CONTENT]</div>

NAVIGATION SCRIPT (place at end of body, before </body>):
<script>
var _currentPage = 'home';
function goTo(id) {
  document.querySelectorAll('.pg').forEach(function(el) {
    el.style.display = 'none';
  });
  var target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';
    _currentPage = id;
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.nav-link').forEach(function(a) {
    var isActive = a.getAttribute('onclick') && a.getAttribute('onclick').indexOf("'"+id+"'") >= 0;
    a.style.color = isActive ? 'white' : 'rgba(255,255,255,0.7)';
    a.style.borderBottom = isActive ? '2px solid white' : '2px solid transparent';
    a.style.fontWeight = isActive ? '600' : '500';
  });
}
// Intercept ALL link clicks to prevent page navigation
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href') || '';
  // If it's a hash link to a known section, use goTo
  if (href.startsWith('#')) {
    var id = href.slice(1);
    if (document.getElementById(id)) {
      e.preventDefault();
      goTo(id);
      return;
    }
    e.preventDefault();
    return;
  }
  // External links open in new tab
  if (href.startsWith('http') || href.startsWith('//')) {
    e.preventDefault();
    window.open(href, '_blank');
    return;
  }
  // Prevent all other navigation
  if (href !== 'javascript:void(0)' && href !== '' && href !== '#') {
    e.preventDefault();
  }
}, true);
</script>

════════════════════════════════════════════
IMAGES
════════════════════════════════════════════

Use LoremFlickr with the topic keyword. NEVER use picsum.photos (gives random unrelated images).
Format: https://loremflickr.com/WIDTH/HEIGHT/KEYWORD?lock=UNIQUE_NUMBER

Use the actual topic as keyword:
- Coffee shop: https://loremflickr.com/1400/700/coffee?lock=1
- Gym: https://loremflickr.com/1400/700/gym?lock=1  
- Restaurant: https://loremflickr.com/1400/700/restaurant?lock=1
- Law firm: https://loremflickr.com/1400/700/law?lock=1
- Use a DIFFERENT lock number for every single image (1, 2, 3, 4...)

════════════════════════════════════════════
REQUIRED SECTIONS
════════════════════════════════════════════

HOME: Full-screen hero with loremflickr background image + dark overlay, large headline, subtitle, 2 CTA buttons. Below hero: 3 feature cards.

ABOUT: 2-column layout (text + image), company story, team grid with 4 member cards.

SERVICES: Card grid with 3-4 service cards, each with image, icon, title, price, features list, CTA button.

PORTFOLIO: Image grid with 6 items, hover overlay effect.

CONTACT: Split layout — contact info cards on left, form on right. Form has name, email, message, submit button that shows alert("Message sent! We'll be in touch.").

FOOTER: Dark background, 4 columns (brand info, nav links, support links, social icons), copyright line. Footer goes inside the #home section at the bottom OR as a standalone element after all .pg divs.

════════════════════════════════════════════
IMPORTANT RULES
════════════════════════════════════════════

1. Use <span onclick="goTo('id')"> for nav — NOT <a href="#id">
2. Use inline styles for layout-critical things — NOT Tailwind responsive classes
3. Tailwind classes are fine for colors, spacing, shadows, typography
4. All CTA buttons: onclick="goTo('services')" or onclick="goTo('contact')" — not href
5. Make each section visually distinct and complete — not placeholder text
6. Use beautiful design: gradients, shadows, hover effects, smooth transitions
`;

// ── IMPORT GeneratedContent type ──────────────────────────────────────────────
import { GeneratedContent } from '../types';

// ── API CALL ──────────────────────────────────────────────────────────────────
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
      messages:    [{ role:'system', content:system }, { role:'user', content:`Create a website for: ${user}` }],
      temperature: 0.3,
      max_tokens:  8000,
      stream:      false,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP_${res.status}|${txt.slice(0,200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${m.id}`);
  return content;
}

// ── PARSE HTML FROM AI RESPONSE ───────────────────────────────────────────────
function extractHtml(raw: string): string {
  // Strip markdown code fences if present
  let html = raw
    .replace(/^```html\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();

  // If it starts with <!DOCTYPE or <html, we're good
  if (/^<!DOCTYPE/i.test(html) || /^<html/i.test(html)) {
    return html;
  }

  // Try to find a full HTML document in the response
  const docMatch = raw.match(/<!DOCTYPE[\s\S]*<\/html>/i) || raw.match(/<html[\s\S]*<\/html>/i);
  if (docMatch) return docMatch[0];

  // If we got just body content, wrap it
  if (html.length > 200) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<style>*{box-sizing:border-box}html,body{margin:0;padding:0}.pg{min-height:100vh;width:100%}</style>
</head>
<body>
${html}
</body>
</html>`;
  }

  throw new Error(`Could not extract HTML. Response length: ${raw.length}`);
}

// ── ENSURE NAVIGATION WORKS ───────────────────────────────────────────────────
// Always inject a safety-net script that:
// 1. Defines goTo() if not present
// 2. Intercepts ALL anchor clicks to prevent navigation away from the page
// 3. Handles both data-page and href="#id" style links
function ensureNavigation(html: string): string {
  // ALWAYS inject our safety-net script, regardless of what the AI generated
  // It wraps the existing goTo or defines its own
  const safetyScript = `
<script>
(function() {
  // Define goTo if the AI didn't
  if (typeof goTo !== 'function') {
    window.goTo = function(id) {
      document.querySelectorAll('.pg, section[id], div[id]').forEach(function(el) {
        if (el.classList.contains('pg') || ['home','about','services','portfolio','contact','shop','cart','checkout','team','blog','pricing','gallery','menu','faq'].indexOf(el.id) >= 0) {
          el.style.display = 'none';
        }
      });
      var target = document.getElementById(id);
      if (target) { target.style.display = 'block'; window.scrollTo(0, 0); }
      document.querySelectorAll('.nav-link, nav a, nav span[onclick]').forEach(function(el) {
        var onclick = el.getAttribute('onclick') || '';
        var isActive = onclick.indexOf("'"+id+"'") >= 0 || onclick.indexOf('"'+id+'"') >= 0;
        el.style.opacity = isActive ? '1' : '0.7';
        el.style.fontWeight = isActive ? '700' : '500';
      });
    };
  } else {
    window.goTo = goTo;
  }

  // INTERCEPT ALL ANCHOR CLICKS — prevents any navigation away from the page
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (!link) return;
    var href = (link.getAttribute('href') || '').trim();
    // Hash links: use goTo if it's a known section
    if (href.startsWith('#') && href.length > 1) {
      var id = href.slice(1);
      e.preventDefault();
      if (document.getElementById(id)) { window.goTo(id); }
      return;
    }
    // External links: open in new tab
    if (href.startsWith('http') || href.startsWith('//')) {
      e.preventDefault();
      try { window.open(href, '_blank', 'noopener'); } catch(ex) {}
      return;
    }
    // Everything else: block navigation
    if (href && href !== '#' && href !== 'javascript:void(0)' && href !== 'javascript:;') {
      e.preventDefault();
    }
  }, true); // capture phase — runs before any other handler

  // Initialize: show first .pg section, hide the rest
  document.addEventListener('DOMContentLoaded', function() {
    var pages = Array.from(document.querySelectorAll('.pg'));
    if (pages.length === 0) {
      // Fallback: find sections by known IDs
      var ids = ['home','about','services','portfolio','contact'];
      pages = ids.map(function(id) { return document.getElementById(id); }).filter(Boolean);
    }
    if (pages.length > 0) {
      pages.forEach(function(p, i) { p.style.display = i === 0 ? 'block' : 'none'; });
    }
  });
})();
</script>`;

  // Insert before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', safetyScript + '\n</body>');
  }
  return html + safetyScript;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export interface GenerateResult { content: GeneratedContent; usedModel: string; usedProvider: string; }

export const generateWebsite = async (
  prompt: string,
  _pref: string,
  onProgress?: (partial: string, name?: string) => void,
): Promise<GenerateResult> => {
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');

  let lastErrMsg = '';

  for (const m of CASCADE) {
    if (m.provider==='groq'       && !hasGroqKey())       continue;
    if (m.provider==='openrouter' && !hasOpenRouterKey()) continue;
    if (isBlocked(m.id)) continue;

    try {
      onProgress?.('', m.name);
      const raw = await callModel(m, SYSTEM, prompt);
      const html = extractHtml(raw);
      const finalHtml = ensureNavigation(html);

      // Return as a GeneratedContent with html = the full document
      // css and javascript are empty since everything is inline in the HTML
      const content: GeneratedContent = {
        html: finalHtml,
        css: '',
        javascript: '',
      };

      return { content, usedModel: m.name, usedProvider: m.provider };

    } catch (err: any) {
      lastErrMsg = String(err?.message || err);
      const msg = lastErrMsg.toLowerCase();
      console.warn(`[Visinaro] ${m.id} failed: ${lastErrMsg.slice(0,100)}`);

      if (msg.includes('no_key:')) continue;
      if (msg.includes('401') || msg.includes('403') || msg.includes('authentication')) {
        CASCADE.filter(x => x.provider===m.provider).forEach(x => block(x.id, 600_000));
        continue;
      }
      if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
        block(m.id, 90_000); continue;
      }
      if (msg.includes('404') || msg.includes('no endpoints')) {
        block(m.id, 24*3600_000); continue;
      }
      block(m.id, 5_000);
    }
  }

  throw new Error('Generation failed. Please try again.');
};

// ── SEO OPTIMIZER ─────────────────────────────────────────────────────────────
export const optimizeSEO = async (html: string, prompt: string): Promise<{improvedHtml:string; seoReport:string}> => {
  const m = CASCADE.find(x => !isBlocked(x.id) && ((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return { improvedHtml: html, seoReport: 'No model available.' };
  try {
    const raw = await callModel(m,
      'You are an SEO expert. Add/improve meta tags, title, description, schema.org JSON-LD, heading hierarchy, and alt texts. Return ONLY the improved complete HTML.',
      `Prompt: ${prompt}\n\nHTML:\n${html.slice(0,6000)}`
    );
    const improved = extractHtml(raw);
    return { improvedHtml: improved.length > 200 ? improved : html, seoReport: 'SEO meta tags, schema markup, and alt texts updated.' };
  } catch { return { improvedHtml: html, seoReport: 'SEO optimization unavailable.' }; }
};

export const enhancePrompt = async (idea: string): Promise<string> => {
  const m = CASCADE.find(x => !isBlocked(x.id) && ((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return idea;
  try {
    const raw = await callModel(m, 'Expand this into a detailed website brief. Output ONLY the expanded prompt, nothing else.', `Expand: ${idea}`);
    return raw.trim() || idea;
  } catch { return idea; }
};
