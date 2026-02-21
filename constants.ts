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
You are an expert web developer. Generate a complete, visually stunning multi-page SPA website.
Output ONLY the HTML body content using the delimiter format specified below.

═══ MANDATORY HTML STRUCTURE ═══

The HTML you generate goes directly inside <body>. Write it exactly like this:

<nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md">
  <a href="#home" class="flex items-center gap-2 text-white font-bold text-xl" id="nav-logo">
    [INLINE SVG LOGO HERE - brand relevant] Brand Name
  </a>
  <div class="hidden md:flex items-center gap-8">
    <a href="#home" class="text-white/80 hover:text-white transition-colors">Home</a>
    <a href="#about" class="text-white/80 hover:text-white transition-colors">About</a>
    <a href="#services" class="text-white/80 hover:text-white transition-colors">Services</a>
    <a href="#portfolio" class="text-white/80 hover:text-white transition-colors">Portfolio</a>
    <a href="#contact" class="text-white/80 hover:text-white transition-colors">Contact</a>
    <a href="#auth" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all">Sign In</a>
  </div>
  <button id="mobile-menu-btn" class="md:hidden text-white">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
</nav>
<div id="mobile-menu" class="hidden fixed top-16 left-0 right-0 z-40 bg-slate-900 p-4 flex flex-col gap-3 md:hidden">
  <a href="#home" class="text-white py-2 border-b border-white/10">Home</a>
  <a href="#about" class="text-white py-2 border-b border-white/10">About</a>
  <a href="#services" class="text-white py-2 border-b border-white/10">Services</a>
  <a href="#portfolio" class="text-white py-2 border-b border-white/10">Portfolio</a>
  <a href="#contact" class="text-white py-2 border-b border-white/10">Contact</a>
  <a href="#auth" class="text-indigo-400 py-2">Sign In</a>
</div>

<section id="home" class="page-section w-full min-h-screen">
  [HERO CONTENT - see PART 2 below]
</section>

<section id="about" class="page-section w-full min-h-screen hidden">
  [ABOUT CONTENT]
</section>

<section id="services" class="page-section w-full min-h-screen hidden">
  [SERVICES CONTENT]
</section>

<section id="portfolio" class="page-section w-full min-h-screen hidden">
  [PORTFOLIO CONTENT]
</section>

<!--__TEMPLATE_AUTH__-->
<!--__TEMPLATE_CONTACT__-->
<!--__TEMPLATE_FOOTER__-->

CRITICAL RULES — these will break the site if you don't follow them:
1. Every section EXCEPT #home MUST have class="hidden" in addition to page-section
2. #home must NOT have class="hidden"
3. ALL nav link hrefs must exactly match a section id: href="#about" links to id="about"
4. Do NOT add any JavaScript navigation — the framework handles it
5. Do NOT generate your own contact form — use <!--__TEMPLATE_CONTACT__-->
6. Do NOT generate a footer — use <!--__TEMPLATE_FOOTER__-->
7. Logo: always use inline SVG inside <a href="#home">

═══ PART 2 — IMAGES ═══

Use Picsum Photos — always works, never broken:
  Hero:       https://picsum.photos/seed/WORD/1400/700
  Cards/Cols: https://picsum.photos/seed/WORD/600/400
  Portraits:  https://picsum.photos/seed/WORD/400/500
Use a DIFFERENT seed word for every single image (e.g. coffee1, coffee2, barista3).
Never reuse the same seed.

═══ PART 3 — HOME SECTION (hero) ═══

Hero must have:
- Full viewport height: min-h-screen
- Full width background image with dark overlay
- Large headline (clamp 48px-80px) and subtitle
- TWO prominent CTA buttons with gradients and shadows
- Below hero: 3 feature highlight cards

Hero HTML pattern:
<section id="home" class="page-section w-full min-h-screen">
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img src="https://picsum.photos/seed/RELEVANT/1400/700" alt="hero" class="absolute inset-0 w-full h-full object-cover"/>
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
    <div class="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
      <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">[HEADLINE]</h1>
      <p class="text-xl text-white/80 mb-10 max-w-2xl mx-auto">[SUBTITLE 2-3 sentences]</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a href="#services" class="px-8 py-4 bg-gradient-to-r from-[COLOR]-500 to-[COLOR]-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 shadow-[COLOR]-500/30">
          [Primary CTA]
        </a>
        <a href="#about" class="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white hover:text-slate-900 transition-all duration-300">
          [Secondary CTA]
        </a>
      </div>
    </div>
  </div>
  <!-- Feature highlights below hero -->
  <div class="bg-white py-16 px-6">
    <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      [3 feature cards with icon + title + description]
    </div>
  </div>
</section>

═══ PART 4 — ABOUT SECTION ═══

<section id="about" class="page-section w-full min-h-screen hidden bg-slate-50">
  <div class="max-w-6xl mx-auto px-6 py-24">
    <div class="grid md:grid-cols-2 gap-16 items-center mb-20">
      <div>
        <span class="uppercase tracking-widest text-indigo-600 text-sm font-bold">Our Story</span>
        <h2 class="text-4xl font-extrabold text-slate-900 mt-2 mb-6">[Brand headline]</h2>
        <p class="text-slate-600 text-lg leading-relaxed mb-4">[Paragraph 1 — specific to the brand]</p>
        <p class="text-slate-600 text-lg leading-relaxed">[Paragraph 2]</p>
        <blockquote class="mt-6 pl-4 border-l-4 border-indigo-500 text-slate-700 italic text-xl">[Mission statement]</blockquote>
      </div>
      <img src="https://picsum.photos/seed/WORD/700/500" class="rounded-3xl shadow-2xl w-full object-cover"/>
    </div>
    <!-- Team grid -->
    <h3 class="text-3xl font-bold text-center text-slate-900 mb-12">Meet Our Team</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      [4 team member cards: photo + name + role + bio]
    </div>
  </div>
</section>

═══ PART 5 — SERVICES SECTION ═══

<section id="services" class="page-section w-full min-h-screen hidden bg-white">
  <div class="max-w-6xl mx-auto px-6 py-24">
    <div class="text-center mb-16">
      <span class="uppercase tracking-widest text-indigo-600 text-sm font-bold">What We Offer</span>
      <h2 class="text-4xl font-extrabold text-slate-900 mt-2">[Services headline]</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      [3-4 cards: each has image, icon emoji, title, price/tag, 4 bullet features, styled CTA button]
    </div>
  </div>
</section>

═══ PART 6 — PORTFOLIO SECTION ═══

<section id="portfolio" class="page-section w-full min-h-screen hidden bg-slate-900">
  <div class="max-w-6xl mx-auto px-6 py-24">
    <h2 class="text-4xl font-extrabold text-white text-center mb-12">Our Work</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      [6 cards: picsum image with hover overlay showing project name + view button]
    </div>
  </div>
</section>

═══ PART 7 — JAVASCRIPT ═══

Mobile menu toggle and navbar scroll effect ONLY.
The framework injects all navigation logic — do NOT add any.

===JS_START===
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
if(btn && menu){ btn.addEventListener('click', () => menu.classList.toggle('hidden')); }
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if(nav){ if(window.scrollY > 60){ nav.classList.add('shadow-lg'); nav.style.background='rgba(0,0,0,0.95)'; } else { nav.style.background=''; } }
});
===JS_END===

═══ OUTPUT FORMAT ═══

===HTML_START===
[complete HTML for body here — nav, sections, template placeholders]
===HTML_END===

===CSS_START===
[leave empty — Tailwind handles everything]
===CSS_END===

===JS_START===
[mobile menu toggle + scroll effect only]
===JS_END===
`;

export const ECOMMERCE_ADDON = `

═══ E-COMMERCE ADDITIONS ═══

After #portfolio section, add these EXACT comment placeholders:
<!--__TEMPLATE_SHOP__-->
<!--__TEMPLATE_CART__-->
<!--__TEMPLATE_CHECKOUT__-->

Add to both desktop nav and mobile menu:
<a href="#shop">Shop</a>
<a href="#cart">Cart <span class="cart-badge bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">0</span></a>

On the HOME section, add CTA buttons that work:
<button onclick="window.navigateTo && window.navigateTo('shop')" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all">
  Shop Now
</button>
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
