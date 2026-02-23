/**
 * VISINARO AI SERVICE — Self-contained HTML generation
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

import { GeneratedContent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You are an expert web developer. Generate a COMPLETE, BEAUTIFUL, PROFESSIONAL website as a single self-contained HTML file.

STRICT OUTPUT RULES:
- Output ONLY raw HTML starting with <!DOCTYPE html>
- No markdown, no backticks, no explanation before or after
- Every section must have REAL, RICH content — no placeholder text

════════════════════════════════════════════════════════════
NAVIGATION SYSTEM — USE EXACTLY AS SHOWN
════════════════════════════════════════════════════════════

NAVBAR — use inline style="display:flex", NEVER class="hidden md:flex":
<nav style="position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,0.93);backdrop-filter:blur(12px);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;border-bottom:1px solid rgba(255,255,255,0.07)">
  <span onclick="goTo('home')" style="color:white;font-weight:800;font-size:1.25rem;cursor:pointer;display:flex;align-items:center;gap:8px">
    [SVG LOGO] [BRAND NAME]
  </span>
  <div style="display:flex;align-items:center;gap:1.75rem">
    <span onclick="goTo('home')"     class="nl" style="color:white;cursor:pointer;font-size:0.875rem;font-weight:600;border-bottom:2px solid white;padding-bottom:2px">Home</span>
    <span onclick="goTo('about')"    class="nl" style="color:rgba(255,255,255,0.65);cursor:pointer;font-size:0.875rem">About</span>
    <span onclick="goTo('services')" class="nl" style="color:rgba(255,255,255,0.65);cursor:pointer;font-size:0.875rem">Services</span>
    <span onclick="goTo('portfolio')" class="nl" style="color:rgba(255,255,255,0.65);cursor:pointer;font-size:0.875rem">Portfolio</span>
    <span onclick="goTo('contact')"  class="nl" style="color:rgba(255,255,255,0.65);cursor:pointer;font-size:0.875rem">Contact</span>
    <span onclick="goTo('login')" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:0.5rem 1.25rem;border-radius:8px;cursor:pointer;font-size:0.875rem;font-weight:600">Sign In</span>
  </div>
</nav>

SECTIONS — only #home has display:block, all others display:none:
<div id="home"      class="pg" style="display:block;padding-top:64px">...</div>
<div id="about"     class="pg" style="display:none;padding-top:64px">...</div>
<div id="services"  class="pg" style="display:none;padding-top:64px">...</div>
<div id="portfolio" class="pg" style="display:none;padding-top:64px">...</div>
<div id="contact"   class="pg" style="display:none;padding-top:64px">...</div>
<div id="login"     class="pg" style="display:none;padding-top:64px">...</div>

NAVIGATION SCRIPT — copy this EXACTLY at end of body:
<script>
function goTo(id){
  document.querySelectorAll('.pg').forEach(function(el){el.style.display='none';});
  var t=document.getElementById(id);
  if(t){t.style.display='block';window.scrollTo(0,0);}
  document.querySelectorAll('.nl').forEach(function(el){
    var active=el.getAttribute('onclick')&&el.getAttribute('onclick').indexOf("'"+id+"'")>=0;
    el.style.color=active?'white':'rgba(255,255,255,0.65)';
    el.style.borderBottom=active?'2px solid white':'none';
    el.style.fontWeight=active?'600':'400';
  });
}
document.addEventListener('click',function(e){
  var a=e.target.closest('a[href]');if(!a)return;
  var h=(a.getAttribute('href')||'').trim();
  if(h.startsWith('#')&&h.length>1){e.preventDefault();var id=h.slice(1);if(document.getElementById(id))goTo(id);return;}
  if(h.startsWith('http')||h.startsWith('//')){e.preventDefault();window.open(h,'_blank');return;}
  if(h&&h!=='#'&&h!=='javascript:void(0)'){e.preventDefault();}
},true);
</script>

════════════════════════════════════════════════════════════
IMAGES — LOREMFLICKR ONLY
════════════════════════════════════════════════════════════
Use topic-relevant real photos. Format: https://loremflickr.com/WIDTH/HEIGHT/KEYWORD?lock=N
- ALWAYS use the site topic as keyword: coffee, gym, restaurant, law, tech, fashion, etc.
- NEVER use picsum.photos — it gives random unrelated images
- Use different lock numbers for every image: lock=1, lock=2, lock=3...
- Hero: 1400x700, Cards: 600x400, Portraits: 400x500, Gallery: 600x400

════════════════════════════════════════════════════════════
REQUIRED SECTIONS — ALL MUST HAVE FULL RICH CONTENT
════════════════════════════════════════════════════════════

1. HOME SECTION:
- Full viewport hero: background image with dark overlay, large bold headline, subtitle, 2 CTA buttons
- Below hero: 3 value proposition cards with icons, titles, descriptions
- Stats bar: 4 numbers (e.g. "500+ Clients", "10 Years", etc.)

2. ABOUT SECTION (must be long and rich):
- Section header with label badge and headline
- 2-column: left = story text (3+ paragraphs), right = brand image
- Mission/Vision/Values: 3 cards with icons
- Team grid: 4 members, each with portrait photo, name, role, bio text, social icons
- Timeline: 4-5 company milestones with years
- Testimonials: 3 quote cards with photo, name, company, rating stars

3. SERVICES SECTION:
- Section header
- 3-4 service cards: each with loremflickr image, emoji icon, service name, price/tag, 4 feature bullet points, CTA button
- Why choose us: 3 benefit cards

4. PORTFOLIO SECTION:
- 6 portfolio items in a grid: loremflickr image, overlay on hover showing project name + "View Project" button
- Filter tabs: All, Design, Development, Marketing

5. CONTACT SECTION — ELEGANT DESIGN:
- Full-width gradient hero banner at top with "Let's Talk" heading
- 3 contact info cards (Address, Phone, Email) with icons and styled boxes
- Large contact form on the right side:
  - Name + Email in a row
  - Subject dropdown
  - Message textarea (6 rows)
  - "Send Message" button with gradient
- Map placeholder (dark styled box with address overlay)
- Social media links row

6. LOGIN/SIGNUP SECTION:
- Dark gradient background (e.g. deep navy or brand color)
- Centered card with glassmorphism effect
- Toggle tabs: "Sign In" and "Create Account"
- Sign In form: Email, Password, "Forgot password?" link, Sign In button
- Sign Up form: Full Name, Email, Password, Confirm Password, Sign Up button
- Social auth: "Continue with Google" and "Continue with GitHub" buttons with proper SVG icons
- "Back to Home" link at bottom that calls goTo('home')

7. FOOTER (after all .pg divs):
- Dark background (#0f172a)
- 4 columns: Brand + description, Quick Links, Services, Newsletter signup
- Social icons row
- Copyright bar with "All rights reserved"

════════════════════════════════════════════════════════════
DESIGN STANDARDS
════════════════════════════════════════════════════════════
- Color scheme: derive from the brand/topic (warm amber for coffee, blue for tech, etc.)
- Typography: large bold headings (clamp sizes), readable body text
- Spacing: generous padding (py-24 equivalent = padding:6rem 0)
- Cards: white background, rounded-2xl, shadow, hover lift effect (transition + transform)
- Buttons: gradient backgrounds, rounded-xl, hover scale effect
- Use inline styles for positioning and layout
- Use Tailwind utility classes for colors, typography, shadows
`;

// ─────────────────────────────────────────────────────────────────────────────
async function callModel(m: M, system: string, user: string): Promise<string> {
  const key = m.provider==='groq' ? getGroqKey() : getOpenRouterKey();
  if (!key || key.length < 10) throw new Error(`NO_KEY:${m.provider}`);

  const url = m.provider==='groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';

  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  };
  if (m.provider==='openrouter') {
    headers['HTTP-Referer'] = 'https://visinaro.onrender.com';
    headers['X-Title'] = 'Visinaro';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: m.id,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Create a complete professional website for: ${user}\n\nRemember: output ONLY raw HTML starting with <!DOCTYPE html>. Include ALL 7 sections: home, about, services, portfolio, contact, login, footer.` }
      ],
      temperature: 0.3,
      max_tokens: 8000,
      stream: false,
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

function extractHtml(raw: string): string {
  let html = raw.replace(/^```html\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```\s*$/im,'').trim();
  if (/^<!DOCTYPE/i.test(html) || /^<html/i.test(html)) return html;
  const m = raw.match(/<!DOCTYPE[\s\S]*<\/html>/i) || raw.match(/<html[\s\S]*<\/html>/i);
  if (m) return m[0];
  if (html.length > 200) return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>*{box-sizing:border-box}html,body{margin:0;padding:0}.pg{min-height:100vh;width:100%}</style></head><body>${html}</body></html>`;
  throw new Error(`Could not extract HTML. Response length: ${raw.length}`);
}

function ensureNavigation(html: string): string {
  // Always inject a bulletproof click interceptor + goTo fallback
  const script = `
<script>
(function(){
  if(typeof window.goTo!=='function'){
    window.goTo=function(id){
      document.querySelectorAll('.pg').forEach(function(el){el.style.display='none';});
      var t=document.getElementById(id);if(t){t.style.display='block';window.scrollTo(0,0);}
      document.querySelectorAll('.nl').forEach(function(el){
        var active=el.getAttribute('onclick')&&el.getAttribute('onclick').indexOf("'"+id+"'")>=0;
        el.style.color=active?'white':'rgba(255,255,255,0.65)';
        el.style.borderBottom=active?'2px solid white':'none';
      });
    };
  } else { window.goTo=goTo; }
  // Intercept all anchor clicks — capture phase
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');if(!a)return;
    var h=(a.getAttribute('href')||'').trim();
    if(h.startsWith('#')&&h.length>1){e.preventDefault();var id=h.slice(1);if(document.getElementById(id))window.goTo(id);return;}
    if(h.startsWith('http')||h.startsWith('//')){e.preventDefault();try{window.open(h,'_blank','noopener');}catch(x){}return;}
    if(h&&h!=='#'&&h!=='javascript:void(0)'&&h!=='javascript:;')e.preventDefault();
  },true);
})();
</script>`;
  return html.includes('</body>') ? html.replace('</body>', script+'\n</body>') : html+script;
}

// ─────────────────────────────────────────────────────────────────────────────
export interface GenerateResult { content: GeneratedContent; usedModel: string; usedProvider: string; }

export const generateWebsite = async (
  prompt: string,
  _pref: string,
  onProgress?: (partial: string, name?: string) => void,
): Promise<GenerateResult> => {
  if (!hasAnyKey()) throw new Error('API_KEY_MISSING');
  let lastErrMsg = '';

  for (const m of CASCADE) {
    if (m.provider==='groq' && !hasGroqKey()) continue;
    if (m.provider==='openrouter' && !hasOpenRouterKey()) continue;
    if (isBlocked(m.id)) continue;
    try {
      onProgress?.('', m.name);
      const raw = await callModel(m, SYSTEM, prompt);
      const html = extractHtml(raw);
      const finalHtml = ensureNavigation(html);
      return { content: { html: finalHtml, css: '', javascript: '' }, usedModel: m.name, usedProvider: m.provider };
    } catch (err: any) {
      lastErrMsg = String(err?.message || err);
      const msg = lastErrMsg.toLowerCase();
      console.warn(`[Visinaro] ${m.id} failed: ${lastErrMsg.slice(0,100)}`);
      if (msg.includes('no_key:')) continue;
      if (msg.includes('401')||msg.includes('403')||msg.includes('authentication'))
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

export const optimizeSEO = async (html: string, prompt: string): Promise<{improvedHtml:string;seoReport:string}> => {
  const m = CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return { improvedHtml: html, seoReport: 'No model available.' };
  try {
    const raw = await callModel(m, 'You are an SEO expert. Improve meta tags, title, description, schema.org, headings, alt texts. Return ONLY the complete improved HTML.', `Prompt: ${prompt}\n\nHTML:\n${html.slice(0,6000)}`);
    const improved = extractHtml(raw);
    return { improvedHtml: improved.length>200?improved:html, seoReport: 'SEO meta tags, schema markup, alt texts updated.' };
  } catch { return { improvedHtml: html, seoReport: 'SEO optimization unavailable.' }; }
};

export const enhancePrompt = async (idea: string): Promise<string> => {
  const m = CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if (!m) return idea;
  try {
    const raw = await callModel(m, 'Expand this into a detailed website brief. Output ONLY the expanded prompt, no preamble.', `Expand: ${idea}`);
    return raw.trim()||idea;
  } catch { return idea; }
};
