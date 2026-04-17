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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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

const ANALYSIS_PROMPT = String.raw`You are an expert university exam analyst. Analyze the provided syllabus and previous year question papers with surgical precision.

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

MATHEMATICAL CONTENT FORMATTING (STRICT):
- ALL mathematical expressions, equations, formulas, variables, and symbols MUST be written in valid LaTeX
- Inline math (within a sentence) → wrap in single dollars: $x^2 + y^2 = z^2$
- Block / display equations (standalone) → wrap in double dollars: $$\int_0^1 x^2 \, dx = \frac{1}{3}$$
- Multi-step derivations or aligned equations → use:
  $$\begin{aligned} a &= b + c \\ &= d \end{aligned}$$
- NEVER output raw math like "x^2 + y^2 = z^2" or "integral from 0 to 1" — always LaTeX
- Use proper LaTeX commands: \frac{a}{b}, \sqrt{x}, \int, \sum, \lim, \alpha, \beta, \theta, \cdot, \times, \leq, \geq, \neq, \to, \infty
- Escape special characters properly. Use \\ for line breaks inside aligned blocks
- Do NOT mix raw text math with LaTeX in the same expression
- Apply this to BOTH question text and any solution/explanation text
- For non-math subjects (history, literature, etc.), no LaTeX is needed — plain text is fine

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