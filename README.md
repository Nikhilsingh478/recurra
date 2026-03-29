<div align="center">

# 🧠 RECURRA

**Predict What Matters in Your Exams with AI-Precision**

*An advanced, AI-powered exam pattern intelligence engine that cross-references university syllabus with past papers to dynamically surface the exact questions most likely to appear on your next exam.*

[![Live Demo](https://img.shields.io/badge/Live-recurraio.vercel.app-3b6fd4?style=for-the-badge&logo=vercel&logoColor=white)](https://recurraio.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Powered by Gemini 2.5 Flash](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🎯 What is Recurra?

Most students waste hours manually scanning old exam papers, trying to map questions back to the syllabus, and guessing what's important. **Recurra automates this entire cognitive workload in seconds.**

By simply pasting your syllabus and uploading previous year question papers, Recurra's custom AI engine cross-references the data to detect recurring patterns. It strictly filters out off-syllabus content, calculates dynamic probability thresholds, and delivers a beautifully structured study plan featuring up to **8 tailored, high-probability questions per unit**.

> *Think of it as an expert academic strategist that reads, models, and predicts your university exam patterns so you don't have to.*

---

## ✨ Hyper-Detailed Feature Set

Recurra is packed with advanced engineering and state-of-the-art UX to ensure the maximum reliability of its predictions while feeling premium.

### 🧠 1. Advanced AI Pattern Engine
- **Powered by Gemini 2.5 Flash**: Utilizes a highly optimized, low-latency prompt architecture for surgical precision in mapping context.
- **Strict Out-of-Syllabus Filtering**: The engine is strictly bounded by the provided syllabus. Questions that appeared in past papers but are no longer in the syllabus are automatically dropped.
- **Redundancy & Fallback System**: To guarantee uptime, the backend utilizes an autonomous API Key Rotation mechanism (`GEMINI_API_KEY`, `_1`, `_2`, `_3`). If one gets rate-limited, the system seamlessly fails over to the next without the user ever noticing.

### 📊 2. Dynamic Probability Ranking
- **Intelligent Frequency Analysis**: Recurra does not rely on hardcoded thresholds (e.g., "3 times means high"). Instead, it analyzes the full distribution spread of the specific dataset provided.
- **Priority Tiers**: 
  - **Priority 1 (Highest)**: The absolute top of the frequency range for the current context.
  - **Priority 2 (High)**: The median repeating concepts.
  - **Priority 3 (Low)**: Baseline repetitions.
- **Unit-by-Unit Strategizing**: Provides the top requested topics neatly sorted into their exact syllabus units. 

### 🛡️ 3. Robust Backend & Rate Limiting
- **Vercel Serverless Architecture**: Fast, edge-ready API endpoints (`api/analyze.ts`).
- **Custom IP-Based Rate Limiting**: Prevents abuse by limiting users to exactly **10 analyses per day**, tied chronologically to midnight IST.
- **CORS & Preflight Handling**: Secure cross-origin policies enforced strictly on the API layer.

### 🎨 4. Cinematic & Immersive UX
- **Canvas 2D + Framer Motion + GSAP**: Unparalleled front-end animations. Expect parallax scrolling, immersive reveal animations, and glassmorphism elements.
- **Lenis Smooth Scroll**: For buttery-smooth page navigation that feels native.
- **Interactive Analysis Loader**: A cinematic, full-screen loading sequence with real-time text scramble effects while the AI computes the results.

### 📄 5. Seamless Export & SEO
- **One-Click PDF Export**: Uses `jspdf` to generate a rigorous, fully formatted, and printable PDF of your predicted exam paper results.
- **Google Analytics 4 Integrated**: Full user event tracking and funnel visualization out of the box.
- **Enterprise-Grade SEO**: Configured with `react-helmet-async`, dynamic canonical definitions, explicit `robots.txt`, auto-generating `sitemaps`, and structured JSON-LD Schema (WebApplication/EducationApplication).

---

## 🛠 Complete Technology Stack

| Layer | Technologies Used | specific purpose |
|---|---|---|
| **Core Framework** | React 18, TypeScript 5, DOM | Component architecture and strict typing |
| **Build/Dev Tool** | Vite 5 (SWC) | Lightning-fast HMR and optimized production bundles |
| **UI & Styling** | Tailwind CSS 3.4, shadcn/ui, Radix | Utility-first styling with accessible, unstyled primitives |
| **Animation Engine** | Framer Motion, GSAP 3.14, Tailwind Animate | orchestrated micro-interactions and scroll sequences |
| **Smooth Scrolling** | Lenis | Hardware-accelerated smooth scrolling mathematics |
| **AI Inference** | Google Gemini 2.5 Flash API | Foundational LLM for pattern detection and logic breakdown |
| **API Endpoints** | Vercel Serverless Functions (Node.js) | Secure handling of API keys, routing, and IP rate limiting |
| **State & Fetching** | TanStack React Query v5 | Advanced caching, and asynchronous state synchronization |
| **Routing** | React Router v6 | Client-side routing with lazy-loaded code splitting |
| **Export/Document** | jsPDF 4.2 | Client-side PDF generation from deep DOM elements |
| **SEO & Analytics** | React Helmet Async, GA4, vite-plugin-sitemap | Semantic indexing, canonical links, and user behavior analytics |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- `npm`, `yarn`, or `bun`

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/recurra.git
cd recurra

# Install dependencies (npm used as example)
npm install
```

### 2. Environment Variables Integration
To run the analysis engine, you need a Google Gemini API Key. Create a `.env` file at the root of the project:

```env
# Primary API Key
GEMINI_API_KEY=your_primary_key_here

# Fallback Keys (Optional but recommended for high traffic)
GEMINI_API_KEY_1=your_fallback_key_1
GEMINI_API_KEY_2=your_fallback_key_2
GEMINI_API_KEY_3=your_fallback_key_3
```

### 3. Start Development Server

```bash
npm run dev
```
The application will boot up at `http://localhost:8080` (or the port specified by Vite).

---

## 📁 Hyper-Detailed Project Structure

```text
recurra/
├── api/
│   └── analyze.ts             # Vercel Serverless endpoint, Rate-Limiting, Gemini API Rotation logic
├── public/                    # Static assets (Favicons, OG Images, sitemaps)
├── src/
│   ├── assets/                # Local SVGs, images, and videos
│   ├── components/            # Reusable UI architecture
│   │   ├── ui/                # shadcn/ui base components (Buttons, Toasts, Tooltips)
│   │   ├── Navbar.tsx         # Responsive sticky navigation
│   │   ├── Footer.tsx         # Semantic footer design
│   │   ├── HeroSection.tsx    # Cinematic hero with GSAP/Framer animations
│   │   ├── AnalysisLoader.tsx # Immersive loading sequence during AI fetch
│   │   ├── GlowButton.tsx     # Custom hardware-accelerated glowing buttons
│   │   ├── ScrollReveal.tsx   # Viewport-triggered animation wrappers
│   │   └── ScrollStack.tsx    # Parallax stacked scroll mechanics
│   ├── hooks/                 # Custom React hooks (e.g., use-mobile)
│   ├── pages/                 
│   │   ├── Index.tsx          # Main Landing Route ('/')
│   │   ├── Analyze.tsx        # Core interactive tool for inputting Syllabus & Papers
│   │   ├── Results.tsx        # Dynamic display of Gemini JSON responses
│   │   ├── Features.tsx       # Marketing feature breakdown
│   │   ├── Process.tsx        # Explanation of the AI mechanisms
│   │   └── Docs.tsx           # Text-based instruction documentation
│   ├── utils/                 
│   │   └── analytics.ts       # GA4 Event firing utilities (pageviews, custom events)
│   ├── App.tsx                # React Router definitions & Context Providers (React Query, Toaster)
│   └── main.tsx               # Application entry point binding to DOM
├── eslint.config.js           # Strict ESLint configuration
├── tailwind.config.ts         # Custom Tailwind theme, colors, and keyframes
├── vite.config.ts             # Vite build configuration (SWC, sitemap generator)
└── vercel.json                # Vercel deployment directives and rewrites
```

---

## 🌐 Route Architecture

| Path | Component | Description | Access |
|---|---|---|---|
| `/` | `<Index />` | The primary cinematic landing page experience. | Public ✅ |
| `/features` | `<Features />` | Deep dive into Recurra's distinct advantages. | Public ✅ |
| `/process` | `<Process />` | Explains the methodology behind the AI pattern detection. | Public ✅ |
| `/docs` | `<Docs />` | Help documentation on how to properly format syllabus and papers. | Public ✅ |
| `/analyze` | `<Analyze />` | The main engine interface for data entry. | Tool 🔧 |
| `/results` | `<Results />` | Displays data visually; generates PDF exports. | Tool 🔧 |

---

## 🚢 Deployment

Recurra is heavily optimized for zero-config deployments on Vercel.

1. Ensure your code is pushed to GitHub/GitLab.
2. Import the project into Vercel.
3. Add the required Environment Variables (`GEMINI_API_KEY`, etc.) in the Vercel Dashboard.
4. Deploy. The `vercel.json` and Vite configurations automatically handle routing rules.

To build manually for a static server:
```bash
npm run build
```
This generates an optimized output in the `dist/` directory, complete with auto-generated sitemaps and minified CSS/JS.

---

## 🤝 Contributing

We welcome advanced contributions! Whether it's enhancing the prompt engineering in `api/analyze.ts` or tweaking GSAP timings in the frontend.

1. **Fork** the repository
2. **Create your feature branch** (`git checkout -b feat/epic-new-system`)
3. **Commit your changes using Conventional Commits** (`git commit -m 'feat: added redis caching layer'`)
4. **Push to the branch** (`git push origin feat/epic-new-system`)
5. **Open a Pull Request** describing your changes in deep detail.

---

## 📄 License & Integrity

This project is proprietary. All rights reserved. Recurra strictly filters inputs and does not persist user-provided syllabi or examination papers maliciously.

---

<div align="center">

**[recurraio.vercel.app](https://recurraio.vercel.app)**

*Built relentlessly for university students · Powered by Google Deepmind Gemini*

</div>
