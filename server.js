// server.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const admin = require("firebase-admin");
app.use(express.json());
app.use(express.static("public")); // untuk menyajikan file statis dari folder public

const PORT = process.env.PORT || 3000;

// Inisialisasi Firebase Admin SDK
const serviceAccount = require("./backend/tlogo-chatbot-firebase-adminsdk-fbsvc-082cb084b4.json");

const VERIFY_TOKEN = "desa_tlogo";
const ACCESS_TOKEN =
  "";
const PHONE_NUMBER_ID = "693707970499139";
const PENDING_FILE = "./pending_verifikasi.json";

const sessions = {}; // melacak status user

// Buat file pending jika belum ada
if (!fs.existsSync(PENDING_FILE)) {
  fs.writeFileSync(PENDING_FILE, "[]", "utf-8");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const layananRef = db.collection("services");

const GEMINI_API_KEY = "AIzaSyCzbLahWEj_rAJAAD-cikyVy4Krd98XUos"; // ganti dengan milikmu
const GEMINI_MODEL = "models/gemini-1.5-flash"; // atau gemini-1.5-pro
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`;

async function callGeminiAPI(userMessage, daftarLayanan = []) {
  try {
    const layananText = daftarLayanan.length
      ? daftarLayanan.map((l, i) => `- ${l}`).join("\n")
      : "Belum ada layanan yang tersedia.";

    const prompt = `
Kamu adalah asisten chatbot untuk layanan Desa Tlogo. Gunakan gaya bahasa yang sopan dan ramah.

Berikut daftar layanan yang tersedia:
${layananText}

User berkata: "${userMessage}"

Balaslah sesuai konteks pertanyaan user, gunakan kata-kata alami seperti manusia, dan jika tidak cocok dengan layanan manapun, arahkan user untuk menghubungi admin.
`;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    // ✅ Tambahan perlindungan
    const text = await response.text();
    if (!response.ok) {
      console.error(`❌ Gemini API HTTP Error ${response.status}: ${text}`);
      return "Maaf, terjadi masalah dengan layanan AI.";
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      console.error("🔴 Raw response text:", text);
      return "Maaf, terjadi kesalahan saat membaca respons dari AI.";
    }

    console.log("💬 Gemini raw response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Gemini API Error:", data.error);
      return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Maaf, saya tidak bisa menjawab saat ini.";
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return "Maaf, saya tidak bisa menjawab saat ini karena gangguan teknis.";
  }
}

module.exports = { callGeminiAPI };

app.get("/api/layanan", async (req, res) => {
  try {
    const snapshot = await layananRef.get();
    const layanan = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(layanan);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil layanan" });
  }
});

// Verifikasi webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

function isUserConfused(msg) {
  const keywords = [
    "bingung",
    "nggak ngerti",
    "ngga paham",
    "nggak tahu",
    "ga ngerti",
    "ga paham",
    "gatau",
    "gaktau",
    "tidak tahu",
    "gimana",
    "error",
    "tidak bisa",
    "apa itu",
    "tolong",
    "hubungi admin",
  ];
  return keywords.some((k) => msg.includes(k));
}

// Handle pesan dari WhatsApp
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object) {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      let userMessage = "";

      if (message.type === "text") {
        userMessage = message.text.body.toLowerCase();
      } else if (
        message.type === "interactive" &&
        message.interactive?.type === "button_reply"
      ) {
        userMessage = message.interactive.button_reply.id.toLowerCase();
      }

      // Cek jika user kebingungan
      if (isUserConfused(userMessage)) {
        await sendAdminContactButton(
          from,
          "Sepertinya Anda mengalami kesulitan."
        );
        return res.sendStatus(200);
      }

      console.log("User message:", userMessage); //buat debugging
      console.log("✅ Tombol ditekan:", userMessage);

      const layananRef = db.collection("services");
      const layananSnapshot = await layananRef.get();
      const layananList = layananSnapshot.docs.map((doc) => doc.data());

      console.log(
        "Layanan tersedia:",
        layananList.map((l) => l.name)
      );

      const layananDitemukan = layananList.find((layanan) => {
        const nama = layanan.name.toLowerCase();
        return nama.split(" ").some((kata) => userMessage.includes(kata));
      });

      if (layananDitemukan) {
        console.log("✅ Ditemukan layanan:", layananDitemukan.name);

        let reply = "";
        if (userMessage.includes("syarat")) {
          reply = `📄 *Syarat & Ketentuan ${layananDitemukan.name}*\n${layananDitemukan.termsAndConditions}`;
        } else if (userMessage.includes("prosedur")) {
          reply = `🔄 *Prosedur ${layananDitemukan.name}*\n${layananDitemukan.procedure}`;
        } else if (userMessage.includes("jadwal")) {
          reply = `🕒 *Jadwal ${layananDitemukan.name}*\n${layananDitemukan.time}`;
        } else {
          reply = `ℹ️ *${layananDitemukan.name}*\n\n📄 *Syarat:*\n${layananDitemukan.termsAndConditions}\n\n🔄 *Prosedur:*\n${layananDitemukan.procedure}\n\n🕒 *Jadwal:*\n${layananDitemukan.time}`;
        }

        await sendTextMessage(from, reply);
      }

      if (!sessions[from]) sessions[from] = { step: "awal" };
      const session = sessions[from];
      let reply = null;

      // === FITUR BARU: Menampilkan daftar kategori layanan dari Firestore ===
      if (userMessage.includes("layanan")) {
        try {
          const snapshot = await layananRef.get();
          const layananAktif = snapshot.docs
            .map((doc) => doc.data())
            .filter((service) => service.status === "active");

          if (layananAktif.length === 0) {
            await sendTextMessage(
              from,
              "Saat ini belum ada layanan yang tersedia."
            );
            return res.sendStatus(200);
          }

          // Ambil kategori unik
          const kategoriUnik = [
            ...new Set(layananAktif.map((l) => l.category)),
          ];

          // Kirim tombol interaktif (maks 3)
          await sendInteractiveKategoriButton(from, kategoriUnik);
          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil layanan:", err);
          await sendTextMessage(
            from,
            "Terjadi kesalahan mengambil daftar layanan."
          );
          return res.sendStatus(200);
        }
      }

      // === FITUR BARU: Menampilkan layanan berdasarkan kategori ===
      // if (userMessage.startsWith("kategori_")) {
      //   const selectedKategori = userMessage.replace("kategori_", "").replace(/_/g, " ");
      //   console.log("👉 Kategori dipilih:", selectedKategori);

      //   try {
      //     const snapshot = await layananRef.where("status", "==", "active").get();
      //     const layananDalamKategori = snapshot.docs.map(doc => doc.data()).filter(service => service.category.toLowerCase() === selectedKategori.toLowerCase());
      //     if (layananDalamKategori.length === 0) {
      //       await sendTextMessage(from, `Tidak ditemukan layanan dalam kategori *${capitalize(selectedKategori)}*.`);
      //     } else {
      //       await sendInteractiveLayananButton(from, layananDalamKategori);
      //     }
      //     return res.sendStatus(200);
      //   } catch (err) {
      //     console.error("Gagal ambil layanan:", err);
      //     await sendTextMessage(from, "Terjadi kesalahan saat mengambil data layanan.");
      //     return res.sendStatus(200);
      //   }
      // }

      //Codingan percobaan
      if (userMessage.startsWith("kategori_")) {
        const selectedKategori = userMessage
          .replace("kategori_", "")
          .replace(/_/g, " ");
        console.log("👉 Kategori dipilih:", selectedKategori);

        try {
          const snapshot = await layananRef
            .where("status", "==", "active")
            .get();

          console.log("📦 Semua layanan aktif:");
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            console.log(`- Nama: ${data.name}, Kategori: ${data.category}`);
          });

          const layananDalamKategori = snapshot.docs
            .map((doc) => doc.data())
            .filter(
              (service) =>
                service.category.toLowerCase() ===
                selectedKategori.toLowerCase()
            );

          console.log("✅ Ditemukan layanan:", layananDalamKategori.length);

          if (layananDalamKategori.length === 0) {
            await sendTextMessage(
              from,
              `Tidak ditemukan layanan dalam kategori *${capitalize(
                selectedKategori
              )}*.`
            );
          } else {
            await sendInteractiveLayananButton(from, layananDalamKategori);
          }

          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil layanan:", err);
          await sendTextMessage(
            from,
            "Terjadi kesalahan saat mengambil data layanan."
          );
          return res.sendStatus(200);
        }
      }

      // === FITUR BARU: Menampilkan detail layanan ===
      if (userMessage.startsWith("layanan_")) {
        const namaLayananSlug = userMessage
          .replace("layanan_", "")
          .replace(/_/g, " ");

        try {
          const snapshot = await layananRef
            .where("status", "==", "active")
            .get();

          const layananAktif = snapshot.docs.map((doc) => doc.data());

          const layanan = layananAktif.find(
            (l) => l.name.toLowerCase() === namaLayananSlug.toLowerCase()
          );

          if (!layanan) {
            await sendTextMessage(
              from,
              `❌ Layanan *${capitalize(namaLayananSlug)}* tidak ditemukan.`
            );
          } else {
            const detailText = `📄 *${layanan.name}*\n\n📘 *Deskripsi:* ${layanan.description}\n📑 *Syarat & Ketentuan:* ${layanan.termsAndConditions}\n🧭 *Prosedur:* ${layanan.procedure}`;

            await sendTextMessage(from, detailText);
          }

          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil detail layanan:", err);
          await sendTextMessage(
            from,
            "Terjadi kesalahan saat mengambil detail layanan."
          );
          return res.sendStatus(200);
        }
      }

      if (["hai", "halo", "hi", "menu"].some((k) => userMessage.includes(k))) {
        await sendTextMessage(
          from,
          "Halo! Apakah ada yang bisa saya bantu? \n\nJika Anda ingin melihat informasi layanan yang ada di desa, Anda bisa ketik *layanan* untuk melihat daftar layanan desa."
        );
        return res.sendStatus(200);
      }
      // lama
      // if (reply) {
      //   await sendTextMessage(from, reply);
      // } else if (
      //   !userMessage.startsWith("kategori_") &&
      //   !userMessage.startsWith("layanan_") &&
      //   !["halo", "hi", "menu", "layanan"].includes(userMessage)
      // ) {
      //   try {
      //     const snapshot = await layananRef
      //       .where("status", "==", "active")
      //       .get();
      //     const daftarLayanan = snapshot.docs.map((doc) => doc.data().name);
      //     const aiReply = await callGeminiAPI(userMessage, daftarLayanan);
      //     console.log(`✅ Balasan Gemini: ${aiReply}`);
      //     await sendTextMessage(from, aiReply);
      //   } catch (err) {
      //     console.error("❌ Error Gemini:", err);
      //     await sendAdminContactButton(from);
      //   }
      // }

      // // Baru
      // if (["halo", "hi", "menu"].includes(userMessage)) {
      //   await sendTextMessage(
      //     from,
      //     "Halo! Ketik *layanan* atau Klik *Layanan Yang dibawah* untuk melihat daftar layanan desa."
      //   );
      //   return res.sendStatus(200);
      // }

      // Gemini AI fallback untuk pertanyaan umum
      if (!layananDitemukan) {
        try {
          console.log(`🤖 Mengirim pertanyaan ke Gemini: ${userMessage}`);
          const snapshot = await layananRef
            .where("status", "==", "active")
            .get();
          const daftarLayanan = snapshot.docs.map((doc) => doc.data().name);
          const aiReply = await callGeminiAPI(userMessage, daftarLayanan);
          console.log(`✅ Balasan Gemini: ${aiReply}`);
          await sendTextMessage(from, aiReply);
        } catch (err) {
          console.error("❌ Error Gemini:", err);
          await sendAdminContactButton(from);
        }
        return res.sendStatus(200);
      }

      // fallback terakhir
      return res.sendStatus(200);
    }
  }
  res.sendStatus(404);
});

// Helper untuk kirim tombol interaktif
async function sendInteractiveKategoriButton(to, kategoriList) {
  const buttons = kategoriList.slice(0, 3).map((kategori) => ({
    type: "reply",
    reply: {
      id: `kategori_${kategori.toLowerCase().replace(/\s+/g, "_")}`,
      title: kategori,
    },
  }));

  const openingText = `📌 *Layanan Desa Tlogo*\n\nHalo! Berikut beberapa *kategori layanan* yang tersedia di Desa Tlogo. Silakan pilih salah satu kategori untuk melihat daftar layanan yang tersedia di dalamnya:\n`;

  return await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: openingText,
          },
          action: {
            buttons,
          },
        },
      }),
    }
  );
}

// Helper untuk kirim tombol interaktif layanan
// async function sendInteractiveLayananButton(to, layananList) {
//   const buttons = layananList.slice(0, 3).map((layanan) => ({
//     type: "reply",
//     reply: {
//       id: `layanan_${layanan.name.toLowerCase().replace(/\s+/g, "_")}`,
//       title: layanan.name
//     }
//   }));

//   const text = `📋 Berikut adalah daftar layanan yang tersedia dalam kategori ini. Silakan pilih salah satu:`;

//   return await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${ACCESS_TOKEN}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       messaging_product: "whatsapp",
//       to,
//       type: "interactive",
//       interactive: {
//         type: "button",
//         body: { text },
//         action: { buttons }
//       }
//     })
//   });
// }

//Codingan percobaan
async function sendInteractiveLayananButton(to, layananList) {
  const buttons = layananList.slice(0, 3).map((layanan) => ({
    type: "reply",
    reply: {
      id: `layanan_${layanan.name.toLowerCase().replace(/\s+/g, "_")}`,
      title:
        layanan.name.length > 20
          ? layanan.name.slice(0, 17) + "..."
          : layanan.name,
    },
  }));

  console.log("📨 Kirim tombol layanan ke:", to);
  console.log("📋 Tombol:", buttons);

  const text = `📋 Berikut adalah daftar layanan yang tersedia dalam kategori ini. Silakan pilih salah satu:`;

  return await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text },
          action: { buttons },
        },
      }),
    }
  );
}

// Helper untuk kirim teks biasa
async function sendTextMessage(to, body) {
  return await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body },
      }),
    }
  );
}

// Helper untuk kirim tombol kontak admin
// Jika user mengalami kesulitan, kirimkan tombol untuk menghubungi admin
async function sendAdminContactButton(to) {
  const adminPhone = "6281287789220";
  const adminLink = `https://wa.me/${adminPhone}?text=Halo%20Admin,%20saya%20butuh%20bantuan%20lebih%20lanjut.`;
  const desaWebsite = "https://tlogo-blitar.desa.id"; // Ganti dengan link resmimu

  const text =
    `Sepertinya Anda mengalami kesulitan.\n\n` +
    `Hubungi Admin di sini:\n${adminLink}\n\n` +
    `Atau kunjungi website resmi kami:\n${desaWebsite}`;

  return await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      }),
    }
  );
}

function capitalize(str) {
  return str
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

// Endpoint admin: list pending
app.get("/admin/pending", (req, res) => {
  const pending = JSON.parse(fs.readFileSync(PENDING_FILE));
  res.json(pending);
});

// Endpoint admin: verifikasi berdasarkan index
app.post("/admin/verifikasi/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const pending = JSON.parse(fs.readFileSync(PENDING_FILE));

    if (index >= 0 && index < pending.length) {
      const { from } = pending[index];
      pending.splice(index, 1);
      fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

      await sendTextMessage(
        from,
        "✅ Pembayaran Anda telah diverifikasi. Terima kasih telah membeli paket kami!"
      );
      return res.sendStatus(200);
    }
    res.status(400).json({ error: "Index tidak valid" });
  } catch (err) {
    console.error("Verifikasi gagal:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// Fallback ke dashboard jika user akses root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
);
