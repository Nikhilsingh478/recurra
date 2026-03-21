import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedbackModal from "@/components/FeedbackModal";

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
  HIGHEST: { bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.2)",  color:"rgb(251,191,36)",      dot:"#f59e0b", label:"HIGHEST" },
  HIGH:    { bg:"rgba(59,111,212,0.09)",  border:"rgba(59,111,212,0.25)", color:"rgb(147,180,248)",     dot:"#3b6fd4", label:"HIGH"    },
  MEDIUM:  { bg:"rgba(59,111,212,0.09)",  border:"rgba(59,111,212,0.25)", color:"rgb(147,180,248)",     dot:"#3b6fd4", label:"MEDIUM"  },
  LOW:     { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)",dot:"rgba(255,255,255,0.18)", label:"LOW" },
};
type PKey = keyof typeof P;
const getP = (key?: string) => P[(key as PKey) ?? "LOW"] ?? P.LOW;

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
   QUESTION ROW
───────────────────────────────────────────── */
const QuestionRow = ({ q, index }: { q: ProbableQuestion; index: number }) => {
  const { ref, visible } = useReveal(index * 45);
  const pKey = q.priority ?? (q.isHighFrequency ? "HIGHEST" : "LOW");
  const p = getP(pKey);

  return (
    <div
      ref={ref}
      className="q-row group flex items-start justify-between gap-5 py-4"
      style={rs(visible)}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        {pKey === "HIGHEST" ? (
          <span className="mt-0.5 shrink-0 text-sm leading-none">🔥</span>
        ) : pKey === "HIGH" ? (
          <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.dot }} />
        ) : (
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        )}
        <span
          className="text-[0.9rem] leading-[1.7]"
          style={{
            color: pKey === "HIGHEST" ? "rgba(255,255,255,0.88)"
                 : pKey === "HIGH"    ? "rgba(255,255,255,0.62)"
                 :                      "rgba(255,255,255,0.38)",
          }}
        >
          {q.question}
        </span>
      </div>
      <span
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
        style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}
      >
        {q.frequency}×
      </span>
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
          <p className="text-[0.9rem] leading-[1.7] text-white/85">{q.question}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background:"rgba(245,158,11,0.09)", border:"1px solid rgba(245,158,11,0.22)", color:"rgb(251,191,36)" }}
        >
          {q.frequency}×
        </span>
      </div>
      <p className="mt-2 text-[11px] text-white/28">{q.unit}</p>
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

/* ─────────────────────────────────────────────
   PDF EXPORT — fixed version
   Drop this entire function into Results.tsx
   replacing the existing exportPDF function
───────────────────────────────────────────── */

const exportPDF = async (data: RecurraResults) => {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const W        = 210;
    const margin   = 16;           // left/right margin
    const colW     = W - margin * 2;  // 178mm usable width
    const freqW    = 10;           // reserved width on right for "2x", "3x"
    const prefixW  = 8;            // reserved width on left for "[!!] " etc.
    const textW    = colW - prefixW - freqW - 4; // actual question text width
    let y = margin;

    /* ── safe page break ── */
    const checkPage = (needed = 18) => {
      if (y + needed > 284) {
        doc.addPage();
        y = margin;
      }
    };

    /* ── thin divider line ── */
    const hLine = (
      r = 210, g = 215, b = 225,
      lw = 0.25,
      x1 = margin, x2 = W - margin
    ) => {
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(lw);
      doc.line(x1, y, x2, y);
      y += 4;
    };

    /* ── set font helper ── */
    const setFont = (
      size: number,
      r: number, g: number, b: number,
      bold = false
    ) => {
      doc.setFontSize(size);
      doc.setTextColor(r, g, b);
      doc.setFont("helvetica", bold ? "bold" : "normal");
    };

    /* ─────────────────────────────────────────
       HEADER BAR — dark branded
    ───────────────────────────────────────── */
    doc.setFillColor(5, 8, 16);
    doc.rect(0, 0, W, 36, "F");

    setFont(15, 255, 255, 255, true);
    doc.text("RECURRA", margin, 13);

    setFont(8, 136, 153, 170, false);
    doc.text("Exam Pattern Analysis", margin, 21);
    doc.text(
      `Generated: ${new Date(data.timestamp ?? "").toLocaleString("en-IN")}`,
      margin, 28
    );

    y = 44;

    /* ─────────────────────────────────────────
       SUBJECT HEADING
    ───────────────────────────────────────── */
    setFont(18, 10, 14, 28, true);
    doc.text(data.subject ?? "General", margin, y);
    y += 7;

    setFont(10, 90, 100, 120, false);
    doc.text("Exam Probables", margin, y);
    y += 5;

    hLine(200, 205, 215, 0.4);

    setFont(8.5, 110, 120, 140, false);
    doc.text(
      `${data.totalYearsAnalyzed ?? 0} years analyzed  |  ` +
      `${data.units?.length ?? 0} units  |  ` +
      `${data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0) ?? 0} questions`,
      margin, y
    );
    y += 11;

    /* ─────────────────────────────────────────
       EXAM STRATEGY BOX
       Fix: measure text height FIRST, then draw box
    ───────────────────────────────────────── */
    checkPage(36);

    const stratText  = data.examStrategy ?? "";
    /* use colW - 12 for text inside box (6mm padding each side) */
    const stratLines = doc.splitTextToSize(stratText, colW - 12);
    /* line height for 9pt = ~4.2mm per line */
    const stratBodyH = stratLines.length * 4.4;
    /* total box height: 7mm label area + body + 8mm padding */
    const stratBoxH  = stratBodyH + 17;

    doc.setFillColor(237, 242, 255);
    doc.roundedRect(margin, y - 3, colW, stratBoxH, 3, 3, "F");
    doc.setDrawColor(180, 200, 245);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 3, colW, stratBoxH, 3, 3, "S");

    setFont(7, 59, 111, 212, true);
    doc.text("EXAM STRATEGY", margin + 5, y + 3);
    y += 9;

    setFont(9, 30, 40, 60, false);
    doc.text(stratLines, margin + 6, y);
    y += stratBodyH + 8;

    /* ─────────────────────────────────────────
       HIGH FREQUENCY TOPICS
    ───────────────────────────────────────── */
    const hfT = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
    if (hfT.length > 0) {
      checkPage(20);

      setFont(7, 59, 111, 212, true);
      doc.text("HIGH FREQUENCY TOPICS", margin, y);
      y += 5;

      const topicsStr   = hfT.join("  |  ");
      const topicsLines = doc.splitTextToSize(topicsStr, colW);
      setFont(8.5, 50, 60, 80, false);
      doc.text(topicsLines, margin, y);
      y += topicsLines.length * 4.2 + 9;
    }

    /* ─────────────────────────────────────────
       UNITS
    ───────────────────────────────────────── */
    data.units?.forEach((u) => {
      checkPage(30);

      const pKey = (u.unitPriority ?? u.priority ?? "LOW") as string;

      const headerBg: Record<string, [number,number,number]> = {
        HIGHEST: [254, 243, 199],
        HIGH:    [219, 234, 254],
        MEDIUM:  [219, 234, 254],
        LOW:     [243, 244, 246],
      };
      const labelCol: Record<string, [number,number,number]> = {
        HIGHEST: [155, 95,  10 ],
        HIGH:    [59,  111, 212],
        MEDIUM:  [59,  111, 212],
        LOW:     [120, 130, 150],
      };

      /* Unit header box — fixed 16mm height */
      doc.setFillColor(...(headerBg[pKey] ?? [243, 244, 246]));
      doc.roundedRect(margin, y - 2, colW, 16, 2, 2, "F");

      /* UNIT N label — left */
      setFont(7, ...(labelCol[pKey] ?? [120, 130, 150]), true);
      doc.text(`UNIT ${u.unitNumber}`, margin + 4, y + 3);

      /* Priority label — right */
      doc.text(pKey, W - margin - 3, y + 3, { align: "right" });

      /* Unit title — left, below label */
      setFont(10, 10, 14, 28, true);
      /* truncate long titles to fit */
      const titleLines = doc.splitTextToSize(u.unitTitle ?? "", colW - 30);
      doc.text(titleLines[0], margin + 4, y + 11); // only first line in header
      y += 20;

      /* Topics row */
      if (u.topTopics?.length > 0) {
        const topicsStr   = u.topTopics.join("  |  ");
        const tLines      = doc.splitTextToSize(topicsStr, colW);
        setFont(7.5, 130, 140, 155, false);
        doc.text(tLines, margin, y);
        y += tLines.length * 3.8 + 4;
      }

      /* ── Questions ── */
      u.probableQuestions?.forEach((q) => {
        checkPage(12);

        const qpKey  = q.priority ?? (q.isHighFrequency ? "HIGHEST" : "LOW");
        const prefix = qpKey === "HIGHEST" ? "[!!]"
                     : qpKey === "HIGH"    ? "[>] "
                     :                       "[ ] ";

        const qTextCol: Record<string, [number,number,number]> = {
          HIGHEST: [10,  10,  10 ],
          HIGH:    [35,  45,  65 ],
          MEDIUM:  [35,  45,  65 ],
          LOW:     [140, 148, 160],
        };
        const qFreqCol: Record<string, [number,number,number]> = {
          HIGHEST: [155, 95,  10 ],
          HIGH:    [59,  111, 212],
          MEDIUM:  [59,  111, 212],
          LOW:     [160, 165, 175],
        };

        /*
          Layout per question row:
          [prefix]  [question text ................]  [Nx]
          margin+0  margin+prefixW                    W-margin-freqW

          textW = colW - prefixW - freqW - 4
          This guarantees frequency badge never overlaps text
        */
        const qLines = doc.splitTextToSize(q.question, textW);
        const rowH   = qLines.length * 4.4 + 2;

        checkPage(rowH + 4);

        /* Prefix */
        setFont(8.5, ...(qTextCol[qpKey] ?? [140, 148, 160]),
          qpKey === "HIGHEST");
        doc.text(prefix, margin, y);

        /* Question text — starts after prefix */
        doc.text(qLines, margin + prefixW, y);

        /* Frequency badge — right aligned, pinned to first line */
        setFont(8, ...(qFreqCol[qpKey] ?? [160, 165, 175]), true);
        doc.text(`${q.frequency}x`, W - margin, y, { align: "right" });

        y += rowH;

        /* thin separator */
        doc.setDrawColor(220, 224, 230);
        doc.setLineWidth(0.18);
        doc.line(margin + prefixW, y, W - margin, y);
        y += 3;
      });

      y += 4; // gap after unit
    });

    /* ─────────────────────────────────────────
       MUST PREPARE SECTION
    ───────────────────────────────────────── */
    const hfQ = data.highFrequencyQuestions ??
      (data.units?.flatMap(u =>
        (u.probableQuestions ?? [])
          .filter(q => q.frequency >= 2)
          .map(q => ({
            question:  q.question,
            frequency: q.frequency,
            unit:      u.unitTitle,
          }))
      ) ?? []).sort((a, b) => b.frequency - a.frequency);

    if (hfQ.length > 0) {
      checkPage(24);

      /* Section header box */
      doc.setFillColor(255, 247, 224);
      doc.setDrawColor(230, 195, 140);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 3, colW, 11, 2, 2, "FD");

      setFont(7.5, 155, 95, 10, true);
      doc.text("MUST PREPARE — HIGH FREQUENCY QUESTIONS", margin + 5, y + 4);
      y += 14;

      hfQ.forEach((q) => {
        const qLines = doc.splitTextToSize(q.question, textW);
        const rowH   = qLines.length * 4.4 + 2;

        checkPage(rowH + 10);

        /* [!!] prefix */
        setFont(8.5, 10, 10, 10, true);
        doc.text("[!!]", margin, y);

        /* Question text */
        doc.text(qLines, margin + prefixW, y);

        /* Frequency */
        setFont(8, 155, 95, 10, true);
        doc.text(`${q.frequency}x`, W - margin, y, { align: "right" });

        y += rowH;

        /* Unit name below question */
        setFont(7.5, 150, 158, 170, false);
        doc.text(q.unit ?? "", margin + prefixW, y);
        y += 5;

        /* separator */
        doc.setDrawColor(235, 210, 170);
        doc.setLineWidth(0.18);
        doc.line(margin + prefixW, y, W - margin, y);
        y += 3;
      });
    }

    /* ─────────────────────────────────────────
       FOOTER — on every page
    ───────────────────────────────────────── */
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(210, 215, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 288, W - margin, 288);

      setFont(7, 180, 185, 195, false);
      doc.text("Generated by Recurra", margin, 292);
      doc.text(`${i} / ${pageCount}`, W - margin, 292, { align: "right" });
    }

    doc.save(
      `${(data.subject ?? "recurra").replace(/\s+/g, "_")}_exam_probables.pdf`
    );

  } catch (err) {
    console.error("PDF export failed:", err);
    alert("PDF export failed. Make sure jspdf is installed: npm install jspdf");
  }
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

  const handleExport = async () => {
    if (!data || exporting) return;
    setExporting(true);
    await exportPDF(data);
    setExporting(false);
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

        @media (max-width:640px) {
          .tab-btn { font-size: 0.72rem; padding: 7px 2px; }
        }
      `}</style>

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
                    onClick={() => setActiveTab(t.key)}
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

          {/* ════ TOPICS ════ */}
          {mounted && activeTab === "topics" && (
            <div className="b-rev bd3">
              <p className="sec-lbl">High Frequency Topics</p>

              {hfTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {hfTopics.map((t, i) => <span key={i} className="hft-pill">{t}</span>)}
                </div>
              ) : (
                <p className="text-[0.9rem] text-white/28">
                  No high-frequency topics detected — try adding more years of papers.
                </p>
              )}

              {data.units?.some(u => u.topTopics?.length > 0) && (
                <div className="mt-14">
                  <p className="sec-lbl">Topics by Unit</p>
                  <div className="space-y-8">
                    {data.units?.map(u =>
                      u.topTopics?.length > 0 ? (
                        <div key={u.unitNumber}>
                          <p className="mb-3 text-[0.82rem] font-medium text-white/38">
                            Unit {u.unitNumber} — {u.unitTitle}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {u.topTopics.map((t, i) => (
                              <span key={i} className="topic-pill rounded-full px-3 py-1 text-[11px] text-white/35">{t}</span>
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