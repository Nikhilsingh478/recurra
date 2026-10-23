<div align="center">

# 🧠 RECURRA

**Predict What Matters in Your Exams with AI-Precision**

*An AI-powered exam pattern intelligence engine that cross-references your university syllabus with past papers to surface the questions most likely to appear on your next exam.*

[![Live Demo](https://img.shields.io/badge/Live-recurraio.vercel.app-3b6fd4?style=for-the-badge&logo=vercel&logoColor=white)](https://recurraio.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Powered by Gemini 2.5](https://img.shields.io/badge/Powered%20by-Gemini%202.5-8E75B2?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse%20(mobile)-90%2B-0cce6b?style=flat-square&logo=lighthouse&logoColor=white)](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Frecurraio.vercel.app%2F)

</div>

---

## 🎯 What is Recurra?

Most students waste hours manually scanning old exam papers, mapping questions back to the syllabus, and guessing what's important. **Recurra automates this in under a minute.**

Paste your syllabus and previous year question papers, and Recurra's AI engine cross-references them to detect recurring patterns. It filters out off-syllabus content, ranks questions by how often they repeat relative to your dataset, and delivers a structured study plan with up to **8 high-probability questions per unit**, plus a skip strategy and a numerical survival kit.

> *Think of it as an academic strategist that reads, models, and predicts your university exam patterns so you don't have to.*

For the full technical reference (prompt rules, JSON schema, API errors, badge meanings), see **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**.

---

## ✨ Features

### 🧠 1. AI Pattern Engine
- **Google Gemini 2.5**: `gemini-2.5-flash-lite` on the Vercel deployment (`api/analyze.ts`) for low latency; `gemini-2.5-pro` on the standalone Node server (`server/analyze.js`). Both run at `temperature: 0` for deterministic output.
- **Strict syllabus filtering**: Questions that appeared in past papers but are no longer in the syllabus are dropped, no matter how often they appeared.
- **Similar-question merging**: Differently worded questions about the same concept are counted as one topic.
- **API key rotation**: Up to four keys (`GEMINI_API_KEY`, `_1`, `_2`, `_3`). On a `429`/`403` the next key is tried automatically.

### 📊 2. Dynamic Ranking & Classification
- **Relative priority tiers**: No hardcoded thresholds. Priorities are assigned from the actual frequency spread of your dataset:
  - **Priority 1**: top of the frequency range
  - **Priority 2**: mid-range repeats
  - **Priority 3**: lowest frequency, flagged `lowPriority` and visually de-emphasised
- **Difficulty**: Easy (definitions), Medium (algorithm steps/diagrams), Hard (numericals/multi-step proofs).
- **ROI rating**: Very High / High / Medium / Low, combining frequency and difficulty.
- **🔺 Trending detection**: Topics that appear in both of the two most recent papers are flagged even if they aren't historically frequent.

### 🗂 3. Results Dashboard
- **Unit-wise**: Probable questions per syllabus unit with frequency, difficulty, ROI, and trending badges.
- **Strategy**: An overall exam strategy and unit-priority summary.
- **Skip Plan**: Recommended unit to skip, an alternative, must-not-skip units, and the **Numerical Survival Kit** (calculation types repeating across 2+ papers).
- **Must Prepare**: All Priority 1 and 2 questions, sorted by frequency.
- **Math rendering**: All formulas render with KaTeX (`$...$` inline, `$$...$$` block).
- **PDF export**: A print-optimised, A4-paginated report via the browser's print dialog (`window.print()`), including all badges and math.
- **Feedback**: In-app feedback modal delivered via EmailJS.

### 🛡️ 4. Backend & Rate Limiting
- **Two interchangeable backends**: a Vercel serverless function (`api/analyze.ts`, 60s max duration) and a Node server (`server/index.js`) used for local development and Render.
- **IP-based rate limiting**: 10 analyses per IP per day, resetting at midnight IST (in-memory).
- **Input validation**: Syllabus and papers must each be at least 80 characters and 10 words.

### ⚡ 5. Performance-First Landing Page
- **No animation libraries on the critical path**: Hero and navbar entrances are pure CSS keyframes; the LCP heading is visible from the first paint.
- **Lightweight scroll effects**: The word-by-word scroll reveal and stacked cards use a single `requestAnimationFrame` handler, active only while on screen (via `IntersectionObserver`).
- **Deferred work**: Below-the-fold sections render in a `startTransition` after first paint; the hero video loads only after page load + idle (skipped on Save-Data, 2G, or reduced motion) with a lightweight poster frame in the meantime; Google Analytics loads on first interaction or 7s after load.
- **Self-hosted fonts**: General Sans is served from `/public/fonts` and preloaded.
- **Route-level code splitting**: Every page is lazy-loaded; the toast system loads only when needed.

### 🔍 6. SEO & Analytics
- Per-page meta tags with `react-helmet-async`, canonical URLs, `robots.txt`, a build-time sitemap (`vite-plugin-sitemap`), JSON-LD `WebApplication` schema, Open Graph / Twitter cards, and a web app manifest.
- GA4 custom events (`src/lib/analytics.ts`): analysis started/completed/failed, PDF exported, results copied, tab switched, feedback submitted. No PII is collected.

---

## 🛠 Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Core** | React 18, TypeScript 5 | Component architecture and typing |
| **Build** | Vite 5 (SWC) | Dev server and optimised production bundles |
| **UI & Styling** | Tailwind CSS 3.4, shadcn/ui, Radix Toast | Utility-first styling and accessible primitives |
| **Animation** | CSS keyframes, `requestAnimationFrame`, `IntersectionObserver` | Entrance and scroll-driven effects without heavy libraries |
| **Math** | KaTeX, `react-katex` | Rendering formulas in results and PDF |
| **AI Inference** | Google Gemini 2.5 (Flash-Lite / Pro) REST API | Pattern detection and ranking |
| **API** | Vercel Serverless Functions, Node.js HTTP server | Key handling, validation, rate limiting |
| **Routing** | React Router v6 | Client-side routing with lazy-loaded pages |
| **Feedback** | EmailJS (`@emailjs/browser`) | Delivering in-app feedback |
| **SEO & Analytics** | React Helmet Async, GA4, vite-plugin-sitemap | Indexing and usage analytics |
| **Testing** | Vitest, jsdom, Testing Library | Unit tests |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (v20 recommended)
- `npm` (a `bun.lock` is also included)

### 1. Clone & Install

```bash
git clone https://github.com/Nikhilsingh478/recurra.git
cd recurra
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Gemini — at least one key is required for analysis
GEMINI_API_KEY=your_primary_key_here

# Optional fallback keys, rotated on rate-limit/quota errors
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=

# Optional — feedback modal (EmailJS). Without these, feedback is skipped silently.
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

### 3. Run

```bash
# Full stack: frontend + /api/analyze on one origin (recommended)
node server/index.js

# Frontend only (the analysis API will not be available)
npm run dev
```

Both start on **http://localhost:5000**.

### Available Scripts

| Command | Description |
|---|---|
| `node server/index.js` | Full-stack dev server (Vite middleware + API). With `NODE_ENV=production`, serves `dist/`. |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production build to `dist/` (includes sitemap) |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

---

## 📁 Project Structure

```text
recurra/
├── api/
│   └── analyze.ts             # Vercel serverless endpoint: validation, rate limiting, Gemini key rotation
├── server/
│   ├── index.js               # Node server: Vite middleware in dev, serves dist/ in production
│   └── analyze.js             # Analysis engine used by the Node server
├── docs/
│   └── DOCUMENTATION.md       # Full technical documentation
├── public/
│   ├── fonts/                 # Self-hosted General Sans (woff2)
│   ├── hero-frame.webp        # Hero poster shown until the video loads
│   ├── site.webmanifest       # Web app manifest
│   └── ...                    # Favicons, OG image, robots.txt
├── src/
│   ├── assets/                # Hero background video
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (toast)
│   │   ├── Navbar.tsx         # Responsive navigation with mobile overlay menu
│   │   ├── HeroSection.tsx    # Landing hero (CSS entrance animations)
│   │   ├── ScrollReveal.tsx   # Scroll-scrubbed word reveal
│   │   ├── ScrollStack.tsx    # Sticky stacked cards
│   │   ├── Magnet.tsx         # Magnetic hover wrapper for CTAs
│   │   ├── GlowButton.tsx     # Glowing pill button
│   │   ├── AnalysisLoader.tsx # Full-screen loader shown during analysis
│   │   ├── MathRenderer.tsx   # KaTeX math rendering
│   │   ├── FeedbackModal.tsx  # Post-results feedback form
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── use-toast.ts       # Toast state
│   ├── lib/
│   │   ├── analytics.ts       # GA4 event helpers
│   │   └── utils.ts           # `cn` class-name helper
│   ├── utils/
│   │   └── sendFeedback.ts    # EmailJS integration
│   ├── pages/
│   │   ├── Index.tsx          # Landing page ('/')
│   │   ├── Analyze.tsx        # Syllabus + papers input
│   │   ├── Results.tsx        # Results tabs and PDF report
│   │   ├── Features.tsx
│   │   ├── Process.tsx
│   │   ├── Docs.tsx
│   │   └── NotFound.tsx
│   ├── test/                  # Vitest setup and tests
│   ├── App.tsx                # Routes (lazy-loaded) and lazy Toaster
│   ├── index.css              # Tailwind layers, fonts, global styles and keyframes
│   └── main.tsx               # Entry point
├── index.html                 # Meta tags, JSON-LD, font/poster preloads, deferred GA loader
├── render.yaml                # Render deployment blueprint (Node server)
├── vercel.json                # Vercel rewrites, function config, cache headers
├── vite.config.ts             # Vite config (SWC, sitemap)
├── vitest.config.ts           # Test config (jsdom)
└── tailwind.config.ts
```

---

## 🌐 Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Landing page |
| `/features` | `Features` | Feature overview |
| `/process` | `Process` | How the analysis works |
| `/docs` | `Docs` | How to format syllabus and papers |
| `/analyze` | `Analyze` | Input syllabus and papers |
| `/results` | `Results` | Results dashboard and PDF export |
| `*` | `NotFound` | 404 page |

**API:** `POST /api/analyze` with `{ "syllabus": string, "papers": string }`. See [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md#9-api-endpoint) for the response schema and error codes.

---

## 🚢 Deployment

### Vercel (production: [recurraio.vercel.app](https://recurraio.vercel.app))
1. Import the repository into Vercel.
2. Add `GEMINI_API_KEY` (and optional fallbacks / EmailJS vars) in the project's Environment Variables.
3. Deploy. `vercel.json` handles SPA rewrites, the `api/analyze.ts` function (60s timeout), and long-lived cache headers for hashed assets, fonts, and video.

### Render
`render.yaml` defines a Node web service that runs `npm install --include=dev && npm run build`, then `node server/index.js` with `NODE_ENV=production`. Set the Gemini keys in the Render dashboard.

### Static build
```bash
npm run build
```
Outputs to `dist/`, including the generated sitemap. Note that a purely static host will not serve `/api/analyze`.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feat/my-feature`)
3. **Commit using Conventional Commits** (`git commit -m 'feat: add X'`)
4. **Push** (`git push origin feat/my-feature`)
5. **Open a Pull Request** describing your changes

Please run `npm run lint` and `npm test` before opening a PR, and keep the landing page lightweight: avoid adding animation or UI libraries to the initial bundle.

---

## 📄 License & Privacy

This project is proprietary. All rights reserved. Recurra does not store submitted syllabi or papers on the server; results are kept only in your browser's `localStorage`.

---

<div align="center">

**[recurraio.vercel.app](https://recurraio.vercel.app)**

*Built for university students · Powered by Google Gemini*

</div>
