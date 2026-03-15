import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

/* ─── Blur-reveal observer hook ─── */
function useBlurReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.animationPlayState = "running";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return containerRef;
}

/* ─── Reusable section label ─── */
const SectionLabel = ({ children }: { children: string }) => (
  <p
    data-reveal
    style={revealStyle(0)}
    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
  >
    <span style={{ color: "rgba(255,255,255,0.2)" }}>{children}</span>
  </p>
);

/* ─── Reveal animation style helper ─── */
function revealStyle(delay: number): React.CSSProperties {
  return {
    animation: `blurReveal 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
    animationPlayState: "paused",
    willChange: "transform, opacity",
  };
}

/* ─── Badge pill ─── */
const Badge = ({ text, variant }: { text: string; variant?: "amber" | "blue" | "muted" | "fire" }) => {
  const colors: Record<string, string> = {
    amber: "#f59e0b",
    blue: "#3b6fd4",
    muted: "rgba(255,255,255,0.25)",
    fire: "#f59e0b",
  };
  const c = variant ? colors[variant] : "#3b6fd4";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{
        background: `${c}22`,
        border: `1px solid ${c}44`,
        color: c,
      }}
    >
      {text}
    </span>
  );
};

const Docs = () => {
  const ref = useBlurReveal();

  return (
    <div className="relative min-h-screen" style={{ background: "radial-gradient(ellipse 65% 45% at 10% 5%, rgba(28,55,130,0.16) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 90% 95%, rgba(15,35,95,0.12) 0%, transparent 62%), #050810" }}>
      <Navbar />

      <div ref={ref} className="mx-auto max-w-[780px] px-5 sm:px-8 pb-24">

        {/* ═══ SECTION 1 — HEADER ═══ */}
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div data-reveal style={revealStyle(0.08)}>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6fd4]" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>Documentation</span>
            </span>
          </div>

          <h1
            data-reveal
            style={{ ...revealStyle(0.16), fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.18, color: "rgba(255,255,255,0.92)" }}
          >
            Everything You Need<br />to Use Recurra.
          </h1>

          <p data-reveal style={{ ...revealStyle(0.24), color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: 560, marginTop: 20 }}>
            A complete guide to getting the most accurate exam predictions from your syllabus and question papers.
          </p>

          <div data-reveal style={revealStyle(0.32)} className="flex flex-wrap gap-3 mt-8">
            <a href="#quick-start" className="docs-pill">Quick Start →</a>
            <a href="#tips" className="docs-pill">Tips for Best Results →</a>
          </div>
        </section>

        {/* ═══ SECTION 2 — HOW IT WORKS ═══ */}
        <section id="quick-start" className="pb-20 sm:pb-24">
          <SectionLabel>THE PROCESS</SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {[
              { n: "01", title: "Paste Your Syllabus", icon: gridIcon, desc: "Paste your subject syllabus structured by units. Recurra uses this as the filter to remove out-of-scope questions." },
              { n: "02", title: "Add Previous Papers", icon: stackIcon, desc: "Paste question papers from multiple years. The more years you add, the sharper the predictions become." },
              { n: "03", title: "Get Exam Probables", icon: targetIcon, desc: "Recurra maps patterns, counts repetitions, and surfaces only the questions that actually matter." },
            ].map((step, i) => (
              <div key={i} data-reveal style={revealStyle(0.1 + i * 0.08)} className="docs-card relative overflow-hidden group">
                <span className="absolute top-3 right-4 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "3.5rem", fontWeight: 700, color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>{step.n}</span>
                <div className="docs-icon-box mb-4" dangerouslySetInnerHTML={{ __html: step.icon }} />
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.02rem", color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.88rem", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}

            {/* Arrow connectors — desktop only */}
            <div className="hidden md:block absolute top-1/2 left-[33.33%] -translate-x-1/2 -translate-y-1/2 z-10" style={{ color: "rgba(255,255,255,0.1)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.2" /></svg>
            </div>
            <div className="hidden md:block absolute top-1/2 left-[66.66%] -translate-x-1/2 -translate-y-1/2 z-10" style={{ color: "rgba(255,255,255,0.1)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.2" /></svg>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3 — INPUT GUIDE ═══ */}
        <section className="pb-20 sm:pb-24">
          <SectionLabel>INPUTS</SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Syllabus */}
            <div data-reveal style={revealStyle(0.1)} className="docs-card">
              <div className="flex items-center gap-3 mb-4">
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.02rem", color: "rgba(255,255,255,0.9)" }}>Your Syllabus</h3>
                <Badge text="Required" variant="blue" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 14 }}>Structure your syllabus by units for best results.</p>
              <div className="docs-code-block">
                <span style={{ color: "rgba(255,255,255,0.55)" }}>
                  Unit 1 — Data Structures{"\n"}Stack, Queue, Linked List...{"\n"}{"\n"}Unit 2 — Algorithms{"\n"}Sorting, Searching...
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.82rem", lineHeight: 1.6, marginTop: 14 }}>
                <span style={{ color: "#3b6fd4" }}>Tip:</span> Label each unit clearly. Recurra maps questions to units.
              </p>
            </div>

            {/* Papers */}
            <div data-reveal style={revealStyle(0.18)} className="docs-card">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.02rem", color: "rgba(255,255,255,0.9)" }}>Previous Year Papers</h3>
                <Badge text="Required · More = Better" variant="blue" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 14 }}>Paste raw text from question papers. Include as many years as possible.</p>
              <div className="docs-code-block">
                <span style={{ color: "rgba(255,255,255,0.55)" }}>
                  2023 Paper:{"\n"}Q1. Explain stack with example...{"\n"}Q2. Define binary search...{"\n"}{"\n"}2022 Paper:{"\n"}Q1. What is a linked list?...
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.82rem", lineHeight: 1.6, marginTop: 14 }}>
                <span style={{ color: "#3b6fd4" }}>Tip:</span> 3+ years gives significantly better frequency analysis.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4 — READING YOUR RESULTS ═══ */}
        <section className="pb-20 sm:pb-24">
          <SectionLabel>READING YOUR RESULTS</SectionLabel>

          <div>
            {[
              { dot: "#f59e0b", title: "HIGHEST Priority Questions", desc: "Questions that appeared 3 or more times across different years. These are your absolute must-prepares. Don't go into the exam without knowing these." },
              { dot: "#3b6fd4", title: "HIGH Priority Questions", desc: "Questions that appeared exactly twice. Strong pattern — high chance of appearing again. Prepare these after your HIGHEST items." },
              { dot: "rgba(255,255,255,0.25)", title: "LOW Priority Questions", desc: "Questions that appeared once but are direct topics from your syllabus. Worth knowing but not your primary focus." },
              { dot: "#f59e0b", title: "Must Prepare List", desc: "A distilled list of only the recurring questions across all units. This is your revision cheat-sheet — the shortest path to exam readiness." },
            ].map((row, i) => (
              <div
                key={i}
                data-reveal
                style={revealStyle(0.08 + i * 0.07)}
                className="docs-result-row group"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: row.dot }} />
                <div>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.98rem", color: "rgba(255,255,255,0.88)", marginBottom: 4 }}>{row.title}</h4>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.86rem", lineHeight: 1.7 }}>{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 5 — PRO TIPS ═══ */}
        <section id="tips" className="pb-20 sm:pb-24">
          <SectionLabel>PRO TIPS</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Add More Years", desc: "Three or more years of papers dramatically improves pattern accuracy. Two years is the minimum; five is ideal." },
              { title: "Structure Your Syllabus", desc: "Label units clearly with headings like 'Unit 1 —' so Recurra can map questions accurately." },
              { title: "Paste Raw Text", desc: "Don't clean up the papers — paste them as-is, including question numbers, marks, and instructions. Recurra filters what it needs." },
              { title: "Start With Must Prepare", desc: "After analysis, go directly to the Must Prepare tab first. These are your highest ROI questions." },
            ].map((tip, i) => (
              <div key={i} data-reveal style={revealStyle(0.08 + i * 0.07)} className="docs-card docs-card-hover">
                <span style={{ fontFamily: "Syne, sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.15)", fontWeight: 700, letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.98rem", color: "rgba(255,255,255,0.88)", marginTop: 8, marginBottom: 6 }}>{tip.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.86rem", lineHeight: 1.7 }}>{tip.desc}</p>
              </div>
            ))}
            {/* Full-width tip */}
            <div data-reveal style={revealStyle(0.4)} className="docs-card docs-card-hover sm:col-span-2">
              <span style={{ fontFamily: "Syne, sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.15)", fontWeight: 700, letterSpacing: "0.1em" }}>05</span>
              <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.98rem", color: "rgba(255,255,255,0.88)", marginTop: 8, marginBottom: 6 }}>Re-analyze With More Data</h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.86rem", lineHeight: 1.7 }}>Got more papers? Re-analyze. Each new paper sharpens the predictions. Recurra gets better the more you give it.</p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 6 — CTA ═══ */}
        <section data-reveal style={revealStyle(0.1)} className="text-center py-16 sm:py-24">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", marginBottom: 14 }}>
            Ready to find what matters?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 28px" }}>
            Paste your syllabus and papers. Get your exam probables in under 20 seconds.
          </p>
          <Link to="/analyze" className="docs-cta-btn">
            Generate Probables →
          </Link>
        </section>
      </div>
    </div>
  );
};

/* ─── Inline SVG icons ─── */
const gridIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
const stackIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>`;
const targetIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#3b6fd4"/></svg>`;

export default Docs;
