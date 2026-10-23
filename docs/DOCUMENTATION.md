# Recurra — Technical Documentation

---

## 1. Overview

Recurra is an AI-powered exam preparation tool that cross-references a university syllabus with previous year question papers to identify recurring topics and generate a ranked list of high-probability exam questions.

---

## 2. Architecture

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix Toast)
- **Routing**: React Router v6, every page lazy-loaded
- **Math rendering**: KaTeX via `react-katex`
- **Backend**: two implementations of the same `POST /api/analyze` contract:

| Backend | File | Gemini model | Used by |
|---|---|---|---|
| Vercel serverless function | `api/analyze.ts` | `gemini-2.5-flash-lite` | Production ([recurraio.vercel.app](https://recurraio.vercel.app)); 60s max duration set in `vercel.json` |
| Node HTTP server | `server/index.js` + `server/analyze.js` | `gemini-2.5-pro` | Local development, Replit, and Render (`render.yaml`) |

Both call the Gemini REST API with `temperature: 0`. When changing the prompt or validation, update **both** `api/analyze.ts` and `server/analyze.js` to keep them in sync.

---

## 3. Setup & Running

### Development
```
node server/index.js
```
The server binds to `0.0.0.0:${PORT:-5000}`. In development it runs Vite in middleware mode so the frontend and API share one origin. With `NODE_ENV=production` it serves the built `dist/` folder instead.

`npm run dev` starts the Vite dev server alone (also on port 5000), but `/api/analyze` is not available there.

### Environment Variables
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Primary Gemini API key |
| `GEMINI_API_KEY_1` | No | Fallback key (rotated on 429/403) |
| `GEMINI_API_KEY_2` | No | Fallback key |
| `GEMINI_API_KEY_3` | No | Fallback key |
| `VITE_EMAILJS_TEMPLATE_ID` | No | EmailJS template for the feedback modal |
| `VITE_EMAILJS_PUBLIC_KEY` | No | EmailJS public key. If either EmailJS var is missing, feedback submission is skipped silently. |
| `PORT` | No | Node server port (default `5000`) |
| `NODE_ENV` | No | `production` makes the Node server serve `dist/` |

### Scripts
| Command | Description |
|---|---|
| `npm run build` | Production build to `dist/` (also generates `sitemap.xml`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest (jsdom), tests live in `src/test/` |

### Deployment
- **Vercel**: frontend + `api/analyze.ts`. `vercel.json` defines SPA rewrites, the function timeout, and cache headers (`/assets/*`, `/fonts/*`, and `*.webm` are cached for 1 year as immutable).
- **Render**: `render.yaml` builds with `npm install --include=dev && npm run build` and starts `node server/index.js` with `NODE_ENV=production`.

---

## 4. Analysis Engine

### 4.1 — How the prompt works

The analysis prompt (in both `api/analyze.ts` and `server/analyze.js`) instructs Gemini with a structured set of rules applied in order:

**Question Inclusion**
Only syllabus-mapped questions are included. Out-of-syllabus questions are excluded regardless of how often they appeared.

**Frequency Counting**
Counts how many distinct papers contain a question on a topic. Similar questions about the same concept are merged into one count.

**Priority System (dynamic)**
Priorities are assigned relative to the actual frequency spread in the uploaded dataset — not fixed thresholds. The highest-frequency questions get Priority 1, middle get Priority 2, and lowest get Priority 3.

**Difficulty Classification**
Each question is classified Easy (definition/explanation), Medium (algorithm steps/diagrams), or Hard (numerical calculation/multi-step proof).

**ROI Classification**
Return on investment per question: Very High (frequent + easy-medium), High (frequent but hard, or medium frequency + easy), Medium (appears 2-3 times, medium difficulty), Low (rare or hard + infrequent).

**Trending Detection**
After assigning priorities, Recurra scans the 2 most recent papers in the dataset. Any topic appearing in both recent papers is marked as `trending: true` regardless of its overall frequency. This catches emerging patterns — a topic that wasn't historically frequent but is clearly gaining examiner attention. Trending questions are visually flagged in results with a 🔺 indicator.

**Low Priority Labeling**
Questions at the bottom of the frequency range (Priority 3) are automatically flagged with `lowPriority: true`. The frontend visually de-emphasizes these cards with reduced opacity and a "Lower Priority" label, helping students make fast decisions about what to skip when time is limited.

**Skip Strategy**
Analyzes all units by frequency, priority, and difficulty to recommend which unit to skip, an alternative, must-not-skip units, and a 2-sentence rationale.

**Numerical Survival Kit**
Identifies calculation-based question types repeating across 2+ papers. Maximum 6 items.

### 4.2 — Key rotation

Gemini keys are tried in order. On a 429 (rate limit) or 403 (quota), the next key is tried. Other errors abort immediately.

### 4.3 — Rate limiting

In-memory IP-based rate limiting: 10 analyses per IP per day, resetting at midnight IST.

### 4.4 — JSON output schema

#### Top-level fields

| Field | Type | Description |
|---|---|---|
| `subject` | string | Detected subject name |
| `totalPapersAnalyzed` | number | Number of distinct question papers found in input. Regular and Supplementary from same year counted separately. |
| `units` | array | Per-unit analysis |
| `examStrategy` | string | 2-3 sentence strategy |
| `highFrequencyTopics` | string[] | Topics appearing across multiple units/years |
| `highFrequencyQuestions` | array | Priority 1 and 2 questions, sorted by frequency |
| `skipStrategy` | object | Skip plan (see below) |
| `numericalKit` | array | Numerical survival kit items |

#### Question schema (inside `probableQuestions` and `highFrequencyQuestions`)

| Field | Type | Description | Example |
|---|---|---|---|
| `question` | string | Question text | "Explain Dijkstra's algorithm" |
| `frequency` | number | Times topic appeared across papers | 4 |
| `priority` | 1\|2\|3 | Relative priority within dataset | 1 |
| `difficulty` | string | Easy / Medium / Hard | "Medium" |
| `roi` | string | Very High / High / Medium / Low | "Very High" |
| `trending` | boolean | True if topic appeared in both of the 2 most recent papers | true |
| `lowPriority` | boolean | True if question is Priority 3 (bottom of frequency range) | false |

#### Skip strategy schema

| Field | Type | Description |
|---|---|---|
| `recommendedSkip` | string | "Unit X — title" |
| `alternativeSkip` | string | "Unit Y — title" |
| `mustNotSkip` | string[] | Units that cannot be skipped |
| `rationale` | string | 2-sentence explanation |

#### Numerical kit item schema

| Field | Type | Description |
|---|---|---|
| `topic` | string | Specific numerical type |
| `practice` | string | What specifically to practice |

---

## 5. Frontend Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Index.tsx` | Landing page |
| `/analyze` | `Analyze.tsx` | Syllabus + papers input |
| `/results` | `Results.tsx` | Ranked question output |
| `/docs` | `Docs.tsx` | Documentation page |
| `/features` | `Features.tsx` | Features overview |
| `/process` | `Process.tsx` | How it works |

---

## 6. Data Flow

1. User pastes syllabus and question papers on `/analyze`
2. Frontend POST to `/api/analyze`
3. The backend (`api/analyze.ts` on Vercel, `server/analyze.js` on the Node server) validates inputs, checks rate limit, builds prompt, calls Gemini
4. Gemini returns JSON; server strips markdown wrappers and parses
5. Result stored in `localStorage` as `recurra_results`
6. Browser redirects to `/results` which reads from localStorage

---

## 7. Results Page

### 7.1 — Tab structure

**Unit-wise tab:** Renders each unit with its probable questions. Each question card shows the question text, frequency badge, difficulty badge, ROI badge, and (if applicable) a 🔺 Trending indicator or a Lower Priority label with reduced opacity.

**Strategy tab:** Shows the `examStrategy` text and a unit-priority summary grid.

**Skip Plan tab:** Renders the `skipStrategy` object — recommended skip unit with rationale, alternative skip unit, must-not-skip units highlighted in warning color, and the Numerical Survival Kit listing calculation-based questions that repeat across 2+ papers. If `skipStrategy` is missing from the response, this tab shows nothing rather than a fallback error message.

**Must Prepare tab:** Shows all Priority 1 and Priority 2 questions (`highFrequencyQuestions`) sorted by frequency descending. Same badge rendering as Unit-wise.

### 7.2 — PDF Export

Uses `window.print()` with a hidden `PDFReport` component positioned off-screen. The report is explicitly paginated into A4-sized pages. All badge rendering (difficulty, ROI, trending, lowPriority) is included in the PDF output.

---

## 8. Math Rendering

All mathematical content is rendered via KaTeX using the `MathRenderer` component. Inline math uses single dollar signs (`$...$`), block equations use double dollars (`$$...$$`). The prompt enforces LaTeX for all math expressions.

---

## 9. API Endpoint

`POST /api/analyze`

**Request body:**
```json
{
  "syllabus": "string (min 80 chars, min 10 words)",
  "papers": "string (min 80 chars, min 10 words)"
}
```

**Response:** The full JSON object from the AI engine, or an error object.

**Error codes:**
- `400` — Invalid syllabus or papers input
- `405` — Method other than `POST` (`OPTIONS` preflight is allowed)
- `413` — Request body too large (>1MB; Node server only, Vercel enforces its own platform limit)
- `429` — Daily rate limit exceeded
- `500` — Analysis failed or service not configured
- `502` — Gemini service error
- `503` — All API keys exhausted

---

## 10. Analytics

A lightweight analytics module (`src/lib/analytics.ts`) wraps GA4 `gtag` and tracks: analysis started/completed/failed, PDF exported, results copied, tab switched, and feedback submitted. No PII is collected.

`gtag.js` itself is **not** loaded during the initial page load. `index.html` defines the `dataLayer`/`gtag` stub immediately (so events are queued from the start) and injects the GA script on the first `pointerdown`, `keydown`, `touchstart`, or `scroll`, or 7 seconds after the `load` event, whichever comes first.

---

## 11. SEO

Each page uses `react-helmet-async` for per-page title, meta description, Open Graph, and Twitter card tags. A sitemap is generated via `vite-plugin-sitemap` at build time.

---

## 12. Styling System

- Tailwind CSS for utility classes
- Global CSS-in-JS via `<style>` tags inside page components for component-specific styles
- Dark theme only (`#050810` background)
- Glassmorphism effects via `backdrop-filter`
- Hardware-accelerated animations using `will-change` and `transform`
- Fonts: General Sans is self-hosted (`public/fonts/`, declared in `src/index.css`); Inter and Syne load asynchronously from Google Fonts

---

## 12a. Landing Page Performance

The landing page targets a Lighthouse mobile performance score of 90+. Keep these rules in place when changing it:

1. **The hero `<h1>` is the LCP element.** It must be visible on first paint: animate `transform` only (`.enter-rise`), never `opacity`, and no delay.
2. **No animation libraries on the landing route.** Entrances use the CSS keyframe classes in `src/index.css` (`enter-fade-up`, `enter-rise`, `enter-fade`, `exit-fade`), tuned via `--enter-y`, `--enter-scale`, `animationDelay`, and `animationDuration`. All respect `prefers-reduced-motion`.
3. **Scroll effects** (`ScrollReveal`, `ScrollStack`) use one `requestAnimationFrame`-throttled scroll listener per component, attached only while the element is on screen (`IntersectionObserver`), and write styles directly to the DOM instead of setting React state.
4. **Below-the-fold content** (`BelowFold` in `Index.tsx`) mounts inside `startTransition` after the first paint so React renders it in interruptible slices.
5. **Hero video** (`src/assets/hero.webm`, ~500 KB) loads only after `window.load` + 1.5s + idle. It is skipped entirely on Save-Data, 2G connections, or reduced motion. `public/hero-frame.webp` is the preloaded poster shown until then.
6. **Entry bundle stays minimal.** Pages and the Radix `Toaster` are lazy-loaded in `App.tsx`. Do not add global providers or libraries to `App.tsx`/`main.tsx` unless every page needs them.

---

## 13. Badge Reference

| Badge | Color | Meaning |
|---|---|---|
| Priority 1 | Amber | Highest frequency in dataset |
| Priority 2 | Blue | Mid-range frequency |
| Priority 3 | Muted white | Lowest frequency |
| Easy | Green | No calculation required |
| Medium | Amber | Algorithm steps or diagrams |
| Hard | Red | Numerical or multi-step proof |
| Very High ROI | Blue | Frequent + easy-medium |
| High ROI | Muted white | Frequent but hard, or medium + easy |
| Medium ROI | Dim | Medium frequency, medium difficulty |
| Low ROI | Red-tinted | Rare or hard + infrequent |
| 🔺 Trending | Amber | Appeared in both of the 2 most recent papers |
| Lower Priority | Muted | Priority 3 — worth knowing, not primary focus |

---

## 14. Known Limitations

1. **In-memory rate limiting** — The rate limit map resets on server restart. Not suitable for multi-instance deployments without a shared store.
2. **No persistent storage** — Results are stored in `localStorage` only. Clearing browser data loses results.
3. **Single language** — The prompt and UI are English-only.
4. **OCR not supported** — Papers must be pasted as plain text. PDFs or images cannot be uploaded.
5. **Context window limit** — Very large syllabi + many years of papers may exceed Gemini's context window and produce truncated output.
6. **Math rendering in PDF** — KaTeX renders correctly in the hidden print DOM, but complex aligned equations may occasionally overflow the column width.
7. **Trending detection requires 2+ papers** — The trending flag requires at least 2 papers to compare recency. With only 1 paper, no questions will be marked trending. This is expected behavior.

---

## 15. Future Improvements

1. Persistent result storage with shareable links
2. PDF upload with OCR for question paper extraction
3. Multi-language syllabus support
4. Per-university prompt tuning for syllabus format variations
5. Historical trend charts showing frequency changes across years
6. Mobile app via React Native / Expo
7. Batch analysis for multiple subjects simultaneously
8. Per-subject prompt tuning — Engineering subjects with heavy numericals (ML, DBMS, CN) would benefit from subject-specific prompt variants that weight numerical question detection more heavily than theory detection.
