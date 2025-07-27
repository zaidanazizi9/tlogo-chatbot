// server.js
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const axios = require('axios');
const admin = require('firebase-admin');  

app.use(express.json());
app.use(express.static("public")); // untuk menyajikan file statis dari folder public

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./backend/chatbot-4d0fe-firebase-adminsdk-fbsvc-93fb12db18.json');

const VERIFY_TOKEN = "desa_tlogo";
const ACCESS_TOKEN = "EAAI0wxW3W2IBPBfvAysJTCqXIgKjPriwhDZAXE8wh0c9qcLBLyZCAylcENj2ElY80C4Si2PUZC0ZBsWhZBi3L34JaB8SyY14OrZCHfDeInE8L2H20MrJztZALO4YRfK7o24RkzgtlFRH3SksQUCBvxInhsbZBnHDpQO8Ieu8ZC26UoLktnvyPqScMmXbhvMGzuaYfSCpVhBrQZCZAu5gIVuQGFeoJGwmAZBkxgkpESwoaLyOOwZDZD";
const PHONE_NUMBER_ID = "693707970499139";
const PENDING_FILE = "./pending_verifikasi.json";

const sessions = {}; // melacak status user


// Buat file pending jika belum ada
if (!fs.existsSync(PENDING_FILE)) {
  fs.writeFileSync(PENDING_FILE, "[]", "utf-8");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const layananRef = db.collection('services');

app.get('/api/layanan', async (req, res) => {
  try {
    const snapshot = await layananRef.get();
    const layanan = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(layanan);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil layanan' });
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
      } else if (message.type === "interactive" && message.interactive?.type === "button_reply") {
        userMessage = message.interactive.button_reply.id.toLowerCase();
      }

      console.log("User message:", userMessage); //buat debugging

      if (!sessions[from]) sessions[from] = { step: "awal" };
      const session = sessions[from];
      let reply = null;

      // === FITUR BARU: Menampilkan daftar kategori layanan dari Firestore ===
      if (userMessage === "layanan") {
        try {
          const snapshot = await layananRef.get();
          const layananAktif = snapshot.docs
            .map(doc => doc.data())
            .filter(service => service.status === "active");

          if (layananAktif.length === 0) {
            await sendTextMessage(from, "Saat ini belum ada layanan yang tersedia.");
            return res.sendStatus(200);
          }

          // Ambil kategori unik
          const kategoriUnik = [...new Set(layananAktif.map(l => l.category))];

          // Kirim tombol interaktif (maks 3)
          await sendInteractiveKategoriButton(from, kategoriUnik);
          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil layanan:", err);
          await sendTextMessage(from, "Terjadi kesalahan mengambil daftar layanan.");
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
        const selectedKategori = userMessage.replace("kategori_", "").replace(/_/g, " ");
        console.log("👉 Kategori dipilih:", selectedKategori);

        try {
          const snapshot = await layananRef.where("status", "==", "active").get();

          console.log("📦 Semua layanan aktif:");
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- Nama: ${data.name}, Kategori: ${data.category}`);
          });

          const layananDalamKategori = snapshot.docs
            .map(doc => doc.data())
            .filter(service => service.category.toLowerCase() === selectedKategori.toLowerCase());

          console.log("✅ Ditemukan layanan:", layananDalamKategori.length);

          if (layananDalamKategori.length === 0) {
            await sendTextMessage(from, `Tidak ditemukan layanan dalam kategori *${capitalize(selectedKategori)}*.`);
          } else {
            await sendInteractiveLayananButton(from, layananDalamKategori);
          }

          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil layanan:", err);
          await sendTextMessage(from, "Terjadi kesalahan saat mengambil data layanan.");
          return res.sendStatus(200);
        }
      }

      // === FITUR BARU: Menampilkan detail layanan ===
      if (userMessage.startsWith("layanan_")) {
        const namaLayananSlug = userMessage.replace("layanan_", "").replace(/_/g, " ");

        try {
          const snapshot = await layananRef
            .where("status", "==", "active")
            .get();

          const layananAktif = snapshot.docs.map(doc => doc.data());

          const layanan = layananAktif.find(l =>
            l.name.toLowerCase() === namaLayananSlug.toLowerCase()
          );

          if (!layanan) {
            await sendTextMessage(from, `❌ Layanan *${capitalize(namaLayananSlug)}* tidak ditemukan.`);
          } else {
            const detailText = `📄 *${layanan.name}*\n\n📘 *Deskripsi:* ${layanan.description}\n📑 *Syarat & Ketentuan:* ${layanan.termsAndConditions}\n🧭 *Prosedur:* ${layanan.procedure}`;

            await sendTextMessage(from, detailText);
          }

          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil detail layanan:", err);
          await sendTextMessage(from, "Terjadi kesalahan saat mengambil detail layanan.");
          return res.sendStatus(200);
        }
      }

      if (reply) await sendTextMessage(from, reply);
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
      title: kategori
    }
  }));

  const openingText = `📌 *Layanan Desa Tlogo*\n\nHalo! Berikut beberapa *kategori layanan* yang tersedia di Desa Tlogo. Silakan pilih salah satu kategori untuk melihat daftar layanan yang tersedia di dalamnya:\n`;

  return await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: openingText
        },
        action: {
          buttons
        }
      }
    })
  });
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
      title: layanan.name.length > 20 ? layanan.name.slice(0, 17) + "..." : layanan.name
    }
  }));

  console.log("📨 Kirim tombol layanan ke:", to);
  console.log("📋 Tombol:", buttons);

  const text = `📋 Berikut adalah daftar layanan yang tersedia dalam kategori ini. Silakan pilih salah satu:`;

  return await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text },
        action: { buttons }
      }
    })
  });
}


// Helper untuk kirim teks biasa
async function sendTextMessage(to, body) {
  return await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body }
    })
  });
}

function capitalize(str) {
  return str.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
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

      await sendTextMessage(from, "✅ Pembayaran Anda telah diverifikasi. Terima kasih telah membeli paket kami!");
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

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
