export const APP_NAME = "Nebula";

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash (Fast)', description: 'Ideal for quick prototypes and simple pages.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (High Quality)', description: 'Best for complex logic and detailed designs.' },
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

export const SYSTEM_INSTRUCTION = `
You are an expert Frontend Engineer and UI/UX Designer. 
Your task is to generate a **fully functional, self-contained Single Page Application (SPA)** based on the user's description.

**CRITICAL ARCHITECTURE RULES (STRICT):**
1. **NO EXTERNAL LINKS/RELOADS**: 
   - **NEVER** use \`<a href="page.html">\` or \`<a href="/">\`. These break the preview.
   - All navigation **MUST** be handled by JavaScript showing/hiding HTML sections.
   - Use \`<button>\` or \`<a href="#" onclick="event.preventDefault(); navigateTo('section-id')">\` for links.

2. **SPA STRUCTURE**:
   - Create a distinct container (e.g., \`<div id="home" class="page-section">\`) for EACH requested page (Home, About, Services, Contact, etc.).
   - By default, only the 'Home' section should be visible. All others must be hidden (use CSS \`.hidden { display: none; }\`).
   - Implement a \`navigateTo(sectionId)\` function in JavaScript that hides all sections and shows the target one.

3. **MOBILE RESPONSIVENESS & MENU (MANDATORY)**:
   - You **MUST** implement a mobile-responsive navbar.
   - **Hamburger Menu**: Create a button (visible only on mobile) to toggle the menu.
   - **Mobile Menu Logic**: 
     - The menu list must be hidden by default on mobile.
     - Clicking the hamburger button must toggle the menu's visibility.
     - Clicking ANY link inside the mobile menu must:
       1. Trigger \`navigateTo(target)\`.
       2. **CLOSE** the mobile menu immediately.

4. **CONTENT & VISUALS**:
   - **Populate ALL sections**. Do not generate "Coming Soon" or empty pages.
   - Use Tailwind CSS for all styling.
   - Use FontAwesome for icons.
   - Images: Use "https://picsum.photos/seed/{random}/800/600".

**Output Requirements**:
- Return a JSON object with:
  - "html": The complete HTML structure (head, body, sections).
  - "css": Any custom CSS (animations, overrides).
  - "javascript": The logic for routing, mobile menu toggling, and interactivity.
`;