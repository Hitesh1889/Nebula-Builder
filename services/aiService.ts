/**
 * VISINARO AI SERVICE
 * - Gemini 2.0 Flash as primary (reads GEMINI_API_KEY / API_KEY / VITE_GEMINI_API_KEY)
 * - postProcess() rebuilds nav, hero, CSS after every generation
 */

const SS = {
  get:(k:string)=>{ try{return localStorage.getItem(k)||'';}catch{try{return sessionStorage.getItem(k)||'';}catch{return '';}} },
  set:(k:string,v:string)=>{ try{localStorage.setItem(k,v);}catch{} try{sessionStorage.setItem(k,v);}catch{} },
  del:(k:string)=>{ try{localStorage.removeItem(k);}catch{} try{sessionStorage.removeItem(k);}catch{} },
};
const K_GEMINI='visinaro_gemini_key', K_GROQ='visinaro_groq_key', K_OR='visinaro_or_key';
const envGet=(k:string)=>{ try{return (import.meta as any).env?.[k]||'';}catch{return '';} };

export const getGeminiKey      =():string=>{ const e=envGet('VITE_GEMINI_API_KEY')||envGet('GEMINI_API_KEY')||envGet('API_KEY'); return e.length>10?e:SS.get(K_GEMINI); };
export const getGroqKey        =():string=>{ const e=envGet('VITE_GROQ_API_KEY'); return e.length>10?e:SS.get(K_GROQ); };
export const getOpenRouterKey  =():string=>{ const e=envGet('VITE_OPENROUTER_API_KEY'); return e.length>10?e:SS.get(K_OR); };
export const saveGeminiKey     =(k:string)=>SS.set(K_GEMINI,k.trim());
export const saveGroqKey       =(k:string)=>SS.set(K_GROQ,k.trim());
export const saveOpenRouterKey =(k:string)=>SS.set(K_OR,k.trim());
export const clearGeminiKey    =()=>SS.del(K_GEMINI);
export const clearGroqKey      =()=>SS.del(K_GROQ);
export const clearOpenRouterKey=()=>SS.del(K_OR);
export const hasGeminiKey      =()=>getGeminiKey().length>10;
export const hasGroqKey        =()=>getGroqKey().length>10;
export const hasOpenRouterKey  =()=>getOpenRouterKey().length>10;
export const hasAnyKey         =()=>hasGeminiKey()||hasGroqKey()||hasOpenRouterKey();
export const getApiKey  =getGeminiKey;
export const saveApiKey =saveGeminiKey;
export const clearApiKey=()=>{clearGeminiKey();clearGroqKey();clearOpenRouterKey();};
export const hasApiKey  =hasAnyKey;

interface M{provider:'gemini'|'groq'|'openrouter';id:string;name:string;}
const CASCADE:M[]=[
  {provider:'gemini',     id:'gemini-2.0-flash-exp',                 name:'Gemini 2.0 Flash'},
  {provider:'gemini',     id:'gemini-1.5-flash',                     name:'Gemini 1.5 Flash'},
  {provider:'groq',       id:'llama-3.3-70b-versatile',              name:'Llama 3.3 70B'},
  {provider:'groq',       id:'mixtral-8x7b-32768',                   name:'Mixtral 8x7B'},
  {provider:'openrouter', id:'deepseek/deepseek-chat:free',          name:'DeepSeek Chat'},
  {provider:'openrouter', id:'meta-llama/llama-3.1-8b-instruct:free',name:'Llama 3.1 8B'},
];
const blocked:Record<string,number>={};
const block   =(id:string,ms:number)=>{blocked[id]=Date.now()+ms;};
const isBlocked=(id:string)=>(blocked[id]||0)>Date.now();
export const getQuotaWaitSeconds=(id:string)=>Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));

import { GeneratedContent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You are a senior web developer. Generate a COMPLETE, VISUALLY STUNNING single-page website as one self-contained HTML file.

STRICT OUTPUT RULE: Start your response with <!DOCTYPE html> — nothing before it. No markdown, no backtick fences, no explanations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE — USE THESE EXACT IDs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The page has sections. Each section uses class="pg" and a specific id.
Only the first section (home) is visible. All others are hidden.

<div id="home"      class="pg" style="display:block">...</div>
<div id="about"     class="pg" style="display:none">...</div>
<div id="services"  class="pg" style="display:none">...</div>
<div id="portfolio" class="pg" style="display:none">...</div>
<div id="contact"   class="pg" style="display:none">...</div>
<div id="login"     class="pg" style="display:none">...</div>

NAVIGATION — put this exact nav block just after <body>:
<nav id="site-nav">
  <div class="nav-brand">BRAND LOGO SVG + NAME HERE</div>
  <div class="nav-links">
    <span data-page="home">Home</span>
    <span data-page="about">About</span>
    <span data-page="services">Services</span>
    <span data-page="portfolio">Portfolio</span>
    <span data-page="contact">Contact</span>
    <span data-page="login" class="nav-cta">Sign In</span>
  </div>
</nav>
NOTE: Do not style this nav — our system will style it beautifully.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO — FULL VIEWPORT WIDTH (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The hero MUST cover the full screen — no boxes, no margins:

<div id="home" class="pg" style="display:block">
  <div style="position:relative;width:100vw;min-height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-left:calc(-50vw + 50%);margin-top:-64px">
    <img src="https://source.unsplash.com/1600x900/?TOPIC,KEYWORD&sig=1" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0" alt="">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.45) 100%);z-index:1"></div>
    <div style="position:relative;z-index:2;text-align:center;padding:2rem;max-width:860px">
      <p style="color:BRAND_COLOR;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:1.5rem">TAGLINE</p>
      <h1 style="font-size:clamp(3rem,7vw,5.5rem);font-weight:900;color:white;line-height:1.05;letter-spacing:-0.03em;margin-bottom:1.5rem">HEADLINE</h1>
      <p style="font-size:1.2rem;color:rgba(255,255,255,0.8);line-height:1.7;margin-bottom:0;max-width:600px;margin-left:auto;margin-right:auto">SUBTITLE</p>
    </div>
  </div>
  <!-- Feature cards, stats etc below hero -->
</div>

IMPORTANT: The hero must have dark text on dark overlay. Use white text only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGES — USE UNSPLASH (REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use Unsplash for ALL images — it works in all browsers and iframes.
Format: https://source.unsplash.com/WIDTHxHEIGHT/?KEYWORD1,KEYWORD2&sig=N
- Use the site topic as keywords (e.g. coffee,cafe or gym,fitness or restaurant,food)
- Use a DIFFERENT sig= number for every image (sig=1, sig=2, sig=3...)
- Hero: 1600x900, Cards: 800x500, Portraits: 500x600, Gallery: 700x500
- NEVER use loremflickr.com, picsum.photos, or placeholder.com

Examples:
  Coffee hero:   https://source.unsplash.com/1600x900/?coffee,cafe&sig=1
  Coffee card:   https://source.unsplash.com/800x500/?coffee,espresso&sig=2
  Person:        https://source.unsplash.com/500x600/?person,portrait&sig=3
  Gym hero:      https://source.unsplash.com/1600x900/?gym,workout&sig=1
  Tech hero:     https://source.unsplash.com/1600x900/?technology,office&sig=1
  Restaurant:    https://source.unsplash.com/800x500/?restaurant,food&sig=2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED SECTIONS WITH REAL CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOME: Hero (full-width as above) → 3 feature cards → stats bar (4 numbers)

ABOUT: Header badge + headline → 2-col (3 paragraphs + image) → Mission/Vision/Values cards → Team grid (4 members with unsplash portraits (500x600/?person,portrait&sig=N)) → Timeline (4 milestones) → Testimonials (3 quotes)

SERVICES: Header → 3-4 cards (unsplash image, icon, name, price, 4 bullet features, CTA button) → Why choose us (3 benefit cards)

PORTFOLIO: Header → 6-image grid with hover overlay (project name + View button) → Filter tabs

CONTACT:
- Top: gradient banner "Let's Work Together" 
- Body: left = 3 contact info cards (icon + label + value) | right = form (Name, Email row; Subject; Message 6 rows; Submit gradient button)
- Bottom: social links row

LOGIN: Dark gradient background → centered card → Sign In / Create Account tabs → forms → Google + GitHub auth buttons → "Back to Home" link

FOOTER: after all .pg divs, dark (#0f172a), 4 columns, social icons, copyright

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN QUALITY — PREMIUM AGENCY LEVEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Google Font: add to <head>: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
- Use font-family:'Inter',sans-serif on body
- Generous spacing: sections padding: 6rem 2rem minimum
- Cards: background:white; border-radius:20px; box-shadow:0 4px 24px rgba(0,0,0,0.08); padding:2rem
- Hover: transition:transform 0.3s ease,box-shadow 0.3s ease on cards, transform:translateY(-6px) on hover
- Buttons: gradient backgrounds, border-radius:12px, padding:14px 32px, font-weight:700
- Section labels: small uppercase badge above headings
- Color scheme: derive from brand topic — coffee=warm amber/brown, gym=bold red/orange, tech=indigo/violet
- All headings: font-weight:800 or 900, letter-spacing:-0.03em
- Body text: color:#475569, line-height:1.7

TAB SWITCHER FOR LOGIN — include this script:
<script>
function switchTab(tab){
  ['signin','signup'].forEach(function(t){
    var f=document.getElementById('form-'+t);
    var b=document.getElementById('tab-'+t);
    if(f) f.style.display = t===tab?'block':'none';
    if(b){ b.style.background=t===tab?'white':'transparent'; b.style.color=t===tab?'#1e1b4b':'rgba(255,255,255,0.65)'; }
  });
}
</script>
`;

// ─────────────────────────────────────────────────────────────────────────────
// POST-PROCESSOR — rebuilds nav + injects CSS + fixes hero after every call
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_LABELS: Record<string,string> = {
  home:'Home', about:'About', services:'Services', portfolio:'Portfolio',
  contact:'Contact', login:'Sign In', shop:'Shop', cart:'Cart',
  team:'Team', blog:'Blog', pricing:'Pricing', gallery:'Gallery', menu:'Menu', faq:'FAQ',
};

function postProcess(html: string): string {
  // ── 1. Find brand color from content ─────────────────────────────────────
  let brandColor = '#6366f1';
  let brandLight = 'rgba(99,102,241,0.15)';
  if (/coffee|cafe|brew|espresso|latte|restaurant|food|bistro|kitchen|bakery/i.test(html))
    { brandColor='#d97706'; brandLight='rgba(217,119,6,0.12)'; }
  else if (/gym|fitness|sport|crossfit|train|workout|muscle/i.test(html))
    { brandColor='#ef4444'; brandLight='rgba(239,68,68,0.12)'; }
  else if (/law|legal|attorney|firm|consult|counsel/i.test(html))
    { brandColor='#1e40af'; brandLight='rgba(30,64,175,0.12)'; }
  else if (/health|medical|clinic|doctor|hospital|wellness/i.test(html))
    { brandColor='#0891b2'; brandLight='rgba(8,145,178,0.12)'; }
  else if (/tech|saas|software|app|startup|digital|ai|cloud/i.test(html))
    { brandColor='#6366f1'; brandLight='rgba(99,102,241,0.12)'; }
  else if (/fashion|style|boutique|luxury|beauty|spa|salon/i.test(html))
    { brandColor='#be185d'; brandLight='rgba(190,24,93,0.12)'; }
  else if (/hotel|resort|travel|tour|hospitality/i.test(html))
    { brandColor='#0f766e'; brandLight='rgba(15,118,110,0.12)'; }

  // ── 2. Extract brand name ─────────────────────────────────────────────────
  let brand = 'Visinaro';
  const titleM = html.match(/<title[^>]*>([^<|–-]+)/i);
  if (titleM) brand = titleM[1].trim().slice(0,30);

  // ── 3. Detect all section IDs — try multiple patterns ────────────────────
  const sectionIds: string[] = [];
  const KNOWN = ['home','about','services','portfolio','contact','login','shop','menu','team','blog','pricing','gallery','faq'];

  // Pattern 1: id="xxx" class="pg"  OR  class="pg" ... id="xxx"
  const pat1 = /(?:id="([^"]+)"[^>]*class="[^"]*pg[^"]*"|class="[^"]*pg[^"]*"[^>]*id="([^"]+)")/g;
  let m1: RegExpExecArray | null;
  while ((m1 = pat1.exec(html)) !== null) {
    const id = m1[1] || m1[2];
    if (id && !sectionIds.includes(id)) sectionIds.push(id);
  }
  // Pattern 2: scan for known IDs directly
  KNOWN.forEach(id => {
    if (html.includes(`id="${id}"`) && !sectionIds.includes(id)) sectionIds.push(id);
  });
  // Pattern 3: look in the nav data-page attributes (most reliable when AI follows instructions)
  const dpPat = /data-page="([^"]+)"/g;
  let dpM: RegExpExecArray | null;
  while ((dpM = dpPat.exec(html)) !== null) {
    if (!sectionIds.includes(dpM[1])) sectionIds.push(dpM[1]);
  }

  const ids = sectionIds.length >= 2 ? sectionIds : ['home','about','services','portfolio','contact','login'];

  // ── 4. Build beautiful fixed navbar ──────────────────────────────────────
  const logoSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="${brandColor}"/><path d="M8 16l5 5 11-10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const navLinks = ids.map(id => {
    const label = PAGE_LABELS[id] || id.charAt(0).toUpperCase()+id.slice(1);
    if (id === 'login') {
      return `<span onclick="goTo('login')" data-page="login" style="background:${brandColor};color:white;padding:9px 22px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;white-space:nowrap;transition:opacity 0.2s;box-shadow:0 2px 8px ${brandColor}55" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">${label}</span>`;
    }
    return `<span onclick="goTo('${id}')" data-page="${id}" class="nl" style="color:rgba(255,255,255,0.72);cursor:pointer;font-size:14px;font-weight:500;padding:6px 0;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap" onmouseover="this.style.color='white'" onmouseout="if(currentPage!=='${id}')this.style.color='rgba(255,255,255,0.72)'">${label}</span>`;
  }).join('');

  const fixedNav = `<nav id="vi-nav" style="position:fixed;top:0;left:0;right:0;z-index:99999;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;background:rgba(6,6,18,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.08);font-family:'Inter',system-ui,sans-serif;box-shadow:0 1px 0 rgba(255,255,255,0.06)">
  <span onclick="goTo('${ids[0]}')" style="color:white;font-weight:800;font-size:1.15rem;cursor:pointer;display:flex;align-items:center;gap:10px;letter-spacing:-0.025em;text-decoration:none;flex-shrink:0">${logoSvg}<span>${brand}</span></span>
  <div style="display:flex;align-items:center;gap:2rem;flex-shrink:0">${navLinks}</div>
</nav>`;

  // Remove existing nav (always broken from AI), replace with ours
  let out = html.replace(/<nav[\s\S]*?<\/nav>/i, fixedNav);
  if (!out.includes('id="vi-nav"')) out = out.replace('<body>', '<body>'+fixedNav);

  // ── 5. Fix hero — strip any max-width/margin containers ──────────────────
  // Override any container that wraps the hero
  const heroFixCSS = `
  /* HERO FULL WIDTH OVERRIDE */
  #home > *:first-child { max-width:100vw !important; width:100vw !important; margin-left:0 !important; margin-right:0 !important; padding-left:0 !important; padding-right:0 !important; }
  #home > div:first-child > div:first-child { max-width:100% !important; width:100% !important; }
  #home > div:first-child img { width:100% !important; max-width:none !important; height:100% !important; object-fit:cover !important; }`;

  // ── 6. Inject base CSS ────────────────────────────────────────────────────
  const baseCSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; overflow-x: hidden; }
  .pg { min-height: 100vh; width: 100%; padding-top: 64px; }
  ${heroFixCSS}
  /* Cards */
  .card { background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 2rem; transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
  /* Buttons */
  .btn-primary { display:inline-block; background:linear-gradient(135deg,${brandColor},${brandColor}dd); color:white; padding:14px 32px; border-radius:12px; font-weight:700; font-size:15px; border:none; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px ${brandColor}44; }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px ${brandColor}55; }
  .btn-outline { display:inline-block; background:transparent; color:white; padding:13px 31px; border-radius:12px; font-weight:600; font-size:15px; border:2px solid rgba(255,255,255,0.45); cursor:pointer; transition:all 0.2s; }
  .btn-outline:hover { background:rgba(255,255,255,0.1); border-color:white; }
  /* Section labels */
  .badge { display:inline-block; background:${brandLight}; color:${brandColor}; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; padding:6px 16px; border-radius:999px; margin-bottom:1rem; border:1px solid ${brandColor}33; }
  /* Headings */
  h1,h2,h3 { letter-spacing:-0.03em; }
  h2 { font-size:clamp(1.8rem,4vw,2.75rem); font-weight:800; color:#0f172a; line-height:1.15; }
  h3 { font-size:1.3rem; font-weight:700; color:#0f172a; }
  p { color:#475569; line-height:1.75; }
  /* Inputs */
  input, textarea, select { font-family:inherit; font-size:15px; }
  input:focus, textarea:focus, select:focus { outline:2px solid ${brandColor}; outline-offset:2px; }
  /* Portfolio hover */
  .port-item { position:relative; overflow:hidden; border-radius:16px; cursor:pointer; }
  .port-item img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; transition:transform 0.4s ease; }
  .port-item:hover img { transform:scale(1.06); }
  .port-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.3) 60%,transparent 100%); opacity:0; transition:opacity 0.3s ease; display:flex; align-items:flex-end; padding:1.5rem; }
  .port-item:hover .port-overlay { opacity:1; }
  /* Scrollbar */
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:3px; }
  /* Section spacing */
  section, .section { padding: 6rem 2rem; }
  /* Grid helpers */
  .grid-3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; }
  .grid-2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:2rem; align-items:center; }
  /* Max width container */
  .container { max-width:1200px; margin:0 auto; padding:0 2rem; }
  /* Team cards */
  .team-card img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:16px; margin-bottom:1rem; }
  /* Testimonial */
  .testimonial { background:white; border-radius:20px; padding:2rem; box-shadow:0 4px 20px rgba(0,0,0,0.07); border-left:4px solid ${brandColor}; }
  /* Form */
  .form-input { width:100%; padding:14px 16px; border:1.5px solid #e2e8f0; border-radius:12px; background:white; color:#0f172a; transition:border-color 0.2s; margin-bottom:1rem; }
  .form-input:focus { border-color:${brandColor}; outline:none; box-shadow:0 0 0 3px ${brandColor}22; }
  /* ul reset for feature lists */
  ul li { list-style:none; padding-left:0; }
</style>`;

  out = out.replace('</head>', baseCSS + '\n</head>');

  // ── 7. Inject navigation JS ───────────────────────────────────────────────
  let currentPage = ids[0] || 'home';
  const navScript = `
<script>
var currentPage = '${ids[0] || 'home'}';
var BRAND_COLOR = '${brandColor}';

window.goTo = function(id) {
  currentPage = id;
  // Hide all sections
  document.querySelectorAll('.pg').forEach(function(el){ el.style.display='none'; });
  // Show target
  var target = document.getElementById(id);
  if (target) { target.style.display='block'; window.scrollTo(0,0); }
  // Update nav links
  document.querySelectorAll('[data-page]').forEach(function(el){
    var page = el.getAttribute('data-page');
    if (page === 'login') return; // don't change Sign In button color
    var isActive = page === id;
    el.style.color = isActive ? 'white' : 'rgba(255,255,255,0.72)';
    el.style.borderBottomColor = isActive ? BRAND_COLOR : 'transparent';
    el.style.fontWeight = isActive ? '700' : '500';
  });
};

// Login tab switcher
window.switchTab = function(tab) {
  ['signin','signup'].forEach(function(t){
    var f = document.getElementById('form-'+t);
    var b = document.getElementById('tab-'+t);
    if (f) f.style.display = t===tab ? 'block' : 'none';
    if (b) {
      b.style.background = t===tab ? 'white' : 'transparent';
      b.style.color = t===tab ? '#1e1b4b' : 'rgba(255,255,255,0.65)';
    }
  });
};

// Block all anchor navigation — prevent leaving the page
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href]');
  if (!a) return;
  var h = (a.getAttribute('href')||'').trim();
  if (h.startsWith('#') && h.length > 1) {
    e.preventDefault();
    var id = h.slice(1);
    if (document.getElementById(id)) window.goTo(id);
    return;
  }
  if (h.startsWith('http') || h.startsWith('//')) {
    e.preventDefault();
    try { window.open(h, '_blank', 'noopener'); } catch(x) {}
    return;
  }
  if (h && h !== '#' && h !== 'javascript:void(0)' && h !== 'javascript:;') e.preventDefault();
}, true);

// Init — show first section only
(function init(){
  var pages = Array.from(document.querySelectorAll('.pg'));
  if (pages.length > 1) {
    pages.forEach(function(p, i){ p.style.display = i===0 ? 'block' : 'none'; });
    if (pages[0].id) window.goTo(pages[0].id);
  }
})();
</script>`;

  out = out.includes('</body>') ? out.replace('</body>', navScript+'\n</body>') : out+navScript;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
async function callModel(m: M, system: string, user: string): Promise<string> {
  const userMsg = `Build a STUNNING complete website for: ${user}

OUTPUT RULES:
1. Start with <!DOCTYPE html> — nothing before it
2. No markdown, no code fences, no explanation
3. Use section ids exactly: home, about, services, portfolio, contact, login
4. Each section: <div id="ID" class="pg" style="display:block or none">
5. Hero must be full-width (100vw), dark overlay, white text
6. Use source.unsplash.com for ALL images (topic keyword, different lock= per image)
7. Include switchTab() function for login tabs`;

  // ── Gemini ────────────────────────────────────────────────────────────────
  if (m.provider === 'gemini') {
    const key = getGeminiKey();
    if (!key || key.length < 10) throw new Error('NO_KEY:gemini');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: system + '\n\n' + userMsg }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) { const t=await res.text().catch(()=>''); throw new Error(`HTTP_${res.status}|${t.slice(0,200)}`); }
    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error(`Empty Gemini response from ${m.id}. Data: ${JSON.stringify(data).slice(0,200)}`);
    return content;
  }

  // ── Groq / OpenRouter ─────────────────────────────────────────────────────
  const key = m.provider==='groq' ? getGroqKey() : getOpenRouterKey();
  if (!key||key.length<10) throw new Error(`NO_KEY:${m.provider}`);
  const url = m.provider==='groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
  const headers: Record<string,string> = {'Content-Type':'application/json','Authorization':`Bearer ${key}`};
  if (m.provider==='openrouter'){headers['HTTP-Referer']='https://visinaro.onrender.com';headers['X-Title']='Visinaro';}
  const res = await fetch(url,{method:'POST',headers,body:JSON.stringify({
    model:m.id, messages:[{role:'system',content:system},{role:'user',content:userMsg}],
    temperature:0.35, max_tokens:8000, stream:false,
  })});
  if (!res.ok){const t=await res.text().catch(()=>'');throw new Error(`HTTP_${res.status}|${t.slice(0,200)}`);}
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${m.id}`);
  return content;
}

function extractHtml(raw: string): string {
  let html = raw.replace(/^```html\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```\s*$/im,'').trim();
  if (/^<!DOCTYPE/i.test(html)||/^<html/i.test(html)) return html;
  const m = raw.match(/<!DOCTYPE[\s\S]*<\/html>/i)||raw.match(/<html[\s\S]*<\/html>/i);
  if (m) return m[0];
  if (html.length>200) return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet"></head><body style="font-family:Inter,sans-serif">${html}</body></html>`;
  throw new Error(`Could not extract HTML from response. Length: ${raw.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
export interface GenerateResult { content: GeneratedContent; usedModel: string; usedProvider: string; }

export const generateWebsite = async (
  prompt: string, _pref: string, onProgress?: (partial: string, name?: string) => void,
): Promise<GenerateResult> => {
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');
  let lastErrMsg = '';
  for (const m of CASCADE) {
    if (m.provider==='gemini'     && !hasGeminiKey())     continue;
    if (m.provider==='groq'       && !hasGroqKey())       continue;
    if (m.provider==='openrouter' && !hasOpenRouterKey()) continue;
    if (isBlocked(m.id)) continue;
    try {
      onProgress?.('', m.name);
      const raw = await callModel(m, SYSTEM, prompt);
      const html = extractHtml(raw);
      const final = postProcess(html);
      return { content:{html:final,css:'',javascript:''}, usedModel:m.name, usedProvider:m.provider };
    } catch (err:any) {
      lastErrMsg = String(err?.message||err);
      const msg = lastErrMsg.toLowerCase();
      console.warn(`[Visinaro] ${m.id} failed: ${lastErrMsg.slice(0,120)}`);
      if (msg.includes('no_key:')) continue;
      if (msg.includes('401')||msg.includes('403')||msg.includes('api_key')||msg.includes('authentication'))
        { CASCADE.filter(x=>x.provider===m.provider).forEach(x=>block(x.id,600_000)); continue; }
      if (msg.includes('429')||msg.includes('rate limit')||msg.includes('quota'))
        { block(m.id,90_000); continue; }
      if (msg.includes('404')||msg.includes('no endpoints'))
        { block(m.id,24*3600_000); continue; }
      block(m.id,5_000);
    }
  }
  throw new Error('Generation failed. Please try again.');
};

export const optimizeSEO = async (html:string, prompt:string): Promise<{improvedHtml:string;seoReport:string}> => {
  const m = CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='gemini'&&hasGeminiKey())||(x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return {improvedHtml:html,seoReport:'No model available.'};
  try {
    const raw = await callModel(m,'Improve meta tags, title, description, schema.org JSON-LD, heading hierarchy, alt texts. Return ONLY the improved complete HTML.',`Prompt: ${prompt}\n\nHTML:\n${html.slice(0,6000)}`);
    const improved = extractHtml(raw);
    return {improvedHtml:improved.length>200?postProcess(improved):html, seoReport:'SEO meta tags, schema markup, alt texts updated.'};
  } catch { return {improvedHtml:html,seoReport:'SEO unavailable.'}; }
};

export const enhancePrompt = async (idea:string): Promise<string> => {
  const m = CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='gemini'&&hasGeminiKey())||(x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return idea;
  try { const raw=await callModel(m,'Expand into a detailed website brief. Output ONLY the brief, no preamble.',`Expand: ${idea}`); return raw.trim()||idea; }
  catch { return idea; }
};
