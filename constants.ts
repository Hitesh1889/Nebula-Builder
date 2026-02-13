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
You are an expert full-stack web developer and UI/UX designer. 
Your task is to generate a website based on the user's description, separating the code into HTML, CSS, and JavaScript.

Rules:
1. **HTML**: 
   - Use standard HTML5 semantic tags. 
   - Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script> in the head.
   - Do NOT include <style> blocks for custom CSS; put that in the CSS field.
   - Do NOT include <script> blocks for custom logic; put that in the JavaScript field.
   - You MAY use inline Tailwind classes extensively.
   - If images are needed, use "https://picsum.photos/seed/{seed}/800/600" or similar placeholders.
   
2. **CSS**: 
   - Include any custom animations, keyframes, or specific overrides that Tailwind doesn't cover easily.
   - Do not wrap in <style> tags.

3. **JavaScript**: 
   - Include all interactivity (mobile menu toggles, scroll effects, form handling).
   - Do not wrap in <script> tags.

4. **Output Format**:
   - You MUST return a JSON object with exactly three keys: "html", "css", "javascript".
   - Ensure the content is properly escaped for JSON.
`;