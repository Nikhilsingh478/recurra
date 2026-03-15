import { useEffect, useRef, useState } from "react";
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
      { threshold: 0.12 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return containerRef;
}

function revealStyle(delay: number): React.CSSProperties {
  return {
    animation: `blurReveal 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
    animationPlayState: "paused",
    willChange: "transform, opacity",
  };
}

/* ─── Counter hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, val };
}

const SectionLabel = ({ children }: { children: string }) => (
  <p data-reveal style={revealStyle(0)} className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
    <span style={{ color: "rgba(255,255,255,0.2)" }}>{children}</span>
  </p>
);

/* ─── Feature icons ─── */
const icons: Record<string, string> = {
  filter: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><path d="M3 4h18l-7 8.5V18l-4 2V12.5L3 4z"/></svg>`,
  repeat: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
  layers: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  flame: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><path d="M12 22c4-2.5 7-6.5 7-11a7 7 0 00-14 0c0 4.5 3 8.5 7 11z"/><path d="M12 22c-1.5-1.5-2.5-3.5-2.5-5.5a2.5 2.5 0 015 0c0 2-1 4-2.5 5.5z"/></svg>`,
  target: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#3b6fd4"/></svg>`,
  bulb: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6fd4" stroke-width="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>`,
};

const features = [
  { icon: "filter", title: "Syllabus Filtering", desc: "Only questions directly tied to your syllabus topics make it through. Zero out-of-scope noise." },
  { icon: "repeat", title: "Pattern Recognition", desc: "Tracks which questions repeat across years and how often. Frequency = probability." },
  { icon: "layers", title: "Unit-wise Analysis", desc: "Results organized by unit so you know exactly which parts of the syllabus matter most." },
  { icon: "flame", title: "Priority Ranking", desc: "HIGHEST, HIGH, and LOW priority labels on every question based on how many times it appeared." },
  { icon: "target", title: "Must Prepare List", desc: "A distilled list of only recurring questions — your shortest path to exam readiness." },
  { icon: "bulb", title: "Exam Strategy", desc: "AI-generated strategy based on actual patterns found in your papers — not generic advice." },
];

const comparisonRows = [
  ["50+ random questions", "6-8 per unit max"],
  ["No syllabus filter", "Strict syllabus mapping"],
  ["No frequency data", "Repetition counted"],
  ["No priority", "HIGHEST / HIGH / LOW"],
  ["Generic output", "Exam-specific analysis"],
];

const Features = () => {
  const ref = useBlurReveal();
  const stat1 = useCountUp(4);
  const stat2 = useCountUp(8);

  return (
    <div className="relative min-h-screen" style={{ background: "radial-gradient(ellipse 65% 45% at 10% 5%, rgba(28,55,130,0.16) 0%, transparent 62%), radial-gradient(ellipse 50% 40% at 90% 95%, rgba(15,35,95,0.12) 0%, transparent 62%), #050810" }}>
      <Navbar />

      <div ref={ref} className="mx-auto max-w-[900px] px-5 sm:px-8 pb-24">

        {/* ═══ HEADER ═══ */}
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div data-reveal style={revealStyle(0.08)}>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6fd4]" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>Features</span>
            </span>
          </div>

          <h1 data-reveal style={{ ...revealStyle(0.16), fontFamily: "Syne, sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.18, color: "rgba(255,255,255,0.92)" }}>
            Built Different.<br />For Students Who<br />Don't Have Time to Waste.
          </h1>

          <p data-reveal style={{ ...revealStyle(0.24), color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: 580, marginTop: 20 }}>
            Every feature in Recurra exists for one reason — to help you find the highest-value questions before your exam.
          </p>
        </section>

        {/* ═══ CORE FEATURES ═══ */}
        <section className="pb-20 sm:pb-24">
          <SectionLabel>CORE FEATURES</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} data-reveal style={revealStyle(0.08 + i * 0.07)} className="docs-card docs-card-hover">
                <div className="docs-icon-box mb-4" dangerouslySetInnerHTML={{ __html: icons[f.icon] }} />
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.02rem", color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.86rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ DIFFERENTIATOR ═══ */}
        <section className="pb-20 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Left — 3 cols */}
            <div className="lg:col-span-3">
              <p data-reveal style={{ ...revealStyle(0), fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: 20 }}>WHY RECURRA</p>
              <h2 data-reveal style={{ ...revealStyle(0.1), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", lineHeight: 1.2, color: "rgba(255,255,255,0.9)" }}>
                Most tools give you<br />too much.<br />Recurra gives you<br />what's enough.
              </h2>
              <p data-reveal style={{ ...revealStyle(0.2), color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1.75, marginTop: 20 }}>
                Generic AI tools dump 50+ questions per subject with no structure, no frequency data, and no filter for what's actually in your syllabus.
              </p>
              <p data-reveal style={{ ...revealStyle(0.28), color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1.75, marginTop: 12 }}>
                Recurra is built around one principle — focused, high-value output. The fewer questions you need to know, the better your preparation.
              </p>
            </div>

            {/* Right — comparison table */}
            <div className="lg:col-span-2" data-reveal style={revealStyle(0.2)}>
              <div className="docs-card" style={{ padding: "20px 22px" }}>
                <div className="grid grid-cols-2 gap-x-6 text-[11px] font-bold uppercase tracking-[0.15em] pb-3 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Others</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Recurra</span>
                </div>
                {comparisonRows.map(([other, recurra], i) => (
                  <div key={i} className="grid grid-cols-2 gap-x-6 py-3" style={{ borderBottom: i < comparisonRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.82rem" }}>{other}</span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.82rem" }}>
                      <span style={{ color: "#3b6fd4", marginRight: 6 }}>✓</span>{recurra}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="pb-20 sm:pb-24">
          <div data-reveal style={revealStyle(0.1)} className="docs-card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style2="" >
            <div className="rounded-[20px] p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, divideColor: "rgba(255,255,255,0.06)" }}>
              {[
                { ref: stat1.ref, val: String(stat1.val), label: "Result sections", sub: "Units, Strategy, Topics, Must Prepare" },
                { ref: stat2.ref, val: String(stat2.val), label: "Questions max per unit", sub: "Focused, not overwhelming" },
                { ref: null, val: "< 20s", label: "Analysis time", sub: "Powered by Gemini AI" },
              ].map((s, i) => (
                <div key={i} ref={s.ref} className="text-center py-6 sm:py-0 sm:px-6">
                  <p style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1 }}>{s.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginTop: 8 }}>{s.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", marginTop: 4 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ UNDER THE HOOD ═══ */}
        <section className="pb-20 sm:pb-24">
          <SectionLabel>UNDER THE HOOD</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left — diagram */}
            <div data-reveal style={revealStyle(0.1)} className="flex justify-center">
              <svg viewBox="0 0 320 220" className="w-full max-w-[340px]" fill="none">
                {/* Input boxes */}
                <rect x="10" y="30" width="80" height="34" rx="8" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
                <text x="50" y="51" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Inter">Syllabus</text>

                <rect x="10" y="80" width="80" height="34" rx="8" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
                <text x="50" y="101" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Inter">Papers</text>

                {/* Lines to center */}
                <line x1="90" y1="47" x2="125" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1">
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="90" y1="97" x2="125" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Gemini box */}
                <rect x="125" y="72" width="70" height="48" rx="10" stroke="rgba(59,111,212,0.35)" strokeWidth="1.2" fill="rgba(59,111,212,0.08)">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
                </rect>
                <text x="160" y="100" textAnchor="middle" fill="#3b6fd4" fontSize="9" fontWeight="600" fontFamily="Syne">Gemini AI</text>

                {/* Lines to outputs */}
                <line x1="195" y1="85" x2="230" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="195" y1="92" x2="230" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="195" y1="100" x2="230" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="195" y1="108" x2="230" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Traveling dots */}
                <circle r="2" fill="#3b6fd4">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M90,47 L125,90" />
                </circle>
                <circle r="2" fill="#3b6fd4">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M195,92 L230,80" begin="0.5s" />
                </circle>

                {/* Output boxes */}
                {[
                  { y: 26, label: "Units" },
                  { y: 66, label: "Strategy" },
                  { y: 106, label: "Topics" },
                  { y: 146, label: "Must Prepare" },
                ].map((o) => (
                  <g key={o.label}>
                    <rect x="230" y={o.y} width="80" height="30" rx="7" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />
                    <text x="270" y={o.y + 19} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="Inter">{o.label}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Right — text */}
            <div>
              <h2 data-reveal style={{ ...revealStyle(0.12), fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", lineHeight: 1.25, marginBottom: 16 }}>
                Gemini AI,<br />guided by structure.
              </h2>
              <p data-reveal style={{ ...revealStyle(0.2), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: 12 }}>
                Recurra doesn't just send your papers to an AI and hope for the best. The prompt is engineered with strict rules — frequency counting, syllabus filtering, priority ranking, and a hard cap on output volume.
              </p>
              <p data-reveal style={{ ...revealStyle(0.28), color: "rgba(255,255,255,0.42)", fontSize: "0.9rem", lineHeight: 1.75 }}>
                The result is an AI analysis that behaves like a focused exam expert, not a general knowledge chatbot.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section data-reveal style={revealStyle(0.1)} className="text-center py-16 sm:py-24">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "rgba(255,255,255,0.92)", marginBottom: 14 }}>
            Try it on your next exam.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 28px" }}>
            Paste your syllabus and papers. Results in under 20 seconds.
          </p>
          <Link to="/analyze" className="docs-cta-btn">
            Generate Probables →
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Features;
