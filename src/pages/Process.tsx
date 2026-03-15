import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

/* ─── Blur-reveal observer ─── */
function useBlurReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.animationPlayState = "running";
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

function rv(delay: number): React.CSSProperties {
  return {
    animation: `blurReveal 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
    animationPlayState: "paused",
    willChange: "transform, opacity",
  };
}

/* ─── Typewriter hook ─── */
function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let i = 0;
        const iv = setInterval(() => {
          i++;
          setDisplayed(text.slice(0, i));
          if (i >= text.length) { clearInterval(iv); setDone(true); }
        }, speed);
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [text, speed]);

  return { displayed, done, elRef };
}

/* ─── Timeline fill hook ─── */
function useTimelineFill() {
  const ref = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setFill(true); io.unobserve(e.target); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, fill };
}

/* ─── Section label ─── */
const SL = ({ children }: { children: string }) => (
  <p data-reveal style={rv(0)} className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
    <span style={{ color: "rgba(255,255,255,0.2)" }}>{children}</span>
  </p>
);

const syllabusText = `Unit 1 — Data Structures\nStack, Queue, Linked List, Trees\n\nUnit 2 — Algorithms\nSorting, Searching, Complexity\n\nUnit 3 — Operating Systems\nProcess Management, Memory...`;

/* ════════════════════════════════════════ */
const Process = () => {
  const ref = useBlurReveal();
  const tw = useTypewriter(syllabusText, 30);
  const tl = useTimelineFill();

  /* dot fill observer for step 2 */
  const [dotsVisible, setDotsVisible] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = dotsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDotsVisible(true); io.unobserve(e.target); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* step 3 internal stagger */
  const [s3Visible, setS3Visible] = useState(false);
  const s3Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = s3Ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setS3Visible(true); io.unobserve(e.target); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative min-h-screen" style={{ background: "radial-gradient(ellipse 65% 45% at 10% 5%, rgba(28,55,130,0.16) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 90% 95%, rgba(15,35,95,0.12) 0%, transparent 62%), #050810" }}>
      <Navbar />

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center min-h-[100vh] text-center px-5 overflow-hidden">
        {/* Decorative orbiting circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div style={{ width: 500, height: 500, animation: "slowRotate 80s linear infinite" }}>
            <svg viewBox="0 0 500 500" width="500" height="500" className="opacity-100">
              <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(59,111,212,0.06)" strokeWidth="1" />
            </svg>
            {/* Orbiting dots */}
            {[
              { dur: "25s", dir: "" },
              { dur: "40s", dir: "reverse" },
              { dur: "55s", dir: "" },
            ].map((d, i) => (
              <div key={i} className="absolute inset-0" style={{ animation: `slowRotate ${d.dur} linear infinite ${d.dir}` }}>
                <div className="absolute rounded-full" style={{ width: 3, height: 3, background: "rgba(59,111,212,0.4)", top: 10, left: "50%", transform: "translateX(-50%)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Badge */}
          <div data-reveal style={rv(0.06)}>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6fd4]" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>How It Works</span>
            </span>
          </div>

          {/* Heading */}
          <h1 data-reveal style={{ ...rv(0.14), fontFamily: "Syne, sans-serif", fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.15 }}>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Input.</span><br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Analyze.</span><br />
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Prepare.</span>
          </h1>

          {/* Subtext */}
          <p data-reveal style={{ ...rv(0.22), color: "rgba(255,255,255,0.4)", fontSize: "1rem", letterSpacing: "0.02em", maxWidth: 380 }}>
            Three steps. Under 20 seconds.<br />Only what matters.
          </p>
        </div>

        {/* Scroll indicator */}
        <div data-reveal style={{ ...rv(0.5) }} className="absolute bottom-10 flex flex-col items-center gap-2">
          <div className="relative" style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)" }}>
            <div className="absolute left-0 w-full rounded-full" style={{ width: 3, height: 3, background: "rgba(255,255,255,0.35)", left: -1, animation: "scrollDot 3s ease-in-out infinite" }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>scroll</span>
        </div>
      </section>

      {/* ═══ SECTION 2 — THREE STEPS ═══ */}
      <section className="relative py-20 sm:py-32">
        {/* Timeline line */}
        <div className="hidden lg:block absolute top-0 bottom-0" style={{ left: 48, width: 1, background: "rgba(255,255,255,0.06)" }} />

        {/* Step 01 */}
        <div className="relative mb-24 sm:mb-32 px-5 lg:pl-[100px] lg:pr-12">
          {/* Node */}
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 40, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)", animation: "nodePulse 2.5s ease-in-out infinite" }} />
          {/* Big number */}
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 700, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>01</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left */}
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>STEP 01</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.2 }}>Paste Your Syllabus</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 380, marginBottom: 16 }}>Recurra uses your syllabus as the master filter. Every question is checked against it. If it's not in your syllabus, it doesn't make it in.</p>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Text Input</span>
            </div>

            {/* Right — mockup card */}
            <div data-reveal style={{ ...rv(0.2), animationName: "blurSlideRight" }} className="proc-card">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "block" }}>Your Syllabus</span>
              <div ref={tw.elRef} className="relative" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", minHeight: 160, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                {tw.displayed}
                {!tw.done && <span className="inline-block align-middle" style={{ width: 1, height: 14, background: "#3b6fd4", marginLeft: 1, animation: "blink 1s step-end infinite" }} />}
                {tw.done && <span className="inline-block align-middle" style={{ width: 1, height: 14, background: "#3b6fd4", marginLeft: 1, animation: "blink 1s step-end infinite" }} />}
              </div>
              {tw.done && (
                <div className="flex items-center gap-2 mt-3" style={{ animation: "blurReveal 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: "#22c55e" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>3 units detected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 02 */}
        <div className="relative mb-24 sm:mb-32 px-5 lg:pl-[100px] lg:pr-12">
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 40, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)" }} />
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 700, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>02</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>STEP 02</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.2 }}>Add Previous Year Papers</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 380, marginBottom: 12 }}>The more years you add, the sharper the predictions. Recurra counts how many times each question appeared and uses that frequency as a confidence score.</p>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 2, marginBottom: 16 }}>
                <div>📄&ensp;2 years = basic analysis</div>
                <div>📄📄📄&ensp;5+ years = sharp predictions</div>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Text Input</span>
            </div>

            {/* Right — stacked cards */}
            <div data-reveal style={{ ...rv(0.2), animationName: "blurSlideRight" }} className="relative group">
              {/* Card stack */}
              <div className="relative" style={{ minHeight: 220 }}>
                {[2, 1, 0].map((i) => (
                  <div
                    key={i}
                    className="proc-card absolute inset-0 transition-transform duration-300"
                    style={{
                      transform: `translate3d(${i * 6}px, ${i * 6}px, 0)`,
                      opacity: i === 0 ? 1 : i === 1 ? 0.6 : 0.3,
                      filter: i === 2 ? "blur(1px)" : "none",
                      zIndex: 3 - i,
                      ...(i === 0 ? {} : {}),
                    }}
                  >
                    {i === 0 && (
                      <>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>2023 Paper</span>
                        <div className="mt-3 space-y-2">
                          {["Q1. Explain stack with example...", "Q2. Define binary search...", "Q3. Compare sorting algorithms..."].map((q, qi) => (
                            <p key={qi} className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{q}</p>
                          ))}
                        </div>
                        <div ref={dotsRef} className="mt-5">
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>Years Analyzed</span>
                          <div className="flex gap-2 mt-2">
                            {[0, 1, 2].map((di) => (
                              <div
                                key={di}
                                className="rounded-full"
                                style={{
                                  width: 8, height: 8,
                                  background: "#3b6fd4",
                                  transform: dotsVisible ? "scale(1)" : "scale(0)",
                                  opacity: dotsVisible ? 1 : 0,
                                  transition: `transform 0.4s cubic-bezier(0.22,1,0.36,1) ${di * 0.15}s, opacity 0.4s ease ${di * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Hover fan-out via CSS group */}
              <style>{`.group:hover .proc-card:nth-child(1) { transform: translate3d(12px,8px,0) !important; } .group:hover .proc-card:nth-child(2) { transform: translate3d(6px,4px,0) !important; }`}</style>
            </div>
          </div>
        </div>

        {/* Step 03 */}
        <div className="relative px-5 lg:pl-[100px] lg:pr-12">
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 40, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)" }} />
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 700, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}>03</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>STEP 03</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.2 }}>Get Your Exam Probables</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 380, marginBottom: 16 }}>Recurra analyzes patterns across all your papers, filters against the syllabus, ranks by frequency, and generates unit-wise high-probability questions.</p>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>AI Processing → Structured Output</span>
            </div>

            {/* Right — results preview */}
            <div ref={s3Ref} data-reveal style={{ ...rv(0.2), animationName: "blurSlideRight" }} className="proc-card">
              <div style={{ opacity: s3Visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", maxWidth: 200 }}>Human Computer Interaction — Probables</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.25)", color: "#93b4f8" }}>5 units</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>🔥 7 must-prepare</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
              </div>

              {/* Unit 1 */}
              <div style={{ opacity: s3Visible ? 1 : 0, transform: s3Visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)", transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s", marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>UNIT 1</span>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Introduction</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.25)", color: "#93b4f8" }}>HIGH</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)" }}>🔥 Explain Human Memory in detail</span>
                    <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>2×</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>· Describe Input-Output channels</span>
                    <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>1×</span>
                  </div>
                </div>
              </div>

              {/* Unit 3 */}
              <div style={{ opacity: s3Visible ? 1 : 0, transform: s3Visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)", transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s" }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>UNIT 3</span>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Implementation & Evaluation</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.25)", color: "#93b4f8" }}>HIGH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)" }}>🔥 Explain Universal Design principles</span>
                  <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>3×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — THE AI ENGINE ═══ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[860px] grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left */}
          <div>
            <SL>THE ENGINE</SL>
            <h2 data-reveal style={{ ...rv(0.1), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", lineHeight: 1.25, marginBottom: 18 }}>
              Gemini AI.<br />Structured by<br />Recurra.
            </h2>
            <p data-reveal style={{ ...rv(0.18), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 12 }}>
              The analysis isn't just a prompt. Recurra sends a precisely engineered instruction set that forces the AI to count frequencies, apply syllabus filters, rank by priority, and cap output volume.
            </p>
            <p data-reveal style={{ ...rv(0.24), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 24 }}>
              The result is disciplined, structured, exam-specific analysis — not a generic question dump.
            </p>

            {/* Stat rows */}
            {[
              { label: "Temperature: 0", sub: "Fully deterministic output" },
              { label: "14,000 token output limit", sub: "Enough for any subject" },
              { label: "Strict JSON response", sub: "Structured, parseable, reliable" },
            ].map((r, i) => (
              <div key={i} data-reveal style={rv(0.3 + i * 0.07)} className="flex items-center gap-3.5 py-3.5">
                <div style={{ width: 2, height: 28, background: "#3b6fd4", borderRadius: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{r.label}</p>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>{r.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — flow diagram */}
          <div data-reveal style={rv(0.15)} className="flex flex-col items-center gap-0">
            {/* Box 1 */}
            <div className="proc-card w-full text-center" style={{ padding: "14px 18px" }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>Syllabus + Papers</span>
            </div>

            {/* Arrow 1 */}
            <div className="relative flex flex-col items-center" style={{ height: 50 }}>
              <div style={{ width: 1, height: "100%", background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#3b6fd4", animation: "travelDown 2.5s ease-in-out infinite 0.5s" }} />
            </div>

            {/* Box 2 — Gemini */}
            <div className="w-full text-center" style={{ background: "rgba(59,111,212,0.08)", border: "1px solid rgba(59,111,212,0.28)", borderRadius: 14, padding: "18px 22px", animation: "boxGlow 3s ease-in-out infinite" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.85rem", color: "#93b4f8", fontWeight: 600, marginBottom: 10 }}>Recurra Prompt Engine</p>
              <div className="text-left space-y-0.5">
                {["Syllabus filter", "Frequency counter", "Priority ranker", "Volume limiter"].map((s) => (
                  <p key={s} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>· {s}</p>
                ))}
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="relative flex flex-col items-center" style={{ height: 50 }}>
              <div style={{ width: 1, height: "100%", background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#3b6fd4", animation: "travelDown 2.5s ease-in-out infinite 1s" }} />
            </div>

            {/* Box 3 */}
            <div className="proc-card w-full" style={{ padding: "14px 18px" }}>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {["Units", "Strategy", "Topics", "Must Prepare"].map((p) => (
                  <span key={p} className="rounded-full" style={{ padding: "3px 10px", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — TIMELINE TRUTH ═══ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[760px]">
          <SL>WHAT HAPPENS IN 15 SECONDS</SL>

          <div ref={tl.ref} className="relative mt-12">
            {/* Track */}
            <div className="relative h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, #3b6fd4, #93b4f8)", width: tl.fill ? "100%" : "0%", transition: "width 2s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>

            {/* Nodes */}
            <div className="flex justify-between mt-0 relative" style={{ top: -5 }}>
              {[
                { label: "Request sent", pos: "below" },
                { label: "Syllabus parsed", pos: "above" },
                { label: "Patterns mapped", pos: "below" },
                { label: "Questions ranked", pos: "above" },
                { label: "Results ready", pos: "below" },
              ].map((node, i) => (
                <div key={i} className="flex flex-col items-center relative" style={{ opacity: tl.fill ? 1 : 0.3, transition: `opacity 0.5s ease ${0.4 + i * 0.35}s`, width: 0 }}>
                  <div className="rounded-full" style={{
                    width: i === 4 ? 10 : 8,
                    height: i === 4 ? 10 : 8,
                    background: "#050810",
                    border: `2px solid rgba(59,111,212,${tl.fill ? 0.7 : 0.3})`,
                    boxShadow: tl.fill ? `0 0 ${i === 4 ? 16 : 8}px rgba(59,111,212,0.4)` : "none",
                    transition: `all 0.5s ease ${0.4 + i * 0.35}s`,
                  }} />
                  <span className={`absolute whitespace-nowrap ${node.pos === "above" ? "bottom-5" : "top-5"}`} style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    opacity: tl.fill ? 1 : 0,
                    filter: tl.fill ? "blur(0)" : "blur(8px)",
                    transform: tl.fill ? "translate3d(0,0,0)" : "translate3d(0,6px,0)",
                    transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.35}s`,
                  }}>
                    {i === 4 && <span style={{ color: "#22c55e", marginRight: 4 }}>✓</span>}
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — CTA ═══ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[600px] text-center">
          <SL>READY</SL>
          <h2 data-reveal style={{ ...rv(0.1), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", lineHeight: 1.3, marginBottom: 14 }}>
            You now know the process.<br />Time to run it.
          </h2>
          <p data-reveal style={{ ...rv(0.18), color: "rgba(255,255,255,0.42)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 28px" }}>
            Paste your syllabus and papers.<br />Get your exam probables in under 20 seconds.
          </p>
          <div data-reveal style={rv(0.26)}>
            <Link to="/analyze" className="proc-shimmer-btn">
              Generate Probables →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Process;
