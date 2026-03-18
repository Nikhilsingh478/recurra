<div align="center">

# RECURRA

**Predict What Matters in Your Exams**

AI-powered exam pattern intelligence that analyzes university syllabi and past papers to surface the questions most likely to appear on your next exam.

[![Live Demo](https://img.shields.io/badge/Live-recurraio.vercel.app-3b6fd4?style=for-the-badge&logo=vercel&logoColor=white)](https://recurraio.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-8E75B2?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🎯 What is Recurra?

Most students waste hours scanning old exam papers manually, trying to guess what's important. **Recurra does it in seconds.**

Paste your syllabus and upload past question papers — Recurra's AI cross-references them to identify recurring patterns, ranks questions by probability (**Highest / High / Low**), and delivers a focused list of up to **8 high-probability questions per unit**.

> Think of it as a study strategist that reads every past paper so you don't have to.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Pattern Detection** | Cross-references syllabi with past papers to find recurring question patterns |
| **Probability Ranking** | Every question ranked as Highest, High, or Low based on historical frequency |
| **Smart Filtering** | Out-of-scope content is automatically filtered — only relevant questions surface |
| **Fast Analysis** | Results in under 20 seconds, powered by Google's Gemini AI |
| **Unit-wise Breakdown** | Up to 8 high-probability questions per unit for structured study planning |
| **PDF Export** | Download your analysis as a clean, printable PDF report |
| **Cinematic Loader** | Full-screen AI analysis animation with real-time progress tracking |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5 |
| **Build Tool** | Vite 5 (SWC) |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **Animation** | Framer Motion + GSAP + Canvas 2D |
| **Smooth Scroll** | Lenis |
| **AI Engine** | Google Gemini API |
| **Routing** | React Router v6 |
| **State** | TanStack React Query |
| **SEO** | vite-plugin-sitemap, structured robots.txt |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/recurra.git
cd recurra

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

The output is written to `dist/` — ready for deployment to Vercel, Netlify, or any static host. A `sitemap.xml` is auto-generated at build time.

---

## 📁 Project Structure

```
src/
├── assets/           # Static assets (video, images)
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── AnalysisLoader.tsx
│   ├── GlowButton.tsx
│   ├── ScrollReveal.tsx
│   ├── ScrollStack.tsx
│   └── ...
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
│   ├── Index.tsx     # Landing page
│   ├── Analyze.tsx   # Core analysis tool
│   ├── Results.tsx   # Analysis results display
│   ├── Features.tsx  # Feature showcase
│   ├── Process.tsx   # How it works
│   └── Docs.tsx      # Documentation
├── utils/            # Utility functions
├── App.tsx           # Router & providers
└── main.tsx          # Entry point
```

---

## 🌐 Routes

| Path | Description | Public |
|---|---|---|
| `/` | Landing page | ✅ |
| `/features` | Feature showcase | ✅ |
| `/process` | How Recurra works | ✅ |
| `/docs` | Documentation | ✅ |
| `/analyze` | Analysis tool (app) | 🔧 |
| `/results` | Analysis results | 🔧 |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved.

---

<div align="center">

**[recurraio.vercel.app](https://recurraio.vercel.app)**

Built for university students · Powered by Gemini AI

</div>
