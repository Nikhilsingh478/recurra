import { useEffect, useState } from "react";
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

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RecurraResults | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("recurra_results");
    if (!raw) {
      navigate("/analyze");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      navigate("/analyze");
    }
  }, [navigate]);

  const copyToClipboard = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`${data.subject} — Exam Probables`);
    lines.push(`Analysis Complete · ${data.totalYearsAnalyzed} years analyzed`);
    lines.push("");
    lines.push("Exam Strategy:");
    lines.push(data.examStrategy);
    lines.push("");
    lines.push("Super High-Frequency Topics:");
    lines.push(data.superHighFrequencyTopics.join(", "));
    lines.push("");
    data.units.forEach((u) => {
      lines.push(`UNIT ${u.unitNumber}: ${u.unitTitle}`);
      lines.push(`Priority: ${u.priority}`);
      lines.push("Key Topics: " + u.topTopics.join(", "));
      lines.push("");
      u.probableQuestions.forEach((q) => {
        lines.push(`${q.isHighFrequency ? "🔥" : "·"} ${q.question} (appeared ${q.frequency}x)`);
      });
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#050810] font-body">
      <div className="analyze-bg fixed inset-0 -z-10" aria-hidden />

      <Navbar />

      <div
        className="mx-auto max-w-[800px] px-6 pb-32 pt-12 md:pt-16"
        style={{ animation: "results-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Results header */}
        <div
          className="results-enter mb-8"
          style={{ animationDelay: "0ms" }}
        >
          <p className="mb-2 font-body text-sm text-[#8899aa]">
            Analysis Complete · {formatTimestamp(data.timestamp)} · {data.totalYearsAnalyzed ?? 0} years analyzed
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {data.subject ?? "General"} — Exam Probables
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-body text-sm text-white">
              🔥 {data.superHighFrequencyTopics?.length ?? 0} Super High-Frequency Topics
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-body text-sm text-white">
              📋 {data.units?.length ?? 0} Units Analyzed
            </span>
          </div>
        </div>

        {/* Exam strategy banner */}
        <div
          className="results-enter mb-10 rounded-lg border-l-4 border-[#3b6fd4] bg-white/[0.04] p-6"
          style={{ animationDelay: "100ms" }}
        >
          <p className="mb-2 font-heading text-sm font-semibold text-white">💡 Exam Strategy</p>
          <p className="font-body text-[#8899aa]">{data.examStrategy ?? "Review high-frequency topics first."}</p>
        </div>

        {/* Super high frequency */}
        {data.superHighFrequencyTopics?.length > 0 && (
          <div
            className="results-enter mb-12"
            style={{ animationDelay: "150ms" }}
          >
            <p className="mb-4 font-body text-sm font-medium text-[#8899aa]">
              🔥 Must Prepare — Super High Frequency
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.superHighFrequencyTopics.map((t, i) => (
                <span
                  key={i}
                  className="shrink-0 rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-2 font-body text-sm font-medium text-amber-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Units */}
        {data.units?.map((unit, idx) => (
          <div
            key={unit.unitNumber}
            className="results-enter mb-12"
            style={{ animationDelay: `${150 + (idx + 1) * 50}ms` }}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-wider text-[#8899aa]">
                  UNIT {unit.unitNumber}
                </p>
                <h2 className="font-heading text-lg font-semibold text-white">{unit.unitTitle}</h2>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 font-body text-xs font-medium ${
                  unit.priority === "HIGH"
                    ? "bg-red-500/15 text-amber-400 border border-amber-500/40"
                    : unit.priority === "MEDIUM"
                      ? "bg-[#3b6fd4]/15 text-blue-300 border border-[#3b6fd4]/40"
                      : "border border-white/20 bg-white/[0.04] text-[#8899aa]"
                }`}
              >
                {unit.priority} PRIORITY
              </span>
            </div>
            <div className="mb-4 h-px bg-white/[0.07]" />

            <div className="mb-4">
              <p className="mb-2 font-body text-xs text-[#8899aa]">Key Topics:</p>
              <div className="flex flex-wrap gap-2">
                {unit.topTopics?.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-body text-xs text-[#8899aa]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-0">
              {unit.probableQuestions?.map((q, i) => (
                <div
                  key={i}
                  className="group flex items-start justify-between gap-4 border-b border-white/[0.04] py-4 transition-colors duration-150 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="mr-2">{q.isHighFrequency ? "🔥" : "·"}</span>
                    <span
                      className={q.isHighFrequency ? "text-white" : "text-white/75"}
                    >
                      {q.question}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 font-body text-xs ${
                      q.isHighFrequency ? "text-amber-400" : "text-[#8899aa]"
                    }`}
                  >
                    appeared {q.frequency}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-t border-white/[0.07] px-6 backdrop-blur-xl"
        style={{ background: "rgba(5, 8, 16, 0.85)" }}
      >
        <button
          onClick={() => navigate("/analyze")}
          className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
        >
          ← Analyze Another Subject
        </button>
        <button
          onClick={copyToClipboard}
          className="rounded-full bg-white px-5 py-2.5 font-body text-sm font-medium text-[#050810] transition-opacity hover:opacity-90"
        >
          {copied ? "Copied ✓" : "Copy Results"}
        </button>
      </div>
    </div>
  );
};

export default Results;
