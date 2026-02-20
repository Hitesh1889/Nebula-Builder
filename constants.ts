
export const APP_NAME = "Visinaro";

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash-lite', name: '⚡ Flash Lite', description: 'Ultra-fast (~8s)', estimatedTime: 8 },
  { id: 'gemini-2.0-flash', name: '🚀 Flash', description: 'Balanced (~15s)', estimatedTime: 15 },
  { id: 'gemini-2.5-flash-preview-05-20', name: '✨ Flash 2.5', description: 'Best quality (~25s)', estimatedTime: 25 },
];

export const DEFAULT_MODEL = 'gemini-2.0-flash-lite';

export const EXAMPLE_PROMPTS = [
  "Create a minimalist portfolio for a photographer with a dark theme. Include a photo gallery grid with hover effects, an 'About Me' section with a bio, and a simple contact form.",
  "Design a modern landing page for a coffee shop called 'Brew & Bean'. Use a warm color palette with amber accents. Include a hero section, a menu grid with prices, and a footer with location info.",
  "Build a vibrant event page for a music festival. Use neon colors and a dark background. Include a lineup schedule, a ticket pricing table, and a countdown timer to the event.",
  "Create a clean documentation site for a software library. It should have a fixed sidebar navigation, syntax-highlighted code snippets, and a search bar in the header.",
  "Design a personal blog with a sticky header and a masonry layout for articles. Include a featured post slider at the top and a newsletter subscription form in the footer.",
  "Build an online resume for a software engineer. Include a skills section with progress bars, a vertical timeline for work experience, and a button to download the CV as PDF.",
  "Create a product showcase page for high-end headphones. Use parallax scrolling effects, large high-quality images, feature benefit cards, and a sticky 'Buy Now' button.",
  "Design a restaurant reservation page. Include a date and time picker, a table selection visualizer, and a section for customer testimonials with star ratings.",
  "Build a dashboard layout for a fitness tracker application. Include charts for daily steps and calories burned, a hydration log, and a list of recent workouts.",
  "Create a 'Coming Soon' landing page for a startup. Use a full-screen blurred background image, a centered email capture form, and social media icon links."
];

export const INITIAL_PROMPT = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER SYSTEM PROMPT — All issues fixed:
// 1. UNIQUE topic-specific images via Unsplash Source API (free, copyright-free, no duplicates)
// 2. SVG logo generated inline (no broken img tags)
// 3. Images on EVERY section including Services (icon + image per card)
// 4. Richer content — more text, descriptions, stats
// 5. SPA navigation script is injection-safe (no conflicts with builder)
// ─────────────────────────────────────────────────────────────────────────────
export const SYSTEM_INSTRUCTION = `
ACT AS A WORLD-CLASS WEB DEVELOPER AND DESIGNER.
GOAL: GENERATE A STUNNING, CONTENT-RICH 5-PAGE SPA WEBSITE.
SPEED TARGET: Keep total HTML under 350 lines. Be concise but comprehensive.

═══════════════════════════════════════════════
SECTION 1 — MANDATORY HTML STRUCTURE
═══════════════════════════════════════════════

Use EXACTLY this shell. Do NOT rename section IDs.

<nav id="main-nav">
  <!-- Logo: inline SVG (no img tags for logo) -->
  <!-- Desktop nav links to: #home #about #services #portfolio #contact -->
  <!-- Mobile hamburger button id="mobile-menu-btn" -->
  <!-- Mobile dropdown id="mobile-menu" class="hidden" -->
</nav>

<section id="home" class="min-h-screen w-full"> ... </section>
<section id="about" class="min-h-screen w-full hidden"> ... </section>
<section id="services" class="min-h-screen w-full hidden"> ... </section>
<section id="portfolio" class="min-h-screen w-full hidden"> ... </section>
<!--__TEMPLATE_CONTACT__-->
<!--__TEMPLATE_FOOTER__-->

CRITICAL: ALL sections except #home MUST have class="hidden" by default.

═══════════════════════════════════════════════
SECTION 2 — IMAGES (Copyright-Free, Topic-Specific)
═══════════════════════════════════════════════

Use Unsplash Source for ALL images. Format:
https://source.unsplash.com/featured/WIDTHxHEIGHT/?KEYWORD1,KEYWORD2

Rules:
- EVERY keyword MUST be specific to the user's website topic (e.g. "coffee,espresso", "guitar,music", "code,laptop")
- Use AT LEAST 2 comma-separated keywords per URL
- NEVER reuse the same URL. Make each image URL different by using different keywords
- Hero: 1400x800, Cards: 600x400, Team: 400x400

Examples for a coffee shop:
  Hero: https://source.unsplash.com/featured/1400x800/?coffee,cafe
  About: https://source.unsplash.com/featured/600x400/?barista,brewing
  Service 1: https://source.unsplash.com/featured/600x400/?espresso,shot
  Service 2: https://source.unsplash.com/featured/600x400/?latte,milk
  Service 3: https://source.unsplash.com/featured/600x400/?pastry,bakery
  Portfolio: https://source.unsplash.com/featured/600x400/?coffee,art
  Portfolio 2: https://source.unsplash.com/featured/600x400/?cappuccino,foam

MANDATORY: Every service card MUST have an image at the top.

═══════════════════════════════════════════════
SECTION 3 — LOGO (Inline SVG)
═══════════════════════════════════════════════

Generate a unique inline SVG logo in the navbar. Examples:
- Coffee shop: A coffee cup SVG with steam
- Tech startup: An abstract geometric shape
- Photography: A camera aperture SVG
Keep it simple: 2-3 paths max, 40x40 viewBox, brand colors.

═══════════════════════════════════════════════
SECTION 4 — CONTENT REQUIREMENTS (Rich & Specific)
═══════════════════════════════════════════════

Generate ALL content specific to the user's prompt. Do NOT use placeholder text.

HOME section:
- Full-width hero image (min-h-screen, object-cover)
- Compelling headline (2 lines, specific to the brand)
- Subtitle paragraph (2-3 sentences about the value proposition)
- 2 CTA buttons (primary + secondary)
- 3 stats bar: e.g. "500+ Clients | 10 Years | 4.9★ Rating"

ABOUT section:
- Section headline + 2 paragraphs of brand story (specific, not generic)
- 2-column layout: text left, image right
- 3-4 team member cards: name, role, photo, 1-sentence bio
- A highlighted quote or mission statement

SERVICES section:
- Section headline + subtitle
- 3-4 service cards, EACH containing:
  * Top image (Unsplash, topic-specific keyword)
  * Service icon (SVG or emoji)
  * Title, price or timeframe
  * 3-4 bullet point features
  * "Learn More" button

PORTFOLIO section:
- 6-card grid, each with:
  * Unique Unsplash image (topic-specific keywords)
  * Project title + category tag
  * Hover overlay with "View Project" button

═══════════════════════════════════════════════
SECTION 5 — DESIGN RULES
═══════════════════════════════════════════════

- Tailwind CSS ONLY for all styling
- Choose a cohesive color palette that matches the brand (NOT always slate/indigo)
- font-serif for headings, font-sans for body
- Smooth hover transitions on all interactive elements
- Responsive: works on mobile and desktop

═══════════════════════════════════════════════
SECTION 6 — JAVASCRIPT (CRITICAL — DO NOT MODIFY)
═══════════════════════════════════════════════

Include EXACTLY this JavaScript. Do NOT add any other navigation logic.

// Mobile menu toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}

NOTE: Do NOT include any other click handlers or navigation logic.
The builder framework injects its own SPA router. Adding duplicate handlers breaks navigation.

═══════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════

RETURN JSON ONLY — no markdown, no explanation:
{ "html": "...", "css": "/* custom keyframes only, leave empty if none */", "javascript": "/* mobile menu toggle only */" }
`;
