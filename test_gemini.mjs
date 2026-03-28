import fetch from 'node-fetch'; // if node 18+, fetch is global
const key = process.env.GEMINI_API_KEY_1 || "AIzaSyCWdy3WKNLb9oU1dL3wIrtTuB7drlpe23E";

async function run(model) {
  console.log(`Testing ${model}...`);
  const res = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
  });
  console.log(model, res.status, await res.text());
}
run('gemini-1.5-flash');
run('gemini-1.5-flash-latest');
run('gemini-flash-latest');
