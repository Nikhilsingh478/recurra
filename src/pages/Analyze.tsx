import { useState } from "react";
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

  const syllabusCount = syllabus.length;
  const papersCount = papers.length;
  const bothFilled = syllabus.trim().length > 0 && papers.trim().length > 0;

  const triggerShake = (field: "syllabus" | "papers") => {
    if (field === "syllabus") {
      setShakeSyllabus(true);
      setErrorSyllabus(true);
      setTimeout(() => setShakeSyllabus(false), 300);
    } else {
      setShakePapers(true);
      setErrorPapers(true);
      setTimeout(() => setShakePapers(false), 300);
    }
  };

  const runAnalysis = async () => {
    if (!syllabus.trim()) {
      triggerShake("syllabus");
      return;
    }
    if (!papers.trim()) {
      triggerShake("papers");
      return;
    }
    setErrorSyllabus(false);
    setErrorPapers(false);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast({
        description: "API key not configured. Please add VITE_GEMINI_API_KEY to .env",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLoadingMessageIndex(0);
    setProgressWidth(0);

    const progressInterval = setInterval(() => {
      setProgressWidth((w) => Math.min(w + 2, 85));
    }, 400);

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);

    const prompt = ANALYSIS_PROMPT.replace("{{SYLLABUS}}", syllabus.trim()).replace("{{PAPERS}}", papers.trim());

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 14000,
            },
          }),
        }
      );

      const data = await res.json();
      console.log("API Response:", data);
      console.log("API Status:", res.status);

      if (!res.ok) {
        console.error("API Error Body:", data);
        throw new Error(`API error: ${res.status}`);
      }

      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgressWidth(100);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error("No text in response:", data);
        throw new Error("No response from API");
      }

      const jsonStr = text.replace(/^```json\s*|\s*```$/g, "").trim();
      const result = JSON.parse(jsonStr);

      localStorage.setItem(
        "recurra_results",
        JSON.stringify({
          ...result,
          timestamp: new Date().toISOString(),
          subject: result.subject || "General",
        })
      );
      navigate("/results");
    } catch (err) {
      console.error("Caught error:", err);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setLoading(false);
      toast({
        description: "Analysis failed. Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  };

  const formatCount = (n: number) => n.toLocaleString() + " characters";

  return (
    <div className="min-h-screen bg-[#050810] font-body">
      {/* Animated gradient background */}
      <div className="analyze-bg fixed inset-0 -z-10" aria-hidden />

      <Navbar />

      <div className="mx-auto max-w-[760px] px-6 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fd4]" />
            <span className="font-body text-xs font-medium text-[#8899aa]">AI-Powered Analysis</span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
            Drop Your Material.
            <br />
            Get What Matters.
          </h1>
          <p className="mt-4 font-body text-base text-[#8899aa] md:text-lg">
            Paste your syllabus and previous year papers below. Recurra will analyze patterns and surface
            high-probability questions.
          </p>
        </div>

        {/* Input 1 — Syllabus */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <label className="font-body text-base font-medium text-white">Your Syllabus</label>
            {errorSyllabus && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
          </div>
          <p className="mb-2 font-body text-sm text-[#8899aa]">Paste your syllabus structured by units</p>
          <textarea
            value={syllabus}
            onChange={(e) => {
              setSyllabus(e.target.value);
              setErrorSyllabus(false);
            }}
            placeholder={`Unit 1 — Data Structures
Stack, Queue, Linked List, Trees...

Unit 2 — Algorithms
Sorting, Searching, Complexity...`}
            className={`analyze-input min-h-[220px] w-full resize-y rounded-lg border bg-white/[0.04] px-4 py-3 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#3b6fd4]/40 ${
              shakeSyllabus ? "analyze-shake" : ""
            }`}
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
          <p className="mt-1 text-right font-body text-xs text-[#8899aa]">{formatCount(syllabusCount)}</p>
        </div>

        {/* Input 2 — Papers */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <label className="font-body text-base font-medium text-white">Previous Year Papers</label>
            {errorPapers && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
          </div>
          <p className="mb-2 font-body text-sm text-[#8899aa]">
            Paste papers from multiple years. More years = better predictions.
          </p>
          <textarea
            value={papers}
            onChange={(e) => {
              setPapers(e.target.value);
              setErrorPapers(false);
            }}
            placeholder={`2023 Paper:
Q1. Explain the working of a stack with example.
Q2. Write an algorithm for binary search...

2022 Paper:
Q1. What is a linked list? Explain types...`}
            className={`analyze-input min-h-[280px] w-full resize-y rounded-lg border bg-white/[0.04] px-4 py-3 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#3b6fd4]/40 ${
              shakePapers ? "analyze-shake" : ""
            }`}
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
          <p className="mt-1 text-right font-body text-xs text-[#8899aa]">{formatCount(papersCount)}</p>
        </div>

        {/* Analyze button */}
        <button
          onClick={runAnalysis}
          disabled={loading || !bothFilled}
          className={`analyze-btn flex h-14 w-full items-center justify-center rounded-full font-heading text-base font-semibold transition-all duration-200 ${
            bothFilled ? "analyze-btn-shimmer bg-white text-[#050810] hover:scale-[1.02]" : "cursor-not-allowed bg-white/40 text-white/60"
          }`}
        >
          {loading ? (
            <span className="analyze-loading-pulse">Analyzing patterns...</span>
          ) : (
            <>Analyze & Generate Probables →</>
          )}
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050810]/95">
          <div className="analyze-loading-glow absolute inset-0 -z-10" aria-hidden />
          <p className="mb-2 font-body text-sm font-medium text-[#8899aa]">RECURRA</p>
          <p className="mb-8 font-body text-lg text-white transition-opacity duration-500">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <div className="h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#3b6fd4] transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;
