import fetch from 'node-fetch'; // if node 18+, fetch is global
const key = process.env.GEMINI_API_KEY_1 || "AIzaSyCWdy3WKNLb9oU1dL3wIrtTuB7drlpe23E";

async function list() {
  const res = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name).join('\n'));
}
list();
