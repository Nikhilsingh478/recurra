import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface ProbableQuestion {
  question: string;
  frequency: number;
  priority?: "HIGHEST" | "HIGH" | "LOW";
  isHighFrequency?: boolean;
}

interface Unit {
  unitNumber: number;
  unitTitle: string;
  unitPriority?: "HIGHEST" | "HIGH" | "LOW";
  priority?: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
  probableQuestions: ProbableQuestion[];
  topTopics: string[];
}

interface HFQuestion {
  question: string;
  frequency: number;
  unit: string;
}

interface RecurraResults {
  subject: string;
  totalYearsAnalyzed: number;
  units: Unit[];
  examStrategy: string;
  highFrequencyTopics?: string[];
  highFrequencyQuestions?: HFQuestion[];
  superHighFrequencyTopics?: string[];
  timestamp?: string;
}

/* ─────────────────────────────────────────────
   PRIORITY MAP
───────────────────────────────────────────── */
const P = {
  HIGHEST: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  color: "rgb(251,191,36)",       dot: "#f59e0b", label: "HIGHEST" },
  HIGH:    { bg: "rgba(59,111,212,0.09)", border: "rgba(59,111,212,0.25)", color: "rgb(147,180,248)",      dot: "#3b6fd4", label: "HIGH"    },
  MEDIUM:  { bg: "rgba(59,111,212,0.09)", border: "rgba(59,111,212,0.25)", color: "rgb(147,180,248)",      dot: "#3b6fd4", label: "MEDIUM"  },
  LOW:     { bg: "rgba(255,255,255,0.03)",border: "rgba(255,255,255,0.07)",color: "rgba(255,255,255,0.3)", dot: "rgba(255,255,255,0.18)", label: "LOW" },
};
type PKey = keyof typeof P;

const getP = (key?: string) => P[(key as PKey) ?? "LOW"] ?? P.LOW;

/* ─────────────────────────────────────────────
   BLUR-REVEAL HOOK
───────────────────────────────────────────── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
};

const revealStyle = (visible: boolean): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  filter: visible ? "blur(0)" : "blur(8px)",
  transform: visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)",
  transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
  willChange: "opacity,filter,transform",
});

/* ─────────────────────────────────────────────
   QUESTION ROW — extracted component (fixes hooks-in-map bug)
───────────────────────────────────────────── */
const QuestionRow = ({ q, index }: { q: ProbableQuestion; index: number }) => {
  const { ref, visible } = useReveal(index * 50);
  const pKey = q.priority ?? (q.isHighFrequency ? "HIGHEST" : "LOW");
  const p = getP(pKey);

  return (
    <div
      ref={ref}
      className="q-row flex items-start justify-between gap-4 border-b border-white/[0.05] py-4"
      style={revealStyle(visible)}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {pKey === "HIGHEST" ? (
          <span className="mt-0.5 shrink-0 text-sm leading-none">🔥</span>
        ) : pKey === "HIGH" ? (
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.dot }} />
        ) : (
          <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }} />
        )}
        <span
          className="text-[0.9rem] leading-relaxed"
          style={{
            color: pKey === "HIGHEST" ? "rgba(255,255,255,0.9)"
                 : pKey === "HIGH"    ? "rgba(255,255,255,0.68)"
                 :                      "rgba(255,255,255,0.4)",
          }}
        >
          {q.question}
        </span>
      </div>
      <span
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}
      >
        {q.frequency}×
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HF QUESTION CARD — extracted component
───────────────────────────────────────────── */
const HFCard = ({ q, index }: { q: HFQuestion; index: number }) => {
  const { ref, visible } = useReveal(index * 55);
  return (
    <div ref={ref} className="hfq-card" style={revealStyle(visible)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-sm">🔥</span>
          <p className="text-[0.9rem] leading-relaxed text-white/88">{q.question}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
          style={{ background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.22)", color: "rgb(251,191,36)" }}
        >
          {q.frequency}×
        </span>
      </div>
      <p className="mt-2 text-[11px] text-white/28">{q.unit}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   UNIT SECTION — extracted component
───────────────────────────────────────────── */
const UnitSection = ({ unit, idx }: { unit: Unit; idx: number }) => {
  const { ref, visible } = useReveal(idx * 80);
  const up = getP(unit.unitPriority ?? unit.priority);

  return (
    <div ref={ref} className="mb-16" style={revealStyle(visible)}>
      {/* Unit header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/22">
            Unit {unit.unitNumber}
          </p>
          <h2 className="font-heading text-xl font-semibold leading-snug text-white/90 md:text-2xl">
            {unit.unitTitle}
          </h2>
        </div>
        <span
          className="mt-1 shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-wide"
          style={{ background: up.bg, border: `1px solid ${up.border}`, color: up.color }}
        >
          {up.label}
        </span>
      </div>

      {/* Divider */}
      <div className="mb-5 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 75%)" }} />

      {/* Topics */}
      {unit.topTopics?.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/20">Topics —</span>
          {unit.topTopics.map((t, i) => (
            <span key={i} className="topic-pill rounded-full px-3 py-0.5 text-[11px] text-white/38">{t}</span>
          ))}
        </div>
      )}

      {/* Questions */}
      <div>
        {unit.probableQuestions?.map((q, i) => (
          <QuestionRow key={i} q={q} index={i} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   EXPORT TO TXT
───────────────────────────────────────────── */
const doExport = (data: RecurraResults) => {
  const L: string[] = [];
  L.push(`RECURRA — ${data.subject} Exam Probables`);
  L.push(`Generated: ${new Date(data.timestamp ?? "").toLocaleString("en-IN")} · ${data.totalYearsAnalyzed} years analyzed`);
  L.push(""); L.push("━━━ EXAM STRATEGY ━━━"); L.push(data.examStrategy ?? ""); L.push("");
  const hfT = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
  if (hfT.length) { L.push("━━━ HIGH FREQUENCY TOPICS ━━━"); hfT.forEach(t => L.push(`  • ${t}`)); L.push(""); }
  L.push("━━━ UNIT-WISE PROBABLE QUESTIONS ━━━");
  data.units?.forEach(u => {
    L.push(""); L.push(`UNIT ${u.unitNumber}: ${u.unitTitle}  [${u.unitPriority ?? u.priority ?? "LOW"}]`);
    u.probableQuestions?.forEach(q => {
      const pk = q.priority ?? (q.isHighFrequency ? "HIGHEST" : "LOW");
      L.push(`  ${pk === "HIGHEST" ? "🔥" : pk === "HIGH" ? "▸" : "·"} ${q.question}  (${q.frequency}×)`);
    });
  });
  const hfQ = data.highFrequencyQuestions ?? [];
  if (hfQ.length) { L.push(""); L.push("━━━ MUST PREPARE ━━━"); hfQ.forEach(q => L.push(`  🔥 ${q.question}  (${q.frequency}×) — ${q.unit}`)); }
  const blob = new Blob([L.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${(data.subject ?? "recurra").replace(/\s+/g, "_")}_probables.txt`; a.click();
  URL.revokeObjectURL(url);
};

/* ─────────────────────────────────────────────
   MAIN RESULTS COMPONENT
───────────────────────────────────────────── */
const Results = () => {
  const navigate = useNavigate();
  const [data, setData]           = useState<RecurraResults | null>(null);
  const [mounted, setMounted]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [activeTab, setActiveTab] = useState<"units" | "strategy" | "topics" | "hf">("units");

  useEffect(() => {
    const raw = localStorage.getItem("recurra_results");
    if (!raw) { navigate("/analyze"); return; }
    try { setData(JSON.parse(raw)); setTimeout(() => setMounted(true), 100); }
    catch { navigate("/analyze"); }
  }, [navigate]);

  const copyResults = useCallback(() => {
    if (!data) return;
    const L: string[] = [];
    L.push(`${data.subject} — Exam Probables (${data.totalYearsAnalyzed} years analyzed)`);
    L.push(""); L.push("Exam Strategy:"); L.push(data.examStrategy ?? ""); L.push("");
    const hfT = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
    if (hfT.length) { L.push("High Frequency Topics:"); L.push(hfT.join(", ")); L.push(""); }
    data.units?.forEach(u => {
      L.push(`UNIT ${u.unitNumber}: ${u.unitTitle}`);
      u.probableQuestions?.forEach(q => {
        const pk = q.priority ?? (q.isHighFrequency ? "HIGHEST" : "LOW");
        L.push(`${pk === "HIGHEST" ? "🔥" : "·"} ${q.question}  (${q.frequency}×)`);
      });
      L.push("");
    });
    navigator.clipboard.writeText(L.join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2400);
  }, [data]);

  const fmt = (ts?: string) => ts
    ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  if (!data) return null;

  const hfTopics    = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
  const hfQuestions = data.highFrequencyQuestions ?? [];
  const totalQ      = data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0) ?? 0;

  /* fallback hf questions from units */
  const mustPrepare: HFQuestion[] = hfQuestions.length > 0
    ? hfQuestions
    : (data.units?.flatMap(u =>
        (u.probableQuestions ?? [])
          .filter(q => q.frequency >= 2)
          .map(q => ({ question: q.question, frequency: q.frequency, unit: u.unitTitle }))
      ) ?? []).sort((a, b) => b.frequency - a.frequency);

  const TABS = [
    { key: "units"    as const, label: "Unit-wise" },
    { key: "strategy" as const, label: "Strategy" },
    { key: "topics"   as const, label: "Topics" },
    { key: "hf"       as const, label: "Must Prepare", count: mustPrepare.length },
  ];

  return (
    <>
      <style>{`
        .res-bg {
          background:
            radial-gradient(ellipse 65% 45% at 5% 2%,  rgba(22,45,112,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 95% 98%, rgba(12,28,82,0.11) 0%, transparent 60%),
            #050810;
        }

        /* Static blur-in */
        @keyframes blurIn {
          from { opacity:0; filter:blur(10px); transform:translate3d(0,14px,0); }
          to   { opacity:1; filter:blur(0);    transform:translate3d(0,0,0); }
        }
        .b-rev { opacity:0; will-change:opacity,filter,transform; animation:blurIn 0.72s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bd1 { animation-delay:0.08s; }
        .bd2 { animation-delay:0.17s; }
        .bd3 { animation-delay:0.26s; }

        /* Tab bar */
        .tab-bar {
          display:flex; gap:2px;
          background:rgba(255,255,255,0.028);
          border:1px solid rgba(255,255,255,0.065);
          border-radius:12px; padding:4px;
          overflow-x:auto; scrollbar-width:none;
        }
        .tab-bar::-webkit-scrollbar { display:none; }
        .tab-btn {
          flex-shrink:0; padding:8px 16px;
          border-radius:9px; border:none;
          font-size:0.82rem; font-weight:500;
          color:rgba(255,255,255,0.38);
          background:transparent; cursor:pointer;
          transition:background 0.18s ease, color 0.18s ease;
          white-space:nowrap;
        }
        .tab-btn:hover { color:rgba(255,255,255,0.6); }
        .tab-btn.active { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.9); }

        /* Question row */
        .q-row {
          border-radius:10px;
          margin-left:-8px; margin-right:-8px;
          padding-left:8px; padding-right:8px;
          transition:background 0.15s ease;
        }
        .q-row:hover { background:rgba(255,255,255,0.02); }

        /* Topic pill */
        .topic-pill {
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          transition:background 0.18s, border-color 0.18s, color 0.18s;
          cursor:default;
        }
        .topic-pill:hover {
          background:rgba(59,111,212,0.09);
          border-color:rgba(59,111,212,0.22);
          color:rgba(147,180,248,0.85);
        }

        /* Strategy card */
        .strat-card {
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.065);
          border-left:2px solid rgba(59,111,212,0.7);
          border-radius:16px; padding:24px 26px;
          transition:background 0.2s, border-left-color 0.2s;
        }
        .strat-card:hover { background:rgba(59,111,212,0.03); border-left-color:#6494e8; }

        /* HF topic pill */
        .hft-pill {
          background:rgba(245,158,11,0.07);
          border:1px solid rgba(245,158,11,0.18);
          color:rgb(251,191,36); border-radius:999px;
          padding:6px 16px; font-size:0.82rem; font-weight:500;
          white-space:nowrap; cursor:default;
          transition:background 0.18s, transform 0.18s;
          will-change:transform;
        }
        .hft-pill:hover { background:rgba(245,158,11,0.13); transform:translate3d(0,-1px,0); }

        /* HF question card */
        .hfq-card {
          background:rgba(245,158,11,0.035);
          border:1px solid rgba(245,158,11,0.1);
          border-radius:14px; padding:18px 20px;
          transition:background 0.18s, border-color 0.18s, transform 0.18s;
          will-change:transform;
        }
        .hfq-card:hover { background:rgba(245,158,11,0.065); border-color:rgba(245,158,11,0.18); transform:translate3d(0,-2px,0); }

        /* Stat pill */
        .stat-pill {
          display:inline-flex; align-items:center; gap:7px;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.025);
          border-radius:999px; padding:6px 16px;
          font-size:0.8rem; color:rgba(255,255,255,0.5);
          transition:background 0.18s;
        }
        .stat-pill:hover { background:rgba(255,255,255,0.042); }

        /* Unit summary card */
        .unit-card {
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.055);
          border-radius:14px; padding:16px 20px;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          transition:background 0.18s, border-color 0.18s;
        }
        .unit-card:hover { background:rgba(255,255,255,0.032); border-color:rgba(255,255,255,0.09); }

        /* Bottom bar */
        .btm-bar {
          background:rgba(5,8,16,0.92);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
          border-top:1px solid rgba(255,255,255,0.05);
        }
        .btn-ghost {
          border:1px solid rgba(255,255,255,0.1); background:transparent;
          color:rgba(255,255,255,0.5); border-radius:999px;
          padding:9px 20px; font-size:0.82rem; font-weight:500; cursor:pointer;
          transition:background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
          will-change:transform;
        }
        .btn-ghost:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.16); color:rgba(255,255,255,0.78); transform:translate3d(0,-1px,0); }
        .btn-white {
          background:#fff; color:#050810; border:none;
          border-radius:999px; padding:9px 22px;
          font-size:0.82rem; font-weight:600; cursor:pointer;
          transition:opacity 0.18s, transform 0.18s, box-shadow 0.18s;
          will-change:transform;
        }
        .btn-white:hover { opacity:0.88; transform:translate3d(0,-1px,0); box-shadow:0 4px 20px rgba(255,255,255,0.1); }
        .btn-white:active { transform:scale(0.97); }
        .btn-export {
          background:transparent; border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.5); border-radius:999px;
          padding:9px 20px; font-size:0.82rem; font-weight:500; cursor:pointer;
          transition:background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
          will-change:transform;
        }
        .btn-export:hover { background:rgba(59,111,212,0.09); border-color:rgba(59,111,212,0.28); color:rgba(147,180,248,0.85); transform:translate3d(0,-1px,0); }

        /* Ping */
        @keyframes cpPing { 75%,100% { transform:scale(2.2); opacity:0; } }
        .cp-ping { animation:cpPing 1.8s cubic-bezier(0,0,0.2,1) infinite; will-change:transform,opacity; }

        /* Sec label */
        .sec-lbl {
          font-size:10px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.2em;
          color:rgba(255,255,255,0.18); margin-bottom:20px;
        }

        @media (max-width:640px) {
          .tab-btn { padding:7px 11px; font-size:0.76rem; }
        }
      `}</style>

      <div className="res-bg relative min-h-screen font-body">
        <div className="res-bg fixed inset-0 -z-10" aria-hidden />
        <Navbar />

        <div className="mx-auto max-w-[860px] px-5 pb-32 pt-10 sm:px-8 md:pt-14">

          {/* ── HEADER ── */}
          {mounted && (
            <div className="b-rev bd1 mb-10">
              <p className="mb-2.5 text-[11px] tracking-wide text-white/22">
                Analysis Complete · {fmt(data.timestamp)} · {data.totalYearsAnalyzed ?? 0} years analyzed
              </p>
              <h1
                className="font-heading font-bold leading-tight tracking-tight text-white"
                style={{ fontSize: "clamp(1.7rem, 5vw, 2.6rem)" }}
              >
                {data.subject ?? "General"}
                <span style={{ color: "rgba(255,255,255,0.24)" }}> — Exam Probables</span>
              </h1>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="stat-pill">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="cp-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-55" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </span>
                  {hfTopics.length} high-freq topics
                </span>
                <span className="stat-pill">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fd4]" />
                  {data.units?.length ?? 0} units
                </span>
                <span className="stat-pill">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                  {totalQ} questions
                </span>
                {mustPrepare.length > 0 && (
                  <span className="stat-pill">
                    <span className="text-xs">🔥</span>
                    {mustPrepare.length} must-prepare
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── TAB BAR ── */}
          {mounted && (
            <div className="b-rev bd2 mb-10">
              <div className="tab-bar">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                    {t.count != null && t.count > 0 && (
                      <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-px text-[9px] font-bold text-amber-400">
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════
              UNIT-WISE PROBABLES
          ════════════════════════════ */}
          {mounted && activeTab === "units" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Unit-wise Probable Questions</p>
              {data.units?.map((unit, idx) => (
                <UnitSection key={unit.unitNumber} unit={unit} idx={idx} />
              ))}
            </div>
          )}

          {/* ════════════════════════════
              EXAM STRATEGY
          ════════════════════════════ */}
          {mounted && activeTab === "strategy" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Exam Strategy</p>

              <div className="strat-card mb-12">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="text-base">💡</span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-[#3b6fd4]">
                    Recommended Approach
                  </span>
                </div>
                <p className="text-[0.95rem] leading-[1.75] text-white/55">
                  {data.examStrategy ?? "Review high-frequency topics first."}
                </p>
              </div>

              <p className="sec-lbl">Unit Priority Summary</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {data.units?.map(u => {
                  const up = getP(u.unitPriority ?? u.priority);
                  return (
                    <div key={u.unitNumber} className="unit-card">
                      <div>
                        <p className="mb-0.5 text-[10px] text-white/22">Unit {u.unitNumber}</p>
                        <p className="text-[0.88rem] font-medium text-white/72">{u.unitTitle}</p>
                        <p className="mt-1 text-[11px] text-white/28">
                          {u.probableQuestions?.length ?? 0} questions
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide"
                        style={{ background: up.bg, border: `1px solid ${up.border}`, color: up.color }}
                      >
                        {up.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════
              HIGH FREQ TOPICS
          ════════════════════════════ */}
          {mounted && activeTab === "topics" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">High Frequency Topics</p>

              {hfTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {hfTopics.map((t, i) => (
                    <span key={i} className="hft-pill">{t}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[0.9rem] text-white/28">
                  No high-frequency topics detected — try adding more years of papers.
                </p>
              )}

              {data.units?.some(u => u.topTopics?.length > 0) && (
                <div className="mt-12">
                  <p className="sec-lbl">Topics by Unit</p>
                  <div className="space-y-6">
                    {data.units?.map(u =>
                      u.topTopics?.length > 0 ? (
                        <div key={u.unitNumber}>
                          <p className="mb-3 text-[0.82rem] font-medium text-white/38">
                            Unit {u.unitNumber} — {u.unitTitle}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {u.topTopics.map((t, i) => (
                              <span key={i} className="topic-pill rounded-full px-3 py-1 text-[11px] text-white/38">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════
              MUST PREPARE
          ════════════════════════════ */}
          {mounted && activeTab === "hf" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Must Prepare — High Frequency Questions</p>
              <p className="mb-8 text-[0.88rem] leading-relaxed text-white/32">
                Questions that appeared across multiple years. These are your highest-ROI topics —
                prepare these before anything else.
              </p>

              {mustPrepare.length > 0 ? (
                <div className="space-y-2.5">
                  {mustPrepare.map((q, i) => (
                    <HFCard key={i} q={q} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-[0.9rem] text-white/28">
                  No repeated questions found — add more years of papers for better results.
                </p>
              )}
            </div>
          )}

        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="btm-bar fixed bottom-0 left-0 right-0 z-40 flex h-[60px] items-center justify-between px-5 sm:px-8">
          <button className="btn-ghost" onClick={() => navigate("/analyze")}>
            ← Analyze Another
          </button>
          <div className="flex items-center gap-2">
            <button className="btn-export hidden sm:inline-flex" onClick={() => doExport(data)}>
              Export ↓
            </button>
            <button className="btn-white" onClick={copyResults}>
              {copied ? "Copied ✓" : "Copy Results"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Results;