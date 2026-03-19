import type { VercelRequest, VercelResponse } from "@vercel/node";

const rateLimit = new Map<string, number[]>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

const ANALYSIS_PROMPT = `You are an expert university exam analyst. Analyze the provided syllabus and previous year question papers with surgical precision.

STRICT RULES FOR QUESTION INCLUSION:
- Include a question ONLY if it is directly tied to a topic explicitly mentioned in the syllabus
- Do NOT include questions that are out-of-syllabus even if they appeared in papers
- Do NOT pad the list — quality over quantity
- Maximum 8 questions per unit, ideally 4-6
- Sort questions within each unit from highest frequency to lowest frequency

PRIORITY SYSTEM (apply exactly):
- frequency = 1: Include ONLY if it is a direct, core topic from syllabus. Set priority "LOW"
- frequency = 2: "HIGH" priority
- frequency >= 3: "HIGHEST" priority  
- Unit-level priority: "HIGHEST" if any question has frequency >= 3, "HIGH" if any has frequency = 2, "LOW" otherwise

FREQUENCY COUNTING:
- Count how many different year papers contain a question about this topic/concept
- Similar questions about the same concept count as the same question
- Be conservative — if unsure whether two questions match, count them separately

Return ONLY a valid JSON object. No markdown, no explanation, no backticks, no preamble.

JSON structure:
{
  "subject": "detected subject name",
  "totalYearsAnalyzed": <number of distinct years found in papers>,
  "units": [
    {
      "unitNumber": 1,
      "unitTitle": "exact unit title from syllabus",
      "unitPriority": "HIGHEST" | "HIGH" | "LOW",
      "probableQuestions": [
        {
          "question": "concise question text",
          "frequency": <number>,
          "priority": "HIGHEST" | "HIGH" | "LOW"
        }
      ],
      "topTopics": ["topic1", "topic2", "topic3"]
    }
  ],
  "examStrategy": "2-3 sentence focused strategy tip based on the actual patterns found",
  "highFrequencyTopics": ["topic1", "topic2", "topic3"],
  "highFrequencyQuestions": [
    {
      "question": "question text",
      "frequency": <number>,
      "unit": "unit title"
    }
  ]
}

For highFrequencyQuestions: include ONLY questions with frequency >= 2, sorted by frequency descending. These are the student's must-prepare list.
For highFrequencyTopics: topics that appear across multiple units or multiple years.

SYLLABUS:
{{SYLLABUS}}

PREVIOUS YEAR PAPERS:
{{PAPERS}}`;

const headers: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return res.status(204).setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type").end();
  }

  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip =
    (Array.isArray(req.headers["x-forwarded-for"])
      ? req.headers["x-forwarded-for"][0]
      : req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) ||
    req.socket?.remoteAddress ||
    "unknown";

  const now = Date.now();
  const timestamps = (rateLimit.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Rate limit exceeded. You can analyze 5 times per hour. Please try again later.",
    });
  }

  timestamps.push(now);
  rateLimit.set(ip, timestamps);

  try {
    const { syllabus, papers } = req.body || {};

    if (!syllabus || typeof syllabus !== "string" || syllabus.length < 80 || syllabus.trim().split(/\s+/).length < 10) {
      return res.status(400).json({ error: "Invalid syllabus input" });
    }
    if (!papers || typeof papers !== "string" || papers.length < 80 || papers.trim().split(/\s+/).length < 10) {
      return res.status(400).json({ error: "Invalid papers input" });
    }

    const prompt = ANALYSIS_PROMPT
      .replace("{{SYLLABUS}}", syllabus.trim())
      .replace("{{PAPERS}}", papers.trim());

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY || "",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 14000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      return res.status(502).json({ error: "Analysis service unavailable. Please try again." });
    }

    const data = await geminiRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return res.status(500).json({ error: "Analysis failed. Please check your inputs and try again." });
    }

    const clean = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "Analysis failed. Please check your inputs and try again." });
  }
}
