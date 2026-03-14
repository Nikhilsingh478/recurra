import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

const LOADING_MESSAGES = [
  "Reading your syllabus...",
  "Identifying question patterns...",
  "Analyzing repetition frequency...",
  "Generating high-probability questions...",
  "Finalizing your exam strategy...",
];

const ANALYSIS_PROMPT = `You are an expert exam analyst. You will be given a university syllabus and previous year question papers.

Your task is to:
1. Filter only questions that are relevant to the provided syllabus
2. Identify which topics and questions repeat across years
3. Generate high-probability exam questions unit-wise
4. Count how many times each topic appeared across all papers

Return your response ONLY as a valid JSON object. No markdown. No explanation. No backticks.

The JSON structure must be exactly:
{
  "subject": "detected subject name or General",
  "totalYearsAnalyzed": 0,
  "units": [
    {
      "unitNumber": 1,
      "unitTitle": "unit title from syllabus",
      "priority": "HIGH",
      "probableQuestions": [
        {
          "question": "question text",
          "frequency": 0,
          "isHighFrequency": false
        }
      ],
      "topTopics": ["topic1", "topic2", "topic3"]
    }
  ],
  "examStrategy": "2-3 sentence overall strategy tip",
  "superHighFrequencyTopics": ["topic1", "topic2"]
}

Rules:
- Maximum 10 probable questions per unit
- Only include questions relevant to the syllabus
- isHighFrequency = true if frequency >= 3
- Priority HIGH if unit has 3+ high frequency questions
- Priority MEDIUM if 1-2 high frequency questions
- Priority LOW otherwise
- Keep question text concise and clear

SYLLABUS:
{{SYLLABUS}}

PREVIOUS YEAR PAPERS:
{{PAPERS}}`;

const Analyze = () => {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState("");
  const [papers, setPapers] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeSyllabus, setShakeSyllabus] = useState(false);
  const [shakePapers, setShakePapers] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [errorSyllabus, setErrorSyllabus] = useState(false);
  const [errorPapers, setErrorPapers] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [syllabusFocused, setSyllabusFocused] = useState(false);
  const [papersFocused, setPapersFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const syllabusCount = syllabus.length;
  const papersCount = papers.length;
  const bothFilled = syllabus.trim().length > 0 && papers.trim().length > 0;

  const triggerShake = (field: "syllabus" | "papers") => {
    if (field === "syllabus") {
      setShakeSyllabus(true);
      setErrorSyllabus(true);
      setTimeout(() => setShakeSyllabus(false), 400);
    } else {
      setShakePapers(true);
      setErrorPapers(true);
      setTimeout(() => setShakePapers(false), 400);
    }
  };

  const runAnalysis = async () => {
    if (!syllabus.trim()) { triggerShake("syllabus"); return; }
    if (!papers.trim()) { triggerShake("papers"); return; }
    setErrorSyllabus(false);
    setErrorPapers(false);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast({ description: "API key not configured. Please add VITE_GEMINI_API_KEY to .env", variant: "destructive" });
      return;
    }

    setLoading(true);
    setLoadingMessageIndex(0);
    setProgressWidth(0);

    const progressInterval = setInterval(() => {
      setProgressWidth((w) => Math.min(w + 1.4, 88));
    }, 400);
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2600);

    const prompt = ANALYSIS_PROMPT
      .replace("{{SYLLABUS}}", syllabus.trim())
      .replace("{{PAPERS}}", papers.trim());

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 14000 },
          }),
        }
      );

      const data = await res.json();
      console.log("API Response:", data);
      if (!res.ok) { console.error("API Error:", data); throw new Error(`API error: ${res.status}`); }

      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgressWidth(100);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response from API");

      const jsonStr = text.replace(/^```json\s*|\s*```$/g, "").trim();
      const result = JSON.parse(jsonStr);

      localStorage.setItem("recurra_results", JSON.stringify({
        ...result,
        timestamp: new Date().toISOString(),
        subject: result.subject || "General",
      }));

      setTimeout(() => navigate("/results"), 500);
    } catch (err) {
      console.error("Caught error:", err);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setLoading(false);
      toast({ description: "Analysis failed. Please check your inputs and try again.", variant: "destructive" });
    }
  };

  return (
    <>
      <style>{`
        /* ── Blur-in reveal (Copilot style) ── */
        @keyframes blurReveal {
          from { opacity: 0; filter: blur(14px); transform: translateY(12px); }
          to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
        }
        .reveal {
          opacity: 0;
          animation: blurReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.17s; }
        .d3 { animation-delay: 0.29s; }
        .d4 { animation-delay: 0.38s; }
        .d5 { animation-delay: 0.47s; }
        .d6 { animation-delay: 0.56s; }

        /* ── Ambient background ── */
        .az-bg {
          background:
            radial-gradient(ellipse 65% 45% at 12% 8%,  rgba(28, 55, 130, 0.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 38% at 88% 88%, rgba(15, 35, 95,  0.15) 0%, transparent 65%),
            #050810;
        }

        /* ── Top progress bar ── */
        .top-bar {
          position: fixed;
          top: 0; left: 0;
          height: 1.5px;
          z-index: 100;
          background: linear-gradient(90deg, #3b6fd4, #93b4f8, #3b6fd4);
          background-size: 200% 100%;
          animation: topBarMove 1.6s linear infinite;
          transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(59,111,212,0.75), 0 0 24px rgba(59,111,212,0.3);
        }
        @keyframes topBarMove {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        /* ── Shake ── */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%  { transform: translateX(-7px); }
          30%  { transform: translateX(6px); }
          45%  { transform: translateX(-5px); }
          60%  { transform: translateX(4px); }
          75%  { transform: translateX(-3px); }
        }
        .do-shake { animation: shake 0.42s cubic-bezier(.36,.07,.19,.97) both; }

        /* ── Textarea ── */
        .az-ta {
          width: 100%;
          resize: vertical;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px 20px;
          color: rgba(255,255,255,0.88);
          font-size: 0.875rem;
          line-height: 1.75;
          font-family: inherit;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
          outline: none;
        }
        .az-ta::placeholder { color: rgba(255,255,255,0.16); }
        .az-ta:focus {
          border-color: rgba(59,111,212,0.5);
          background: rgba(59,111,212,0.03);
          box-shadow: 0 0 0 4px rgba(59,111,212,0.07), inset 0 1px 3px rgba(0,0,0,0.3);
        }
        .az-ta.az-err {
          border-color: rgba(239,68,68,0.4);
          box-shadow: 0 0 0 4px rgba(239,68,68,0.05);
        }

        /* ── Stepper connector ── */
        .s-line {
          position: absolute;
          left: 11px;
          top: 30px;
          bottom: -24px;
          width: 1px;
          background: linear-gradient(to bottom, rgba(59,111,212,0.35), rgba(59,111,212,0.04) 90%, transparent);
        }

        /* ── Step badge ── */
        .s-badge {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem; font-weight: 600; flex-shrink: 0;
          transition: all 0.3s ease;
          margin-top: 2px;
        }
        .s-idle   { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.28); }
        .s-active { background: rgba(59,111,212,0.18);  border: 1px solid rgba(59,111,212,0.45); color: #7ba4f0; box-shadow: 0 0 10px rgba(59,111,212,0.22); }
        .s-done   { background: rgba(59,111,212,0.12);  border: 1px solid rgba(59,111,212,0.3);  color: #3b6fd4; }

        /* ── Char micro bar ── */
        .c-track { height: 2px; width: 72px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .c-fill  { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #3b6fd4, #7ba4f0); transition: width 0.3s ease; }

        /* ── Button ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .btn-on {
          background: linear-gradient(105deg, #ffffff 36%, #d4e0ff 50%, #ffffff 64%);
          background-size: 200% auto;
          animation: shimmer 2.8s linear infinite;
          color: #050810;
          box-shadow: 0 0 0 0 rgba(255,255,255,0);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .btn-on:hover {
          transform: scale(1.013);
          box-shadow: 0 6px 36px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4);
        }
        .btn-on:active { transform: scale(0.996); }
        .btn-off { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2); cursor: not-allowed; }

        /* ── Dot loader ── */
        @keyframes dpulse {
          0%,80%,100% { transform: scale(0.55); opacity: 0.25; }
          40%          { transform: scale(1);    opacity: 1; }
        }
        .dp { display:inline-block; width:5px; height:5px; border-radius:50%; background:currentColor; }
        .dp1 { animation: dpulse 1.1s ease-in-out infinite 0s; }
        .dp2 { animation: dpulse 1.1s ease-in-out infinite 0.18s; }
        .dp3 { animation: dpulse 1.1s ease-in-out infinite 0.36s; }

        /* ── Msg fade ── */
        @keyframes msgIn {
          from { opacity:0; filter:blur(6px); transform:translateY(5px); }
          to   { opacity:1; filter:blur(0);   transform:translateY(0); }
        }
        .msg-in { animation: msgIn 0.38s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* ── Ping ── */
        @keyframes cpPing {
          75%,100% { transform: scale(2.2); opacity: 0; }
        }
        .cp-ping { animation: cpPing 1.6s cubic-bezier(0,0,0.2,1) infinite; }

        /* ── Feature cards ── */
        .feat-card {
          border: 1px solid rgba(255,255,255,0.055);
          background: rgba(255,255,255,0.018);
          border-radius: 14px;
          padding: 16px;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
        }
        .feat-card:hover {
          border-color: rgba(59,111,212,0.2);
          background: rgba(59,111,212,0.035);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Top loading bar */}
      {loading && <div className="top-bar" style={{ width: `${progressWidth}%` }} />}

      <div className="az-bg relative min-h-screen font-body">
        <div className="az-bg fixed inset-0 -z-10" aria-hidden />
        <Navbar />

        <div className="mx-auto max-w-[700px] px-5 pb-28 pt-14 md:pt-20">

          {/* Badge */}
          {mounted && (
            <div className="reveal d1 mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="cp-ping absolute inline-flex h-full w-full rounded-full bg-[#3b6fd4] opacity-55" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3b6fd4]" />
              </span>
              <span className="text-xs font-medium tracking-wide text-[#8899aa]">AI-Powered Analysis</span>
            </div>
          )}

          {/* Headline */}
          {mounted && (
            <div className="reveal d2 mb-5">
              <h1 className="font-heading text-[2.5rem] font-bold leading-[1.08] tracking-tight text-white md:text-[3rem]">
                Drop Your Material.
                <br />
                <span style={{ color: "rgba(255,255,255,0.38)" }}>Get What Matters.</span>
              </h1>
            </div>
          )}

          {/* Subtext */}
          {mounted && (
            <div className="reveal d3 mb-14">
              <p className="max-w-md text-[0.95rem] leading-relaxed text-[#8899aa]">
                Paste your syllabus and previous year papers.{" "}
                <span className="text-white/45">Recurra</span> finds what repeats and surfaces the
                questions most likely to appear.
              </p>
            </div>
          )}

          {/* Stepper inputs */}
          {mounted && (
            <div className="reveal d4">

              {/* ─ Input 01: Syllabus ─ */}
              <div className="relative mb-10 flex gap-5">
                <div className="relative flex flex-col items-center">
                  <div className={`s-badge ${syllabus.trim() ? "s-done" : syllabusFocused ? "s-active" : "s-idle"}`}>01</div>
                  <div className="s-line" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/85">Your Syllabus</span>
                      {errorSyllabus && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/[0.12] px-2 py-0.5 text-[11px] font-medium text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-400" />required
                        </span>
                      )}
                    </div>
                    {syllabusCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/22">{syllabusCount.toLocaleString()} chars</span>
                        <div className="c-track">
                          <div className="c-fill" style={{ width: `${Math.min((syllabusCount / 3000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-[11px] text-white/28">Paste your syllabus structured by units</p>
                  <div className={shakeSyllabus ? "do-shake" : ""}>
                    <textarea
                      value={syllabus}
                      rows={9}
                      onFocus={() => setSyllabusFocused(true)}
                      onBlur={() => setSyllabusFocused(false)}
                      onChange={(e) => { setSyllabus(e.target.value); setErrorSyllabus(false); }}
                      placeholder={`Unit 1 — Data Structures\nStack, Queue, Linked List, Trees...\n\nUnit 2 — Algorithms\nSorting, Searching, Complexity...\n\nUnit 3 — ...`}
                      className={`az-ta${errorSyllabus ? " az-err" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* ─ Input 02: Papers ─ */}
              <div className="relative mb-12 flex gap-5">
                <div className="flex flex-col items-center">
                  <div className={`s-badge ${papers.trim() ? "s-done" : papersFocused ? "s-active" : "s-idle"}`}>02</div>
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/85">Previous Year Papers</span>
                      {errorPapers && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/[0.12] px-2 py-0.5 text-[11px] font-medium text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-400" />required
                        </span>
                      )}
                    </div>
                    {papersCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/22">{papersCount.toLocaleString()} chars</span>
                        <div className="c-track">
                          <div className="c-fill" style={{ width: `${Math.min((papersCount / 8000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-[11px] text-white/28">More years of papers = sharper predictions</p>
                  <div className={shakePapers ? "do-shake" : ""}>
                    <textarea
                      value={papers}
                      rows={12}
                      onFocus={() => setPapersFocused(true)}
                      onBlur={() => setPapersFocused(false)}
                      onChange={(e) => { setPapers(e.target.value); setErrorPapers(false); }}
                      placeholder={`2023 Paper:\nQ1. Explain the working of a stack with example.\nQ2. Write an algorithm for binary search...\n\n2022 Paper:\nQ1. What is a linked list? Explain types...\nQ2. Define time complexity...`}
                      className={`az-ta${errorPapers ? " az-err" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {mounted && (
            <div className="reveal d5">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className={`flex h-[54px] w-full items-center justify-center rounded-full font-heading text-[0.92rem] font-semibold ${
                  bothFilled && !loading ? "btn-on" : "btn-off"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-3 text-white/40">
                    <span className="flex items-center gap-[3px]">
                      <span className="dp dp1" />
                      <span className="dp dp2" />
                      <span className="dp dp3" />
                    </span>
                    <span className="msg-in text-[0.83rem] text-white/55" key={loadingMessageIndex}>
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze & Generate Probables
                    <span className="inline-block transition-transform duration-300 hover:translate-x-1">→</span>
                  </span>
                )}
              </button>
              <p className="mt-3.5 text-center text-[11px] text-white/18">
                {bothFilled ? "Powered by Gemini AI · ~15 seconds" : "Fill both fields above to continue"}
              </p>
            </div>
          )}

          {/* Feature hint cards
          {mounted && (
            <div className="reveal d6 mt-16 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                { sym: "◈", title: "Syllabus-filtered",  sub: "Out-of-scope questions removed" },
                { sym: "◎", title: "Pattern-aware",      sub: "Repetition tracked across years" },
                { sym: "◇", title: "Priority ranked",    sub: "Highest value questions first"  },
              ].map((c) => (
                <div key={c.title} className="feat-card group">
                  <span className="mb-2.5 block text-sm text-[#3b6fd4] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                    {c.sym}
                  </span>
                  <p className="text-xs font-medium text-white/65">{c.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/28">{c.sub}</p>
                </div>
              ))}
            </div>
          )} */}

        </div>
      </div>
    </>
  );
};

export default Analyze;