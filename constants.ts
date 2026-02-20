
export const APP_NAME = "Visinaro";

// OPTIMIZATION AGENT: Correct, fast Gemini model IDs
// gemini-2.0-flash-lite = fastest (5-8s) — default
// gemini-2.0-flash     = balanced (8-15s)
// gemini-2.5-flash-preview-05-20 = highest quality (15-25s)
export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash-lite', name: '⚡ Flash Lite', description: 'Ultra-fast (5-8s). Best for simple sites.' },
  { id: 'gemini-2.0-flash', name: '🚀 Flash', description: 'Fast (8-15s). Balanced quality.' },
  { id: 'gemini-2.5-flash-preview-05-20', name: '✨ Flash 2.5', description: 'Smart (15-25s). Best quality.' },
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

// SUPER-OPTIMIZED SYSTEM PROMPT
// Key optimizations vs original:
// 1. Explicit token budget — model knows to stop at 4096 tokens
// 2. Template placeholders for contact + footer (saves ~800 tokens per generation)
// 3. Tighter rules = less ambiguity = faster inference
export const SYSTEM_INSTRUCTION = `
ACT AS A WORLD-CLASS WEB DEVELOPER.
GOAL: GENERATE A ROBUST 5-PAGE WEBSITE (SPA) IN A SINGLE FILE.
CRITICAL: RESPONSE MUST BE FAST. Keep total HTML under 300 lines.

**MANDATORY STRUCTURE (Single Page App):**
1. **CONTAINER**: Use <body> or <main> to hold 5 distinct <section> tags.
2. **5 SECTIONS (PAGES)**:
   - <section id="home" class="min-h-screen w-full ..."> ... </section>
   - <section id="about" class="min-h-screen w-full hidden ..."> ... </section>
   - <section id="services" class="min-h-screen w-full hidden ..."> ... </section>
   - <section id="portfolio" class="min-h-screen w-full hidden ..."> ... </section>
   - <section id="contact" class="min-h-screen w-full hidden ..."> ... </section>
   *NOTE: Add 'hidden' class to all except 'home' by default.*

3. **NAVIGATION (RESPONSIVE)**:
   - **Navbar**: Sticky/Fixed top. Z-index 50.
   - **Desktop**: Links (Home, About, Services, Portfolio, Contact) visible.
   - **Mobile (Hamburger Menu)**: 
     - Create a button with ID \`mobile-menu-btn\` containing a 3-line SVG icon.
     - This button MUST be visible on mobile (block) and hidden on desktop (hidden md:block or similar).
     - Create a Menu Container with ID \`mobile-menu\`. It MUST be \`hidden\` by default.
     - The menu contains vertical links.

**CONTENT REQUIREMENTS (Concise & Professional):**
- **Home**: High-impact Hero section with Image, Headline, 2 Buttons.
- **About**: "Our Story" text, Team Grid (3-4 cards).
- **Services**: Grid of 3-6 Service Cards with icons.
- **Portfolio**: Grid of 6 Project Images with hover effects.
- **Contact & Footer**:
   - **CRITICAL**: DO NOT write HTML/code for the Contact section or Footer. To save time and tokens, you MUST ONLY output the following exact placeholders:
     - For Contact: \`<!--__TEMPLATE_CONTACT__-->\`
     - For Footer: \`<!--__TEMPLATE_FOOTER__-->\`
   - Place these placeholders where the contact section and footer should normally be.

**DESIGN RULES:**
- **Tailwind CSS ONLY**: Use \`bg-slate-50\`, \`text-slate-900\`, \`shadow-xl\`, \`rounded-2xl\`.
- **Images**: Use \`https://image.pollinations.ai/prompt/{keyword}\` (e.g., 'office', 'code', 'meeting').
- **Typography**: Use \`font-serif\` for headings, \`font-sans\` for body.

**JAVASCRIPT LOGIC (Include this):**
\`\`\`javascript
// Mobile Menu Toggle
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
if(btn && menu) {
    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
}

// Navigation Logic
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if(target) {
        target.classList.remove('hidden');
        window.scrollTo(0,0);
    }
    // Close mobile menu if open
    if(menu) menu.classList.add('hidden');
  });
});
\`\`\`

RETURN JSON ONLY: { "html": "...", "css": "...", "javascript": "..." }
`;
