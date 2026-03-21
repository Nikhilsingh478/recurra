import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AnalysisLoader from "@/components/AnalysisLoader";
import { toast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";

/* ─────────────────────────────────────────────
   LOADING MESSAGES
───────────────────────────────────────────── */
const LOADING_MESSAGES = [
  "Reading your syllabus...",
  "Scanning question papers...",
  "Mapping repetition patterns...",
  "Ranking by frequency & priority...",
  "Finalizing your exam strategy...",
];

/* prompt moved to api/analyze.ts */

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const Analyze = () => {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState("");
  const [papers, setPapers] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shakeSyllabus, setShakeSyllabus] = useState(false);
  const [shakePapers, setShakePapers] = useState(false);
  const [errSyllabus, setErrSyllabus] = useState(false);
  const [errPapers, setErrPapers] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [s1Focused, setS1Focused] = useState(false);
  const [s2Focused, setS2Focused] = useState(false);
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const bothFilled = syllabus.trim().length > 0 && papers.trim().length > 0;

  const shake = useCallback((field: "syllabus" | "papers") => {
    if (field === "syllabus") {
      setShakeSyllabus(true); setErrSyllabus(true);
      setTimeout(() => setShakeSyllabus(false), 450);
    } else {
      setShakePapers(true); setErrPapers(true);
      setTimeout(() => setShakePapers(false), 450);
    }
  }, []);

  const runAnalysis = async () => {
    if (!syllabus.trim()) { shake("syllabus"); return; }
    if (!papers.trim()) { shake("papers"); return; }

    // ── Input quality validation ──
    const isGarbage = (text: string) => {
      const words = text.trim().split(/\s+/);
      if (words.length < 10) return true;
      if (text.length < 80) return true;
      return false;
    };
    if (isGarbage(syllabus)) {
      shake("syllabus");
      toast({ description: "Please paste a proper unit-wise syllabus with at least a few units.", variant: "destructive" });
      analytics.analysisFailed("invalid_syllabus_input");
      return;
    }
    if (isGarbage(papers)) {
      shake("papers");
      toast({ description: "Please paste at least one full question paper.", variant: "destructive" });
      analytics.analysisFailed("invalid_papers_input");
      return;
    }

    setErrSyllabus(false); setErrPapers(false);
    analytics.analysisStarted();

    setLoading(true);
    setMsgIndex(0);
    setProgress(0);
    setMsgVisible(true);

    const progInterval = setInterval(() =>
      setProgress(w => Math.min(w + 1.2, 88)), 380);

    const msgInterval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
        setMsgVisible(true);
      }, 250);
    }, 2800);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabus: syllabus.trim(),
          papers: papers.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Analysis failed");

      clearInterval(progInterval);
      clearInterval(msgInterval);
      setProgress(100);

      // ── Empty result check ──
      const hasQuestions = result.units?.some((u: any) => u.probableQuestions?.length > 0);
      if (!hasQuestions) {
        clearInterval(progInterval);
        clearInterval(msgInterval);
        setLoading(false);
        toast({ description: "No valid syllabus content found. Please paste a proper unit-wise syllabus.", variant: "destructive" });
        analytics.analysisFailed("empty_result_from_gemini");
        return;
      }
      
      analytics.analysisCompleted(
        result.subject ?? "Unknown",
        result.units?.length ?? 0
      );

      localStorage.setItem("recurra_results", JSON.stringify({
        ...result,
        timestamp: new Date().toISOString(),
        subject: result.subject || "General",
      }));

      setTimeout(() => navigate("/results"), 400);
    } catch (err) {
      console.error(err);
      clearInterval(progInterval);
      clearInterval(msgInterval);
      setLoading(false);
      analytics.analysisFailed(err instanceof Error ? err.message : "unknown_error");
      toast({ description: err instanceof Error ? err.message : "Analysis failed. Please try again.", variant: "destructive" });
    }
  };
  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        /* GPU-composited blur reveal — no jitter */
        @keyframes blurReveal {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translate3d(0, 14px, 0);
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translate3d(0, 0, 0);
          }
        }
        .reveal {
          opacity: 0;
          will-change: opacity, filter, transform;
          animation: blurReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .d1 { animation-delay: 0.08s; }
        .d2 { animation-delay: 0.18s; }
        .d3 { animation-delay: 0.28s; }
        .d4 { animation-delay: 0.36s; }
        .d5 { animation-delay: 0.44s; }
        .d6 { animation-delay: 0.52s; }

        /* Background */
        .az-bg {
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%,   rgba(30, 58, 138, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 90% 100%, rgba(17, 38, 100, 0.12) 0%, transparent 60%),
            #050810;
        }

        /* Top progress bar — GPU only */
        .top-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          z-index: 200;
          transform-origin: left center;
          background: linear-gradient(90deg, #2d5bbf, #6ea0f7, #2d5bbf);
          background-size: 200% 100%;
          animation: barShine 1.8s linear infinite;
          box-shadow: 0 0 12px rgba(59, 111, 212, 0.7);
          will-change: transform;
        }
        @keyframes barShine {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        /* Shake — transform only */
        @keyframes shake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          18%  { transform: translate3d(-7px, 0, 0); }
          36%  { transform: translate3d(6px, 0, 0); }
          54%  { transform: translate3d(-5px, 0, 0); }
          72%  { transform: translate3d(4px, 0, 0); }
          88%  { transform: translate3d(-2px, 0, 0); }
        }
        .do-shake {
          will-change: transform;
          animation: shake 0.44s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        /* Textarea */
        .az-ta {
          width: 100%;
          resize: vertical;
          min-height: 160px;
          background: rgba(255, 255, 255, 0.022);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 16px 18px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.875rem;
          line-height: 1.75;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .az-ta::placeholder { color: rgba(255, 255, 255, 0.15); }
        .az-ta:focus {
          border-color: rgba(59, 111, 212, 0.5);
          background: rgba(59, 111, 212, 0.028);
          box-shadow: 0 0 0 4px rgba(59, 111, 212, 0.07);
        }
        .az-ta.err {
          border-color: rgba(239, 68, 68, 0.4);
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.05);
        }

        /* Stepper */
        .step-line {
          position: absolute;
          left: 11px;
          top: 28px;
          bottom: -20px;
          width: 1px;
          background: linear-gradient(
            to bottom,
            rgba(59, 111, 212, 0.3) 0%,
            rgba(59, 111, 212, 0.03) 85%,
            transparent 100%
          );
        }
        .step-num {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem; font-weight: 600;
          flex-shrink: 0;
          transition: background 0.25s ease, border-color 0.25s ease,
                      color 0.25s ease, box-shadow 0.25s ease;
        }
        .sn-idle   { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: rgba(255,255,255,0.25); }
        .sn-active { background: rgba(59,111,212,0.16);  border: 1px solid rgba(59,111,212,0.45);  color: #93b4f8;
                     box-shadow: 0 0 0 4px rgba(59,111,212,0.07); }
        .sn-done   { background: rgba(59,111,212,0.1);   border: 1px solid rgba(59,111,212,0.28);  color: #5a8ae8; }

        /* Char bar */
        .c-track { height: 2px; width: 64px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .c-fill  {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #3b6fd4, #93b4f8);
          transition: width 0.35s ease;
          will-change: width;
        }

        /* CTA button */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .btn-ready {
          background: linear-gradient(108deg, #fff 35%, #dce8ff 50%, #fff 65%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          color: #050810;
          will-change: transform;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .btn-ready:hover {
          transform: scale(1.012);
          box-shadow: 0 8px 32px rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.35);
        }
        .btn-ready:active  { transform: scale(0.997); }
        .btn-muted { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.22); cursor: not-allowed; }

        /* Loading dots */
        @keyframes ldot {
          0%, 80%, 100% { transform: scale3d(0.55, 0.55, 1); opacity: 0.2; }
          40%            { transform: scale3d(1, 1, 1);       opacity: 1; }
        }
        .ld { display:inline-block; width:5px; height:5px; border-radius:50%; background:currentColor; will-change: transform, opacity; }
        .ld1 { animation: ldot 1.1s ease-in-out infinite 0s; }
        .ld2 { animation: ldot 1.1s ease-in-out infinite 0.17s; }
        .ld3 { animation: ldot 1.1s ease-in-out infinite 0.34s; }

        /* Loading msg */
        @keyframes msgBlurIn {
          from { opacity:0; filter:blur(5px); transform: translate3d(0, 5px, 0); }
          to   { opacity:1; filter:blur(0);   transform: translate3d(0, 0, 0); }
        }
        .msg-in {
          will-change: opacity, filter, transform;
          animation: msgBlurIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .msg-out { opacity: 0; }

        /* Ping */
        @keyframes cpPing {
          75%, 100% { transform: scale(2.1); opacity: 0; }
        }
        .cp-ping { animation: cpPing 1.8s cubic-bezier(0,0,0.2,1) infinite; will-change: transform, opacity; }

        /* Hint cards */
        .hint-card {
          border: 1px solid rgba(255,255,255,0.055);
          background: rgba(255,255,255,0.016);
          border-radius: 14px;
          padding: 15px;
          transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease;
          will-change: transform;
        }
        .hint-card:hover {
          border-color: rgba(59,111,212,0.22);
          background: rgba(59,111,212,0.032);
          transform: translate3d(0, -2px, 0);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .page-heading { font-size: 2rem !important; }
          .page-sub { font-size: 0.9rem !important; }
          .az-ta { font-size: 0.82rem; padding: 14px 15px; }
        }
      `}</style>

      {/* Top progress bar */}
      {loading && (
        <div
          className="top-bar"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      )}

      <div className="az-bg relative min-h-screen font-body">
        <div className="az-bg fixed inset-0 -z-10" aria-hidden />
        <Navbar />

        <div className="mx-auto max-w-[820px] px-5 pb-24 pt-12 sm:px-8 md:pt-20">

          {/* ── Badge ── */}
          {mounted && (
            <div className="reveal d1 mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="cp-ping absolute inline-flex h-full w-full rounded-full bg-[#3b6fd4] opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-[#3b6fd4]" />
              </span>
              <span className="text-[11px] font-medium tracking-wide text-[#8899aa]">
                AI-Powered Exam Analysis
              </span>
            </div>
          )}

          {/* ── Headline ── */}
          {mounted && (
            <div className="reveal d2 mb-5">
              <h1
                className="page-heading font-heading font-bold leading-[1.07] tracking-tight text-white"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)" }}
              >
                Drop Your Material.
                <br />
                <span style={{ color: "rgba(255,255,255,0.32)" }}>Get What Matters.</span>
              </h1>
            </div>
          )}

          {/* ── Subtext ── */}
          {mounted && (
            <div className="reveal d3 mb-12">
              <p className="page-sub max-w-sm text-[0.93rem] leading-relaxed text-[#8899aa]">
                Paste your syllabus and previous year papers.{" "}
                <span className="text-white/40">Recurra</span> maps what repeats and
                surfaces only the questions that actually matter.
              </p>
            </div>
          )}

          {/* ── Stepper ── */}
          {mounted && (
            <div className="reveal d4">

              {/* Step 01 — Syllabus */}
              <div className="relative mb-10 flex gap-4 sm:gap-5">
                <div className="relative flex flex-col items-center">
                  <div className={`step-num ${syllabus.trim() ? "sn-done" : s1Focused ? "sn-active" : "sn-idle"}`}>
                    01
                  </div>
                  <div className="step-line" />
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  {/* Label row */}
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.84rem] font-medium text-white/85">Your Syllabus</span>
                      {errSyllabus && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          required
                        </span>
                      )}
                    </div>
                    {syllabus.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/22">
                          {syllabus.length.toLocaleString()} chars
                        </span>
                        <div className="c-track">
                          <div className="c-fill" style={{ width: `${Math.min((syllabus.length / 3000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mb-2.5 text-[11px] text-white/25">
                    Paste your syllabus structured by units
                  </p>
                  <div className={shakeSyllabus ? "do-shake" : ""}>
                    <textarea
                      value={syllabus}
                      rows={8}
                      onFocus={() => setS1Focused(true)}
                      onBlur={() => setS1Focused(false)}
                      onChange={e => { setSyllabus(e.target.value); setErrSyllabus(false); }}
                      placeholder={
                        "Unit 1 — Data Structures\n" +
                        "Stack, Queue, Linked List, Trees...\n\n" +
                        "Unit 2 — Algorithms\n" +
                        "Sorting, Searching, Complexity...\n\n" +
                        "Unit 3 — ..."
                      }
                      className={`az-ta${errSyllabus ? " err" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Step 02 — Papers */}
              <div className="relative mb-10 flex gap-4 sm:gap-5">
                <div className="flex flex-col items-center">
                  <div className={`step-num ${papers.trim() ? "sn-done" : s2Focused ? "sn-active" : "sn-idle"}`}>
                    02
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  {/* Label row */}
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.84rem] font-medium text-white/85">Previous Year Papers</span>
                      {errPapers && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          required
                        </span>
                      )}
                    </div>
                    {papers.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/22">
                          {papers.length.toLocaleString()} chars
                        </span>
                        <div className="c-track">
                          <div className="c-fill" style={{ width: `${Math.min((papers.length / 8000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mb-2.5 text-[11px] text-white/25">
                    More years = sharper predictions. Paste all you have.
                  </p>
                  <div className={shakePapers ? "do-shake" : ""}>
                    <textarea
                      value={papers}
                      rows={11}
                      onFocus={() => setS2Focused(true)}
                      onBlur={() => setS2Focused(false)}
                      onChange={e => { setPapers(e.target.value); setErrPapers(false); }}
                      placeholder={
                        "2023 Paper:\n" +
                        "Q1. Explain the working of a stack with example.\n" +
                        "Q2. Write an algorithm for binary search...\n\n" +
                        "2022 Paper:\n" +
                        "Q1. What is a linked list? Explain types...\n" +
                        "Q2. Define time complexity and explain Big-O notation..."
                      }
                      className={`az-ta${errPapers ? " err" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          {mounted && (
            <div className="reveal d5">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className={`flex h-[52px] w-full items-center justify-center rounded-full font-heading text-[0.9rem] font-semibold ${bothFilled && !loading ? "btn-ready" : "btn-muted"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-[3px] text-white/40">
                      <span className="ld ld1" />
                      <span className="ld ld2" />
                      <span className="ld ld3" />
                    </span>
                    <span
                      key={msgIndex}
                      className={`text-[0.82rem] text-white/50 ${msgVisible ? "msg-in" : "msg-out"}`}
                    >
                      {LOADING_MESSAGES[msgIndex]}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze & Generate Probables
                    <span>→</span>
                  </span>
                )}
              </button>

              <p className="mt-3 text-center text-[10px] text-white/18">
                {bothFilled
                  ? "Powered by Gemini AI · typically under 20 seconds"
                  : "Complete both fields above to continue"}
              </p>
            </div>
          )}

          {/* ── Hint cards ──
          {mounted && (
            <div className="reveal d6 mt-14 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  sym: "◈",
                  title: "Syllabus-filtered",
                  sub: "Out-of-scope questions stripped out",
                },
                {
                  sym: "◎",
                  title: "Frequency-ranked",
                  sub: "Repeated questions surface first",
                },
                {
                  sym: "◇",
                  title: "High-ROI focus",
                  sub: "Only questions worth your time",
                },
              ].map(c => (
                <div key={c.title} className="hint-card">
                  <span className="mb-2 block text-sm text-[#3b6fd4] opacity-55 transition-opacity duration-200 group-hover:opacity-100">
                    {c.sym}
                  </span>
                  <p className="text-[0.78rem] font-medium text-white/60">{c.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/25">{c.sub}</p>
                </div>
              ))}
            </div>
          )} */}

        </div>
      </div>

      <AnalysisLoader
        visible={loading}
        message={LOADING_MESSAGES[msgIndex]}
        progress={progress}
      />
    </>
  );
};

export default Analyze;