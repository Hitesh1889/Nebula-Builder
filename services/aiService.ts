/**
 * VISINARO AI SERVICE
 * 
 * Key insight: small LLMs ignore complex nav templates.
 * Solution: post-process the AI output to ALWAYS fix the nav,
 * inject quality CSS, and fix the login page JS.
 */

const SS = {
  get:(k:string)=>{ try{return localStorage.getItem(k)||'';}catch{try{return sessionStorage.getItem(k)||'';}catch{return '';}} },
  set:(k:string,v:string)=>{ try{localStorage.setItem(k,v);}catch{} try{sessionStorage.setItem(k,v);}catch{} },
  del:(k:string)=>{ try{localStorage.removeItem(k);}catch{} try{sessionStorage.removeItem(k);}catch{} },
};
const K_GEMINI='visinaro_gemini_key', K_GROQ='visinaro_groq_key', K_OR='visinaro_or_key';
const envGet=(k:string)=>{ try{return (import.meta as any).env?.[k]||'';}catch{return '';} };

// Gemini
export const getGeminiKey      =():string=>{ const e=envGet('VITE_GEMINI_API_KEY')||envGet('GEMINI_API_KEY')||envGet('API_KEY'); return e.length>10?e:SS.get(K_GEMINI); };
export const saveGeminiKey     =(k:string)=>SS.set(K_GEMINI,k.trim());
export const clearGeminiKey    =()=>SS.del(K_GEMINI);
export const hasGeminiKey      =()=>getGeminiKey().length>10;
// Groq
export const getGroqKey        =():string=>{ const e=envGet('VITE_GROQ_API_KEY'); return e.length>10?e:SS.get(K_GROQ); };
export const saveGroqKey       =(k:string)=>SS.set(K_GROQ,k.trim());
export const clearGroqKey      =()=>SS.del(K_GROQ);
export const hasGroqKey        =()=>getGroqKey().length>10;
// OpenRouter
export const getOpenRouterKey  =():string=>{ const e=envGet('VITE_OPENROUTER_API_KEY'); return e.length>10?e:SS.get(K_OR); };
export const saveOpenRouterKey =(k:string)=>SS.set(K_OR,k.trim());
export const clearOpenRouterKey=()=>SS.del(K_OR);
export const hasOpenRouterKey  =()=>getOpenRouterKey().length>10;
// Combined
export const hasAnyKey  =()=>hasGeminiKey()||hasGroqKey()||hasOpenRouterKey();
export const getApiKey  =getGeminiKey;
export const saveApiKey =saveGeminiKey;
export const clearApiKey=()=>{clearGeminiKey();clearGroqKey();clearOpenRouterKey();};
export const hasApiKey  =hasAnyKey;

interface M{provider:'gemini'|'groq'|'openrouter';id:string;name:string;}
const CASCADE:M[]=[
  // Gemini first — best quality + fast enough
  {provider:'gemini',     id:'gemini-2.0-flash-exp',                 name:'Gemini 2.0 Flash'},
  {provider:'gemini',     id:'gemini-1.5-flash',                     name:'Gemini 1.5 Flash'},
  // Groq fallback — fastest
  {provider:'groq',       id:'llama-3.3-70b-versatile',              name:'Llama 3.3 70B'},
  {provider:'groq',       id:'mixtral-8x7b-32768',                   name:'Mixtral 8x7B'},
  // OpenRouter last resort
  {provider:'openrouter', id:'deepseek/deepseek-chat:free',          name:'DeepSeek Chat'},
  {provider:'openrouter', id:'meta-llama/llama-3.1-8b-instruct:free',name:'Llama 3.1 8B'},
];
const blocked:Record<string,number>={};
const block   =(id:string,ms:number)=>{blocked[id]=Date.now()+ms;};
const isBlocked=(id:string)=>(blocked[id]||0)>Date.now();
export const getQuotaWaitSeconds=(id:string)=>Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));
import { GeneratedContent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — simplified so even small models follow it
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You are an expert web developer. Generate a COMPLETE, VISUALLY STUNNING website as a single self-contained HTML file.

OUTPUT: Raw HTML only, starting with <!DOCTYPE html>. No markdown, no code fences, no explanation.

SECTION IDs — you MUST use EXACTLY these ids (our router depends on them):
- id="home"      → hero + features + stats
- id="about"     → story + team + timeline + testimonials  
- id="services"  → service cards with prices
- id="portfolio" → image grid with hover overlays
- id="contact"   → contact info + form
- id="login"     → auth card with Sign In / Sign Up tabs

SECTION HTML PATTERN (copy exactly):
<div id="home"      class="pg" style="display:block">CONTENT</div>
<div id="about"     class="pg" style="display:none">CONTENT</div>
<div id="services"  class="pg" style="display:none">CONTENT</div>
<div id="portfolio" class="pg" style="display:none">CONTENT</div>
<div id="contact"   class="pg" style="display:none">CONTENT</div>
<div id="login"     class="pg" style="display:none">CONTENT</div>

NAVIGATION — use these onclick handlers (our system rebuilds the nav, just put data-label for display name):
<nav id="main-nav" data-brand="BRAND NAME">
  <div data-page="home">Home</div>
  <div data-page="about">About</div>
  <div data-page="services">Services</div>
  <div data-page="portfolio">Portfolio</div>
  <div data-page="contact">Contact</div>
  <div data-page="login">Sign In</div>
</nav>
NOTE: Our system will visually style this nav — just put the data-page attributes correctly.

HERO (CRITICAL — must be full viewport width, not boxed):
<div style="position:relative;width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden">
  <img src="https://loremflickr.com/1600/900/TOPIC?lock=1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="hero">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.45) 100%)"></div>
  <div style="position:relative;z-index:1;text-align:center;padding:2rem;max-width:800px">
    <h1 style="font-size:clamp(2.5rem,6vw,5rem);font-weight:900;color:white;margin-bottom:1rem;line-height:1.1">[HEADLINE]</h1>
    <p style="font-size:1.25rem;color:rgba(255,255,255,0.85);margin-bottom:2.5rem;line-height:1.6">[SUBTITLE]</p>
  </div>
</div>

IMAGES — use LoremFlickr ONLY (topic-relevant real photos):
https://loremflickr.com/WIDTH/HEIGHT/KEYWORD?lock=NUMBER
- Use TOPIC as keyword: coffee, gym, restaurant, law, tech, fashion, hotel, etc.
- Different lock= number for every single image
- Hero: 1600x900, Cards: 800x500, Portraits: 400x500
- NEVER use picsum.photos

LOGIN SECTION — must include this JS for tab switching:
<div id="login" class="pg" style="display:none;min-height:100vh;background:linear-gradient(135deg,#1e1b4b,#312e81);display:none;align-items:center;justify-content:center">
  <div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:24px;padding:3rem;width:420px;max-width:90vw">
    <div style="display:flex;margin-bottom:2rem;background:rgba(255,255,255,0.08);border-radius:12px;padding:4px">
      <button id="tab-signin" onclick="switchTab('signin')" style="flex:1;padding:10px;background:white;color:#1e1b4b;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.9rem">Sign In</button>
      <button id="tab-signup" onclick="switchTab('signup')" style="flex:1;padding:10px;background:transparent;color:rgba(255,255,255,0.7);border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:0.9rem">Create Account</button>
    </div>
    <div id="form-signin">[SIGNIN FORM CONTENT]</div>
    <div id="form-signup" style="display:none">[SIGNUP FORM CONTENT]</div>
  </div>
</div>
<script>
function switchTab(tab){
  var signin=document.getElementById('form-signin');
  var signup=document.getElementById('form-signup');
  var ts=document.getElementById('tab-signin');
  var tu=document.getElementById('tab-signup');
  if(tab==='signin'){
    if(signin)signin.style.display='block';
    if(signup)signup.style.display='none';
    if(ts){ts.style.background='white';ts.style.color='#1e1b4b';}
    if(tu){tu.style.background='transparent';tu.style.color='rgba(255,255,255,0.7)';}
  } else {
    if(signin)signin.style.display='none';
    if(signup)signup.style.display='block';
    if(ts){ts.style.background='transparent';ts.style.color='rgba(255,255,255,0.7)';}
    if(tu){tu.style.background='white';tu.style.color='#1e1b4b';}
  }
}
</script>

REQUIRED CONTENT (make it rich and professional):
- HOME: hero (no CTA buttons, just headline + subtitle), then 3 feature cards, then stats row (4 numbers)
- ABOUT: brand story (3 paragraphs), team grid (4 members with photos), values (3 cards), testimonials (3)
- SERVICES: 3-4 cards with loremflickr image, icon, name, price tag, 4 bullet features, CTA button
- PORTFOLIO: 6-image grid with hover overlay (project name + "View" button appears on hover)
- CONTACT: gradient banner top, 3 info cards, contact form (name+email row, subject, message, submit button)
- LOGIN: as shown above with working tab switching
- FOOTER: dark (#0f172a), 4 columns, social icons, copyright

DESIGN — make it look like a premium agency built it:
- Use gradients everywhere: backgrounds, buttons, section dividers
- Cards: white bg, border-radius:16px or 24px, box-shadow:0 8px 32px rgba(0,0,0,0.12)
- Hover effects: transform:translateY(-4px), transition:all 0.3s ease
- Color scheme: match the brand topic (coffee=amber/brown, gym=dark+orange, tech=indigo/blue)
- Google Font: add <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"> to <head>
- Typography: font-family:'Inter',sans-serif throughout
`;

// ─────────────────────────────────────────────────────────────────────────────
// POST-PROCESSOR — runs on every generated HTML to fix nav + inject CSS
// ─────────────────────────────────────────────────────────────────────────────

// Labels for known section IDs
const PAGE_LABELS: Record<string,string> = {
  home:'Home', about:'About', services:'Services', portfolio:'Portfolio',
  contact:'Contact', login:'Sign In', shop:'Shop', cart:'Cart',
  team:'Team', blog:'Blog', pricing:'Pricing', gallery:'Gallery',
  menu:'Menu', faq:'FAQ',
};

function postProcess(html: string): string {
  // 1. Find all .pg section IDs in the generated HTML
  const sectionIds: string[] = [];
  const pgRegex = /id="([^"]+)"[^>]*class="pg"|class="pg"[^>]*id="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = pgRegex.exec(html)) !== null) {
    sectionIds.push(m[1] || m[2]);
  }
  // Fallback: look for common IDs
  if (sectionIds.length < 2) {
    ['home','about','services','portfolio','contact','login','menu','gallery','team','shop'].forEach(id => {
      if (html.includes(`id="${id}"`) && !sectionIds.includes(id)) sectionIds.push(id);
    });
  }
  const ids = sectionIds.length > 0 ? sectionIds : ['home','about','services','portfolio','contact','login'];

  // 2. Extract brand name from the page (h1 or title)
  let brand = 'Site';
  const titleM = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleM) brand = titleM[1].trim().slice(0,40);
  else {
    const h1M = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1M) brand = h1M[1].replace(/<[^>]+>/g,'').trim().slice(0,40);
  }

  // 3. Extract brand color (look for common brand color patterns in existing nav/buttons)
  let brandColor = '#6366f1'; // default indigo
  const colorPatterns = [
    html.match(/background[^;]*?#([0-9a-f]{6})/i),
    html.match(/from-\[#([0-9a-f]{6})\]/i),
  ];
  // Use amber for coffee/food, indigo default
  if (/coffee|cafe|brew|restaurant|food|bistro|kitchen/i.test(html)) brandColor = '#d97706';
  else if (/gym|fitness|sport|train/i.test(html)) brandColor = '#ef4444';
  else if (/law|legal|attorney|consult/i.test(html)) brandColor = '#1d4ed8';
  else if (/health|medical|clinic|doctor/i.test(html)) brandColor = '#0891b2';
  else if (/tech|saas|software|app|digital/i.test(html)) brandColor = '#6366f1';
  else if (/fashion|style|boutique|luxury/i.test(html)) brandColor = '#be185d';

  // 4. Build our fixed navbar HTML
  const navItems = ids.map(id => {
    const label = PAGE_LABELS[id] || id.charAt(0).toUpperCase()+id.slice(1);
    const isLogin = id === 'login';
    if (isLogin) {
      return `<span onclick="goTo('login')" class="nl" data-page="login" style="background:${brandColor};color:white;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:opacity 0.2s" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">${label}</span>`;
    }
    return `<span onclick="goTo('${id}')" class="nl" data-page="${id}" style="color:rgba(255,255,255,0.75);cursor:pointer;font-size:14px;font-weight:500;transition:color 0.2s;padding:4px 0" onmouseover="this.style.color='white'" onmouseout="this.style.color=''">${label}</span>`;
  });

  // SVG logo — a simple icon
  const logoSvg = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="${brandColor}" stroke-width="2.5"/><path d="M8 14l4 4 8-8" stroke="${brandColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const fixedNav = `<nav id="vi-nav" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(8,8,20,0.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;border-bottom:1px solid rgba(255,255,255,0.07);font-family:'Inter',system-ui,sans-serif">
  <span onclick="goTo('${ids[0]}')" style="color:white;font-weight:800;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;gap:10px;letter-spacing:-0.02em">${logoSvg}${brand}</span>
  <div style="display:flex;align-items:center;gap:28px">${navItems.join('')}</div>
</nav>`;

  // 5. Remove existing nav (it's always broken) and inject our fixed nav
  let out = html.replace(/<nav[\s\S]*?<\/nav>/i, fixedNav);
  // If no nav found, insert after <body>
  if (!out.includes('id="vi-nav"')) {
    out = out.replace('<body>', '<body>' + fixedNav);
  }

  // 6. Inject base quality CSS into <head>
  const baseCSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #fff; color: #0f172a; }
  .pg { min-height: 100vh; width: 100%; padding-top: 64px; }
  /* Hero must be full width */
  .pg:first-of-type > div:first-child,
  #home > div:first-child { width: 100% !important; max-width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
  /* Remove any max-width on hero images */
  #home img[style*="position:absolute"] { width: 100% !important; max-width: none !important; }
  /* Smooth scrolling */
  html { scroll-behavior: smooth; }
  /* Card hover effect */
  .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.15) !important; }
  /* Button base */
  button, [onclick] { cursor: pointer; }
  /* Section headings */
  .section-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
  .section-label { display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 999px; margin-bottom: 1rem; }
  /* Input styles */
  input, textarea, select { font-family: inherit; }
  input:focus, textarea:focus, select:focus { outline: 2px solid ${brandColor}; outline-offset: 2px; }
  /* Portfolio hover */
  .port-item { position: relative; overflow: hidden; border-radius: 16px; }
  .port-item .port-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.75); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
  .port-item:hover .port-overlay { opacity: 1; }
  /* Nav active state */
  .nl.active { color: white !important; }
  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
  /* Remove default list styles */
  ul, ol { padding-left: 0; list-style: none; }
</style>`;

  out = out.replace('</head>', baseCSS + '\n</head>');

  // 7. Inject navigation JS + click interceptor + login tab switcher
  const navScript = `
<script>
(function(){
  var BRAND_COLOR = '${brandColor}';
  
  window.goTo = function(id) {
    document.querySelectorAll('.pg').forEach(function(el){ el.style.display='none'; });
    var target = document.getElementById(id);
    if(target){ target.style.display='block'; window.scrollTo(0,0); }
    document.querySelectorAll('.nl').forEach(function(el){
      var page = el.getAttribute('data-page') || (el.getAttribute('onclick')||'').replace(/.*goTo\\('([^']+)'.*/, '$1');
      var isActive = page === id;
      if(el.getAttribute('data-page')==='login'){ return; } // skip signin button styling
      el.style.color = isActive ? 'white' : 'rgba(255,255,255,0.75)';
      el.style.fontWeight = isActive ? '700' : '500';
      el.style.borderBottom = isActive ? ('2px solid '+BRAND_COLOR) : 'none';
      el.style.paddingBottom = isActive ? '2px' : '0';
    });
  };

  // Tab switcher for login page
  window.switchTab = function(tab) {
    var fs = document.getElementById('form-signin');
    var fu = document.getElementById('form-signup');
    var ts = document.getElementById('tab-signin');
    var tu = document.getElementById('tab-signup');
    if(tab==='signin'){
      if(fs)fs.style.display='block'; if(fu)fu.style.display='none';
      if(ts){ts.style.background='white';ts.style.color='#1e1b4b';}
      if(tu){tu.style.background='transparent';tu.style.color='rgba(255,255,255,0.7)';}
    } else {
      if(fs)fs.style.display='none'; if(fu)fu.style.display='block';
      if(ts){ts.style.background='transparent';ts.style.color='rgba(255,255,255,0.7)';}
      if(tu){tu.style.background='white';tu.style.color='#1e1b4b';}
    }
  };

  // Intercept ALL anchor clicks - prevent any page navigation
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href]');
    if(!a) return;
    var h = (a.getAttribute('href')||'').trim();
    if(h.startsWith('#') && h.length > 1){ e.preventDefault(); var id=h.slice(1); if(document.getElementById(id)) window.goTo(id); return; }
    if(h.startsWith('http')||h.startsWith('//')){ e.preventDefault(); try{window.open(h,'_blank','noopener');}catch(x){} return; }
    if(h && h!=='#' && h!=='javascript:void(0)' && h!=='javascript:;') e.preventDefault();
  }, true);

  // On load — ensure first section visible, rest hidden
  function init(){
    var pages = Array.from(document.querySelectorAll('.pg'));
    if(pages.length === 0) return;
    var firstId = pages[0].id || 'home';
    window.goTo(firstId);
  }
  if(document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
</script>`;

  out = out.includes('</body>') ? out.replace('</body>', navScript+'\n</body>') : out+navScript;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
async function callModel(m: M, system: string, user: string): Promise<string> {
  const userMsg = `Build a complete professional website for: ${user}\n\nOUTPUT: Raw HTML only starting with <!DOCTYPE html>. Use section ids: home, about, services, portfolio, contact, login. Make it visually stunning.`;

  // ── Gemini (uses Google AI API, different format) ──────────────────────────
  if (m.provider === 'gemini') {
    const key = getGeminiKey();
    if (!key || key.length < 10) throw new Error('NO_KEY:gemini');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: system + '\n\n' + userMsg }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP_${res.status}|${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error(`Empty Gemini response from ${m.id}`);
    return content;
  }

  // ── Groq / OpenRouter (OpenAI-compatible) ─────────────────────────────────
  const key = m.provider === 'groq' ? getGroqKey() : getOpenRouterKey();
  if (!key || key.length < 10) throw new Error(`NO_KEY:${m.provider}`);
  const url = m.provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` };
  if (m.provider === 'openrouter') { headers['HTTP-Referer'] = 'https://visinaro.onrender.com'; headers['X-Title'] = 'Visinaro'; }
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({
      model: m.id,
      messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
      temperature: 0.3, max_tokens: 8000, stream: false,
    }),
  });
  if (!res.ok) { const txt = await res.text().catch(() => ''); throw new Error(`HTTP_${res.status}|${txt.slice(0, 200)}`); }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${m.id}`);
  return content;
}

function extractHtml(raw: string): string {
  let html = raw.replace(/^```html\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```\s*$/im,'').trim();
  if(/^<!DOCTYPE/i.test(html)||/^<html/i.test(html)) return html;
  const m = raw.match(/<!DOCTYPE[\s\S]*<\/html>/i)||raw.match(/<html[\s\S]*<\/html>/i);
  if(m) return m[0];
  if(html.length>200) return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script></head><body>${html}</body></html>`;
  throw new Error(`Could not extract HTML. Length: ${raw.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
export interface GenerateResult { content: GeneratedContent; usedModel: string; usedProvider: string; }

export const generateWebsite = async (
  prompt: string, _pref: string, onProgress?: (partial: string, name?: string) => void,
): Promise<GenerateResult> => {
  if(!hasAnyKey()) throw new Error('API_KEY_MISSING');
  let lastErrMsg='';
  for(const m of CASCADE){
    if(m.provider==='gemini'    &&!hasGeminiKey())     continue;
    if(m.provider==='groq'      &&!hasGroqKey())       continue;
    if(m.provider==='openrouter'&&!hasOpenRouterKey()) continue;
    if(isBlocked(m.id)) continue;
    try {
      onProgress?.('', m.name);
      const raw = await callModel(m, SYSTEM, prompt);
      const html = extractHtml(raw);
      const finalHtml = postProcess(html);
      return { content:{html:finalHtml,css:'',javascript:''}, usedModel:m.name, usedProvider:m.provider };
    } catch(err:any){
      lastErrMsg=String(err?.message||err);
      const msg=lastErrMsg.toLowerCase();
      console.warn(`[Visinaro] ${m.id} failed: ${lastErrMsg.slice(0,100)}`);
      if(msg.includes('no_key:')) continue;
      if(msg.includes('401')||msg.includes('403')||msg.includes('authentication')||msg.includes('api_key')||msg.includes('invalid')){CASCADE.filter(x=>x.provider===m.provider).forEach(x=>block(x.id,600_000));continue;}
      if(msg.includes('429')||msg.includes('rate limit')||msg.includes('quota')){block(m.id,90_000);continue;}
      if(msg.includes('404')||msg.includes('no endpoints')){block(m.id,24*3600_000);continue;}
      block(m.id,5_000);
    }
  }
  throw new Error('Generation failed. Please try again.');
};

export const optimizeSEO = async (html:string,prompt:string): Promise<{improvedHtml:string;seoReport:string}> => {
  const m=CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return {improvedHtml:html,seoReport:'No model available.'};
  try {
    const raw=await callModel(m,'Improve SEO meta tags, schema.org, headings, alt texts. Return ONLY the complete improved HTML.',`Prompt: ${prompt}\n\nHTML:\n${html.slice(0,6000)}`);
    const improved=extractHtml(raw);
    return {improvedHtml:improved.length>200?postProcess(improved):html,seoReport:'SEO updated.'};
  } catch { return {improvedHtml:html,seoReport:'SEO unavailable.'}; }
};

export const enhancePrompt=async(idea:string):Promise<string>=>{
  const m=CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return idea;
  try{const raw=await callModel(m,'Expand into a detailed website brief. Output ONLY the brief, no preamble.',`Expand: ${idea}`);return raw.trim()||idea;}
  catch{return idea;}
};
