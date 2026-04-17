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
  1: { bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.2)",  color:"rgb(251,191,36)",      dot:"#f59e0b", label:"Rank 1" },
  2: { bg:"rgba(59,111,212,0.09)",  border:"rgba(59,111,212,0.25)", color:"rgb(147,180,248)",     dot:"#3b6fd4", label:"Rank 2"    },
  3: { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)",dot:"rgba(255,255,255,0.18)", label:"Rank 3" },
};
type PKey = keyof typeof P;
const getP = (key?: number | string) => P[(key as PKey) ?? 3] ?? P[3];

const extractBraced = (value: string, start: number) => {
  if (value[start] !== "{") return null;
  let depth = 0;
  for (let i = start; i < value.length; i++) {
    if (value[i] === "{") depth++;
    if (value[i] === "}") depth--;
    if (depth === 0) {
      return {
        content: value.slice(start + 1, i),
        end: i + 1,
      };
    }
  }
  return null;
};

const wrapMathFunctionArgs = (value: string) =>
  value.replace(/\b(sin|cos|tan|log)\s+([A-Za-z](?:\s*[A-Za-z0-9])?)/g, (_match, fn, arg) =>
    `${fn}(${String(arg).replace(/\s+/g, "")})`
  );

const replaceLatexFractions = (input: string): string => {
  let output = input;
  let index = output.indexOf("\\frac");

  while (index !== -1) {
    const numerator = extractBraced(output, index + 5);
    if (!numerator) break;
    const denominator = extractBraced(output, numerator.end);
    if (!denominator) break;

    const cleanNumerator = sanitizeMathForPDF(numerator.content);
    const cleanDenominator = sanitizeMathForPDF(denominator.content);
    const hasCompoundNumerator = /[+\-*/]/.test(cleanNumerator);
    const numeratorText = hasCompoundNumerator ? `(${cleanNumerator})` : cleanNumerator;
    const fraction = hasCompoundNumerator
      ? `${numeratorText} / ${cleanDenominator}`
      : `(${numeratorText} / ${cleanDenominator})`;
    output = output.slice(0, index) + fraction + output.slice(denominator.end);
    index = output.indexOf("\\frac", index + fraction.length);
  }

  return output;
};

const replaceLatexSquareRoots = (input: string): string => {
  let output = input;
  let index = output.indexOf("\\sqrt");

  while (index !== -1) {
    const radicand = extractBraced(output, index + 5);
    if (!radicand) break;
    const replacement = `sqrt(${sanitizeMathForPDF(radicand.content)})`;
    output = output.slice(0, index) + replacement + output.slice(radicand.end);
    index = output.indexOf("\\sqrt", index + replacement.length);
  }

  return output;
};

const sanitizeMathForPDF = (input: string): string => {
  if (!input) return "";

  let output = String(input)
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]*?)\$/g, "$1");

  output = replaceLatexFractions(output);
  output = replaceLatexSquareRoots(output);

  output = output
    .replace(/\\left\\\{/g, "{")
    .replace(/\\right\\\}/g, "}")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\|/g, "|")
    .replace(/\\right\|/g, "|")
    .replace(/\\cdot\b/g, "*")
    .replace(/\\times\b/g, "*")
    .replace(/\\sin\b/g, "sin")
    .replace(/\\cos\b/g, "cos")
    .replace(/\\tan\b/g, "tan")
    .replace(/\\log\b/g, "log")
    .replace(/\\ln\b/g, "ln")
    .replace(/\\exp\b/g, "exp")
    .replace(/\\pi\b/g, "pi")
    .replace(/\\theta\b/g, "theta")
    .replace(/\\alpha\b/g, "alpha")
    .replace(/\\beta\b/g, "beta")
    .replace(/\\gamma\b/g, "gamma")
    .replace(/\\delta\b/g, "delta")
    .replace(/\\lambda\b/g, "lambda")
    .replace(/\\mu\b/g, "mu")
    .replace(/\\infty\b/g, "infinity")
    .replace(/\\leq\b/g, "<=")
    .replace(/\\geq\b/g, ">=")
    .replace(/\\neq\b/g, "!=")
    .replace(/\\to\b/g, "->")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\!/g, "")
    .replace(/\\:/g, " ")
    .replace(/\\\s/g, " ")
    .replace(/([A-Za-z0-9)])_\{([^{}]+)\}/g, "$1$2")
    .replace(/([A-Za-z0-9)])_([A-Za-z0-9])/g, "$1$2")
    .replace(/\^\{([^{}]+)\}/g, "^$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\\/g, "");

  output = wrapMathFunctionArgs(output)
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([({[])\s+/g, "$1")
    .replace(/\s+([)}\]])/g, "$1")
    .replace(/\s*([+\-*/=<>])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();

  return output || String(input).replace(/\\/g, "").trim();
};

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
  const pKey = q.priority ?? (q.isHighFrequency ? 1 : 3);
  const p = getP(pKey);

  return (
    <div
      ref={ref}
      className="q-row group py-4"
      style={rs(visible)}
    >
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
            <MathRenderer
              content={q.question}
              className="text-[0.9rem] leading-[1.7]"
            />
            {q.solution && (
              <div
                className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 text-[0.82rem] leading-[1.75] text-white/55"
              >
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                  Solution
                </p>
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

    const PAGE_W   = 210;
    const ML       = 18;
    const MR       = 18;
    const COL      = PAGE_W - ML - MR;   // 174mm
    const SAFE_BTM = 280;
    let   y        = ML;

    /* ── helpers ── */
    const F = (sz: number, r: number, g: number, b: number, bold = false) => {
      doc.setFontSize(sz);
      doc.setTextColor(r, g, b);
      doc.setFont("helvetica", bold ? "bold" : "normal");
    };

    const need = (mm: number) => {
      if (y + mm > SAFE_BTM) { doc.addPage(); y = ML; }
    };

    const rule = (r = 215, g = 218, b = 224, lw = 0.22) => {
      doc.setDrawColor(r, g, b); doc.setLineWidth(lw);
      doc.line(ML, y, PAGE_W - MR, y); y += 4;
    };

    /* ── header bar ── */
    doc.setFillColor(5, 8, 16);
    doc.rect(0, 0, PAGE_W, 38, "F");
    F(16, 255, 255, 255, true);  doc.text("RECURRA", ML, 14);
    F(8,  136, 153, 170);        doc.text("Exam Pattern Analysis", ML, 22);
    F(7.5,136, 153, 170);
    doc.text(`Generated: ${new Date(data.timestamp ?? "").toLocaleString("en-IN")}`, ML, 30);
    y = 46;

    /* ── subject + stats ── */
    F(18, 10, 14, 28, true);
    const subjLines: string[] = doc.splitTextToSize(sanitizeMathForPDF(data.subject ?? "General"), COL);
    doc.text(subjLines, ML, y);
    y += subjLines.length * 8 + 2;

    F(10, 90, 100, 120);
    doc.text("Exam Probables", ML, y); y += 5;
    rule(200, 205, 215, 0.4);

    F(8.5, 110, 120, 140);
    const totalQ = data.units?.reduce((a, u) => a + (u.probableQuestions?.length ?? 0), 0) ?? 0;
    doc.text(
      `${data.totalYearsAnalyzed ?? 0} years analyzed  |  ${data.units?.length ?? 0} units  |  ${totalQ} questions`,
      ML, y
    );
    y += 12;

    /* ── exam strategy box — measure text FIRST, then draw box ── */
    need(40);

    const STRAT_PAD_X = 6;
    const STRAT_PAD_B = 12;
    const LH_STRAT    = 9 * 0.352 * 1.65; // ~5.2mm — generous to prevent overflow

    const stratW     = COL - STRAT_PAD_X * 2 - 6; // extra 6mm safety so lines wrap before edge
    const stratLines: string[] = doc.splitTextToSize(sanitizeMathForPDF(data.examStrategy ?? ""), stratW);
    const stratBodyH = stratLines.length * LH_STRAT;

    // label = 5mm from top, gap = 4mm, then text starts at 5+4=9mm from top
    const LABEL_Y_OFF  = 5;     // label sits 5mm below box top
    const TEXT_Y_OFF   = 13;    // text starts 13mm below box top (label 5mm + 8mm gap)
    const boxH         = TEXT_Y_OFF + stratBodyH + STRAT_PAD_B;

    doc.setFillColor(236, 242, 255);
    doc.setDrawColor(175, 200, 245); doc.setLineWidth(0.28);
    doc.roundedRect(ML, y, COL, boxH, 2.5, 2.5, "FD");

    const boxTop = y;

    // Label
    F(7, 59, 111, 212, true);
    doc.text("EXAM STRATEGY", ML + STRAT_PAD_X, boxTop + LABEL_Y_OFF);

    // Strategy text — starts below label with clear gap
    F(9, 28, 38, 58);
    stratLines.forEach((line, i) => {
      doc.text(line, ML + STRAT_PAD_X, boxTop + TEXT_Y_OFF + i * LH_STRAT);
    });

    y = boxTop + boxH + 8;

    /* ── high freq topics ── */
    const hfT = data.highFrequencyTopics ?? data.superHighFrequencyTopics ?? [];
    if (hfT.length > 0) {
      need(22);
      F(7, 59, 111, 212, true);
      doc.text("HIGH FREQUENCY TOPICS", ML, y); y += 5.5;

      F(8.5, 50, 58, 78);
      // Safety buffer to guarantee no right-edge overflow even with long unbroken tokens
      const HFT_SAFE_W = COL - 4;
      const SEP = "  |  ";

      // Greedy pack topics into lines that strictly fit within HFT_SAFE_W
      const lines: string[] = [];
      let current = "";
      hfT.forEach((rawTopic) => {
        const topic = sanitizeMathForPDF(String(rawTopic ?? "").trim());
        if (!topic) return;

        // If a single topic is itself too wide, hard-wrap it first
        const pieces: string[] =
          doc.getTextWidth(topic) > HFT_SAFE_W
            ? (doc.splitTextToSize(topic, HFT_SAFE_W) as string[])
            : [topic];

        pieces.forEach((piece, idx) => {
          const sep = current && idx === 0 ? SEP : current ? " " : "";
          const candidate = current ? `${current}${sep}${piece}` : piece;
          if (doc.getTextWidth(candidate) <= HFT_SAFE_W) {
            current = candidate;
          } else {
            if (current) lines.push(current);
            current = piece;
          }
        });
      });
      if (current) lines.push(current);

      doc.text(lines, ML, y);
      y += lines.length * (8.5 * 0.352 * 1.25) + 7;
    }

    /* ── units ── */

    // Layout — numbered prefix max "10. " = ~8mm
    const Q_NUM_W   = 9;    // width reserved for "1." "2." etc.
    const Q_FREQ_W  = 12;   // right side for "2x"
    const Q_GAP     = 2;
    const Q_TEXT_W  = COL - Q_NUM_W - Q_FREQ_W - Q_GAP;  // ~151mm
    const LH_Q      = 9 * 0.352 * 1.3;

    const headerBg: Record<string | number, [number,number,number]> = {
      1: [254, 243, 199],
      2: [218, 232, 253],
      3: [242, 244, 247],
    };
    const headerLabelCol: Record<string | number, [number,number,number]> = {
      1: [148, 90,  8  ],
      2: [45,  100, 200],
      3: [120, 130, 148],
    };
    const qTextCol: Record<string | number, [number,number,number]> = {
      1: [8,   8,   8  ],
      2: [32,  42,  62 ],
      3: [138, 146, 158],
    };
    const qNumCol: Record<string | number, [number,number,number]> = {
      1: [148, 90,  8  ],
      2: [45,  100, 200],
      3: [158, 162, 172],
    };
    const qFreqCol: Record<string | number, [number,number,number]> = {
      1: [148, 90,  8  ],
      2: [45,  100, 200],
      3: [158, 162, 172],
    };

    data.units?.forEach((u) => {
      need(34);

      const pKey = (u.unitPriority ?? u.priority ?? 3) as number;
      const bg   = headerBg[pKey]       ?? [242, 244, 247];
      const lc   = headerLabelCol[pKey] ?? [120, 130, 148];

      // Unit header — 18mm
      const HDR_H = 18;
      doc.setFillColor(...bg);
      doc.roundedRect(ML, y, COL, HDR_H, 2, 2, "F");

      F(6.5, ...lc, true);
      doc.text(`UNIT ${u.unitNumber}`, ML + 4, y + 5);
      doc.text(`Rank ${pKey}`, PAGE_W - MR - 3, y + 5, { align: "right" });

      F(10, 10, 14, 28, true);
      const titleLines: string[] = doc.splitTextToSize(sanitizeMathForPDF(u.unitTitle ?? ""), COL - 25);
      doc.text(titleLines[0], ML + 4, y + 13);
      y += HDR_H + 3;

      // Topics
      if (u.topTopics?.length > 0) {
        need(10);
        const topStr = u.topTopics.map((topic) => sanitizeMathForPDF(topic)).filter(Boolean).join("  |  ");
        F(7.5, 128, 138, 152);
        const tLines: string[] = doc.splitTextToSize(topStr, COL);
        doc.text(tLines, ML, y);
        y += tLines.length * 3.8 + 4;
      }

      // Questions — numbered 1. 2. 3. ...
      u.probableQuestions?.forEach((q, qIdx) => {
        const qpKey  = q.priority ?? (q.isHighFrequency ? 1 : 3);
        const numStr = `${qIdx + 1}.`;

        const qLines: string[] = doc.splitTextToSize(sanitizeMathForPDF(q.question), Q_TEXT_W);
        const rowH = qLines.length * LH_Q + 2;
        need(rowH + 5);

        // Number — coloured by priority
        F(8.5, ...(qNumCol[qpKey] ?? [158, 162, 172]), true);
        doc.text(numStr, ML, y);

        // Question text — bold for HIGHEST
        F(8.5, ...(qTextCol[qpKey] ?? [138, 146, 158]), qpKey === 1);
        doc.text(qLines, ML + Q_NUM_W, y);

        // Frequency — right aligned, pinned to first line
        F(8, ...(qFreqCol[qpKey] ?? [158, 162, 172]), true);
        doc.text(`${q.frequency}x`, PAGE_W - MR, y, { align: "right" });

        y += rowH;

        // Thin separator
        doc.setDrawColor(218, 222, 228); doc.setLineWidth(0.15);
        doc.line(ML + Q_NUM_W, y, PAGE_W - MR, y);
        y += 3;
      });

      y += 5;
    });

    /* ── must prepare ── */
    const hfQraw = data.highFrequencyQuestions ??
      (data.units?.flatMap(u =>
        (u.probableQuestions ?? [])
          .filter(q => q.frequency >= 2)
          .map(q => ({
            question: sanitizeMathForPDF(q.question),
            frequency: q.frequency,
            unit: sanitizeMathForPDF(u.unitTitle),
          }))
      ) ?? []).sort((a, b) => b.frequency - a.frequency);

    if (hfQraw.length > 0) {
      need(26);

      doc.setFillColor(255, 247, 222);
      doc.setDrawColor(228, 192, 135); doc.setLineWidth(0.28);
      doc.roundedRect(ML, y, COL, 12, 2, 2, "FD");
      F(7.5, 148, 90, 8, true);
      doc.text("MUST PREPARE — HIGH FREQUENCY QUESTIONS", ML + 5, y + 7.5);
      y += 16;

      hfQraw.forEach((q, qIdx) => {
        const qLines: string[] = doc.splitTextToSize(sanitizeMathForPDF(q.question), Q_TEXT_W);
        const rowH = qLines.length * LH_Q + 2;
        need(rowH + 12);

        // Number
        F(8.5, 148, 90, 8, true);
        doc.text(`${qIdx + 1}.`, ML, y);

        // Question text
        F(8.5, 8, 8, 8, true);
        doc.text(qLines, ML + Q_NUM_W, y);

        // Frequency
        F(8, 148, 90, 8, true);
        doc.text(`${q.frequency}x`, PAGE_W - MR, y, { align: "right" });

        y += rowH;

        // Unit name
        F(7.5, 148, 156, 168);
        doc.text(sanitizeMathForPDF(q.unit ?? ""), ML + Q_NUM_W, y);
        y += 5.5;

        // Separator
        doc.setDrawColor(232, 206, 165); doc.setLineWidth(0.15);
        doc.line(ML + Q_NUM_W, y, PAGE_W - MR, y);
        y += 3;
      });
    }

    /* ── footer — every page ── */
    const pc = doc.getNumberOfPages();
    for (let i = 1; i <= pc; i++) {
      doc.setPage(i);
      doc.setDrawColor(208, 212, 220); doc.setLineWidth(0.18);
      doc.line(ML, 287, PAGE_W - MR, 287);
      F(7, 178, 183, 193);
      doc.text("Generated by Recurra", ML, 292);
      doc.text(`${i} / ${pc}`, PAGE_W - MR, 292, { align: "right" });
    }

    doc.save(`${sanitizeMathForPDF(data.subject ?? "recurra").replace(/\s+/g, "_")}_exam_probables.pdf`);

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