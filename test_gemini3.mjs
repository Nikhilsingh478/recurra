import fetch from 'node-fetch'; // if node 18+, fetch is global
import fs from 'fs';
const key = process.env.GEMINI_API_KEY_1 || "AIzaSyCWdy3WKNLb9oU1dL3wIrtTuB7drlpe23E";

async function run(model) {
  const res = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
  });
  const text = await res.text();
  fs.writeFileSync('output_3_ok.txt', `${model} ${res.status} ${text}`, 'utf-8');
}
run('gemini-3-flash-preview');
