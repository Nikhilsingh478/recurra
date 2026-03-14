import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface ProbableQuestion {
  question: string;
  frequency: number;
  isHighFrequency: boolean;
}

interface Unit {
  unitNumber: number;
  unitTitle: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  probableQuestions: ProbableQuestion[];
  topTopics: string[];
}

interface RecurraResults {
  subject: string;
  totalYearsAnalyzed: number;
  units: Unit[];
  examStrategy: string;
  superHighFrequencyTopics: string[];
  timestamp?: string;
}

/* ── Blur-reveal hook — fires when element enters viewport ── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
};

/* ── Question row with staggered blur-reveal ── */
const QuestionRow = ({
  q, index,
}: {
  q: ProbableQuestion;
  index: number;
}) => {
  const { ref, visible } = useReveal(index * 55);
  return (
    <div
      ref={ref}
      className="q-row group flex items-start justify-between gap-4 border-b border-white/[0.04] py-[14px]"
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(10px)",
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), filter 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {q.isHighFrequency ? (
          <span className="mt-[1px] shrink-0 text-sm">🔥</span>
        ) : (
          <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-white/20" />
        )}
        <span
          className="text-[0.875rem] leading-relaxed"
          style={{ color: q.isHighFrequency ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}
        >
          {q.question}
        </span>
      </div>
      <span
        className="freq-badge shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{
          background: q.isHighFrequency ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
          color: q.isHighFrequency ? "rgb(251,191,36)" : "rgba(255,255,255,0.28)",
          border: q.isHighFrequency ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {q.frequency}x
      </span>
    </div>
  );
};

/* ── Unit section ── */
const UnitSection = ({ unit, sectionIndex }: { unit: Unit; sectionIndex: number }) => {
  const { ref, visible } = useReveal(sectionIndex * 80);

  const priorityStyle = {
    HIGH:   { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  color: "rgb(251,191,36)",        label: "HIGH" },
    MEDIUM: { bg: "rgba(59,111,212,0.1)",   border: "rgba(59,111,212,0.3)",   color: "rgb(147,180,248)",       label: "MEDIUM" },
    LOW:    { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", label: "LOW" },
  }[unit.priority];

  return (
    <div
      ref={ref}
      className="unit-section mb-14"
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(12px)",
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Unit header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Unit {unit.unitNumber}
          </p>
          <h2 className="font-heading text-[1.15rem] font-semibold leading-tight text-white/90">
            {unit.unitTitle}
          </h2>
        </div>
        <span
          className="mt-1 shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: priorityStyle.bg, border: `1px solid ${priorityStyle.border}`, color: priorityStyle.color }}
        >
          {priorityStyle.label}
        </span>
      </div>

      {/* Divider */}
      <div className="mb-5 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.07) 0%, transparent 100%)" }} />

      {/* Topics */}
      {unit.topTopics?.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/25">Topics —</span>
          {unit.topTopics.map((t, i) => (
            <span
              key={i}
              className="topic-pill rounded-full px-2.5 py-0.5 text-[11px] text-white/40"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {t}
            </span>
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

/* ══════════════════════════════════════════════════════════ */

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RecurraResults | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("recurra_results");
    if (!raw) { navigate("/analyze"); return; }
    try {
      setData(JSON.parse(raw));
      setTimeout(() => setMounted(true), 80);
    } catch {
      navigate("/analyze");
    }
  }, [navigate]);

  const copyResults = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`${data.subject} — Exam Probables`);
    lines.push(`${data.totalYearsAnalyzed} years analyzed`);
    lines.push(""); lines.push("Exam Strategy:"); lines.push(data.examStrategy);
    lines.push(""); lines.push("Super High-Frequency:"); lines.push(data.superHighFrequencyTopics.join(", "));
    lines.push("");
    data.units.forEach((u) => {
      lines.push(`UNIT ${u.unitNumber}: ${u.unitTitle} [${u.priority}]`);
      lines.push("Topics: " + u.topTopics.join(", ")); lines.push("");
      u.probableQuestions.forEach((q) => {
        lines.push(`${q.isHighFrequency ? "🔥" : "·"} ${q.question}  (${q.frequency}x)`);
      });
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const fmt = (ts?: string) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!data) return null;

  return (
    <>
      <style>{`
        /* ── Page background ── */
        .res-bg {
          background:
            radial-gradient(ellipse 60% 40% at 10% 5%,  rgba(25,50,120,0.14) 0%, transparent 65%),
            radial-gradient(ellipse 45% 35% at 90% 90%, rgba(15,32,90,0.12) 0%, transparent 65%),
            #050810;
        }

        /* ── Blur-in for static sections ── */
        @keyframes blurIn {
          from { opacity:0; filter:blur(14px); transform:translateY(12px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        .b-reveal { opacity:0; animation: blurIn 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
        .bd1 { animation-delay:0.06s; }
        .bd2 { animation-delay:0.15s; }
        .bd3 { animation-delay:0.24s; }
        .bd4 { animation-delay:0.33s; }

        /* ── Question row hover ── */
        .q-row {
          transition: background 0.18s ease, padding-left 0.18s ease;
          border-radius: 8px;
          padding-left: 6px;
          padding-right: 6px;
          margin-left: -6px;
          margin-right: -6px;
        }
        .q-row:hover { background: rgba(255,255,255,0.025); }
        .q-row:hover .freq-badge { opacity: 1; }

        /* ── Topic pill hover ── */
        .topic-pill {
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          cursor: default;
        }
        .topic-pill:hover {
          background: rgba(59,111,212,0.1) !important;
          border-color: rgba(59,111,212,0.25) !important;
          color: rgba(147,180,248,0.9) !important;
        }

        /* ── Amber pill ── */
        .amber-pill {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.2);
          color: rgb(252,196,70);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .amber-pill:hover {
          background: rgba(245,158,11,0.14);
          transform: translateY(-1px);
        }

        /* ── Strategy card ── */
        .strategy-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-left: 3px solid #3b6fd4;
          border-radius: 14px;
          padding: 22px 24px;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .strategy-card:hover {
          background: rgba(59,111,212,0.04);
          border-color: rgba(255,255,255,0.1);
          border-left-color: #5a8ae8;
        }

        /* ── Stat pill ── */
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .stat-pill:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.14);
        }

        /* ── Bottom bar ── */
        .bottom-bar {
          background: rgba(5,8,16,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Bottom bar buttons ── */
        .btn-ghost {
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: rgba(255,255,255,0.65);
          border-radius: 999px;
          padding: 9px 20px;
          font-size: 0.82rem;
          font-weight: 500;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
          cursor: pointer;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }
        .btn-solid {
          background: #ffffff;
          color: #050810;
          border: none;
          border-radius: 999px;
          padding: 9px 22px;
          font-size: 0.82rem;
          font-weight: 600;
          transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .btn-solid:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(255,255,255,0.12);
        }
        .btn-solid:active { transform: scale(0.97); }

        /* ── Section divider ── */
        .section-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 14px;
        }

        /* ── Ping ── */
        @keyframes cpPing {
          75%,100% { transform: scale(2.2); opacity: 0; }
        }
        .cp-ping { animation: cpPing 1.8s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>

      <div className="res-bg relative min-h-screen font-body">
        <div className="res-bg fixed inset-0 -z-10" aria-hidden />
        <Navbar />

        <div className="mx-auto max-w-[760px] px-5 pb-36 pt-12 md:pt-16">

          {/* ── Header ── */}
          {mounted && (
            <div className="b-reveal bd1 mb-10">
              <p className="mb-2 text-xs text-white/28">
                Analysis Complete · {fmt(data.timestamp)} · {data.totalYearsAnalyzed ?? 0} years analyzed
              </p>
              <h1 className="font-heading text-[2rem] font-bold leading-tight tracking-tight text-white md:text-[2.5rem]">
                {data.subject ?? "General"}
                <span className="text-white/35"> — Exam Probables</span>
              </h1>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="stat-pill">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="cp-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </span>
                  {data.superHighFrequencyTopics?.length ?? 0} super high-frequency topics
                </span>
                <span className="stat-pill">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fd4]" />
                  {data.units?.length ?? 0} units analyzed
                </span>
              </div>
            </div>
          )}

          {/* ── Strategy ── */}
          {mounted && (
            <div className="b-reveal bd2 mb-12">
              <p className="section-label">Exam Strategy</p>
              <div className="strategy-card">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span className="font-heading text-xs font-semibold uppercase tracking-widest text-[#3b6fd4]">
                    Recommended Approach
                  </span>
                </div>
                <p className="text-[0.9rem] leading-relaxed text-white/60">
                  {data.examStrategy ?? "Review high-frequency topics first."}
                </p>
              </div>
            </div>
          )}

          {/* ── Super high frequency ── */}
          {mounted && data.superHighFrequencyTopics?.length > 0 && (
            <div className="b-reveal bd3 mb-14">
              <p className="section-label">🔥 Must Prepare First</p>
              <div className="flex flex-wrap gap-2">
                {data.superHighFrequencyTopics.map((t, i) => (
                  <span key={i} className="amber-pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Units ── */}
          {mounted && (
            <div className="b-reveal bd4">
              <p className="section-label mb-8">Unit-wise Probable Questions</p>
              {data.units?.map((unit, idx) => (
                <UnitSection key={unit.unitNumber} unit={unit} sectionIndex={idx} />
              ))}
            </div>
          )}

        </div>

        {/* ── Bottom bar ── */}
        <div className="bottom-bar fixed bottom-0 left-0 right-0 z-40 flex h-[60px] items-center justify-between px-5 md:px-8">
          <button className="btn-ghost" onClick={() => navigate("/analyze")}>
            ← Analyze Another
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-white/20 sm:block">
              {data.units?.length} units · {data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0)} questions
            </span>
            <button className="btn-solid" onClick={copyResults}>
              {copied ? "Copied ✓" : "Copy Results"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Results;