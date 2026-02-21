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
// Generate a COMPLETE self-contained HTML file — no injection, no templates.
// The AI writes everything including navigation JS.
const SYSTEM = `You are an expert web developer. Generate a complete, beautiful, multi-page website as a single self-contained HTML file.

CRITICAL: Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown. No code blocks. No explanation.

## NAVIGATION SYSTEM — copy this EXACTLY:

The site uses sections shown/hidden by JavaScript. Here is the EXACT pattern you MUST use:

<script>
function goTo(id) {
  document.querySelectorAll('.pg').forEach(function(s) { s.style.display='none'; });
  var el = document.getElementById(id);
  if (el) { el.style.display='block'; window.scrollTo(0,0); }
  document.querySelectorAll('nav a[data-page]').forEach(function(a) {
    a.style.fontWeight = a.dataset.page===id ? '800' : '';
    a.style.opacity = a.dataset.page===id ? '1' : '0.75';
  });
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('nav a[data-page]').forEach(function(a) {
    a.addEventListener('click', function(e) { e.preventDefault(); goTo(a.dataset.page); });
  });
  goTo('home');
});
</script>

## RULES:
1. Every section must have class="pg" and a unique id (home, about, services, portfolio, contact)
2. ALL sections EXCEPT #home must have style="display:none" in the HTML
3. Nav links use data-page="sectionid" NOT href="#sectionid"
4. Write the full goTo script exactly as shown above — DO NOT modify it
5. Use Tailwind CSS from CDN: <script src="https://cdn.tailwindcss.com"></script>
6. For images use: https://loremflickr.com/800/500/KEYWORD?lock=NUMBER (use topic-relevant keywords like coffee, gym, restaurant, etc.)
7. Use a different lock number for every image (1, 2, 3, ...)
8. Include a full footer with brand name, links, copyright
9. Include a working contact form (just shows an alert on submit)
10. The cart icon should show a count badge that increments on "Add to Cart" click

## HTML STRUCTURE:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[SITE NAME]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
    .pg { min-height: 100vh; width: 100%; }
  </style>
</head>
<body>

<!-- NAVBAR - fixed, always visible -->
<nav style="position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(10,10,20,0.95);backdrop-filter:blur(12px);padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08)">
  <a href="#" onclick="goTo('home');return false;" style="color:white;font-weight:800;font-size:1.25rem;text-decoration:none;display:flex;align-items:center;gap:0.5rem">
    [SVG LOGO ICON] [BRAND NAME]
  </a>
  <div style="display:flex;align-items:center;gap:1.5rem">
    <a data-page="home" href="#" style="color:white;text-decoration:none;font-size:0.9rem;transition:opacity 0.2s">Home</a>
    <a data-page="about" href="#" style="color:white;text-decoration:none;font-size:0.9rem;opacity:0.75;transition:opacity 0.2s">About</a>
    <a data-page="services" href="#" style="color:white;text-decoration:none;font-size:0.9rem;opacity:0.75;transition:opacity 0.2s">Services</a>
    <a data-page="portfolio" href="#" style="color:white;text-decoration:none;font-size:0.9rem;opacity:0.75;transition:opacity 0.2s">Portfolio</a>
    <a data-page="contact" href="#" style="color:white;text-decoration:none;font-size:0.9rem;opacity:0.75;transition:opacity 0.2s">Contact</a>
  </div>
</nav>

<!-- SECTIONS - each with class="pg", only home visible initially -->

<section id="home" class="pg" style="padding-top:64px">
  [FULL HERO + CONTENT]
</section>

<section id="about" class="pg" style="display:none;padding-top:64px">
  [FULL ABOUT CONTENT]
</section>

<section id="services" class="pg" style="display:none;padding-top:64px">
  [FULL SERVICES CONTENT]
</section>

<section id="portfolio" class="pg" style="display:none;padding-top:64px">
  [FULL PORTFOLIO CONTENT]
</section>

<section id="contact" class="pg" style="display:none;padding-top:64px">
  [FULL CONTACT FORM]
</section>

<!-- FOOTER inside #home OR after all sections but before </body> -->
<footer style="background:#0f172a;color:#94a3b8;padding:3rem 2rem;text-align:center">
  [footer content]
</footer>

[NAVIGATION SCRIPT exactly as shown above]

</body>
</html>

## CONTENT REQUIREMENTS:
- Hero: full-viewport background image with overlay, large headline, subtitle, 2 CTA buttons
- About: 2-column layout with image, text, team grid
- Services: card grid with images, prices, features
- Portfolio: masonry/grid of images with hover effects
- Contact: clean form with name, email, message fields, submit button
- All sections must have RICH content — at least 500 words of actual content total
- Use beautiful gradients, shadows, hover effects with inline styles + Tailwind classes
- Make it look PROFESSIONAL and COMPLETE — not a skeleton`;

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
// After AI generates the HTML, ensure the goTo script is present and correct.
// This is our safety net — if the AI forgot the script, we inject it.
function ensureNavigation(html: string): string {
  // If goTo function is already present, leave it alone
  if (html.includes('function goTo(')) return html;

  // Inject the navigation script before </body>
  const navScript = `
<script>
function goTo(id) {
  document.querySelectorAll('.pg').forEach(function(s) { s.style.display='none'; });
  var el = document.getElementById(id);
  if (el) { el.style.display='block'; window.scrollTo(0,0); }
  document.querySelectorAll('nav a[data-page]').forEach(function(a) {
    a.style.fontWeight = a.dataset.page===id ? '800' : '';
    a.style.opacity = a.dataset.page===id ? '1' : '0.75';
  });
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('nav a[data-page]').forEach(function(a) {
    a.addEventListener('click', function(e) { e.preventDefault(); goTo(a.dataset.page); });
  });
  // Also handle href="#sectionid" style links as fallback
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    var id = a.getAttribute('href').slice(1);
    if (id && document.getElementById(id)) {
      a.addEventListener('click', function(e) { e.preventDefault(); goTo(id); });
    }
  });
  var sections = document.querySelectorAll('.pg');
  if (sections.length > 0) goTo(sections[0].id || 'home');
});
</script>`;

  return html.replace('</body>', navScript + '\n</body>');
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
