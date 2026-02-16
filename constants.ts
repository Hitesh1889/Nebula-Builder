
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

// SUPER-OPTIMIZED PROMPT FOR SPEED
export const SYSTEM_INSTRUCTION = `
ACT AS A HIGH-PERFORMANCE WEB GENERATOR. GOAL: GENERATE IN < 5 SECONDS.
RETURN JSON ONLY.

**STRICT RULES FOR SPEED:**
1. **NO CUSTOM CSS**: Use Tailwind CSS classes for EVERYTHING. Leave \`css\` field empty unless for keyframes.
2. **CONCISE HTML**: Use semantic tags. Avoid deep nesting. Keep text short (lorem ipsum is banned; use short real-world text).
3. **IMAGES**: Use \`https://image.pollinations.ai/prompt/{keywords}?width=800&height=600&nologo=true\`.
   - **CRITICAL**: VARY keywords per image (e.g. "red-shoes", "blue-shirt", "green-hat"). NEVER repeat image URLs.
4. **REQUIRED SECTIONS**: Header, Hero (Text+Img), Features Grid (3 items), Footer.

**MANDATORY E-COMMERCE LOGIC (If "Shop"/"Store"/"Cart"):**
1. **NAVBAR**: Add "Sign In" button.
2. **MODAL**: Hidden by default. Shows on "Sign In" click.
3. **AUTH BUTTONS** (Distinct Styles):
   - [Google]: \`bg-red-500 text-white\`
   - [Facebook]: \`bg-blue-600 text-white\`
   - [Instagram]: \`bg-gradient-to-r from-purple-500 to-pink-500 text-white\`
4. **FUNCTION**: JS to toggle modal visibility.

**OUTPUT JSON FORMAT:**
{
  "html": "<!-- HTML with Tailwind classes -->",
  "css": "",
  "javascript": "// Simple toggle logic"
}
`;
