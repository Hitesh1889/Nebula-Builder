/**
 * VISINARO AI SERVICE
 * Key fix: postProcess() replaces ALL AI image URLs with curated working Unsplash IDs
 * and rebuilds the contact section to be elegant.
 */

// ─── Storage ───────────────────────────────────────────────────────────────
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

// ─── Model cascade ─────────────────────────────────────────────────────────
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
const block=(id:string,ms:number)=>{blocked[id]=Date.now()+ms;};
const isBlocked=(id:string)=>(blocked[id]||0)>Date.now();
export const getQuotaWaitSeconds=(id:string)=>Math.max(0,Math.ceil(((blocked[id]||0)-Date.now())/1000));

import { GeneratedContent } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// CURATED IMAGE LIBRARY
// source.unsplash.com was deprecated in 2023 — always broken.
// These are verified stable images.unsplash.com photo IDs.
// ─────────────────────────────────────────────────────────────────────────────
const IMG: Record<string, string[]> = {
  coffee:     ['photo-1495474472287-4d71bcdd2085','photo-1509042239860-f550ce710b93','photo-1514432324607-a09d9b4aefdd','photo-1442512595331-e89e73853f31','photo-1447933601403-0c6688de566e','photo-1520970014086-2208d157e9d6','photo-1485808191679-5f86510bd9d2','photo-1554118811-1e0d58224f24','photo-1501747315-124a0eaca060','photo-1459755486867-b55449bb39ff'],
  restaurant: ['photo-1414235077428-338989a2e8c0','photo-1517248135467-4c7edcad34c4','photo-1424847651672-bf20a4b0982b','photo-1540189549336-e6e99c3679fe','photo-1476224203421-9ac39bcb3327','photo-1467003909585-2f8a72700288','photo-1504674900247-0877df9cc836','photo-1565299624946-b28f40a0ae38','photo-1512621776951-a57141f2eefd','photo-1555396273-367ea4eb4db5'],
  gym:        ['photo-1534438327276-14e5300c3a48','photo-1571019613454-1cb2f99b2d8b','photo-1517836357463-d25dfeac3438','photo-1581009137042-c552e485697a','photo-1583454110551-21f2fa2afe61','photo-1549060279-7e168fcee0c2','photo-1518611012118-696072aa579a','photo-1526506118085-60ce8714f8c5','photo-1574680096145-d05b474e2155','photo-1540497077202-7c8a3999166f'],
  tech:       ['photo-1531297484001-80022131f5a1','photo-1461749280684-dccba630e2f6','photo-1504384308090-c894fdcc538d','photo-1518770660439-4636190af475','photo-1573164713988-8665fc963095','photo-1498050108023-c5249f4df085','photo-1555066931-4365d14bab8c','photo-1563986768494-4dee2763ff3f','photo-1519389950473-47ba0277781c','photo-1522202176988-66273c2fd55f'],
  fashion:    ['photo-1445205170230-053b83016050','photo-1483985988355-763728e1935b','photo-1558618666-fcd25c85cd64','photo-1469334031218-e382a71b716b','photo-1515886657613-9f3515b0c78f','photo-1509631179647-0177331693ae','photo-1490481651871-ab68de25d43d','photo-1525507119028-ed4c629a60a3','photo-1496747611176-843222e1e57c','photo-1536766820879-059fec98ec0a'],
  law:        ['photo-1589829545856-d10d557cf95f','photo-1450101499163-c8848c66ca85','photo-1479142506502-19b3a3b7ff33','photo-1521791136064-7986c2920216','photo-1507679799987-c73779587ccf','photo-1542744094-3a31f272c490','photo-1628348068343-c6a848d2b6dd','photo-1453728013993-6d66e9c9123a'],
  hotel:      ['photo-1566073771259-6a8506099945','photo-1582719508461-905c673771fd','photo-1445019980597-93fa8acb246c','photo-1571003123894-1f0594d2b5d9','photo-1520250497591-112f2f40a3f4','photo-1542314831-068cd1dbfeeb','photo-1455587734955-081b22074882','photo-1551882547-ff40c63fe2fa'],
  medical:    ['photo-1551190822-a9333d879b1f','photo-1576091160550-2173dba999ef','photo-1559757148-5c350d0d3c56','photo-1584982751601-97dcc096659c','photo-1530497610245-94d3c16cda28','photo-1579684385127-1ef15d508118'],
  portrait:   ['photo-1507003211169-0a1dd7228f2d','photo-1494790108377-be9c29b29330','photo-1438761681033-6461ffad8d80','photo-1472099645785-5658abf4ff4e','photo-1500648767791-00dcc994a43e','photo-1534528741775-53994a69daeb','photo-1573497019940-1c28c88b4f3e','photo-1564564321837-a57b7070ac4f','photo-1573496359142-b8d87734a5a2','photo-1580489944761-15a19d654956'],
  office:     ['photo-1497366216548-37526070297c','photo-1497366754035-f200968a6e72','photo-1568992687947-868a62a9f521','photo-1516321318423-f06f85e504b3','photo-1542744173-8e7e53415bb0','photo-1521737604893-d14cc237f11d','photo-1553877522-43269d4ea984','photo-1497215842964-222b430dc094'],
};

function detectTopic(html: string): string {
  const t = html.toLowerCase();
  if (/coffee|cafe|brew|espresso|latte|barista/.test(t)) return 'coffee';
  if (/restaurant|bistro|dine|cuisine|chef|food/.test(t)) return 'restaurant';
  if (/gym|fitness|workout|muscle|crossfit|training/.test(t)) return 'gym';
  if (/fashion|boutique|clothing|apparel|style/.test(t)) return 'fashion';
  if (/law|legal|attorney|lawyer|counsel/.test(t)) return 'law';
  if (/hotel|resort|hospitality|lodging/.test(t)) return 'hotel';
  if (/medical|health|clinic|doctor|hospital/.test(t)) return 'medical';
  if (/saas|software|tech|app|startup|digital|ai/.test(t)) return 'tech';
  return 'office';
}

function getImg(topic: string, idx: number, w = 800, h = 500): string {
  const pool = IMG[topic] || IMG.office;
  const id = pool[idx % pool.length];
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — tell AI to use placeholder markers, we replace with real images
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You are a senior web developer. Generate a COMPLETE, BEAUTIFUL, PROFESSIONAL website as one self-contained HTML file.

STRICT OUTPUT RULE: Start with <!DOCTYPE html> — nothing before it. No markdown, no code fences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGE PLACEHOLDERS — VERY IMPORTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For ALL images use these placeholder tokens (our system replaces them with real photos):
- Hero background:  {{IMG_HERO}}
- Section image:    {{IMG_SECTION}}
- Card image 1-6:   {{IMG_CARD_1}} {{IMG_CARD_2}} {{IMG_CARD_3}} {{IMG_CARD_4}} {{IMG_CARD_5}} {{IMG_CARD_6}}
- Person/portrait:  {{IMG_PERSON_1}} {{IMG_PERSON_2}} {{IMG_PERSON_3}} {{IMG_PERSON_4}}
- Gallery items:    {{IMG_GALLERY_1}} through {{IMG_GALLERY_6}}

Use as src attribute: <img src="{{IMG_HERO}}" ...> or as background: style="background-image:url('{{IMG_HERO}}')"
DO NOT use any other image URLs — no unsplash, no picsum, no loremflickr. ONLY the {{IMG_xxx}} tokens.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE — EXACT IDs REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<div id="home"      class="pg" style="display:block">...</div>
<div id="about"     class="pg" style="display:none">...</div>
<div id="services"  class="pg" style="display:none">...</div>
<div id="portfolio" class="pg" style="display:none">...</div>
<div id="contact"   class="pg" style="display:none">...</div>
<div id="login"     class="pg" style="display:none">...</div>

NAVIGATION — use data-page attributes, our system styles it:
<nav id="site-nav">
  <div class="nav-brand">BRAND NAME</div>
  <div class="nav-links">
    <span data-page="home">Home</span>
    <span data-page="about">About</span>
    <span data-page="services">Services</span>
    <span data-page="portfolio">Portfolio</span>
    <span data-page="contact">Contact</span>
    <span data-page="login" class="nav-cta">Sign In</span>
  </div>
</nav>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO — FULL VIEWPORT WIDTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<div style="position:relative;width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-top:-64px">
  <img src="{{IMG_HERO}}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0" alt="">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,0.80),rgba(0,0,0,0.40));z-index:1"></div>
  <div style="position:relative;z-index:2;text-align:center;padding:2rem;max-width:800px">
    <p style="color:ACCENT_COLOR;font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:1.5rem">TAGLINE</p>
    <h1 style="font-size:clamp(3rem,7vw,5.5rem);font-weight:900;color:white;line-height:1.05;letter-spacing:-0.03em;margin-bottom:1.5rem">MAIN HEADLINE</h1>
    <p style="font-size:1.2rem;color:rgba(255,255,255,0.82);line-height:1.7;max-width:580px;margin:0 auto">SUBTITLE</p>
  </div>
</div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT SECTION — ELEGANT DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build a stunning contact section with this exact layout:
<div id="contact" class="pg" style="display:none">
  <!-- Top gradient banner -->
  <div style="background:linear-gradient(135deg,DARK_COLOR,ACCENT_COLOR);padding:5rem 2rem;text-align:center">
    <p style="color:rgba(255,255,255,0.7);font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:1rem">GET IN TOUCH</p>
    <h2 style="color:white;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;letter-spacing:-0.03em;margin-bottom:1rem">Let's Work Together</h2>
    <p style="color:rgba(255,255,255,0.75);font-size:1.1rem;max-width:500px;margin:0 auto">Have a project in mind? We'd love to hear from you.</p>
  </div>
  <!-- Contact body -->
  <div style="max-width:1100px;margin:0 auto;padding:5rem 2rem;display:grid;grid-template-columns:1fr 1.5fr;gap:4rem;align-items:start">
    <!-- Left: info cards -->
    <div>
      <h3 style="font-size:1.5rem;font-weight:800;color:#0f172a;margin-bottom:2rem">Contact Information</h3>
      <!-- 3 cards: Address, Phone, Email — each styled with icon, label, value -->
      [3 contact info cards with icons, styled with padding:1.5rem, border-radius:16px, border-left:4px solid ACCENT_COLOR, background:#f8fafc, margin-bottom:1rem]
      <!-- Social links row -->
      [Row of 4 social media icon links]
    </div>
    <!-- Right: form -->
    <div style="background:white;border-radius:24px;padding:2.5rem;box-shadow:0 8px 48px rgba(0,0,0,0.10)">
      <h3 style="font-size:1.5rem;font-weight:800;color:#0f172a;margin-bottom:2rem">Send a Message</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <input placeholder="Your Name" style="padding:14px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:inherit;outline:none;transition:border-color 0.2s" onfocus="this.style.borderColor='ACCENT_COLOR'" onblur="this.style.borderColor='#e2e8f0'">
        <input placeholder="Email Address" type="email" style="padding:14px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:inherit;outline:none;transition:border-color 0.2s" onfocus="this.style.borderColor='ACCENT_COLOR'" onblur="this.style.borderColor='#e2e8f0'">
      </div>
      <input placeholder="Subject" style="width:100%;padding:14px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:inherit;outline:none;margin-bottom:1rem;box-sizing:border-box;transition:border-color 0.2s" onfocus="this.style.borderColor='ACCENT_COLOR'" onblur="this.style.borderColor='#e2e8f0'">
      <textarea rows="5" placeholder="Your message..." style="width:100%;padding:14px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:15px;font-family:inherit;outline:none;resize:none;margin-bottom:1.5rem;box-sizing:border-box;transition:border-color 0.2s" onfocus="this.style.borderColor='ACCENT_COLOR'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
      <button onclick="alert('Message sent! We\\'ll be in touch soon.')" style="width:100%;padding:16px;background:linear-gradient(135deg,ACCENT_COLOR,ACCENT_DARK);color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 16px ACCENT_SHADOW" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">Send Message →</button>
    </div>
  </div>
</div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN SECTION — WORKING TABS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<div id="login" class="pg" style="display:none;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e)">
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:2rem">
    <div style="background:rgba(255,255,255,0.07);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:3rem;width:100%;max-width:440px">
      <!-- Tab switcher -->
      <div style="display:flex;background:rgba(255,255,255,0.08);border-radius:12px;padding:4px;margin-bottom:2rem">
        <button id="tab-signin" onclick="switchTab('signin')" style="flex:1;padding:11px;background:white;color:#0f172a;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;font-family:inherit">Sign In</button>
        <button id="tab-signup" onclick="switchTab('signup')" style="flex:1;padding:11px;background:transparent;color:rgba(255,255,255,0.65);border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:14px;font-family:inherit">Create Account</button>
      </div>
      <!-- Sign in form -->
      <div id="form-signin">
        <input type="email" placeholder="Email address" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'" placeholder="Email address">
        <input type="password" placeholder="Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.5rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
        <div style="text-align:right;margin-bottom:1.5rem"><span style="color:rgba(255,255,255,0.5);font-size:13px;cursor:pointer">Forgot password?</span></div>
        <button onclick="alert('Signed in!')" style="width:100%;padding:14px;background:linear-gradient(135deg,ACCENT_COLOR,ACCENT_DARK);color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;margin-bottom:1.5rem;box-shadow:0 4px 16px ACCENT_SHADOW;font-family:inherit">Sign In →</button>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.12)"></div>
          <span style="color:rgba(255,255,255,0.4);font-size:12px;white-space:nowrap">or continue with</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.12)"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          <button onclick="alert('Google sign in')" style="width:100%;padding:12px 16px;background:white;color:#3c4043;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button onclick="alert('Facebook sign in')" style="width:100%;padding:12px 16px;background:#1877F2;color:white;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
          <button onclick="alert('Instagram sign in')" style="width:100%;padding:12px 16px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:white;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Continue with Instagram
          </button>
        </div>
      </div>
      <!-- Sign up form -->
      <div id="form-signup" style="display:none">
        <input type="text" placeholder="Full Name" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
        <input type="email" placeholder="Email Address" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
        <input type="password" placeholder="Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
        <input type="password" placeholder="Confirm Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1.5rem;box-sizing:border-box" onfocus="this.style.borderColor='rgba(255,255,255,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
        <button onclick="alert('Account created!')" style="width:100%;padding:14px;background:linear-gradient(135deg,ACCENT_COLOR,ACCENT_DARK);color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 4px 16px ACCENT_SHADOW;font-family:inherit">Create Account →</button>
      </div>
      <p style="text-align:center;margin-top:1.5rem"><span onclick="goTo('home')" style="color:rgba(255,255,255,0.5);cursor:pointer;font-size:13px">← Back to Home</span></p>
    </div>
  </div>
</div>
<script>
function switchTab(t){
  var si=document.getElementById('form-signin'),su=document.getElementById('form-signup');
  var ts=document.getElementById('tab-signin'),tu=document.getElementById('tab-signup');
  if(si)si.style.display=t==='signin'?'block':'none';
  if(su)su.style.display=t==='signup'?'block':'none';
  if(ts){ts.style.background=t==='signin'?'white':'transparent';ts.style.color=t==='signin'?'#0f172a':'rgba(255,255,255,0.65)';}
  if(tu){tu.style.background=t==='signup'?'white':'transparent';tu.style.color=t==='signup'?'#0f172a':'rgba(255,255,255,0.65)';}
}
</script>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED SECTIONS WITH RICH CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOME: Hero (as above) → 3 feature cards → stats bar (4 impressive numbers)
ABOUT: Badge+headline → 2-col story+image → 3 values cards → 4-member team grid ({{IMG_PERSON_1}} etc.) → 4 timeline milestones → 3 testimonial quotes
SERVICES: Build rich menu/service cards like this template (3-4 cards):
<div style="padding:6rem 2rem;background:#f8fafc">
  <div style="max-width:1200px;margin:0 auto">
    <div style="text-align:center;margin-bottom:4rem">
      <span style="display:inline-block;background:ACCENT_LIGHT;color:ACCENT_COLOR;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;padding:6px 18px;border-radius:999px;margin-bottom:1rem">OUR MENU / SERVICES</span>
      <h2 style="font-size:clamp(2rem,4vw,2.75rem);font-weight:900;color:#0f172a;letter-spacing:-0.03em;margin-bottom:1rem">What We Offer</h2>
      <p style="color:#64748b;font-size:1.1rem;max-width:540px;margin:0 auto">Crafted with passion, served with love.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem">
      <!-- CARD TEMPLATE — repeat 3-4 times with different content -->
      <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 20px 60px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 32px rgba(0,0,0,0.08)'">
        <div style="position:relative;height:220px;overflow:hidden">
          <img src="{{IMG_CARD_1}}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s" alt="Service">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.5),transparent)"></div>
          <span style="position:absolute;top:1rem;right:1rem;background:ACCENT_COLOR;color:white;padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700">POPULAR</span>
        </div>
        <div style="padding:1.75rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.75rem">☕</span>
              <h3 style="font-size:1.2rem;font-weight:800;color:#0f172a">Espresso</h3>
            </div>
            <span style="background:ACCENT_LIGHT;color:ACCENT_COLOR;font-weight:800;font-size:1.1rem;padding:4px 14px;border-radius:10px">$3.50</span>
          </div>
          <p style="color:#64748b;font-size:0.9rem;line-height:1.7;margin-bottom:1.25rem">Rich, bold shot of pure espresso. The foundation of all great coffee drinks.</p>
          <ul style="margin-bottom:1.5rem;display:flex;flex-direction:column;gap:0.5rem">
            <li style="display:flex;align-items:center;gap:0.5rem;color:#475569;font-size:0.875rem"><span style="color:ACCENT_COLOR;font-weight:700">✓</span> Single or double shot</li>
            <li style="display:flex;align-items:center;gap:0.5rem;color:#475569;font-size:0.875rem"><span style="color:ACCENT_COLOR;font-weight:700">✓</span> Freshly ground beans</li>
            <li style="display:flex;align-items:center;gap:0.5rem;color:#475569;font-size:0.875rem"><span style="color:ACCENT_COLOR;font-weight:700">✓</span> Temperature controlled</li>
            <li style="display:flex;align-items:center;gap:0.5rem;color:#475569;font-size:0.875rem"><span style="color:ACCENT_COLOR;font-weight:700">✓</span> Served immediately</li>
          </ul>
          <button onclick="alert('Order placed!')" style="width:100%;padding:13px;background:linear-gradient(135deg,ACCENT_COLOR,ACCENT_DARK);color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Order Now →</button>
        </div>
      </div>
      <!-- Repeat above card pattern for each menu item/service, changing image, icon, name, price, description, features -->
    </div>
  </div>
</div>
PORTFOLIO: Filter tabs (All/Design/Dev/Marketing) → 6-image grid ({{IMG_GALLERY_1}} etc.) with hover overlay showing project name + "View" button
CONTACT: Elegant design as shown above
LOGIN: As shown above with working tabs

FOOTER (after all .pg divs):
<footer style="background:#0f172a;color:white;padding:5rem 2rem 2rem">
  [4 columns: brand+desc, Quick Links, Services, Newsletter signup]
  [Social icons row]
  [Copyright bar]
</footer>

DESIGN STANDARDS:
- Add to <head>: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
- body style: font-family:'Inter',sans-serif
- Derive color scheme from topic (coffee=amber, gym=red, tech=indigo, fashion=pink)
- Generous padding: sections need padding:6rem 2rem minimum
- Cards: border-radius:20px, box-shadow:0 4px 24px rgba(0,0,0,0.08), hover lift
- All section headers: small uppercase badge label above large bold heading
`;

// ─────────────────────────────────────────────────────────────────────────────
// PAGE LABELS
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_LABELS: Record<string,string> = {
  home:'Home', about:'About', services:'Services', portfolio:'Portfolio',
  contact:'Contact', login:'Sign In', shop:'Shop', menu:'Menu',
  team:'Team', blog:'Blog', pricing:'Pricing', gallery:'Gallery', faq:'FAQ',
};

// ─────────────────────────────────────────────────────────────────────────────
// POST-PROCESSOR
// ─────────────────────────────────────────────────────────────────────────────
function postProcess(html: string): string {
  const topic = detectTopic(html);

  // ── 1. Brand color ─────────────────────────────────────────────────────────
  let brandColor = '#6366f1', brandDark = '#4338ca', brandShadow = 'rgba(99,102,241,0.35)', brandLight = 'rgba(99,102,241,0.12)';
  if (topic === 'coffee' || topic === 'restaurant') { brandColor='#d97706'; brandDark='#b45309'; brandShadow='rgba(217,119,6,0.35)'; brandLight='rgba(217,119,6,0.10)'; }
  else if (topic === 'gym')     { brandColor='#ef4444'; brandDark='#dc2626'; brandShadow='rgba(239,68,68,0.35)'; brandLight='rgba(239,68,68,0.10)'; }
  else if (topic === 'law')     { brandColor='#1e40af'; brandDark='#1e3a8a'; brandShadow='rgba(30,64,175,0.35)'; brandLight='rgba(30,64,175,0.10)'; }
  else if (topic === 'medical') { brandColor='#0891b2'; brandDark='#0e7490'; brandShadow='rgba(8,145,178,0.35)'; brandLight='rgba(8,145,178,0.10)'; }
  else if (topic === 'fashion') { brandColor='#be185d'; brandDark='#9d174d'; brandShadow='rgba(190,24,93,0.35)'; brandLight='rgba(190,24,93,0.10)'; }
  else if (topic === 'hotel')   { brandColor='#0f766e'; brandDark='#115e59'; brandShadow='rgba(15,118,110,0.35)'; brandLight='rgba(15,118,110,0.10)'; }

  // ── 2. Replace image tokens with real working Unsplash URLs ────────────────
  let out = html;
  // Hero
  out = out.replace(/\{\{IMG_HERO\}\}/g, getImg(topic, 0, 1600, 900));
  out = out.replace(/\{\{IMG_SECTION\}\}/g, getImg(topic, 1, 1400, 700));
  // Cards
  for (let i = 1; i <= 6; i++) out = out.replace(new RegExp(`\\{\\{IMG_CARD_${i}\\}\\}`, 'g'), getImg(topic, i+1, 800, 500));
  // Persons (portraits)
  for (let i = 1; i <= 4; i++) out = out.replace(new RegExp(`\\{\\{IMG_PERSON_${i}\\}\\}`, 'g'), getImg('portrait', i-1, 400, 500));
  // Gallery
  for (let i = 1; i <= 6; i++) out = out.replace(new RegExp(`\\{\\{IMG_GALLERY_${i}\\}\\}`, 'g'), getImg(topic, i+2, 700, 500));

  // ── 3. Also replace any remaining broken image URLs the AI still generated ──
  // Replace source.unsplash.com (deprecated), loremflickr.com, picsum.photos
  let imgCounter = 0;
  out = out.replace(/https?:\/\/(?:source\.unsplash\.com|loremflickr\.com|picsum\.photos|via\.placeholder\.com|placehold\.co)[^\s"')>]*/g, () => {
    return getImg(topic, imgCounter++, 800, 500);
  });

  // ── 4. Replace color template vars the AI may have used ────────────────────
  out = out.replace(/ACCENT_COLOR/g, brandColor)
           .replace(/ACCENT_DARK/g, brandDark)
           .replace(/ACCENT_SHADOW/g, brandShadow)
           .replace(/DARK_COLOR/g, '#0f172a');

  // ── 5. Brand name ──────────────────────────────────────────────────────────
  let brand = 'Site';
  const titleM = html.match(/<title[^>]*>([^<|–-]+)/i);
  if (titleM) brand = titleM[1].trim().slice(0,30);

  // ── 6. Detect section IDs ──────────────────────────────────────────────────
  const sectionIds: string[] = [];
  const KNOWN = ['home','about','services','portfolio','contact','login','shop','menu','team','blog','pricing','gallery','faq'];
  const pat1 = /(?:id="([^"]+)"[^>]*class="[^"]*pg[^"]*"|class="[^"]*pg[^"]*"[^>]*id="([^"]+)")/g;
  let m: RegExpExecArray | null;
  while ((m = pat1.exec(html)) !== null) { const id=m[1]||m[2]; if(id&&!sectionIds.includes(id)) sectionIds.push(id); }
  KNOWN.forEach(id => { if(html.includes(`id="${id}"`)&&!sectionIds.includes(id)) sectionIds.push(id); });
  const dpPat = /data-page="([^"]+)"/g;
  while ((m = dpPat.exec(html)) !== null) { if(!sectionIds.includes(m[1])) sectionIds.push(m[1]); }
  const ids = sectionIds.length >= 2 ? sectionIds : ['home','about','services','portfolio','contact','login'];

  // ── 7. Rebuild nav ─────────────────────────────────────────────────────────
  const logoSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="${brandColor}"/><path d="M8 16l5 5 11-10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const navLinks = ids.map(id => {
    const label = PAGE_LABELS[id] || id.charAt(0).toUpperCase()+id.slice(1);
    if (id === 'login') return `<span onclick="goTo('login')" data-page="login" style="background:${brandColor};color:white;padding:9px 22px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700;white-space:nowrap;box-shadow:0 2px 12px ${brandShadow}">${label}</span>`;
    return `<span onclick="goTo('${id}')" data-page="${id}" class="nl" style="color:rgba(255,255,255,0.72);cursor:pointer;font-size:14px;font-weight:500;padding:6px 0;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap">${label}</span>`;
  }).join('');

  const fixedNav = `<nav id="vi-nav" style="position:fixed;top:0;left:0;right:0;z-index:99999;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;background:rgba(6,6,18,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.08);font-family:'Inter',system-ui,sans-serif">
  <span onclick="goTo('${ids[0]}')" style="color:white;font-weight:800;font-size:1.15rem;cursor:pointer;display:flex;align-items:center;gap:10px;letter-spacing:-0.025em">${logoSvg}<span>${brand}</span></span>
  <div style="display:flex;align-items:center;gap:2rem">${navLinks}</div>
</nav>`;

  out = out.replace(/<nav[\s\S]*?<\/nav>/i, fixedNav);
  if (!out.includes('id="vi-nav"')) out = out.replace('<body>', '<body>'+fixedNav);

  // ── 8. Inject base CSS ─────────────────────────────────────────────────────
  const baseCSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0f172a;overflow-x:hidden}
  .pg{min-height:100vh;width:100%;padding-top:64px}
  /* Hero override */
  #home>*:first-child{max-width:100vw!important;width:100%!important;margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}
  #home img[style*="position:absolute"]{width:100%!important;max-width:none!important;height:100%!important;object-fit:cover!important}
  /* Cards */
  .card{background:white;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.07);padding:2rem;transition:transform 0.3s,box-shadow 0.3s}
  .card:hover{transform:translateY(-6px);box-shadow:0 16px 48px rgba(0,0,0,0.13)}
  /* Buttons */
  .btn{display:inline-block;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;border:none;cursor:pointer;transition:all 0.2s}
  .btn-primary{background:linear-gradient(135deg,${brandColor},${brandDark});color:white;box-shadow:0 4px 16px ${brandShadow}}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px ${brandShadow}}
  /* Badge labels */
  .badge{display:inline-block;background:${brandLight};color:${brandColor};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;padding:6px 16px;border-radius:999px;margin-bottom:1rem}
  /* Typography */
  h1,h2,h3{letter-spacing:-0.03em}
  h2{font-size:clamp(1.8rem,4vw,2.75rem);font-weight:800;color:#0f172a;line-height:1.15}
  h3{font-size:1.3rem;font-weight:700;color:#0f172a}
  p{color:#475569;line-height:1.75}
  /* Images */
  img{display:block;max-width:100%;height:auto}
  img[style*="position:absolute"]{max-width:none}
  /* Portfolio */
  .port-item{position:relative;overflow:hidden;border-radius:16px;cursor:pointer}
  .port-item img{width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform 0.4s}
  .port-item:hover img{transform:scale(1.06)}
  .port-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.85),rgba(0,0,0,0.2) 60%,transparent);opacity:0;transition:opacity 0.3s;display:flex;align-items:flex-end;padding:1.5rem}
  .port-item:hover .port-overlay{opacity:1}
  /* Section */
  .section,.sec{padding:6rem 2rem}
  .container{max-width:1200px;margin:0 auto;padding:0 2rem}
  /* Inputs */
  input,textarea,select{font-family:inherit;font-size:15px}
  /* Scrollbar */
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:3px}
  ul li{list-style:none}
</style>`;

  out = out.replace('</head>', baseCSS + '\n</head>');

  // ── 9. Build master script — injected into <head> so it always runs ──────
  const masterScript = `<script>
(function(){
  var BRAND='${brandColor}';
  var FIRST='${ids[0]||"home"}';
  var cur=FIRST;
  window.goTo=function(id){
    if(!id)return;
    cur=id;
    var all=document.querySelectorAll('.pg');
    all.forEach(function(el){el.style.display='none';});
    var t=document.getElementById(id);
    if(t){t.style.display='block';window.scrollTo(0,0);}
    document.querySelectorAll('[data-page]').forEach(function(el){
      var p=el.getAttribute('data-page');
      if(p==='login')return;
      var on=p===id;
      el.style.color=on?'white':'rgba(255,255,255,0.72)';
      el.style.borderBottomColor=on?BRAND:'transparent';
      el.style.fontWeight=on?'700':'500';
    });
  };
  window.switchTab=function(t){
    ['signin','signup'].forEach(function(s){
      var f=document.getElementById('form-'+s),b=document.getElementById('tab-'+s);
      if(f)f.style.display=s===t?'block':'none';
      if(b){b.style.background=s===t?'white':'transparent';b.style.color=s===t?'#0f172a':'rgba(255,255,255,0.65)';}
    });
  };
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');if(!a)return;
    var h=(a.getAttribute('href')||'').trim();
    if(h.startsWith('#')&&h.length>1){e.preventDefault();var id=h.slice(1);if(document.getElementById(id))window.goTo(id);return;}
    if(h.startsWith('http')||h.startsWith('//')){e.preventDefault();try{window.open(h,'_blank','noopener');}catch(x){}return;}
    if(h&&h!=='#'&&h!=='javascript:void(0)'&&h!=='javascript:;')e.preventDefault();
  },true);
  function init(){
    var pages=Array.from(document.querySelectorAll('.pg'));
    if(!pages.length)return;
    pages.forEach(function(p){p.style.display='none';});
    var first=pages[0];
    if(first){first.style.display='block';window.goTo(first.id||FIRST);}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
  else{setTimeout(init,0);}
})();
</script>`;

  // ── 10. Always rebuild login section with real social buttons ───────────────
  const loginSection = `<div id="login" class="pg" style="display:none;background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)">
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:2rem">
    <div style="background:rgba(255,255,255,0.07);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.12);border-radius:28px;padding:3rem;width:100%;max-width:440px;box-shadow:0 32px 80px rgba(0,0,0,0.4)">
      <div style="text-align:center;margin-bottom:2rem">
        <div style="width:56px;height:56px;background:${brandColor};border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;box-shadow:0 8px 24px ${brandShadow}"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M8 14l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h2 style="color:white;font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:0.25rem">${brand}</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:14px">Sign in to your account</p>
      </div>
      <div style="display:flex;background:rgba(255,255,255,0.08);border-radius:14px;padding:4px;margin-bottom:2rem">
        <button id="tab-signin" onclick="switchTab('signin')" style="flex:1;padding:11px;background:white;color:#0f172a;border:none;border-radius:11px;font-weight:700;cursor:pointer;font-size:14px;font-family:inherit;transition:all 0.2s">Sign In</button>
        <button id="tab-signup" onclick="switchTab('signup')" style="flex:1;padding:11px;background:transparent;color:rgba(255,255,255,0.55);border:none;border-radius:11px;font-weight:600;cursor:pointer;font-size:14px;font-family:inherit;transition:all 0.2s">Create Account</button>
      </div>
      <div id="form-signin">
        <input type="email" placeholder="Email address" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.875rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <input type="password" placeholder="Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.5rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <div style="text-align:right;margin-bottom:1.5rem"><span style="color:${brandColor};font-size:13px;cursor:pointer;font-weight:600">Forgot password?</span></div>
        <button onclick="alert('Signed in!')" style="width:100%;padding:14px;background:linear-gradient(135deg,${brandColor},${brandDark});color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;margin-bottom:1.5rem;box-shadow:0 4px 20px ${brandShadow};font-family:inherit;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='none'">Sign In →</button>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
          <span style="color:rgba(255,255,255,0.35);font-size:12px;white-space:nowrap;letter-spacing:0.05em">OR CONTINUE WITH</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          <button onclick="alert('Google')" style="width:100%;padding:12px 16px;background:white;color:#3c4043;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.15)" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button onclick="alert('Facebook')" style="width:100%;padding:12px 16px;background:#1877F2;color:white;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)';this.style.opacity='0.92'" onmouseout="this.style.transform='none';this.style.opacity='1'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
          <button onclick="alert('Instagram')" style="width:100%;padding:12px 16px;background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);color:white;border:none;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;transition:all 0.2s" onmouseover="this.style.transform='translateY(-1px)';this.style.opacity='0.92'" onmouseout="this.style.transform='none';this.style.opacity='1'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Continue with Instagram
          </button>
        </div>
      </div>
      <div id="form-signup" style="display:none">
        <input type="text" placeholder="Full Name" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.875rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <input type="email" placeholder="Email Address" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.875rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <input type="password" placeholder="Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:0.875rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <input type="password" placeholder="Confirm Password" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:1.5rem;box-sizing:border-box" onfocus="this.style.borderColor='${brandColor}'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        <button onclick="alert('Account created!')" style="width:100%;padding:14px;background:linear-gradient(135deg,${brandColor},${brandDark});color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 4px 20px ${brandShadow};font-family:inherit">Create Account →</button>
      </div>
      <p style="text-align:center;margin-top:1.5rem"><span onclick="goTo('home')" style="color:rgba(255,255,255,0.35);cursor:pointer;font-size:13px;transition:color 0.2s" onmouseover="this.style.color='rgba(255,255,255,0.7)'" onmouseout="this.style.color='rgba(255,255,255,0.35)'">← Back to Home</span></p>
    </div>
  </div>
</div>`;

  // ── 10b. Replace login section safely (walk div depth, no greedy regex) ───
  const loginStartTag = out.match(/<div[^>]*id="login"[^>]*>/i)?.[0];
  if (loginStartTag) {
    const loginStart = out.indexOf(loginStartTag);
    let depth = 0, pos = loginStart, found = -1;
    while (pos < out.length - 1) {
      if (out[pos] === '<') {
        if (out.slice(pos, pos+4) === '<div') { depth++; pos += 4; continue; }
        if (out.slice(pos, pos+6) === '</div>') { depth--; if (depth === 0) { found = pos + 6; break; } pos += 6; continue; }
      }
      pos++;
    }
    if (found > 0) out = out.slice(0, loginStart) + loginSection + '\n' + out.slice(found);
  } else {
    out = out.replace('</body>', loginSection + '\n</body>');
  }

  // ── Strip ALL AI-generated <script> blocks to prevent goTo conflicts ───
  // Keep only: scripts that contain switchTab (login), and NO script that defines goTo/navigation
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, function(scriptBlock) {
    // Remove any AI script that touches navigation or goTo
    if (/goTo|showPage|showSection|navigate|currentPage|\bnavigation\b/.test(scriptBlock)) return '';
    // Keep our own switchTab inline scripts in login section (small, safe)
    if (/switchTab/.test(scriptBlock) && scriptBlock.length < 500) return scriptBlock;
    // Keep small inline scripts (event handlers etc) but strip large ones
    if (scriptBlock.length > 200) return '';
    return scriptBlock;
  });

  // Inject master script into <head> — runs before any remaining scripts
  if (out.includes('</head>')) {
    out = out.replace('</head>', masterScript + '\n</head>');
  } else {
    out = masterScript + out;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────────────
async function callModel(m: M, system: string, user: string): Promise<string> {
  if (m.provider === 'gemini') {
    const key = getGeminiKey();
    if(!key||key.length<10) throw new Error('NO_KEY:gemini');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${key}`;
    const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      contents:[{role:'user',parts:[{text:system+'\n\n'+user}]}],
      generationConfig:{temperature:0.35,maxOutputTokens:8192},
    })});
    if(!res.ok){const t=await res.text().catch(()=>'');throw new Error(`HTTP_${res.status}|${t.slice(0,200)}`);}
    const data=await res.json();
    const content=data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!content) throw new Error(`Empty Gemini response. ${JSON.stringify(data).slice(0,200)}`);
    return content;
  }
  const key = m.provider==='groq' ? getGroqKey() : getOpenRouterKey();
  if(!key||key.length<10) throw new Error(`NO_KEY:${m.provider}`);
  const url = m.provider==='groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
  const headers: Record<string,string> = {'Content-Type':'application/json','Authorization':`Bearer ${key}`};
  if(m.provider==='openrouter'){headers['HTTP-Referer']='https://visinaro.onrender.com';headers['X-Title']='Visinaro';}
  const res = await fetch(url,{method:'POST',headers,body:JSON.stringify({
    model:m.id,messages:[{role:'system',content:system},{role:'user',content:user}],
    temperature:0.35,max_tokens:8000,stream:false,
  })});
  if(!res.ok){const t=await res.text().catch(()=>'');throw new Error(`HTTP_${res.status}|${t.slice(0,200)}`);}
  const data=await res.json();
  const content=data?.choices?.[0]?.message?.content;
  if(!content) throw new Error(`Empty response from ${m.id}`);
  return content;
}

function extractHtml(raw: string): string {
  let h = raw.replace(/^```html\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```\s*$/im,'').trim();
  if(/^<!DOCTYPE/i.test(h)||/^<html/i.test(h)) return h;
  const m=raw.match(/<!DOCTYPE[\s\S]*<\/html>/i)||raw.match(/<html[\s\S]*<\/html>/i);
  if(m) return m[0];
  if(h.length>200) return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${h}</body></html>`;
  throw new Error(`Could not extract HTML. Length: ${raw.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
export interface GenerateResult{content:GeneratedContent;usedModel:string;usedProvider:string;}

export const generateWebsite = async (
  prompt:string, _pref:string, onProgress?:(partial:string,name?:string)=>void,
):Promise<GenerateResult> => {
  if(!hasAnyKey()) throw new Error('API_KEY_MISSING');
  const userMsg = `Build a complete, stunning website for: ${prompt}

CRITICAL RULES:
1. Output raw HTML only, starting with <!DOCTYPE html>
2. Use EXACTLY these section ids: home, about, services, portfolio, contact, login
3. Each section: <div id="ID" class="pg" style="display:block or none">
4. For ALL images use the {{IMG_xxx}} placeholder tokens — do NOT use any image URLs
5. Hero: full-width (100vw), image background, dark overlay, white text
6. Contact section: elegant design with gradient banner top + info cards + styled form
7. Login section: dark gradient bg + glass card + working Sign In/Sign Up tabs`;

  for(const m of CASCADE){
    if(m.provider==='gemini'     &&!hasGeminiKey())     continue;
    if(m.provider==='groq'       &&!hasGroqKey())       continue;
    if(m.provider==='openrouter' &&!hasOpenRouterKey()) continue;
    if(isBlocked(m.id)) continue;
    try{
      onProgress?.('',m.name);
      const raw=await callModel(m,SYSTEM,userMsg);
      const html=extractHtml(raw);
      const final=postProcess(html);
      return{content:{html:final,css:'',javascript:''},usedModel:m.name,usedProvider:m.provider};
    }catch(err:any){
      const msg=String(err?.message||err).toLowerCase();
      console.warn(`[Visinaro] ${m.id} failed:`,msg.slice(0,100));
      if(msg.includes('no_key:')) continue;
      if(msg.includes('401')||msg.includes('403')||msg.includes('api_key')||msg.includes('authentication'))
        {CASCADE.filter(x=>x.provider===m.provider).forEach(x=>block(x.id,600_000));continue;}
      if(msg.includes('429')||msg.includes('rate limit')||msg.includes('quota')){block(m.id,90_000);continue;}
      if(msg.includes('404')||msg.includes('no endpoints')){block(m.id,24*3600_000);continue;}
      block(m.id,5_000);
    }
  }
  throw new Error('Generation failed. Please try again.');
};

export const optimizeSEO=async(html:string,prompt:string):Promise<{improvedHtml:string;seoReport:string}>=>{
  const m=CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='gemini'&&hasGeminiKey())||(x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return{improvedHtml:html,seoReport:'No model available.'};
  try{
    const raw=await callModel(m,'Improve SEO: meta tags, schema.org, headings, alt texts. Return ONLY complete HTML.',`Prompt: ${prompt}\n\nHTML:\n${html.slice(0,6000)}`);
    const improved=extractHtml(raw);
    return{improvedHtml:improved.length>200?postProcess(improved):html,seoReport:'SEO updated.'};
  }catch{return{improvedHtml:html,seoReport:'SEO unavailable.'};}
};

export const enhancePrompt=async(idea:string):Promise<string>=>{
  const m=CASCADE.find(x=>!isBlocked(x.id)&&((x.provider==='gemini'&&hasGeminiKey())||(x.provider==='groq'&&hasGroqKey())||(x.provider==='openrouter'&&hasOpenRouterKey())));
  if(!m) return idea;
  try{const raw=await callModel(m,'Expand into a detailed website brief. Output ONLY the brief.',`Expand: ${idea}`);return raw.trim()||idea;}
  catch{return idea;}
};
