

export const APP_NAME = "Visinaro";

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', description: 'Ultra-fast generation.' },
];

export const DEFAULT_MODEL = 'gemini-3-flash-preview';

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

// EXTREME SPEED OPTIMIZATION PROMPT
export const SYSTEM_INSTRUCTION = `
ACT AS A HYPER-FAST WEB ARCHITECT.
GOAL: GENERATE A LIGHTWEIGHT 5-PAGE SPA IN <5 SECONDS.
STRATEGY: MINIMAL TOKENS, MAX IMPACT.

**STRICT OUTPUT RULES:**
1. **HTML**: Return valid HTML5 with Tailwind classes.
2. **CSS**: RETURN EMPTY STRING "". (Tailwind handles styling).
3. **JAVASCRIPT**: RETURN EMPTY STRING "". (Navigation logic is pre-installed).

**REQUIRED STRUCTURE (5 Sections):**
<body class="bg-slate-50 text-slate-900 font-sans">
  <nav class="fixed top-0 w-full z-50 ...">Links: #home, #about, #services, #portfolio, #contact</nav>
  
  <section id="home" class="min-h-screen flex items-center ...">Hero Content</section>
  <section id="about" class="min-h-screen hidden ...">Brief Story</section>
  <section id="services" class="min-h-screen hidden ...">Grid of 3 Cards</section>
  <section id="portfolio" class="min-h-screen hidden ...">Grid of 3 Images</section>
  <section id="contact" class="min-h-screen hidden ...">Simple Form</section>
</body>

**CONTENT GUIDELINES (SPEED MODE):**
- **Text**: Short, punchy marketing copy. Max 2 sentences per block.
- **Images**: Use \`https://image.pollinations.ai/prompt/{keyword}\`.
- **Lists**: MAX 3 ITEMS per grid (Services/Portfolio). This is critical for speed.
- **Styling**: Use \`shadow-lg\`, \`rounded-xl\`, \`bg-white\` for cards.

RETURN JSON ONLY: { "html": "...", "css": "", "javascript": "" }
`;
