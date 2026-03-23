import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
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
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.animationPlayState = "running";
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return containerRef;
}

function rv(delay: number): React.CSSProperties {
  return {
    animation: `blurReveal 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
    animationPlayState: "paused",
    willChange: "transform, opacity",
  };
}

const SL = ({ children }: { children: string }) => (
  <p data-reveal style={rv(0)} className="text-[10px] font-bold uppercase tracking-[0.2em] mb-7">
    <span style={{ color: "rgba(255,255,255,0.2)" }}>{children}</span>
  </p>
);

const Badge = ({ text, variant = "blue" }: { text: string; variant?: "amber" | "blue" | "muted" }) => {
  const c = variant === "amber" ? "#f59e0b" : variant === "muted" ? "rgba(255,255,255,0.25)" : "#3b6fd4";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: `${c}22`, border: `1px solid ${c}44`, color: c }}>
      {text}
    </span>
  );
};

/* ─── SVG icons ─── */
const gridIcon   = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
const stackIcon  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>`;
const targetIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#3b6fd4"/></svg>`;

const Docs = () => {
  const ref = useBlurReveal();

  return (
    <>
      <Helmet>
        <title>Documentation: How to Use Recurra for Exam Preparation</title>
        <meta
          name="description"
          content="Complete guide to using Recurra. Learn how to paste your syllabus and previous year papers to get the most accurate high-probability exam question predictions."
        />
        <link rel="canonical" href="https://recurraio.vercel.app/docs" />

        <meta name="robots" content="index, follow" />

        <meta property="og:title" content="Documentation: How to Use Recurra for Exam Preparation" />
        <meta
          property="og:description"
          content="Complete guide to using Recurra. Learn how to paste your syllabus and previous year papers to get the most accurate high-probability exam question predictions."
        />
        <meta property="og:url" content="https://recurraio.vercel.app/docs" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Recurra" />
        <meta property="og:image" content="https://recurraio.vercel.app/og_image.webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Documentation: How to Use Recurra for Exam Preparation" />
        <meta
          name="twitter:description"
          content="Complete guide to using Recurra. Learn how to paste your syllabus and previous year papers to get the most accurate high-probability exam question predictions."
        />
        <meta name="twitter:image" content="https://recurraio.vercel.app/og_image.webp" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Documentation: How to Use Recurra for Exam Preparation",
              url: "https://recurraio.vercel.app/docs",
              description:
                "Complete guide to using Recurra. Learn how to paste your syllabus and previous year papers to get the most accurate high-probability exam question predictions.",
            }),
          }}
        />
      </Helmet>
      <style>{`
        @keyframes blurReveal {
          from { opacity:0; filter:blur(10px); transform:translate3d(0,14px,0); }
          to   { opacity:1; filter:blur(0);    transform:translate3d(0,0,0); }
        }

        /* ── Docs card ── */
        .docs-card {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 16px;
          padding: 26px 28px;
          transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease;
        }
        .docs-card-hover:hover {
          border-color: rgba(59,111,212,0.22);
          background: rgba(59,111,212,0.035);
          transform: translate3d(0,-2px,0);
        }

        /* ── Icon box ── */
        .docs-icon-box {
          width: 42px; height: 42px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(59,111,212,0.1);
          border: 1px solid rgba(59,111,212,0.2);
          flex-shrink: 0;
        }

        /* ── Code block ── */
        .docs-code-block {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          white-space: pre;
        }

        /* ── Result row ── */
        .docs-result-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding-left: 8px;
          padding-right: 8px;
          margin-left: -8px;
          margin-right: -8px;
          transition: background 0.16s ease, padding-left 0.18s ease;
        }
        .docs-result-row:last-child { border-bottom: none; }
        .docs-result-row:hover {
          background: rgba(255,255,255,0.02);
          padding-left: 14px;
        }

        /* ── Quick nav pill ── */
        .docs-pill {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .docs-pill:hover {
          background: rgba(59,111,212,0.1);
          border-color: rgba(59,111,212,0.3);
          color: rgba(147,180,248,0.9);
        }

        /* ── CTA button ── */
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        .docs-cta-btn {
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
        .docs-cta-btn:hover {
          transform: translate3d(0,-2px,0);
          box-shadow: 0 8px 32px rgba(255,255,255,0.1);
        }
      `}</style>

      <div
        className="relative min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 10% 5%, rgba(28,55,130,0.16) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 90% 95%, rgba(15,35,95,0.12) 0%, transparent 62%), #050810",
        }}
      >
        <Navbar />

        {/* ── Wider max-width on desktop, generous padding ── */}
        <div ref={ref} className="mx-auto max-w-[1000px] px-5 sm:px-10 pb-24">

          {/* ════════ HEADER ════════ */}
          <section className="pt-20 sm:pt-28 pb-16 sm:pb-24">
            <div data-reveal style={rv(0.08)} className="mb-6">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b6fd4]" />
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }}>Documentation</span>
              </span>
            </div>

            <h1
              data-reveal
              style={{
                ...rv(0.15),
                fontFamily: "Syne, sans-serif",
                fontSize: "clamp(2rem,5vw,3.4rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.92)",
                marginBottom: 20,
              }}
            >
              Everything You Need
              <br />to Use Recurra.
            </h1>

            <p
              data-reveal
              style={{
                ...rv(0.23),
                color: "rgba(255,255,255,0.42)",
                fontSize: "clamp(0.9rem,1.8vw,1.05rem)",
                lineHeight: 1.78,
                maxWidth: 580,
                marginBottom: 32,
              }}
            >
              A complete guide to getting the most accurate exam predictions
              from your syllabus and question papers.
            </p>

            <div data-reveal style={rv(0.30)} className="flex flex-wrap gap-3">
              <a href="#quick-start" className="docs-pill">Quick Start →</a>
              <a href="#tips" className="docs-pill">Tips for Best Results →</a>
            </div>
          </section>

          {/* ════════ HOW IT WORKS ════════ */}
          <section id="quick-start" className="pb-20 sm:pb-24">
            <SL>THE PROCESS</SL>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {[
                { n: "01", title: "Paste Your Syllabus",  icon: gridIcon,   desc: "Paste your subject syllabus structured by units. Recurra uses this as the filter to remove out-of-scope questions." },
                { n: "02", title: "Add Previous Papers",   icon: stackIcon,  desc: "Paste question papers from multiple years. The more years you add, the sharper the predictions become." },
                { n: "03", title: "Get Exam Probables",    icon: targetIcon, desc: "Recurra maps patterns, counts repetitions, and surfaces only the questions that actually matter." },
              ].map((step, i) => (
                <div key={i} data-reveal style={rv(0.1 + i * 0.08)} className="docs-card docs-card-hover relative overflow-hidden">
                  <span
                    className="absolute top-3 right-4 select-none pointer-events-none"
                    style={{ fontFamily:"Syne,sans-serif", fontSize:"3.5rem", fontWeight:700, color:"rgba(255,255,255,0.04)", lineHeight:1 }}
                  >
                    {step.n}
                  </span>
                  <div className="docs-icon-box mb-5" dangerouslySetInnerHTML={{ __html: step.icon }} />
                  <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"1.02rem", color:"rgba(255,255,255,0.9)", marginBottom:8 }}>{step.title}</h3>
                  <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.875rem", lineHeight:1.72 }}>{step.desc}</p>
                </div>
              ))}

              {/* Arrow connectors desktop */}
              {[33.33, 66.66].map((left, i) => (
                <div key={i} className="hidden md:block absolute z-10" style={{ top:"50%", left:`${left}%`, transform:"translate(-50%,-50%)", color:"rgba(255,255,255,0.1)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.2"/></svg>
                </div>
              ))}
            </div>
          </section>

          {/* ════════ INPUT GUIDE ════════ */}
          <section className="pb-20 sm:pb-24">
            <SL>INPUTS</SL>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Syllabus */}
              <div data-reveal style={rv(0.1)} className="docs-card">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"1.02rem", color:"rgba(255,255,255,0.9)" }}>Your Syllabus</h3>
                  <Badge text="Required" />
                </div>
                <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.875rem", lineHeight:1.72, marginBottom:14 }}>
                  Structure your syllabus by units for best results.
                </p>
                <div className="docs-code-block">{`Unit 1: Data Structures\nStack, Queue, Linked List...\n\nUnit 2: Algorithms\nSorting, Searching...`}</div>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", lineHeight:1.6, marginTop:14 }}>
                  <span style={{ color:"#3b6fd4" }}>Tip:</span> Label each unit clearly. Recurra maps questions to units.
                </p>
              </div>

              {/* Papers */}
              <div data-reveal style={rv(0.18)} className="docs-card">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"1.02rem", color:"rgba(255,255,255,0.9)" }}>Previous Year Papers</h3>
                  <Badge text="Required · More = Better" />
                </div>
                <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.875rem", lineHeight:1.72, marginBottom:14 }}>
                  Paste raw text from question papers. Include as many years as possible.
                </p>
                <div className="docs-code-block">{`2023 Paper:\nQ1. Explain stack with example...\nQ2. Define binary search...\n\n2022 Paper:\nQ1. What is a linked list?...`}</div>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", lineHeight:1.6, marginTop:14 }}>
                  <span style={{ color:"#3b6fd4" }}>Tip:</span> 3+ years gives significantly better frequency analysis.
                </p>
              </div>
            </div>
          </section>

          {/* ════════ READING RESULTS ════════ */}
          <section className="pb-20 sm:pb-24">
            <SL>READING YOUR RESULTS</SL>

            <div>
              {[
                { dot:"#f59e0b", title:"HIGHEST Priority Questions", desc:"Questions that appeared 3 or more times across different years. These are your absolute must-prepares. Don't go into the exam without knowing these." },
                { dot:"#3b6fd4", title:"HIGH Priority Questions",    desc:"Questions that appeared exactly twice. Strong pattern, high chance of appearing again. Prepare these after your HIGHEST items." },
                { dot:"rgba(255,255,255,0.22)", title:"LOW Priority Questions", desc:"Questions that appeared once but are direct topics from your syllabus. Worth knowing but not your primary focus." },
                { dot:"#f59e0b", title:"Must Prepare List",          desc:"A distilled list of only the recurring questions across all units. This is your revision cheat-sheet, the shortest path to exam readiness." },
              ].map((row, i) => (
                <div key={i} data-reveal style={rv(0.08 + i * 0.07)} className="docs-result-row group">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: row.dot }} />
                  <div>
                    <h4 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"0.98rem", color:"rgba(255,255,255,0.88)", marginBottom:5 }}>{row.title}</h4>
                    <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.875rem", lineHeight:1.72 }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════════ PRO TIPS ════════ */}
          <section id="tips" className="pb-20 sm:pb-24">
            <SL>PRO TIPS</SL>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title:"Add More Years",          desc:"Three or more years of papers dramatically improves pattern accuracy. Two years is the minimum; five is ideal." },
                { title:"Structure Your Syllabus", desc:"Label units clearly with headings like 'Unit 1:' so Recurra can map questions accurately." },
                { title:"Paste Raw Text",          desc:"Don't clean up the papers, paste them as-is, including question numbers, marks, and instructions. Recurra filters what it needs." },
                { title:"Start With Must Prepare", desc:"After analysis, go directly to the Must Prepare tab first. These are your highest ROI questions." },
              ].map((tip, i) => (
                <div key={i} data-reveal style={rv(0.08 + i * 0.07)} className="docs-card docs-card-hover">
                  <span style={{ fontFamily:"Syne,sans-serif", fontSize:"0.65rem", color:"rgba(255,255,255,0.15)", fontWeight:700, letterSpacing:"0.1em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"0.98rem", color:"rgba(255,255,255,0.88)", marginTop:10, marginBottom:6 }}>{tip.title}</h4>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.875rem", lineHeight:1.72 }}>{tip.desc}</p>
                </div>
              ))}

              {/* Full-width tip */}
              <div data-reveal style={rv(0.4)} className="docs-card docs-card-hover sm:col-span-2">
                <span style={{ fontFamily:"Syne,sans-serif", fontSize:"0.65rem", color:"rgba(255,255,255,0.15)", fontWeight:700, letterSpacing:"0.1em" }}>05</span>
                <h4 style={{ fontFamily:"Syne,sans-serif", fontWeight:600, fontSize:"0.98rem", color:"rgba(255,255,255,0.88)", marginTop:10, marginBottom:6 }}>Re-analyze With More Data</h4>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.875rem", lineHeight:1.72 }}>
                  Got more papers? Re-analyze. Each new paper sharpens the predictions. Recurra gets better the more you give it.
                </p>
              </div>
            </div>
          </section>

          {/* ════════ CTA ════════ */}
          <section data-reveal style={rv(0.1)} className="text-center py-16 sm:py-20">
            <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:"clamp(1.4rem,3vw,2rem)", color:"rgba(255,255,255,0.92)", marginBottom:14 }}>
              Ready to find what matters?
            </h2>
            <p style={{ color:"rgba(255,255,255,0.42)", fontSize:"0.92rem", lineHeight:1.75, maxWidth:440, margin:"0 auto 28px" }}>
              Paste your syllabus and papers. Get your exam probables in under 20 seconds.
            </p>
            <Link to="/analyze" className="docs-cta-btn">
              Generate Probables →
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default Docs;