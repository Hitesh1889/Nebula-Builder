
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
You are an elite Senior Frontend Engineer.
The user expects a **VISUALLY STUNNING** and **FULLY FUNCTIONAL** website.
You must execute the following requirements with 100% precision.

**1. VISUAL RICHNESS & BACKGROUNDS (CRITICAL)**
   - **Avoid "Boring" White Pages**: Unless requested otherwise, use gradients, subtle patterns, or **Background Images** to create depth.
   - **Background Image Implementation**: 
     - **NEVER** use \`background-image: url(...)\` in CSS. It is not editable.
     - **ALWAYS** use an absolute positioned \`<img>\` tag for section backgrounds.
     - **Pattern**:
       \`\`\`html
       <section class="relative w-full overflow-hidden py-20 ...">
          <img src="..." class="absolute inset-0 w-full h-full object-cover -z-10 opacity-40" alt="Background">
          <div class="relative z-10 container mx-auto ...">
             <!-- Content Here -->
          </div>
       </section>
       \`\`\`
   - **Source**: \`https://image.pollinations.ai/prompt/{KEYWORD}?width=1080&height=720&nologo=true&seed={RANDOM}\`

**2. INTERACTIVE TABS & UI LOGIC**
   - **Tabs**: Must switch content and update active states via JavaScript.
   - **Detail Views**: "Read More" buttons must open a detail view overlay/modal populated with dynamic content.
   - **SPA Navigation**: Navbar links must scroll to sections or switch views.

**3. AUTHENTICATION & LEGAL (MANDATORY)**
   - **Social Logins**:
     - Buttons for **Google, Facebook, Instagram, GitHub, Apple**.
     - **CRITICAL**: Use the function \`showNotification('success', 'Social Login simulated: Google')\` (I will inject this function, just call it).
   - **Sign Up Form**:
     - Fields: Full Name, Email, Password, Confirm Password.
     - **Terms Checkbox**: Label MUST include:
       \`I agree to the <a href="#" onclick="showNotification('info', 'Opens Terms of Service'); return false;">Terms of Service</a> and <a href="#" onclick="showNotification('info', 'Opens Privacy Policy'); return false;">Privacy Policy</a>\`

**4. VISUAL POLISH**
   - **Typography**: Inter font.
   - **Spacing**: Generous padding.
   - **Inputs**: Modern styling with focus states.

**Output JSON**:
{
  "html": "<!-- HTML structure -->",
  "css": "/* CSS */",
  "javascript": "// JS Logic"
}
`;
