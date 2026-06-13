const DAILY_LIMIT = 10;
const rateLimit = new Map();

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY || "",
  process.env.GEMINI_API_KEY_1 || "",
  process.env.GEMINI_API_KEY_2 || "",
  process.env.GEMINI_API_KEY_3 || "",
].map((key) => key.trim()).filter((key) => key.length > 0);

function getMidnightIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const midnightIST = new Date(nowIST);
  midnightIST.setUTCHours(0, 0, 0, 0);
  midnightIST.setUTCDate(midnightIST.getUTCDate() + 1);
  return midnightIST.getTime() - istOffset;
}

async function callGemini(prompt) {
  let lastError = "";

  for (const key of GEMINI_KEYS) {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
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
      },
    );

    if (geminiRes.status === 429 || geminiRes.status === 403) {
      lastError = `Key exhausted (status ${geminiRes.status})`;
      continue;
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      throw new Error(`Gemini service error: ${geminiRes.status} ${errText}`.substring(0, 200));
    }

    return geminiRes.json();
  }

  throw new Error(lastError || "ALL_KEYS_EXHAUSTED");
}

const ANALYSIS_PROMPT = String.raw`You are an expert university exam strategist. Analyze the provided syllabus and previous year question papers with surgical precision.

STRICT RULES FOR QUESTION INCLUSION:
- Include a question ONLY if it is directly tied to a topic explicitly mentioned in the syllabus
- Do NOT include out-of-syllabus questions even if they appeared in papers
- Do NOT pad — quality over quantity
- Maximum 8 questions per unit, ideally 4-6
- Sort questions within each unit from highest frequency to lowest frequency
- Rank units by numbers not words

FREQUENCY COUNTING:
- Count how many different year papers contain a question about this topic
- Similar questions about the same concept count as the same question
- Be conservative — if unsure whether two questions match, count separately

PRIORITY SYSTEM (dynamic — never use fixed thresholds):
- Collect ALL question frequencies across every unit
- Identify highest (max) and lowest (min) frequency values
- Assign priorities relatively:
  - Priority 1: TOP of the frequency range (most repeated)
  - Priority 2: MIDDLE of the frequency range
  - Priority 3: BOTTOM of the frequency range (least repeated)
- Unit-level priority matches the highest question priority within that unit

DIFFICULTY CLASSIFICATION:
Classify each question as "Easy", "Medium", or "Hard" based on:
- Easy: Pure theory, definitions, comparisons, short explanations — can be answered from memory with no calculations
- Medium: Structured theory with diagrams, or procedural numericals that follow a fixed repeatable pattern (e.g. FIRST/FOLLOW, CRC, basic blocks)
- Hard: Complex multi-step numericals, parsing table construction, algorithm traces that require deep practice to execute correctly under exam pressure

ROI CLASSIFICATION:
Classify each question as "Very High", "High", "Medium", or "Low" ROI based on:
- ROI = (marks potential × recurrence) ÷ effort required
- Very High ROI: High frequency + Easy or Medium difficulty (e.g. compiler phases, OSI vs TCP/IP, framing methods)
- High ROI: Medium frequency + Easy difficulty OR high frequency + Medium difficulty
- Medium ROI: Hard difficulty but appears frequently (must do but costs time)
- Low ROI: Hard difficulty + low frequency (skip unless time remains)

SKIP STRATEGY:
Analyze the paper pattern carefully. If the paper allows attempting any 4 out of 5 main questions (meaning one full unit can be skipped), identify:
- skipRecommended: the unit number the student should skip for best marks-to-effort ratio
- skipReason: one concise sentence explaining why this unit should be skipped
- skipAlternative: the second-best unit to skip if the student has already prepared the recommended skip unit
- mustNotSkip: array of unit numbers that absolutely cannot be skipped (compulsory or highest ROI)

NUMERICAL SURVIVAL KIT:
Identify the minimum set of numerical/problem-solving question types that covers the majority of recurring problem-solving questions across all units. These are the ones the student must practice by hand before the exam. Maximum 7 items. For each item provide:
- topic: the specific numerical type (e.g. "CRC computation", "Dijkstra's algorithm")
- unit: which unit it belongs to
- whyItMatters: one line explaining why this specific numerical is non-negotiable

MATHEMATICAL CONTENT FORMATTING (STRICT):
- ALL mathematical expressions MUST be written in valid LaTeX
- Inline math → single dollars: $x^2 + y^2$
- Block equations → double dollars: $$\frac{a}{b}$$
- NEVER output raw math — always LaTeX
- For non-math subjects, plain text is fine

Return ONLY a valid JSON object. No markdown, no backticks, no explanation, no preamble.

JSON structure:
{
  "subject": "detected subject name",
  "totalYearsAnalyzed": <number>,
  "units": [
    {
      "unitNumber": 1,
      "unitTitle": "exact unit title from syllabus",
      "unitPriority": 1 | 2 | 3,
      "probableQuestions": [
        {
          "question": "concise question text",
          "frequency": <number>,
          "priority": 1 | 2 | 3,
          "difficulty": "Easy" | "Medium" | "Hard",
          "roi": "Very High" | "High" | "Medium" | "Low"
        }
      ],
      "topTopics": ["topic1", "topic2", "topic3"]
    }
  ],
  "examStrategy": "2-3 sentence focused strategy tip based on actual patterns found",
  "skipStrategy": {
    "skipRecommended": <unit number>,
    "skipReason": "one sentence",
    "skipAlternative": <unit number>,
    "mustNotSkip": [<unit numbers>]
  },
  "numericalSurvivalKit": [
    {
      "topic": "specific numerical type",
      "unit": "unit title",
      "whyItMatters": "one line"
    }
  ],
  "highFrequencyTopics": ["topic1", "topic2", "topic3"],
  "highFrequencyQuestions": [
    {
      "question": "question text",
      "frequency": <number>,
      "unit": "unit title",
      "difficulty": "Easy" | "Medium" | "Hard",
      "roi": "Very High" | "High" | "Medium" | "Low"
    }
  ]
}

For highFrequencyQuestions: include Priority 1 and Priority 2 questions only, sorted by frequency descending.
For highFrequencyTopics: topics appearing across multiple units or multiple years.

SYLLABUS:
{{SYLLABUS}}

PREVIOUS YEAR PAPERS:
{{PAPERS}}`;

export async function analyzeRequest({ body, ip }) {
  if (GEMINI_KEYS.length === 0) {
    return {
      status: 500,
      body: { error: "Analysis service is not configured. Add GEMINI_API_KEY to server secrets." },
    };
  }

  const now = Date.now();
  let ipRecord = rateLimit.get(ip);

  if (!ipRecord || now >= ipRecord.resetAt) {
    ipRecord = { count: 1, resetAt: getMidnightIST() };
    rateLimit.set(ip, ipRecord);
  } else if (ipRecord.count >= DAILY_LIMIT) {
    return {
      status: 429,
      body: {
        error: "You've used all 10 analyses for today. Your limit resets at midnight. Come back tomorrow!",
        resetsAt: new Date(ipRecord.resetAt).toISOString(),
      },
    };
  } else {
    ipRecord.count++;
    rateLimit.set(ip, ipRecord);
  }

  try {
    const { syllabus, papers } = body || {};

    if (!syllabus || typeof syllabus !== "string" || syllabus.length < 80 || syllabus.trim().split(/\s+/).length < 10) {
      return { status: 400, body: { error: "Invalid syllabus input" } };
    }

    if (!papers || typeof papers !== "string" || papers.length < 80 || papers.trim().split(/\s+/).length < 10) {
      return { status: 400, body: { error: "Invalid papers input" } };
    }

    const prompt = ANALYSIS_PROMPT
      .replace("{{SYLLABUS}}", syllabus.trim())
      .replace("{{PAPERS}}", papers.trim());

    let data;
    try {
      data = await callGemini(prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "ALL_KEYS_EXHAUSTED" || message.includes("Key exhausted")) {
        return {
          status: 503,
          body: { error: "Recurra is experiencing high demand right now. Please try again in a few minutes." },
        };
      }
      return {
        status: 502,
        body: { error: `Analysis service unavailable. Details: ${message}` },
      };
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return { status: 500, body: { error: "Analysis failed. Please check your inputs and try again." } };
    }

    const clean = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    return { status: 200, body: JSON.parse(clean) };
  } catch {
    return { status: 500, body: { error: "Analysis failed. Please check your inputs and try again." } };
  }
}