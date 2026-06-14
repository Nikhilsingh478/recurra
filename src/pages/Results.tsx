import { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedbackModal from "@/components/FeedbackModal";
import MathRenderer from "@/components/MathRenderer";
import { analytics } from "@/lib/analytics";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface ProbableQuestion {
  question: string;
  frequency: number;
  priority?: 1 | 2 | 3;
  isHighFrequency?: boolean;
  solution?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  roi?: "Very High" | "High" | "Medium" | "Low";
}
interface Unit {
  unitNumber: number;
  unitTitle: string;
  unitPriority?: 1 | 2 | 3;
  priority?: 1 | 2 | 3;
  probableQuestions: ProbableQuestion[];
  topTopics: string[];
}
interface HFQuestion {
  question: string;
  frequency: number;
  unit: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  roi?: "Very High" | "High" | "Medium" | "Low";
}
interface SkipStrategy {
  recommendedSkip: string;
  alternativeSkip: string;
  mustNotSkip: string[];
  rationale: string;
}
interface NumericalKit {
  topic: string;
  practice: string;
}
interface RecurraResults {
  subject: string;
  totalYearsAnalyzed: number;
  units: Unit[];
  examStrategy: string;
  skipStrategy?: SkipStrategy;
  numericalKit?: NumericalKit[];
  highFrequencyTopics?: string[];
  highFrequencyQuestions?: HFQuestion[];
  superHighFrequencyTopics?: string[];
  timestamp?: string;
}

/* ─────────────────────────────────────────────
   PRIORITY MAP
───────────────────────────────────────────── */
const P = {
  1: { bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.2)",  color:"rgb(251,191,36)",      dot:"#f59e0b", label:"Rank 1" },
  2: { bg:"rgba(59,111,212,0.09)",  border:"rgba(59,111,212,0.25)", color:"rgb(147,180,248)",     dot:"#3b6fd4", label:"Rank 2"    },
  3: { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)",dot:"rgba(255,255,255,0.18)", label:"Rank 3" },
};
type PKey = keyof typeof P;
const getP = (key?: number | string) => P[(key as PKey) ?? 3] ?? P[3];

/* ─────────────────────────────────────────────
   REVEAL HOOK
───────────────────────────────────────────── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.04 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
};

const rs = (visible: boolean): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  filter: visible ? "blur(0)" : "blur(8px)",
  transform: visible ? "translate3d(0,0,0)" : "translate3d(0,10px,0)",
  transition: "opacity 0.58s cubic-bezier(0.22,1,0.36,1), filter 0.58s cubic-bezier(0.22,1,0.36,1), transform 0.58s cubic-bezier(0.22,1,0.36,1)",
  willChange: "opacity,filter,transform",
});

/* ─────────────────────────────────────────────
   BADGE HELPERS
───────────────────────────────────────────── */
const getDifficultyClass = (d?: string) => {
  if (d === "Easy")   return "badge-easy";
  if (d === "Medium") return "badge-medium";
  if (d === "Hard")   return "badge-hard";
  return "";
};

const getRoiClass = (r?: string) => {
  if (r === "Very High") return "badge-roi-vh";
  if (r === "High")      return "badge-roi-h";
  if (r === "Medium")    return "badge-roi-m";
  if (r === "Low")       return "badge-roi-l";
  return "";
};

/* ─────────────────────────────────────────────
   QUESTION ROW
───────────────────────────────────────────── */
const QuestionRow = ({ q, index }: { q: ProbableQuestion; index: number }) => {
  const { ref, visible } = useReveal(index * 45);
  const pKey = q.priority ?? (q.isHighFrequency ? 1 : 3);
  const p = getP(pKey);

  return (
    <div ref={ref} className="q-row group py-4" style={rs(visible)}>
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          {pKey === 1 ? (
            <span className="mt-0.5 shrink-0 text-sm leading-none">🔥</span>
          ) : pKey === 2 ? (
            <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.dot }} />
          ) : (
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          )}
          <div className="min-w-0 flex-1">
            <MathRenderer content={q.question} className="text-[0.9rem] leading-[1.7]" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {q.difficulty && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getDifficultyClass(q.difficulty)}`}>
                  {q.difficulty}
                </span>
              )}
              {q.roi && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getRoiClass(q.roi)}`}>
                  {q.roi} ROI
                </span>
              )}
            </div>
            {q.solution && (
              <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 text-[0.82rem] leading-[1.75] text-white/55">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Solution</p>
                <MathRenderer content={q.solution} />
              </div>
            )}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}
        >
          {q.frequency}×
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HF QUESTION CARD
───────────────────────────────────────────── */
const HFCard = ({ q, index }: { q: HFQuestion; index: number }) => {
  const { ref, visible } = useReveal(index * 50);
  return (
    <div ref={ref} className="hfq-card" style={rs(visible)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-sm">🔥</span>
          <div className="text-[0.9rem] leading-[1.7] text-white/85">
            <MathRenderer content={q.question} />
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background:"rgba(245,158,11,0.09)", border:"1px solid rgba(245,158,11,0.22)", color:"rgb(251,191,36)" }}
        >
          {q.frequency}×
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <p className="text-[11px] text-white/28">{q.unit}</p>
        {q.difficulty && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getDifficultyClass(q.difficulty)}`}>
            {q.difficulty}
          </span>
        )}
        {q.roi && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getRoiClass(q.roi)}`}>
            {q.roi} ROI
          </span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   UNIT SECTION
───────────────────────────────────────────── */
const UnitSection = ({ unit, idx }: { unit: Unit; idx: number }) => {
  const { ref, visible } = useReveal(idx * 70);
  const up = getP(unit.unitPriority ?? unit.priority);

  return (
    <div ref={ref} className="mb-16" style={rs(visible)}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/20">
            Unit {unit.unitNumber}
          </p>
          <h2 className="font-heading text-[1.15rem] font-semibold leading-snug text-white/88 sm:text-xl">
            {unit.unitTitle}
          </h2>
        </div>
        <span
          className="mt-0.5 shrink-0 rounded-full px-3.5 py-1 text-[10px] font-bold tracking-wide"
          style={{ background: up.bg, border: `1px solid ${up.border}`, color: up.color }}
        >
          {up.label}
        </span>
      </div>

      {/* Gradient divider */}
      <div className="mb-5 h-px" style={{ background:"linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />

      {/* Topics */}
      {unit.topTopics?.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-white/20 mr-0.5">Topics —</span>
          {unit.topTopics.map((t, i) => (
            <span key={i} className="topic-pill rounded-full px-3 py-0.5 text-[10px] text-white/35">{t}</span>
          ))}
        </div>
      )}

      {/* Questions — with top border on each row */}
      <div className="divide-y divide-white/[0.045]">
        {unit.probableQuestions?.map((q, i) => (
          <QuestionRow key={i} q={q} index={i} />
        ))}
      </div>
    </div>
  );
};

const getMustPrepare = (data: RecurraResults): HFQuestion[] =>
  data.highFrequencyQuestions?.length
    ? data.highFrequencyQuestions
    : (data.units?.flatMap(u =>
        (u.probableQuestions ?? [])
          .filter(q => q.frequency >= 2)
          .map(q => ({ question: q.question, frequency: q.frequency, unit: u.unitTitle }))
      ) ?? []).sort((a, b) => b.frequency - a.frequency);

const getExportFileName = (subject?: string) =>
  `${(subject || "recurra").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "recurra"}_exam_probables.pdf`;

const waitForPdfRender = async () => {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise(resolve => setTimeout(resolve, 350));
};

const estimateTextRows = (text = "", charsPerRow: number) =>
  Math.max(1, Math.ceil(String(text).length / charsPerRow));

const estimateTopicRows = (topics: string[] = [], charsPerRow: number) => {
  if (topics.length === 0) return 0;
  const units = topics.reduce((sum, topic) => sum + Math.max(1, Math.ceil(String(topic).length / charsPerRow)), 0);
  return Math.max(1, Math.ceil(units / 2));
};

const estimateUnitHeight = (unit: Unit) => {
  const header = 86;
  const topics = estimateTopicRows(unit.topTopics, 42) * 34;
  const questions = (unit.probableQuestions ?? []).reduce((sum, q) => {
    const rows = estimateTextRows(q.question, 92);
    const solution = q.solution ? 52 + estimateTextRows(q.solution, 96) * 18 : 0;
    return sum + 42 + rows * 20 + solution;
  }, 0);
  return header + topics + questions + 32;
};

const paginateUnits = (units: Unit[] = []) => {
  const pages: Unit[][] = [];
  let current: Unit[] = [];
  let currentHeight = 64;
  const maxHeight = 920;

  units.forEach((unit) => {
    const unitHeight = estimateUnitHeight(unit);
    if (current.length > 0 && currentHeight + unitHeight > maxHeight) {
      pages.push(current);
      current = [];
      currentHeight = 64;
    }
    current.push(unit);
    currentHeight += unitHeight;
  });

  if (current.length > 0) pages.push(current);
  return pages;
};

const estimateMustPrepareHeight = (question: HFQuestion) =>
  46 + estimateTextRows(question.question, 98) * 20 + estimateTextRows(question.unit, 120) * 14;

const paginateMustPrepare = (questions: HFQuestion[] = []) => {
  const pages: HFQuestion[][] = [];
  let current: HFQuestion[] = [];
  let currentHeight = 64;
  const maxHeight = 930;

  questions.forEach((question) => {
    const height = estimateMustPrepareHeight(question);
    if (current.length > 0 && currentHeight + height > maxHeight) {
      pages.push(current);
      current = [];
      currentHeight = 64;
    }
    current.push(question);
    currentHeight += height;
  });

  if (current.length > 0) pages.push(current);
  return pages;
};

const PDFPage = ({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) => (
  <section className={`pdf-page ${compact ? "pdf-page-compact" : ""}`}>
    {children}
  </section>
);

const PDFReport = ({ data }: { data: RecurraResults }) => {
  const hfTopics = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
  const mustPrepare = getMustPrepare(data);
  const totalQ = data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0) ?? 0;
  const unitPages = paginateUnits(data.units ?? []);
  const mustPreparePages = paginateMustPrepare(mustPrepare);

  return (
    <article id="pdf-content" className="pdf-report">
      <PDFPage>
        <header className="pdf-cover pdf-avoid">
          <div>
            <p className="pdf-kicker">RECURRA</p>
            <h1>{data.subject ?? "General"}</h1>
            <p className="pdf-subtitle">Exam Probables</p>
          </div>
          <div className="pdf-meta">
            <span>{data.totalYearsAnalyzed ?? 0} years analyzed</span>
            <span>{data.units?.length ?? 0} units</span>
            <span>{totalQ} questions</span>
          </div>
        </header>

        <section className="pdf-card pdf-avoid">
          <p className="pdf-label">Exam Strategy</p>
          <div className="pdf-strategy">
            <MathRenderer content={data.examStrategy ?? "Review high-frequency topics first."} />
          </div>
        </section>

        {hfTopics.length > 0 && (
          <section className="pdf-section pdf-avoid">
            <p className="pdf-label">High Frequency Topics</p>
            <div className="pdf-topic-list">
              {hfTopics.map((topic, index) => (
                <span key={`${topic}-${index}`} className="pdf-topic">
                  <MathRenderer content={topic} />
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="pdf-footer">
          <span>Generated by Recurra</span>
          <span>{new Date(data.timestamp ?? Date.now()).toLocaleString("en-IN")}</span>
        </footer>
      </PDFPage>

      {unitPages.map((pageUnits, pageIndex) => (
        <PDFPage key={pageIndex} compact>
          <section className="pdf-section pdf-section-first">
            <p className="pdf-label">Unit-wise Probable Questions</p>
            {pageUnits.map((unit) => {
              const up = getP(unit.unitPriority ?? unit.priority);
              return (
                <div key={unit.unitNumber} className="pdf-unit">
                  <div className="pdf-unit-header">
                    <div>
                      <p>Unit {unit.unitNumber}</p>
                      <h2><MathRenderer content={unit.unitTitle ?? ""} /></h2>
                    </div>
                    <span style={{ color: up.color, borderColor: up.border, background: up.bg }}>
                      {up.label}
                    </span>
                  </div>

                  {unit.topTopics?.length > 0 && (
                    <div className="pdf-unit-topics">
                      {unit.topTopics.map((topic, index) => (
                        <span key={`${topic}-${index}`}>
                          <MathRenderer content={topic} />
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pdf-question-list">
                    {unit.probableQuestions?.map((q, index) => {
                      const qpKey = q.priority ?? (q.isHighFrequency ? 1 : 3);
                      const qp = getP(qpKey);
                      return (
                        <div key={index} className="pdf-question pdf-avoid">
                          <span className="pdf-question-number" style={{ color: qp.color }}>
                            {index + 1}.
                          </span>
                          <div className="pdf-question-text">
                            <MathRenderer content={q.question} />
                            {(q.difficulty || q.roi) && (
                              <div className="pdf-badges">
                                {q.difficulty && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getDifficultyClass(q.difficulty)}`}>
                                    {q.difficulty}
                                  </span>
                                )}
                                {q.roi && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getRoiClass(q.roi)}`}>
                                    {q.roi} ROI
                                  </span>
                                )}
                              </div>
                            )}
                            {q.solution && (
                              <div className="pdf-solution">
                                <p>Solution</p>
                                <MathRenderer content={q.solution} />
                              </div>
                            )}
                          </div>
                          <span className="pdf-frequency" style={{ color: qp.color }}>
                            {q.frequency}×
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
          <footer className="pdf-footer">
            <span>Generated by Recurra</span>
            <span>Page {pageIndex + 2}</span>
          </footer>
        </PDFPage>
      ))}

      {mustPreparePages.map((pageQuestions, pageIndex) => (
        <PDFPage key={`must-${pageIndex}`} compact>
          <section className="pdf-section pdf-section-first">
            <p className="pdf-label">Must Prepare — High Frequency Questions</p>
            <div className="pdf-must-list">
              {pageQuestions.map((q, index) => (
                <div key={`${q.question}-${index}`} className="pdf-must-item pdf-avoid">
                  <span>{mustPreparePages.slice(0, pageIndex).reduce((sum, page) => sum + page.length, 0) + index + 1}.</span>
                  <div>
                    <MathRenderer content={q.question} />
                    <p>{q.unit}</p>
                    {(q.difficulty || q.roi) && (
                      <div className="pdf-badges">
                        {q.difficulty && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getDifficultyClass(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        )}
                        {q.roi && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getRoiClass(q.roi)}`}>
                            {q.roi} ROI
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <strong>{q.frequency}×</strong>
                </div>
              ))}
            </div>
          </section>
          <footer className="pdf-footer">
            <span>Generated by Recurra</span>
            <span>{new Date(data.timestamp ?? Date.now()).toLocaleString("en-IN")}</span>
          </footer>
        </PDFPage>
      ))}

      {(data.skipStrategy || (data.numericalKit?.length ?? 0) > 0) && (
        <PDFPage compact>
          <section className="pdf-section pdf-section-first">
            {data.skipStrategy && (
              <>
                <p className="pdf-label">Unit Skip Strategy</p>
                <div className="pdf-skip-recommended pdf-avoid">
                  <p className="pdf-skip-tag">⚡ Recommended Skip</p>
                  <p className="pdf-skip-unit">{data.skipStrategy.recommendedSkip}</p>
                  <p className="pdf-skip-reason">{data.skipStrategy.rationale}</p>
                </div>
                <div className="pdf-skip-alternative pdf-avoid">
                  <p className="pdf-skip-tag-green">✓ Alternative Skip</p>
                  <p className="pdf-skip-unit" style={{ fontSize: 13 }}>{data.skipStrategy.alternativeSkip}</p>
                </div>
                {data.skipStrategy.mustNotSkip?.length > 0 && (
                  <div className="pdf-skip-must-not pdf-avoid">
                    <p className="pdf-skip-tag-dim">Must Not Skip</p>
                    <div className="pdf-skip-pills">
                      {data.skipStrategy.mustNotSkip.map((u, i) => (
                        <span key={i} className="pdf-must-not-pill">{u}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {(data.numericalKit?.length ?? 0) > 0 && (
              <>
                <p className="pdf-label" style={{ marginTop: data.skipStrategy ? 28 : 0 }}>
                  Numerical Survival Kit
                </p>
                <div className="pdf-kit-list">
                  {data.numericalKit!.map((item, i) => (
                    <div key={i} className="pdf-kit-item pdf-avoid">
                      <span className="pdf-kit-number">{i + 1}</span>
                      <div>
                        <p className="pdf-kit-topic">{item.topic}</p>
                        <p className="pdf-kit-why">{item.practice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
          <footer className="pdf-footer">
            <span>Generated by Recurra</span>
            <span>{new Date(data.timestamp ?? Date.now()).toLocaleString("en-IN")}</span>
          </footer>
        </PDFPage>
      )}
    </article>
  );
};

const exportPDF = async (data: RecurraResults): Promise<void> => {
  const filename = getExportFileName(data.subject);

  await waitForPdfRender();

  return new Promise<void>((resolve) => {
    const afterPrint = () => {
      window.removeEventListener("afterprint", afterPrint);
      resolve();
    };
    window.addEventListener("afterprint", afterPrint, { once: true });

    document.title = filename.replace(".pdf", "");
    window.print();

    setTimeout(() => {
      window.removeEventListener("afterprint", afterPrint);
      resolve();
    }, 10000);
  });
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const Results = () => {
  const navigate = useNavigate();
  const [data, setData]           = useState<RecurraResults | null>(null);
  const [mounted, setMounted]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"units" | "strategy" | "skip" | "hf">("units");

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
    data.units?.forEach(u => {
      L.push(`UNIT ${u.unitNumber}: ${u.unitTitle}`);
      u.probableQuestions?.forEach(q => {
        const pk = q.priority ?? (q.isHighFrequency ? 1 : 3);
        L.push(`${pk === 1 ? "🔥" : "·"} ${q.question}  (${q.frequency}×)`);
      });
      L.push("");
    });
    navigator.clipboard.writeText(L.join("\n"));
    setCopied(true);
    analytics.resultsCopied();
    setTimeout(() => setCopied(false), 2400);
  }, [data]);

  const handleExport = async () => {
    if (!data || exporting) return;
    setExporting(true);
    analytics.pdfExported();
    const originalTitle = document.title;
    try {
      await exportPDF(data);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      document.title = originalTitle;
      setExporting(false);
    }
  };

  const fmt = (ts?: string) => ts
    ? new Date(ts).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })
    : "";

  if (!data) return null;

  const hfTopics    = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
  const hfQuestions = data.highFrequencyQuestions ?? [];
  const totalQ      = data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0) ?? 0;

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
    { key: "skip"     as const, label: "Skip Plan" },
    { key: "hf"       as const, label: "Must Prepare", count: mustPrepare.length },
  ];

  return (
    <>
      <Helmet>
        <title>Your Exam Probables — Unit-wise Results | Recurra</title>
        <meta name="description" content="View your AI-generated exam probable questions organized by unit, ranked by frequency. Export as PDF or copy your must-prepare list." />
        <link rel="canonical" href="https://recurraio.vercel.app/results" />
      </Helmet>
      <style>{`
        .res-bg {
          background:
            radial-gradient(ellipse 65% 45% at 5% 2%,  rgba(22,45,112,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 95% 98%, rgba(12,28,82,0.11) 0%, transparent 60%),
            #050810;
        }

        @keyframes blurIn {
          from { opacity:0; filter:blur(10px); transform:translate3d(0,14px,0); }
          to   { opacity:1; filter:blur(0);    transform:translate3d(0,0,0); }
        }
        .b-rev { opacity:0; will-change:opacity,filter,transform; animation:blurIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bd1 { animation-delay:0.08s; }
        .bd2 { animation-delay:0.17s; }
        .bd3 { animation-delay:0.26s; }

        /* ── Tab bar — equal width tabs ── */
        .tab-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 12px;
          padding: 4px;
          gap: 2px;
        }
        .tab-btn {
          padding: 8px 4px;
          border-radius: 9px;
          border: none;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.38);
          background: transparent;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
          white-space: nowrap;
          text-align: center;
        }
        .tab-btn:hover { color: rgba(255,255,255,0.6); }
        .tab-btn.active { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }

        /* ── Question row ── */
        .q-row {
          border-radius: 8px;
          margin-left: -8px; margin-right: -8px;
          padding-left: 8px; padding-right: 8px;
          transition: background 0.15s ease;
        }
        .q-row:hover { background: rgba(255,255,255,0.018); }

        /* ── Topic pill ── */
        .topic-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          cursor: default;
        }
        .topic-pill:hover {
          background: rgba(59,111,212,0.09);
          border-color: rgba(59,111,212,0.22);
          color: rgba(147,180,248,0.85);
        }

        /* ── Strategy card ── */
        .strat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.065);
          border-left: 2px solid rgba(59,111,212,0.65);
          border-radius: 16px;
          padding: 24px 28px;
          transition: background 0.2s, border-left-color 0.2s;
        }
        .strat-card:hover { background: rgba(59,111,212,0.03); border-left-color: #6494e8; }

        /* ── HF topic pill ── */
        .hft-pill {
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.18);
          color: rgb(251,191,36);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.82rem;
          font-weight: 500;
          white-space: nowrap;
          cursor: default;
          transition: background 0.18s, transform 0.18s;
          will-change: transform;
        }
        .hft-pill:hover { background: rgba(245,158,11,0.13); transform: translate3d(0,-1px,0); }

        /* ── HF question card ── */
        .hfq-card {
          background: rgba(245,158,11,0.03);
          border: 1px solid rgba(245,158,11,0.09);
          border-radius: 14px;
          padding: 18px 20px;
          transition: background 0.18s, border-color 0.18s, transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease;
          will-change: transform;
        }
        .hfq-card:hover {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.18);
          transform: translate3d(0,-2px,0);
          box-shadow: 0 8px 28px rgba(245,158,11,0.06);
        }

        /* ── Stat pill ── */
        .stat-pill {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          transition: background 0.18s;
        }
        .stat-pill:hover { background: rgba(255,255,255,0.042); }

        /* ── Unit summary card ── */
        .unit-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 14px;
          padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          transition: background 0.18s, border-color 0.18s, transform 0.22s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .unit-card:hover {
          background: rgba(255,255,255,0.032);
          border-color: rgba(255,255,255,0.1);
          transform: translate3d(0,-1px,0);
        }

        /* ── Bottom bar ── */
        .btm-bar {
          background: rgba(5,8,16,0.92);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Bottom buttons — premium hover ── */
        .btn-ghost {
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease;
          will-change: transform;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.82);
          transform: translate3d(0,-1px,0);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .btn-ghost:active { transform: scale(0.97); }

        .btn-white {
          background: #fff;
          color: #050810;
          border: none;
          border-radius: 999px;
          padding: 8px 20px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease;
          will-change: transform;
        }
        .btn-white:hover {
          opacity: 0.88;
          transform: translate3d(0,-2px,0);
          box-shadow: 0 6px 24px rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.3);
        }
        .btn-white:active { transform: scale(0.97); }

        /* btn-export removed since we are redesigning */

        /* ── Ping ── */
        @keyframes cpPing { 75%,100% { transform:scale(2.2); opacity:0; } }
        .cp-ping { animation: cpPing 1.8s cubic-bezier(0,0,0.2,1) infinite; will-change: transform,opacity; }

        /* ── Section label ── */
        .sec-lbl {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.2em;
          color: rgba(255,255,255,0.18); margin-bottom: 22px;
        }

        .pdf-stage {
          position: fixed;
          left: -9999px;
          top: 0;
          width: 794px;
          min-height: 100vh;
          pointer-events: none;
          z-index: -1;
          background: #050810;
        }

        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            visibility: hidden !important;
            background: #050810 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .pdf-stage {
            visibility: visible !important;
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            z-index: auto !important;
            pointer-events: auto !important;
          }
          .pdf-stage * {
            visibility: visible !important;
          }
          .pdf-page {
            page-break-after: always !important;
            break-after: page !important;
            overflow: visible !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-sizing: border-box !important;
          }
          .pdf-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .pdf-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .pdf-question {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .pdf-must-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .pdf-unit {
            break-inside: avoid !important;
          }
          .pdf-kit-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .pdf-skip-recommended, .pdf-skip-alternative, .pdf-skip-must-not {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        .pdf-report {
          width: 794px;
          color: rgba(255,255,255,0.84);
          background: #050810;
          font-family: inherit;
          line-height: 1.58;
          overflow: visible;
        }
        .pdf-page {
          position: relative;
          width: 794px;
          min-height: 1123px;
          padding: 46px 42px 38px;
          background:
            radial-gradient(ellipse 70% 34% at 8% 2%, rgba(59,111,212,0.18), transparent 62%),
            radial-gradient(ellipse 55% 36% at 95% 100%, rgba(245,158,11,0.09), transparent 62%),
            #050810;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          page-break-after: always;
          break-after: page;
        }
        .pdf-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }
        .pdf-page-compact {
          padding-top: 38px;
        }
        .pdf-report * {
          box-sizing: border-box;
          animation: none !important;
          transition: none !important;
          filter: none !important;
        }
        .pdf-cover {
          display: flex;
          justify-content: space-between;
          gap: 28px;
          padding: 30px 32px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.018));
        }
        .pdf-kicker, .pdf-label {
          margin: 0;
          color: rgba(147,180,248,0.9);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .pdf-cover h1 {
          margin: 12px 0 0;
          color: #fff;
          font-size: 34px;
          line-height: 1.12;
          letter-spacing: -0.035em;
        }
        .pdf-subtitle {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.42);
          font-size: 16px;
        }
        .pdf-meta {
          min-width: 190px;
          display: grid;
          gap: 9px;
          align-content: start;
        }
        .pdf-meta span {
          display: block;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          text-align: center;
        }
        .pdf-card, .pdf-section {
          margin-top: 26px;
        }
        .pdf-section-first {
          margin-top: 0;
        }
        .pdf-card {
          padding: 24px 28px;
          border: 1px solid rgba(59,111,212,0.22);
          border-left: 3px solid rgba(59,111,212,0.8);
          border-radius: 20px;
          background: rgba(59,111,212,0.06);
        }
        .pdf-strategy {
          margin-top: 12px;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
        }
        .pdf-topic-list, .pdf-unit-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
          align-items: center;
        }
        .pdf-topic, .pdf-unit-topics span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          min-height: 29px;
          padding: 6px 13px;
          border-radius: 999px;
          border: 1px solid rgba(245,158,11,0.16);
          background: rgba(245,158,11,0.07);
          color: rgb(251,191,36);
          font-size: 11px;
          line-height: 1.3;
          text-align: center;
          overflow-wrap: anywhere;
          white-space: normal;
        }
        .pdf-topic > div, .pdf-unit-topics span > div {
          display: inline;
          line-height: inherit;
        }
        .pdf-topic .katex, .pdf-unit-topics .katex {
          line-height: 1;
        }
        .pdf-unit {
          margin-top: 18px;
          padding: 20px 23px;
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 20px;
          background: rgba(255,255,255,0.022);
        }
        .pdf-unit-header {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .pdf-unit-header p {
          margin: 0 0 6px;
          color: rgba(255,255,255,0.28);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .pdf-unit-header h2 {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 19px;
          line-height: 1.32;
        }
        .pdf-unit-header > span {
          height: max-content;
          padding: 5px 11px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }
        .pdf-unit-topics span {
          border-color: rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.45);
        }
        .pdf-question-list {
          margin-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.045);
        }
        .pdf-question {
          display: grid;
          grid-template-columns: 26px minmax(0, 1fr) 42px;
          gap: 10px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.045);
          color: rgba(255,255,255,0.76);
          font-size: 13px;
          overflow: hidden;
        }
        .pdf-question-text {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .pdf-question-number, .pdf-frequency {
          font-weight: 800;
        }
        .pdf-frequency {
          text-align: right;
        }
        .pdf-solution {
          margin-top: 10px;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 12px;
          background: rgba(255,255,255,0.025);
          color: rgba(255,255,255,0.52);
          font-size: 12px;
        }
        .pdf-solution p {
          margin: 0 0 4px;
          color: rgba(255,255,255,0.28);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .pdf-must-list {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }
        .pdf-must-item {
          display: grid;
          grid-template-columns: 28px 1fr 40px;
          gap: 12px;
          padding: 15px 16px;
          border: 1px solid rgba(245,158,11,0.14);
          border-radius: 16px;
          background: rgba(245,158,11,0.045);
          color: rgba(255,255,255,0.78);
          font-size: 13px;
        }
        .pdf-must-item span, .pdf-must-item strong {
          color: rgb(251,191,36);
          font-weight: 800;
        }
        .pdf-must-item p {
          margin: 5px 0 0;
          color: rgba(255,255,255,0.32);
          font-size: 11px;
        }
        /* ── PDF badges row ── */
        .pdf-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }
        /* ── PDF Skip Strategy ── */
        .pdf-skip-recommended {
          margin-top: 14px;
          padding: 16px 20px;
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.18);
          border-left: 3px solid rgba(245,158,11,0.7);
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .pdf-skip-alternative {
          padding: 16px 20px;
          background: rgba(34,197,94,0.04);
          border: 1px solid rgba(34,197,94,0.12);
          border-left: 3px solid rgba(34,197,94,0.5);
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .pdf-skip-must-not {
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .pdf-skip-tag {
          margin: 0 0 6px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(251,191,36,0.9);
        }
        .pdf-skip-tag-green {
          margin: 0 0 6px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(134,239,172,0.8);
        }
        .pdf-skip-tag-dim {
          margin: 0 0 8px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .pdf-skip-unit {
          margin: 0 0 5px;
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }
        .pdf-skip-reason {
          margin: 0;
          font-size: 12px;
          color: rgba(255,255,255,0.48);
          line-height: 1.5;
        }
        .pdf-skip-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pdf-must-not-pill {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          color: rgb(252,165,165);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
        }
        /* ── PDF Numerical Survival Kit ── */
        .pdf-kit-list {
          margin-top: 14px;
          display: grid;
          gap: 8px;
        }
        .pdf-kit-item {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 12px;
          padding: 13px 16px;
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 12px;
          background: rgba(255,255,255,0.018);
          align-items: start;
        }
        .pdf-kit-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(59,111,212,0.12);
          border: 1px solid rgba(59,111,212,0.28);
          color: rgb(147,180,248);
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pdf-kit-topic {
          margin: 0 0 3px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }
        .pdf-kit-unit {
          margin: 0 0 4px;
          font-size: 10px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .pdf-kit-why {
          margin: 0;
          font-size: 11px;
          color: rgba(255,255,255,0.42);
          line-height: 1.5;
        }
        .pdf-footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.28);
          font-size: 11px;
        }
        .pdf-report .katex {
          color: inherit;
          font-size: 1.02em;
          white-space: normal;
          max-width: 100%;
        }
        .pdf-report .katex-display {
          margin: 8px 0;
          overflow: hidden;
          text-align: left;
          max-width: 100%;
        }
        .pdf-report .katex-display > .katex {
          max-width: 100%;
          overflow: hidden;
        }
        .pdf-report .katex-html {
          max-width: 100%;
        }
        .pdf-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        /* ── Difficulty badge ── */
        .badge-easy   { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.2);  color: rgb(134,239,172); }
        .badge-medium { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); color: rgb(252,211,77); }
        .badge-hard   { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.2);  color: rgb(252,165,165); }

        /* ── ROI badge ── */
        .badge-roi-vh { background: rgba(59,111,212,0.1);   border: 1px solid rgba(59,111,212,0.25);  color: rgb(147,180,248); }
        .badge-roi-h  { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);  color: rgba(255,255,255,0.5); }
        .badge-roi-m  { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.3); }
        .badge-roi-l  { background: rgba(239,68,68,0.05);   border: 1px solid rgba(239,68,68,0.1);   color: rgba(252,165,165,0.5); }

        /* ── Skip strategy card ── */
        .skip-card {
          background: rgba(245,158,11,0.04);
          border: 1px solid rgba(245,158,11,0.12);
          border-left: 3px solid rgba(245,158,11,0.6);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 16px;
        }
        .skip-card-safe {
          background: rgba(34,197,94,0.04);
          border: 1px solid rgba(34,197,94,0.1);
          border-left: 3px solid rgba(34,197,94,0.5);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 16px;
        }
        .must-not-skip-pill {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          color: rgb(252,165,165);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
        }

        /* ── Numerical kit card ── */
        .kit-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          transition: background 0.18s, border-color 0.18s, transform 0.22s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .kit-card:hover {
          background: rgba(59,111,212,0.04);
          border-color: rgba(59,111,212,0.15);
          transform: translate3d(0,-1px,0);
        }
        .kit-number {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(59,111,212,0.12);
          border: 1px solid rgba(59,111,212,0.28);
          color: rgb(147,180,248);
          font-size: 11px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width:640px) {
          .tab-btn { font-size: 0.72rem; padding: 7px 2px; }
        }
      `}</style>

      <div className="pdf-stage" aria-hidden="true">
        <PDFReport data={data} />
      </div>

      <div className="res-bg relative min-h-screen font-body">
        <div className="res-bg fixed inset-0 -z-10" aria-hidden />
        <Navbar />

        <div className="mx-auto max-w-[860px] px-5 pb-32 pt-10 sm:px-8 md:pt-14">

          {/* ── HEADER ── */}
          {mounted && (
            <div className="b-rev bd1 mb-10">
              <p className="mb-3 text-[10px] tracking-wide text-white/22">
                Analysis Complete · {fmt(data.timestamp)} · {data.totalYearsAnalyzed ?? 0} years analyzed
              </p>
              <h1
                className="font-heading font-bold leading-tight tracking-tight text-white"
                style={{ fontSize:"clamp(1.7rem,5vw,2.5rem)", letterSpacing:"-0.01em" }}
              >
                {data.subject ?? "General"}
                <span style={{ color:"rgba(255,255,255,0.22)" }}> — Exam Probables</span>
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

          {/* ── TAB BAR — equal width ── */}
          {mounted && (
            <div className="b-rev bd2 mb-10">
              <div className="tab-bar">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
                    onClick={() => { setActiveTab(t.key); analytics.tabSwitched(t.key); }}
                  >
                    {t.label}
                    {t.count != null && t.count > 0 && (
                      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-400">
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════ UNIT-WISE ════ */}
          {mounted && activeTab === "units" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Unit-wise Probable Questions</p>
              {data.units?.map((unit, idx) => (
                <UnitSection key={unit.unitNumber} unit={unit} idx={idx} />
              ))}
            </div>
          )}

          {/* ════ STRATEGY ════ */}
          {mounted && activeTab === "strategy" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Exam Strategy</p>

              <div className="strat-card mb-14">
                <div className="mb-4 flex items-center gap-2.5">
                  <span>💡</span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-[#3b6fd4]">
                    Recommended Approach
                  </span>
                </div>
                <p className="text-[0.95rem] leading-[1.8] text-white/55">
                  {data.examStrategy ?? "Review high-frequency topics first."}
                </p>
              </div>

              <p className="sec-lbl">Unit Priority Summary</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.units?.map(u => {
                  const up = getP(u.unitPriority ?? u.priority);
                  return (
                    <div key={u.unitNumber} className="unit-card">
                      <div>
                        <p className="mb-1 text-[10px] text-white/20">Unit {u.unitNumber}</p>
                        <p className="text-[0.88rem] font-medium text-white/72 leading-snug">{u.unitTitle}</p>
                        <p className="mt-1.5 text-[10px] text-white/25">
                          {u.probableQuestions?.length ?? 0} questions
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
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

          {/* ════ SKIP PLAN ════ */}
          {mounted && activeTab === "skip" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Unit Skip Strategy</p>

              {data.skipStrategy ? (
                <>
                  <div className="skip-card mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                        Recommended Skip
                      </span>
                    </div>
                    <p className="text-[1rem] font-semibold text-white/85 mb-2">
                      {data.skipStrategy.recommendedSkip}
                    </p>
                    <p className="text-[0.88rem] text-white/45 leading-relaxed">
                      {data.skipStrategy.rationale}
                    </p>
                  </div>

                  <div className="skip-card-safe mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-base">✓</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-400/70">
                        Alternative Skip
                      </span>
                    </div>
                    <p className="text-[1rem] font-semibold text-white/85 mb-2">
                      {data.skipStrategy.alternativeSkip}
                    </p>
                  </div>

                  {data.skipStrategy.mustNotSkip?.length > 0 && (
                    <div className="mb-10">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-red-400/70">
                        Must Not Skip
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data.skipStrategy.mustNotSkip.map((u, i) => (
                          <span key={i} className="must-not-skip-pill">{u}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(data.numericalKit?.length ?? 0) > 0 && (
                    <>
                      <p className="sec-lbl mt-10">Numerical Survival Kit</p>
                      <p className="mb-6 text-[0.88rem] text-white/30 leading-relaxed">
                        Practice exactly these before the exam. Everything else is theory.
                      </p>
                      <div className="space-y-3">
                        {data.numericalKit!.map((item, i) => (
                          <div key={i} className="kit-card">
                            <span className="kit-number">{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.9rem] font-medium text-white/80 mb-1">
                                {item.topic}
                              </p>
                              <p className="text-[11px] text-white/40 leading-relaxed">
                                {item.practice}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-[0.9rem] text-white/28">
                  Skip strategy not available — add more years of papers for better analysis.
                </p>
              )}
            </div>
          )}

          {/* ════ MUST PREPARE ════ */}
          {mounted && activeTab === "hf" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">Must Prepare — High Frequency Questions</p>
              <p className="mb-10 text-[0.88rem] leading-relaxed text-white/30">
                These questions appeared across multiple years.
                Prioritize these above everything else.
              </p>

              {mustPrepare.length > 0 ? (
                <div className="space-y-3">
                  {mustPrepare.map((q, i) => <HFCard key={i} q={q} index={i} />)}
                </div>
              ) : (
                <p className="text-[0.9rem] text-white/28">
                  No repeated questions found — add more years of papers for better results.
                </p>
              )}
            </div>
          )}

        </div>

        {/* ── FLOATING COPY BUTTON ── */}
        <div className="fixed bottom-[74px] right-5 z-40 sm:right-8">
          <button 
            onClick={copyResults}
            className="group flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/10 bg-[#0a1226]/85 backdrop-blur-xl text-white/70 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
            title="Copy Text Format"
          >
            {copied ? <Check size={16} strokeWidth={2.5} className="text-[#3b6fd4]" /> : <Copy size={16} />}
          </button>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="btm-bar fixed bottom-0 left-0 right-0 z-40 flex h-[58px] items-center justify-between px-5 sm:px-8">
          <button className="btn-ghost" onClick={() => navigate("/analyze")}>
            ← Analyze Another
          </button>
          <button className="btn-white" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting PDF..." : "Export as PDF ↓"}
          </button>
        </div>
      </div>
      <FeedbackModal />
    </>
  );
};

export default Results;