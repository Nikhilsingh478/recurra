import type { VercelRequest, VercelResponse } from "@vercel/node";

const DAILY_LIMIT = 10;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY || "",
  process.env.GEMINI_API_KEY_1 || "",
  process.env.GEMINI_API_KEY_2 || "",
  process.env.GEMINI_API_KEY_3 || "",
].map(k => k.trim()).filter(k => k.length > 0);

function getMidnightIST(): number {
  const now = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + IST_OFFSET);
  const midnightIST = new Date(nowIST);
  midnightIST.setUTCHours(0, 0, 0, 0);
  midnightIST.setUTCDate(midnightIST.getUTCDate() + 1);
  return midnightIST.getTime() - IST_OFFSET;
}

async function callGemini(prompt: string): Promise<any> {
  let lastError = "";
  
  for (const key of GEMINI_KEYS) {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 14000 },
        }),
      }
    );
    
    // If this key hit Gemini's rate limit (429) or quota (403),
    // try the next key
    if (geminiRes.status === 429 || geminiRes.status === 403) {
      lastError = `Key exhausted (status ${geminiRes.status})`;
      continue; // try next key
    }
    
    // If any other error from Gemini (500, 502 etc), don't try other keys
    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      throw new Error(`Gemini service error: ${geminiRes.status} ${errText}`.substring(0, 200));
    }
    
    // Success — return the response data
    const data = await geminiRes.json();
    return data;
  }
  
  // All keys exhausted
  throw new Error("ALL_KEYS_EXHAUSTED");
}

const ANALYSIS_PROMPT = `You are an expert university exam analyst. Analyze the provided syllabus and previous year question papers with surgical precision.

STRICT RULES FOR QUESTION INCLUSION:
- Include a question ONLY if it is directly tied to a topic explicitly mentioned in the syllabus
- Do NOT include questions that are out-of-syllabus even if they appeared in papers
- Do NOT pad the list — quality over quantity
- Maximum 8 questions per unit, ideally 4-6
- Sort questions within each unit from highest frequency to lowest frequency
- Rank the units not by words, rank the units by numbers

FREQUENCY COUNTING:
- Count how many different year papers contain a question about this topic/concept
- Similar questions about the same concept count as the same question
- Be conservative — if unsure whether two questions match, count them separately

PRIORITY SYSTEM (dynamic — never use fixed thresholds):
- First, collect ALL question frequencies across every unit in the entire dataset
- Identify the highest (max) and lowest (min) frequency values present
- Then assign priorities relatively based on the actual spread in THIS dataset:
  - Priority 1: Questions at the TOP of the frequency range (most repeated in this dataset)
  - Priority 2: Questions in the MIDDLE of the frequency range
  - Priority 3: Questions at the BOTTOM of the frequency range (least repeated)
- Concrete examples of how to split the range:
  - All frequencies = 1 (only one paper): everything is Priority 3, no P1 or P2
  - Max = 2: frequency 2 → P1, frequency 1 → P3 (skip P2 if no mid values exist)
  - Max = 3: frequency 3 → P1, frequency 2 → P2, frequency 1 → P3
  - Max = 4: frequency 4 → P1, frequency 2-3 → P2, frequency 1 → P3
  - Max = 5: frequency 5 → P1, frequency 3-4 → P2, frequency 1-2 → P3
  - Max = 6: frequency 5-6 → P1, frequency 3-4 → P2, frequency 1-2 → P3
- The key rule: Priority 1 always goes to the highest-frequency questions in THIS dataset, whatever that number is
- Unit-level priority: matches the highest question priority within that unit

Return ONLY a valid JSON object. No markdown, no explanation, no backticks, no preamble.

JSON structure:
{
  "subject": "detected subject name",
  "totalYearsAnalyzed": <number of distinct years found in papers>,
  "units": [
    {
      "unitNumber": 1,
      "unitTitle": "exact unit title from syllabus",
      "unitPriority": 1 | 2 | 3,
      "probableQuestions": [
        {
          "question": "concise question text",
          "frequency": <number>,
          "priority": 1 | 2 | 3
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

For highFrequencyQuestions: include questions with Priority 1 OR Priority 2 (all questions that are not at the bottom of the frequency range for this dataset), sorted by frequency descending. These are the student's must-prepare list.
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
  let ipRecord = rateLimit.get(ip);

  if (!ipRecord || now >= ipRecord.resetAt) {
    // New day or no record
    ipRecord = { count: 1, resetAt: getMidnightIST() };
    rateLimit.set(ip, ipRecord);
  } else if (ipRecord.count >= DAILY_LIMIT) {
    // Limit reached
    return res.status(429).json({
      error: "You've used all 10 analyses for today. Your limit resets at midnight. Come back tomorrow!",
      resetsAt: new Date(ipRecord.resetAt).toISOString()
    });
  } else {
    // Increment count
    ipRecord.count++;
    rateLimit.set(ip, ipRecord);
  }

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

    // Call Gemini with key rotation
    let data;
    try {
      data = await callGemini(prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "ALL_KEYS_EXHAUSTED") {
        return res.status(503).json({ 
          error: "Recurra is experiencing high demand right now. Please try again in a few minutes." 
        });
      }
      return res.status(502).json({ 
        error: `Analysis service unavailable. Details: ${message}` 
      });
    }

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