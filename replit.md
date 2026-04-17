# Recurra Replit Migration

## Project Overview
- React 18 + Vite frontend using TypeScript, Tailwind CSS, and React Router.
- Gemini analysis remains server-side to keep API keys out of browser code.
- `/api/analyze` is served by `server/index.js`, which adapts the original Vercel API logic for Replit.

## Replit Runtime
- Development command: `node server/index.js`
- Web server binds to `0.0.0.0:5000`.
- Vite is run in middleware mode behind the Node server so frontend routes and API routes share one origin.

## Environment Variables
- `GEMINI_API_KEY` is required for analysis.
- Optional fallback keys: `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`.

## PDF Export
- `src/pages/Results.tsx` keeps jsPDF text rendering and sanitizes LaTeX math into readable plain-text math before writing dynamic content to the PDF.