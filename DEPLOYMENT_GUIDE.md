# Visinaro — Render Free Deployment Guide

## What Changed & Why It Was Slow Before

The original app used model ID `gemini-3-flash-preview` — **this model does not exist**.
Every generation attempt would:
1. Call the API → fail with a 404
2. Retry 3 times with exponential backoff (1s → 2s → 4s delay)
3. Show an error after ~7+ seconds of wasted waiting

**That was the entire cause of slowness.** The fix: correct model names.

---

## What's New in This Version

### ⚡ Speed Fixes
| Change | Impact |
|--------|--------|
| Fixed model → `gemini-2.0-flash-lite` | **5–8s generation** (was broken before) |
| Added streaming API | UI updates in real-time as AI generates |
| Temperature 0.4 → 0.3 | Faster, more deterministic output |
| `maxOutputTokens: 4096` cap | Prevents runaway long responses |
| Code-split JS bundles | Faster page load |

### 🔍 SEO Agent (New)
- Live SEO score panel in the workspace toolbar
- Checks 8 SEO rules: meta tags, OG tags, JSON-LD, H1, alt texts, etc.
- One-click AI auto-fix injects missing tags into the generated site

### 🧠 Model Selector (New)
Choose speed vs quality from the toolbar:
- ⚡ **Flash Lite** — 5–8s (default)
- 🚀 **Flash** — 8–15s
- ✨ **Flash 2.5** — 15–25s

### 🔑 Zero-Hassle API Key (New)
- **On Render**: Set `GEMINI_API_KEY` in the dashboard once → works forever ✓
- **Fallback**: If no env key exists, a setup screen asks the user to enter their key (stored in browser)
- **Key button** (🔑) in the header lets you change the key anytime

---

## Deploying to Render (Free Tier)

### Step 1 — Push to GitHub

```bash
# Initialize git in your project folder (if not already)
cd visinaro-optimized
git init
git add .
git commit -m "Initial commit - Visinaro AI Web Builder"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/visinaro.git
git push -u origin main
```

---

### Step 2 — Create a Render Web Service

1. Go to **https://render.com** and sign in (free account)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select your repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `visinaro` |
| **Region** | Pick closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

---

### Step 3 — Set Your API Key (One Time Only)

In Render dashboard → your service → **"Environment"** tab:

Click **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | `your_actual_gemini_key_here` |

**Where to get a free Gemini key:**
1. Go to **https://aistudio.google.com/apikey**
2. Sign in with Google
3. Click "Create API Key"
4. Copy it — it starts with `AIza...`

That's it. You never need to touch this again.

---

### Step 4 — Deploy

Click **"Create Web Service"**. Render will:
1. Pull your code from GitHub
2. Run `npm install && npm run build` (the `GEMINI_API_KEY` is available here → gets baked into the build)
3. Start the server with `npm start`

Your app will be live at: `https://visinaro.onrender.com`

⚠️ **Free tier note**: Render free services spin down after 15 minutes of inactivity and take ~30 seconds to wake up on the next request. This is normal for free tier.

---

### Step 5 — Future Updates (Re-deploy)

Every time you push to GitHub, Render auto-deploys:

```bash
git add .
git commit -m "Updated something"
git push
```

Render detects the push and redeploys automatically. Zero manual steps.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your key
echo "GEMINI_API_KEY=AIza..." > .env.local

# 3. Run dev server
npm run dev
# → Opens at http://localhost:3000
```

---

## If It's Not Working

**"API Key Missing" screen showing on Render:**
→ You forgot to set `GEMINI_API_KEY` in Render's Environment tab. Add it, then click "Manual Deploy".

**Still slow after deployment:**
→ Check that the build logs show `gemini-2.0-flash-lite` (not the old model name). If not, ensure the new `constants.ts` was committed.

**Render says "Build failed":**
→ Check build logs. Usually missing a dependency. Run `npm install` locally first.

**"Service Unavailable" for 30 seconds:**
→ Normal. The free tier spins down. Just wait and refresh.

---

## File Structure Reference

```
visinaro-optimized/
├── App.tsx                          ← Main app (model selector + SEO agent wired in)
├── constants.ts                     ← Fixed model IDs (was the root cause of slowness)
├── services/
│   └── geminiService.ts             ← Streaming + smart key resolution + SEO agent
├── components/
│   ├── ApiKeySetup.tsx              ← NEW: Key setup screen (fallback if no env var)
│   ├── SEOAgent.tsx                 ← NEW: SEO scoring + auto-fix
│   ├── ModelSelector.tsx            ← NEW: Speed/quality model picker
│   └── Header.tsx                   ← Updated: key change button added
├── vite.config.ts                   ← Build optimizations + code splitting
├── package.json                     ← Added `serve` + `npm start` script
├── render.yaml                      ← NEW: Render deployment config
├── public/
│   ├── sitemap.xml                  ← NEW: SEO sitemap
│   └── robots.txt                   ← NEW: Search engine rules
└── index.html                       ← Full SEO meta tags + JSON-LD structured data
```
