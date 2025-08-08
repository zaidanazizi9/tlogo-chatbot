require("dotenv").config();
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`;

// Validasi awal
if (!GEMINI_API_KEY || !GEMINI_MODEL) {
  console.error(
    "❌ Environment variable GEMINI_API_KEY atau GEMINI_MODEL tidak ditemukan!"
  );
  process.exit(1);
}

async function callGeminiAPI(userMessage, daftarLayanan = []) {
  try {
    const layananText = daftarLayanan.length
      ? daftarLayanan.map((l) => `- ${l}`).join("\n")
      : "Belum ada layanan yang tersedia.";

    const prompt = `
Kamu adalah asisten chatbot untuk layanan Desa Tlogo. Gunakan gaya bahasa yang sopan dan ramah.

Berikut daftar layanan yang tersedia:
${layananText}

User berkata: "${userMessage}"

Balaslah sesuai konteks pertanyaan user, gunakan kata-kata alami seperti manusia, dan jika tidak cocok dengan layanan manapun, arahkan user untuk menghubungi admin. Jangan hanya mengulang pertanyaan user. Gunakan bahasa Indonesia yang natural dan mudah dimengerti masyarakat umum.
`;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("❌ Gagal parsing JSON dari Gemini:", parseError);
      return "Maaf, terjadi kesalahan saat membaca respons dari AI.";
    }

    if (!response.ok) {
      console.error(`❌ Gemini API HTTP Error ${response.status}:`, data);
      return "Maaf, terjadi masalah dengan layanan AI.";
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.warn("⚠️ Gemini tidak memberikan jawaban.");
      return "Maaf, saya belum bisa menjawab pertanyaan tersebut.";
    }

    return reply;
  } catch (err) {
    console.error("❌ Terjadi kesalahan tak terduga:", err);
    return "Maaf, saya tidak bisa menjawab saat ini karena gangguan teknis.";
  }
}

module.exports = { callGeminiAPI };
