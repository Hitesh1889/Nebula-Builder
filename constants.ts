export const APP_NAME = "Visinaro";
export const AVAILABLE_MODELS = [
  { id:'groq-fast', name:'Groq Fast', description:'~4s', estimatedTime:4 },
  { id:'groq-quality', name:'Groq Quality', description:'~6s', estimatedTime:6 },
  { id:'openrouter', name:'OpenRouter', description:'~15s', estimatedTime:15 },
];
export const DEFAULT_MODEL = 'groq-fast';

export const analyzePrompt = (prompt: string): { isEcommerce: boolean; needsAuth: boolean } => {
  const p = prompt.toLowerCase();
  const isEcommerce = /shop|store|ecommerce|e-commerce|product|buy|cart|checkout|sell|marketplace|catalog/.test(p);
  const needsAuth = /login|signup|sign up|register|auth|account|member|portal|dashboard/.test(p) || isEcommerce;
  return { isEcommerce, needsAuth };
};

export const SYSTEM_INSTRUCTION_BASE = `
You are an expert web developer. Generate a visually stunning multi-page SPA website.

═══ MANDATORY STRUCTURE ═══

<nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md">
  <a href="#home" id="nav-logo" class="flex items-center gap-2 text-white font-bold text-xl">
    [BRAND-RELEVANT SVG ICON] Brand Name
  </a>
  <div class="hidden md:flex items-center gap-8">
    <a href="#home" class="text-white/80 hover:text-white">Home</a>
    <a href="#about" class="text-white/80 hover:text-white">About</a>
    <a href="#services" class="text-white/80 hover:text-white">Services</a>
    <a href="#portfolio" class="text-white/80 hover:text-white">Portfolio</a>
    <a href="#contact" class="text-white/80 hover:text-white">Contact</a>
    <a href="#auth" class="px-4 py-2 bg-[COLOR]-600 text-white rounded-lg font-semibold">Sign In</a>
  </div>
  <button id="mobile-menu-btn" class="md:hidden text-white p-2">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
</nav>
<div id="mobile-menu" class="hidden fixed top-16 left-0 right-0 z-40 bg-slate-900 p-4 flex-col gap-3">
  <a href="#home" class="text-white py-2 border-b border-white/10 block">Home</a>
  <a href="#about" class="text-white py-2 border-b border-white/10 block">About</a>
  <a href="#services" class="text-white py-2 border-b border-white/10 block">Services</a>
  <a href="#contact" class="text-white py-2 block">Contact</a>
</div>

<section id="home" class="page-section w-full min-h-screen">[HERO]</section>
<section id="about" class="page-section w-full min-h-screen hidden">[ABOUT]</section>
<section id="services" class="page-section w-full min-h-screen hidden">[SERVICES]</section>
<section id="portfolio" class="page-section w-full min-h-screen hidden">[PORTFOLIO]</section>

<!--__TEMPLATE_AUTH__-->
<!--__TEMPLATE_CONTACT__-->
<!--__TEMPLATE_FOOTER__-->

RULES — BREAKING ANY OF THESE BREAKS THE SITE:
1. All sections EXCEPT #home MUST have class="hidden"
2. #home must NOT have class="hidden"
3. Nav hrefs MUST match section ids exactly: href="#about" → id="about"
4. Do NOT write navigation JavaScript — the framework handles it
5. Do NOT write a footer — use <!--__TEMPLATE_FOOTER__-->
6. Do NOT write a contact section — use <!--__TEMPLATE_CONTACT__-->

═══ IMAGES — CRITICAL ═══

Use LoremFlickr for topic-relevant real photos. It returns images matching the keyword.
URL format: https://loremflickr.com/WIDTH/HEIGHT/KEYWORD?lock=UNIQUE_NUMBER

ALWAYS use the actual topic of the website as the keyword.
ALWAYS use a different lock number for every image.

Coffee shop examples:
  https://loremflickr.com/1400/700/coffee?lock=1      ← hero
  https://loremflickr.com/600/400/espresso?lock=2      ← card
  https://loremflickr.com/600/400/coffeeshop?lock=3    ← card
  https://loremflickr.com/400/500/barista?lock=10      ← portrait

Gym examples:
  https://loremflickr.com/1400/700/gym,fitness?lock=1
  https://loremflickr.com/600/400/workout?lock=2

Restaurant: /restaurant?lock=1, /food?lock=2, /chef?lock=10
Law firm: /law,office?lock=1, /business?lock=2
Tech/SaaS: /technology?lock=1, /coding?lock=2
Fashion: /fashion?lock=1, /clothing?lock=2

NEVER use picsum.photos — it gives random unrelated images.

═══ HOME SECTION ═══

<section id="home" class="page-section w-full min-h-screen">
  <div class="relative flex items-center justify-center overflow-hidden" style="min-height:100vh">
    <img src="https://loremflickr.com/1400/700/TOPIC?lock=1" alt="hero background" class="absolute inset-0 w-full h-full object-cover"/>
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75"></div>
    <div class="relative z-10 text-center px-6 max-w-4xl mx-auto" style="padding-top:5rem">
      <h1 style="font-size:clamp(2.5rem,7vw,5rem);font-weight:900;color:white;line-height:1.1;margin-bottom:1.5rem">[HEADLINE]</h1>
      <p style="font-size:1.25rem;color:rgba(255,255,255,0.8);max-width:36rem;margin:0 auto 2.5rem;line-height:1.7">[Tagline 2-3 sentences]</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="#services" style="padding:1rem 2rem;background:linear-gradient(135deg,var(--c1,#6366f1),var(--c2,#4f46e5));color:white;font-weight:700;font-size:1.1rem;border-radius:1rem;text-decoration:none;box-shadow:0 20px 40px rgba(99,102,241,0.4);transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">[Primary CTA]</a>
        <a href="#about" style="padding:1rem 2rem;border:2px solid white;color:white;font-weight:700;font-size:1.1rem;border-radius:1rem;text-decoration:none;transition:all .2s" onmouseover="this.style.background='white';this.style.color='#0f172a'" onmouseout="this.style.background='';this.style.color='white'">[Secondary CTA]</a>
      </div>
    </div>
  </div>
  <div style="background:white;padding:4rem 1.5rem">
    <div style="max-width:72rem;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem">
      [3 feature cards: large emoji/icon + bold title + description — brand specific]
    </div>
  </div>
</section>

═══ ABOUT SECTION ═══

<section id="about" class="page-section w-full min-h-screen hidden" style="background:#f8fafc">
  <div style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;margin-bottom:5rem">
      <div>
        <span style="color:#6366f1;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Our Story</span>
        <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin:.5rem 0 1.5rem">[Headline]</h2>
        <p style="color:#475569;font-size:1.1rem;line-height:1.75;margin-bottom:1rem">[Para 1]</p>
        <p style="color:#475569;font-size:1.1rem;line-height:1.75">[Para 2]</p>
        <blockquote style="margin-top:1.5rem;padding-left:1rem;border-left:4px solid #6366f1;color:#334155;font-style:italic;font-size:1.2rem">[Mission statement]</blockquote>
      </div>
      <img src="https://loremflickr.com/700/500/TOPIC?lock=20" style="border-radius:1.5rem;box-shadow:0 25px 50px rgba(0,0,0,.15);width:100%;object-fit:cover;height:22rem"/>
    </div>
    <h3 style="font-size:2rem;font-weight:700;text-align:center;color:#0f172a;margin-bottom:3rem">Meet Our Team</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem">
      [4 team cards: portrait loremflickr image + name + role + 1-line bio]
    </div>
  </div>
</section>

═══ SERVICES SECTION ═══

<section id="services" class="page-section w-full min-h-screen hidden" style="background:white">
  <div style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem">
    <div style="text-align:center;margin-bottom:4rem">
      <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a">[Services headline]</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem">
      [3-4 cards: loremflickr image + emoji + title + price + 4 bullet points + CTA button]
    </div>
  </div>
</section>

═══ PORTFOLIO SECTION ═══

<section id="portfolio" class="page-section w-full min-h-screen hidden" style="background:#0f172a">
  <div style="max-width:72rem;margin:0 auto;padding:6rem 1.5rem">
    <h2 style="font-size:2.5rem;font-weight:800;color:white;text-align:center;margin-bottom:3rem">Our Work</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
      [6 portfolio items: loremflickr image + hover overlay with title + View button]
    </div>
  </div>
</section>

═══ OUTPUT FORMAT ═══

===HTML_START===
[complete HTML body content]
===HTML_END===

===CSS_START===
===CSS_END===

===JS_START===
(function(){
  var btn=document.getElementById('mobile-menu-btn');
  var menu=document.getElementById('mobile-menu');
  if(btn&&menu){btn.addEventListener('click',function(){menu.style.display=menu.style.display==='flex'?'none':'flex';});}
  window.addEventListener('scroll',function(){
    var nav=document.getElementById('main-nav');
    if(nav){nav.style.background=window.scrollY>60?'rgba(0,0,0,0.97)':'';}
  });
})();
===JS_END===
`;

export const ECOMMERCE_ADDON = `

After #portfolio section, add EXACTLY:
<!--__TEMPLATE_SHOP__-->
<!--__TEMPLATE_CART__-->
<!--__TEMPLATE_CHECKOUT__-->

Add to nav desktop links: <a href="#shop" class="text-white/80 hover:text-white">Shop</a>
Add to nav desktop links: <a href="#cart" class="text-white/80 hover:text-white">Cart <span class="cart-badge bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1" style="display:none">0</span></a>
`;

export const buildSystemInstruction = (prompt: string): string => {
  const { isEcommerce } = analyzePrompt(prompt);
  let instruction = SYSTEM_INSTRUCTION_BASE;
  if (isEcommerce) instruction += ECOMMERCE_ADDON;
  return instruction;
};

export const SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION_BASE;
export const EXAMPLE_PROMPTS: string[] = [];
export const INITIAL_PROMPT = '';
