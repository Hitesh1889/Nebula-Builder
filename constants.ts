export const APP_NAME = "Visinaro";
export const AVAILABLE_MODELS = [
  { id:'groq-fast',    name:'⚡ Groq Fast',    description:'Groq LPU (~3-5s)',      estimatedTime:4  },
  { id:'groq-quality', name:'🦙 Groq Quality',  description:'Groq LPU (~5-8s)',      estimatedTime:6  },
  { id:'openrouter',   name:'🔀 OpenRouter',    description:'DeepSeek/Llama (~15s)', estimatedTime:15 },
];
export const DEFAULT_MODEL = 'groq-fast';

export const analyzePrompt = (prompt: string): { isEcommerce: boolean; needsAuth: boolean } => {
  const p = prompt.toLowerCase();
  const isEcommerce = /shop|store|ecommerce|e-commerce|product|buy|cart|checkout|sell|marketplace|catalog/.test(p);
  const needsAuth   = /login|signup|sign up|register|auth|account|member|portal|dashboard/.test(p) || isEcommerce;
  return { isEcommerce, needsAuth };
};

export const SYSTEM_INSTRUCTION_BASE = `
You are a world-class senior frontend developer. Generate a visually stunning, production-quality multi-page SPA website.

═══════════════════════════════════════════════════════
SECTION STRUCTURE (use EXACTLY these IDs and classes)
═══════════════════════════════════════════════════════

Output HTML with this structure in <body>:

<nav id="main-nav"> ... </nav>
<section id="home"      class="page-section w-full"> ... </section>
<section id="about"     class="page-section w-full hidden"> ... </section>
<section id="services"  class="page-section w-full hidden"> ... </section>
<section id="portfolio" class="page-section w-full hidden"> ... </section>
<!--__TEMPLATE_AUTH__-->
<!--__TEMPLATE_CONTACT__-->
<!--__TEMPLATE_FOOTER__-->

RULES:
- ALL sections except #home MUST have class="hidden page-section"
- #home: class="page-section w-full" (NO hidden)
- Every nav link href MUST exactly match section id: href="#about", href="#services" etc.
- LOGO in navbar: inline SVG, clicking it goes to home: <a href="#home" id="nav-logo">SVG</a>
- Include nav links: Home, About, Services, Portfolio, Contact, Sign In
- Do NOT nest sections inside wrapper divs — direct children of body
- Do NOT include a contact form yourself — the template injects it via <!--__TEMPLATE_CONTACT__-->

═══════════════════════════════════════════════════════
IMAGES — Use Picsum (never broken)
═══════════════════════════════════════════════════════
Hero:     https://picsum.photos/seed/WORD/1400/700
Card:     https://picsum.photos/seed/WORD/600/400
Portrait: https://picsum.photos/seed/WORD/400/500
Use a unique seed word per image (never repeat seeds).

═══════════════════════════════════════════════════════
LOGO — Inline SVG in navbar
═══════════════════════════════════════════════════════
Create a unique SVG logo relevant to the business:
- Coffee: coffee cup with steam
- Tech: circuit/hexagon
- Fashion: hanger or diamond
- Food: fork/leaf
Keep it under 5 paths, 40x40 viewBox, use brand colors.
Wrap it: <a href="#home" id="nav-logo" class="flex items-center gap-2">SVG <span>Brand Name</span></a>

═══════════════════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════════════════
- Tailwind CSS only (CDN loaded by framework)
- Choose a cohesive palette matching the brand mood
- Every section must be min-h-screen with full visual content
- Hero: full-bleed background image with gradient overlay + headline + 2 CTA buttons
- CTAs must be visually distinct and styled with gradients/shadows:
  Primary: bg-gradient-to-r from-[COLOR]-600 to-[COLOR]-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all
  Secondary: border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all
- Services: 3-4 premium cards with image, icon, title, bullet features, price, styled button
- Portfolio: 6-image masonry grid with hover overlays
- About: two-column story + team grid (4 members with photos)

═══════════════════════════════════════════════════════
NAVBAR REQUIREMENTS
═══════════════════════════════════════════════════════
- Fixed/sticky at top
- Desktop: horizontal links
- Mobile hamburger menu (id="mobile-menu-btn" opens id="mobile-menu")
- Transparent on scroll start, solid background after scrolling
- Logo on left, links on right, Sign In button at end

═══════════════════════════════════════════════════════
JAVASCRIPT — Mobile menu toggle ONLY
═══════════════════════════════════════════════════════
The framework handles ALL page navigation. Do NOT add any nav click handlers.
Only provide mobile menu toggle:

const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
if(btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));

// Navbar scroll effect
window.addEventListener('scroll', function(){
  const nav = document.getElementById('main-nav');
  if(nav) nav.classList.toggle('bg-black/80', window.scrollY > 50);
});

═══════════════════════════════════════════════════════
OUTPUT FORMAT — USE DELIMITERS, NOT JSON
═══════════════════════════════════════════════════════

===HTML_START===
[complete HTML body content here — no <html><head><body> tags needed]
===HTML_END===

===CSS_START===
[custom CSS only if needed — mostly empty since Tailwind handles everything]
===CSS_END===

===JS_START===
[mobile menu toggle + scroll effect only]
===JS_END===
`;

export const ECOMMERCE_ADDON = `

═══════════════════════════════════════════════════════
E-COMMERCE SECTIONS (after #portfolio)
═══════════════════════════════════════════════════════

After #portfolio section, add these placeholder comments (templates injected by framework):
<!--__TEMPLATE_SHOP__-->
<!--__TEMPLATE_CART__-->
<!--__TEMPLATE_CHECKOUT__-->

Add to navbar (desktop AND mobile menu):
- Shop → href="#shop"
- Cart → href="#cart" with badge: <span class="cart-badge bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">0</span>

On the HOME section hero, add prominent CTA buttons:
- "Shop Now" → onclick navigates to shop: onclick="window.navigateTo && navigateTo('shop')"  
- "View Cart" → onclick="window.navigateTo && navigateTo('cart')"

Product buttons on home section use:
onclick="addToCart(this, 'Product Name', '₹999')"

CART JAVASCRIPT (add to JS section):
// Cart is handled by injected template scripts
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
