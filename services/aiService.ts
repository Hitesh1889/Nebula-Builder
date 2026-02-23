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
        [Email input, Password input with "Forgot password?" link, Sign In button with gradient, divider, Google + GitHub social buttons]
      </div>
      <!-- Sign up form -->
      <div id="form-signup" style="display:none">
        [Full Name, Email, Password, Confirm Password inputs, Create Account button]
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
SERVICES: 3-4 service cards ({{IMG_CARD_1}} etc., icon, name, price, 4 bullet features, CTA)
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

  // ── 9. Inject JS ───────────────────────────────────────────────────────────
  const navScript = `
<script>
var currentPage = '${ids[0]||'home'}';
var BRAND_COLOR = '${brandColor}';
window.goTo = function(id) {
  currentPage = id;
  document.querySelectorAll('.pg').forEach(function(el){el.style.display='none';});
  var t = document.getElementById(id);
  if(t){t.style.display='block';window.scrollTo(0,0);}
  document.querySelectorAll('[data-page]').forEach(function(el){
    var p = el.getAttribute('data-page');
    if(p==='login') return;
    var active = p===id;
    el.style.color = active ? 'white' : 'rgba(255,255,255,0.72)';
    el.style.borderBottomColor = active ? BRAND_COLOR : 'transparent';
    el.style.fontWeight = active ? '700' : '500';
  });
};
window.switchTab = function(t) {
  ['signin','signup'].forEach(function(s){
    var f=document.getElementById('form-'+s), b=document.getElementById('tab-'+s);
    if(f) f.style.display=s===t?'block':'none';
    if(b){b.style.background=s===t?'white':'transparent';b.style.color=s===t?'#0f172a':'rgba(255,255,255,0.65)';}
  });
};
document.addEventListener('click',function(e){
  var a=e.target.closest('a[href]');if(!a)return;
  var h=(a.getAttribute('href')||'').trim();
  if(h.startsWith('#')&&h.length>1){e.preventDefault();var id=h.slice(1);if(document.getElementById(id))window.goTo(id);return;}
  if(h.startsWith('http')||h.startsWith('//')){e.preventDefault();try{window.open(h,'_blank','noopener');}catch(x){}return;}
  if(h&&h!=='#'&&h!=='javascript:void(0)')e.preventDefault();
},true);
(function(){
  var pages=Array.from(document.querySelectorAll('.pg'));
  if(pages.length>1){pages.forEach(function(p,i){p.style.display=i===0?'block':'none';});}
  if(pages[0]&&pages[0].id) window.goTo(pages[0].id);
})();
</script>`;

  out = out.includes('</body>') ? out.replace('</body>', navScript+'\n</body>') : out+navScript;
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
