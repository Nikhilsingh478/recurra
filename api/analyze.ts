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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 20000 },
        }),
      }
    );
    
    // If this key hit Gemini's rate limit (429) or quota (403),
    // try the next key
    if (geminiRes.status === 429 || geminiRes.status === 403) {
      lastError = `Key exhausted (status ${geminiRes.status})`;
      console.error(`Gemini key failed with status ${geminiRes.status}`);
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
- Include a question ONLY if directly tied to a topic explicitly in the syllabus
- Do NOT include out-of-syllabus questions
- Do NOT pad — quality over quantity
- Maximum 8 questions per unit, ideally 4-6
- Sort questions within each unit from highest to lowest frequency
- Rank units by numbers not words

FREQUENCY COUNTING:
- Count how many different year papers contain a question on this topic
- Similar questions about the same concept = same question
- Be conservative — if unsure whether two questions match, count separately

PRIORITY SYSTEM (dynamic):
- Collect ALL frequencies across every unit first
- Assign priorities relative to the actual spread in THIS dataset:
  - Priority 1: top of frequency range (most repeated)
  - Priority 2: middle of frequency range
  - Priority 3: bottom of frequency range
- Max=5: freq 5→P1, freq 3-4→P2, freq 1-2→P3
- Max=3: freq 3→P1, freq 2→P2, freq 1→P3
- Unit priority = highest question priority within that unit

DIFFICULTY (per question):
- Easy: definition, explanation, comparison — no calculation required
- Medium: requires algorithm steps, diagram, or structured derivation
- Hard: requires numerical calculation, proof, or multi-step problem solving

ROI (per question):
- Very High: appears frequently AND is easy-medium difficulty
- High: appears frequently but hard, OR medium frequency and easy
- Medium: appears 2-3 times, medium difficulty
- Low: appears once or is hard with low frequency

TRENDING TOPICS:
- Scan the 2 most recent papers only
- If a topic appears in both, set "trending": true, otherwise false

LOW PRIORITY LABELING:
- Any question with Priority 3 (bottom of frequency range) must have a "lowPriority": true field
- Any question with Priority 1 or Priority 2 must have "lowPriority": false
- The lowPriority flag tells the frontend to visually de-emphasize these questions
- Students should know these are worth knowing but not primary focus

SKIP STRATEGY:
- Analyze all units by: question frequency, unit priority, difficulty
- Identify which unit to most safely skip (lowest frequency + hardest + lowest ROI)
- Identify one alternative skip unit
- Identify must-not-skip units (highest frequency + easiest marks)
- Write 2-sentence rationale explaining the reasoning

NUMERICAL SURVIVAL KIT:
- Scan all papers for questions requiring actual calculation or algorithm application
- List only numerical question types repeating across 2+ papers
- Format: "Topic — what to practice"
- Maximum 6 items

MATHEMATICAL FORMATTING (STRICT):
- ALL math expressions MUST be valid LaTeX
- Inline math → single dollars: $x^2$
- Block equations → double dollars: $$\\frac{a}{b}$$
- NEVER raw math outside LaTeX
- Use proper commands: \\frac, \\sqrt, \\int, \\sum, \\alpha, \\beta, \\theta

Return ONLY valid JSON. No markdown, no backticks, no explanation.

{
  "subject": "detected subject name",
  "totalPapersAnalyzed": <number of distinct question papers found in the input — count each paper separately even if from the same year, e.g. Regular + Supplementary from 2024 = 2 papers>,
  "units": [
    {
      "unitNumber": 1,
      "unitTitle": "exact unit title from syllabus",
      "unitPriority": 1 | 2 | 3,
      "probableQuestions": [
        {
          "question": "question text",
          "frequency": <number>,
          "priority": 1 | 2 | 3,
          "difficulty": "Easy" | "Medium" | "Hard",
          "roi": "Very High" | "High" | "Medium" | "Low",
          "trending": true | false,
          "lowPriority": true | false
        }
      ],
      "topTopics": ["topic1", "topic2"]
    }
  ],
  "examStrategy": "2-3 sentence strategy based on actual patterns",
  "highFrequencyTopics": ["topic1", "topic2"],
  "highFrequencyQuestions": [
    {
      "question": "question text",
      "frequency": <number>,
      "unit": "unit title",
      "difficulty": "Easy" | "Medium" | "Hard",
      "roi": "Very High" | "High" | "Medium" | "Low",
      "trending": true | false,
      "lowPriority": true | false
    }
  ],
  "skipStrategy": {
    "recommendedSkip": "Unit X — unit title",
    "alternativeSkip": "Unit Y — unit title",
    "mustNotSkip": ["Unit A — title", "Unit B — title"],
    "rationale": "2 sentence explanation"
  },
  "numericalKit": [
    {
      "topic": "topic name",
      "practice": "what specifically to practice"
    }
  ]
}

For highFrequencyQuestions: Priority 1 and Priority 2 only, sorted by frequency descending.

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
      const blockReason = data?.promptFeedback?.blockReason || "";
      const geminiError = data?.error?.message || "";
      console.error("Gemini empty response:", JSON.stringify(data).substring(0, 300));
      return res.status(500).json({ 
        error: `Analysis failed: ${blockReason || geminiError || "Empty response from AI. Please try again."}` 
      });
    }

    // Check if Gemini returned an error message instead of JSON
    if (raw.startsWith("An error") || raw.startsWith("I'm sorry") || raw.startsWith("I cannot") || raw.startsWith("Error")) {
      console.error("Gemini returned error text:", raw.substring(0, 200));
      return res.status(500).json({ 
        error: "AI analysis unavailable right now. Please wait a moment and try again." 
      });
    }

    const clean = raw.replace(/^```json\s*|\s*```$/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw response start:", raw.substring(0, 300));
      return res.status(500).json({ 
        error: "Analysis failed to parse. Try reducing the amount of text in your papers input and try again." 
      });
    }

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "Analysis failed. Please check your inputs and try again." });
  }
}