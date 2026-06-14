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