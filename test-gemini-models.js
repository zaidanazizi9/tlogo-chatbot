const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const GEMINI_API_KEY = "AIzaSyAI9tMRpTpKvHgfgGXI4iqWqpW0_k8wxGw";

async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`);
  const data = await res.json();
  console.log("📦 Daftar Model yang tersedia:");
  console.dir(data, { depth: null });
}

listModels();
