import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
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

const SL = ({ children }: { children: string }) => (
  <p data-reveal style={rv(0)} className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
    <span style={{ color: "rgba(255,255,255,0.2)" }}>{children}</span>
  </p>
);

const syllabusText = `Unit 1: Data Structures\nStack, Queue, Linked List, Trees\n\nUnit 2: Algorithms\nSorting, Searching, Complexity\n\nUnit 3: Operating Systems\nProcess Management, Memory...`;

const Process = () => {
  const ref = useBlurReveal();
  const tw = useTypewriter(syllabusText, 30);
  const tl = useTimelineFill();

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
      <Helmet>
        <title>How Recurra Works: 3 Steps to Exam Probables | Recurra</title>
        <meta
          name="description"
          content="Learn how Recurra analyzes previous year question papers against your syllabus to find repeating patterns and generate high-probability exam questions in under 30 seconds."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://recurraio.vercel.app/process" />

        <meta property="og:title" content="How Recurra Works: 3 Steps to Exam Probables | Recurra" />
        <meta
          property="og:description"
          content="Learn how Recurra analyzes previous year question papers against your syllabus to find repeating patterns and generate high-probability exam questions in under 30 seconds."
        />
        <meta property="og:url" content="https://recurraio.vercel.app/process" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Recurra" />
        <meta property="og:image" content="https://recurraio.vercel.app/og_image.webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How Recurra Works: 3 Steps to Exam Probables | Recurra" />
        <meta
          name="twitter:description"
          content="Learn how Recurra analyzes previous year question papers against your syllabus to find repeating patterns and generate high-probability exam questions in under 30 seconds."
        />
        <meta name="twitter:image" content="https://recurraio.vercel.app/og_image.webp" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "How Recurra Works: 3 Steps to Exam Probables | Recurra",
              url: "https://recurraio.vercel.app/process",
              description:
                "Learn how Recurra analyzes previous year question papers against your syllabus to find repeating patterns and generate high-probability exam questions in under 30 seconds.",
            }),
          }}
        />
      </Helmet>

      <style>{`
        @keyframes blurReveal {
          from { opacity: 0; filter: blur(12px); transform: translate3d(0, 16px, 0); }
          to   { opacity: 1; filter: blur(0);    transform: translate3d(0, 0, 0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes travelDown {
          0%   { transform: translate3d(-50%, 0, 0);    opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate3d(-50%, 40px, 0); opacity: 0; }
        }
        @keyframes boxGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,111,212,0); }
          50%       { box-shadow: 0 0 0 6px rgba(59,111,212,0.07), 0 0 28px rgba(59,111,212,0.1); }
        }
        @keyframes nodePulse {
          0%, 100% { box-shadow: 0 0 6px rgba(59,111,212,0.3); }
          50%       { box-shadow: 0 0 18px rgba(59,111,212,0.65), 0 0 36px rgba(59,111,212,0.2); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .proc-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 22px 24px;
          transition: border-color 0.22s ease;
        }
        .proc-card:hover { border-color: rgba(59,111,212,0.2); }

        .proc-shimmer-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          padding: 0 32px;
          border-radius: 999px;
          font-family: "Syne", sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #050810;
          background: linear-gradient(108deg, #fff 35%, #dce8ff 50%, #fff 65%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          text-decoration: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          will-change: transform;
        }
        .proc-shimmer-btn:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 8px 32px rgba(255,255,255,0.1);
        }
      `}</style>

      <Navbar />

      {/* ═══════════════════════════════════════
          HERO: clean editorial, no decoration
      ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-[860px] px-5 sm:px-8 pt-24 sm:pt-32 pb-20 sm:pb-28">

        {/* Badge */}
        <div data-reveal style={rv(0.06)} className="mb-7">
          <span
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fd4]" />
            How It Works
          </span>
        </div>

        {/* Heading: two-tone, large, editorial */}
        <h1
          data-reveal
          style={{
            ...rv(0.12),
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.4rem, 7vw, 4.6rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.92)" }}>Three steps.</span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.32)" }}>Under 20 seconds.</span>
        </h1>

        {/* Subtext */}
        <p
          data-reveal
          style={{
            ...rv(0.22),
            color: "rgba(255,255,255,0.42)",
            fontSize: "clamp(0.9rem, 2vw, 1rem)",
            lineHeight: 1.8,
            maxWidth: 460,
            marginBottom: 48,
          }}
        >
          Paste your syllabus and papers. Recurra maps what repeats,
          filters what doesn't belong, and surfaces only the questions
          that actually matter for your exam.
        </p>

        {/* Thin rule */}
        <div
          data-reveal
          style={{
            ...rv(0.3),
            height: 1,
            background: "linear-gradient(90deg, rgba(255,255,255,0.07) 0%, transparent 70%)",
          }}
        />
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2: THREE STEPS
      ═══════════════════════════════════════ */}
      <section className="relative py-4 sm:py-8">
        {/* Timeline vertical line */}
        <div className="hidden lg:block absolute top-0 bottom-0" style={{ left: 48, width: 1, background: "rgba(255,255,255,0.06)" }} />

        {/* ─ STEP 01 ─ */}
        <div className="relative mb-24 sm:mb-32 px-5 lg:pl-[100px] lg:pr-12">
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 32, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)", animation: "nodePulse 2.5s ease-in-out infinite" }} />
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(5rem, 12vw, 9rem)", fontWeight: 700, color: "rgba(255,255,255,0.025)", lineHeight: 1 }}>01</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            {/* Left */}
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)" }}>STEP 01</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.18 }}>
                Paste Your Syllabus
              </h2>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.92rem", lineHeight: 1.82, maxWidth: 380, marginBottom: 18 }}>
                Recurra uses your syllabus as the master filter. Every question
                from the papers is checked against it, if it's not a direct
                topic from your syllabus, it doesn't make the cut.
              </p>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
                Text Input
              </span>
            </div>

            {/* Right: typewriter mockup */}
            <div data-reveal style={rv(0.2)} className="proc-card">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>Your Syllabus</span>
                <span style={{ fontSize: 10, color: "rgba(59,111,212,0.7)", fontWeight: 600 }}>REQUIRED</span>
              </div>
              <div
                ref={tw.elRef}
                style={{
                  background: "rgba(0,0,0,0.22)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.58)",
                  minHeight: 150,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                }}
              >
                {tw.displayed}
                <span
                  className="inline-block align-middle"
                  style={{ width: 1, height: 13, background: "#3b6fd4", marginLeft: 1, animation: "blink 1s step-end infinite" }}
                />
              </div>
              {tw.done && (
                <div
                  className="flex items-center gap-2 mt-3"
                  style={{ animation: "blurReveal 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
                >
                  <span className="rounded-full" style={{ width: 6, height: 6, background: "#22c55e", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>3 units detected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─ STEP 02 ─ */}
        <div className="relative mb-24 sm:mb-32 px-5 lg:pl-[100px] lg:pr-12">
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 32, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)" }} />
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(5rem, 12vw, 9rem)", fontWeight: 700, color: "rgba(255,255,255,0.025)", lineHeight: 1 }}>02</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            {/* Left */}
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)" }}>STEP 02</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.18 }}>
                Add Previous Year Papers
              </h2>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.92rem", lineHeight: 1.82, maxWidth: 380, marginBottom: 14 }}>
                The more years you add, the sharper the predictions. Recurra
                counts how many times each question appeared across all papers
                and uses that as a frequency confidence score.
              </p>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", lineHeight: 2.1, marginBottom: 18 }}>
                <div>📄 &ensp;2 years = basic analysis</div>
                <div>📄📄📄 &ensp;5+ years = sharp predictions</div>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
                Text Input
              </span>
            </div>

            {/* Right: stacked paper cards */}
            <div data-reveal style={{ ...rv(0.2), minHeight: 210 }} className="relative group">              {[2, 1, 0].map((i) => (
              <div
                key={i}
                className="proc-card absolute inset-0"
                style={{
                  transform: `translate3d(${i * 7}px, ${i * 7}px, 0)`,
                  opacity: i === 0 ? 1 : i === 1 ? 0.55 : 0.25,
                  filter: i === 2 ? "blur(0.8px)" : "none",
                  zIndex: 3 - i,
                  transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {i === 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em" }}>2023 Paper</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>3 questions</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        "Q1. Explain stack with example...",
                        "Q2. Define binary search...",
                        "Q3. Compare sorting algorithms...",
                      ].map((q, qi) => (
                        <p key={qi} className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>{q}</p>
                      ))}
                    </div>
                    <div
                      ref={dotsRef}
                      className="mt-5 pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontWeight: 600 }}>Years Analyzed</span>
                        <div className="flex gap-2">
                          {[0, 1, 2].map((di) => (
                            <div
                              key={di}
                              className="rounded-full"
                              style={{
                                width: 7, height: 7,
                                background: "#3b6fd4",
                                transform: dotsVisible ? "scale(1)" : "scale(0)",
                                opacity: dotsVisible ? 1 : 0,
                                transition: `transform 0.4s cubic-bezier(0.22,1,0.36,1) ${di * 0.15}s, opacity 0.4s ease ${di * 0.15}s`,
                                willChange: "transform, opacity",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* ─ STEP 03 ─ */}
        <div className="relative px-5 lg:pl-[100px] lg:pr-12">
          <div className="hidden lg:flex absolute items-center justify-center" style={{ left: 42, top: 32, width: 12, height: 12, borderRadius: "50%", background: "#050810", border: "1px solid rgba(59,111,212,0.5)", boxShadow: "0 0 12px rgba(59,111,212,0.3)" }} />
          <span className="absolute right-4 lg:right-12 top-0 select-none pointer-events-none" style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(5rem, 12vw, 9rem)", fontWeight: 700, color: "rgba(255,255,255,0.025)", lineHeight: 1 }}>03</span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            {/* Left */}
            <div data-reveal style={rv(0.1)}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)" }}>STEP 03</span>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 16, lineHeight: 1.18 }}>
                Get Your Exam Probables
              </h2>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.92rem", lineHeight: 1.82, maxWidth: 380, marginBottom: 18 }}>
                Recurra analyzes patterns across all papers, filters against
                your syllabus, ranks by frequency, and generates unit-wise
                high-probability questions sorted from highest to lowest value.
              </p>
              <span className="inline-flex items-center rounded-full px-3 py-1" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
                AI Processing → Structured Output
              </span>
            </div>

            {/* Right: results preview */}
            <div ref={s3Ref} data-reveal style={rv(0.2)} className="proc-card">
              {/* Header */}
              <div
                style={{
                  opacity: s3Visible ? 1 : 0,
                  filter: s3Visible ? "blur(0)" : "blur(6px)",
                  transition: "all 0.5s ease 0s",
                  marginBottom: 14,
                }}
              >
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
                  Human Computer Interaction: Probables
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="rounded-full px-2.5 py-0.5" style={{ fontSize: 10, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.22)", color: "#93b4f8" }}>5 units</span>
                  <span className="rounded-full px-2.5 py-0.5" style={{ fontSize: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)", color: "#f59e0b" }}>🔥 7 must-prepare</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 14 }} />
              </div>

              {/* Unit 1 */}
              <div
                style={{
                  opacity: s3Visible ? 1 : 0,
                  transform: s3Visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)",
                  transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>UNIT 1</span>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Introduction</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.22)", color: "#93b4f8" }}>HIGH</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.55)" }}>🔥 Explain Human Memory in detail</span>
                    <span className="shrink-0 rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>2×</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.38)" }}>· Describe Input-Output channels</span>
                    <span className="shrink-0 rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.28)" }}>1×</span>
                  </div>
                </div>
              </div>

              {/* Unit 3 */}
              <div
                style={{
                  opacity: s3Visible ? 1 : 0,
                  transform: s3Visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)",
                  transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>UNIT 3</span>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Evaluation</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 9, background: "rgba(59,111,212,0.1)", border: "1px solid rgba(59,111,212,0.22)", color: "#93b4f8" }}>HIGH</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.55)" }}>🔥 Explain Universal Design principles</span>
                  <span className="shrink-0 rounded-full px-1.5 py-0.5" style={{ fontSize: 9, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>3×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3: AI ENGINE
      ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[860px] grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <SL>THE ENGINE</SL>
            <h2 data-reveal style={{ ...rv(0.1), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", lineHeight: 1.25, marginBottom: 18 }}>
              Gemini AI.<br />Structured by Recurra.
            </h2>
            <p data-reveal style={{ ...rv(0.18), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 12 }}>
              The analysis isn't just a prompt. Recurra sends a precisely engineered
              instruction set that forces the AI to count frequencies, apply syllabus
              filters, rank by priority, and cap output volume.
            </p>
            <p data-reveal style={{ ...rv(0.24), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 24 }}>
              The result is disciplined, structured, exam-specific analysis,
              not a generic question dump.
            </p>
            {[
              { label: "Temperature: 0", sub: "Fully deterministic output" },
              { label: "14,000 token limit", sub: "Enough for any subject" },
              { label: "Strict JSON response", sub: "Structured, parseable, reliable" },
            ].map((r, i) => (
              <div key={i} data-reveal style={{ ...rv(0.3 + i * 0.07), borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="flex items-center gap-3.5 py-3.5">                <div style={{ width: 2, height: 26, background: "#3b6fd4", borderRadius: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{r.label}</p>
                  <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{r.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div data-reveal style={rv(0.15)} className="flex flex-col items-center">
            <div className="proc-card w-full text-center" style={{ padding: "14px 18px" }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)" }}>Syllabus + Papers</span>
            </div>
            <div className="relative flex flex-col items-center" style={{ height: 48 }}>
              <div style={{ width: 1, height: "100%", background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#3b6fd4", left: "50%", animation: "travelDown 2.5s ease-in-out infinite 0.5s" }} />
            </div>
            <div className="w-full text-center" style={{ background: "rgba(59,111,212,0.08)", border: "1px solid rgba(59,111,212,0.26)", borderRadius: 14, padding: "18px 22px", animation: "boxGlow 3s ease-in-out infinite" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontSize: "0.85rem", color: "#93b4f8", fontWeight: 600, marginBottom: 10 }}>Recurra Prompt Engine</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                {["Syllabus filter", "Frequency counter", "Priority ranker", "Volume limiter"].map((s) => (
                  <p key={s} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>· {s}</p>
                ))}
              </div>
            </div>
            <div className="relative flex flex-col items-center" style={{ height: 48 }}>
              <div style={{ width: 1, height: "100%", background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "#3b6fd4", left: "50%", animation: "travelDown 2.5s ease-in-out infinite 1s" }} />
            </div>
            <div className="proc-card w-full" style={{ padding: "14px 18px" }}>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {["Units", "Strategy", "Topics", "Must Prepare"].map((p) => (
                  <span key={p} className="rounded-full" style={{ padding: "3px 10px", fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4: TIMELINE
          Desktop: horizontal | Mobile: vertical
      ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[760px]">
          <SL>WHAT HAPPENS IN 15 SECONDS</SL>


          <div ref={tl.ref} className="relative mt-12">
            <div className="relative h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, #3b6fd4, #93b4f8)", width: tl.fill ? "100%" : "0%", transition: "width 2s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
            <div className="flex justify-between mt-0 relative" style={{ top: -5 }}>
              {[
                { label: "Request", pos: "below" },
                { label: "Syllabus parsed", pos: "above" },
                { label: "Patterns mapped", pos: "below" },
                { label: "Questions ranked", pos: "above" },
                { label: "Results", pos: "below" },
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

      {/* ═══════════════════════════════════════
          SECTION 5: CTA
      ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-32 px-5">
        <div className="mx-auto max-w-[560px] text-center">
          <SL>READY</SL>
          <h2 data-reveal style={{ ...rv(0.1), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", lineHeight: 1.3, marginBottom: 14 }}>
            You now know the process.
            <br />
            <span style={{ color: "rgba(255,255,255,0.38)" }}>Time to run it.</span>
          </h2>
          <p data-reveal style={{ ...rv(0.18), color: "rgba(255,255,255,0.4)", fontSize: "0.92rem", lineHeight: 1.75, maxWidth: 400, margin: "0 auto 28px" }}>
            Paste your syllabus and papers.
            <br />
            Get your exam probables in under 20 seconds.
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