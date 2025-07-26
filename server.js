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
const ACCESS_TOKEN = "EAAI0wxW3W2IBPDBeF8hcFtRBzZAu7dh9nvaAqeq2iYDRSqKALsDzJwrXGo7yDnwZAA8nZATakhEpwazMSHmWoWyeEkOaLYHDPD9SxR2tZASK8YdXGqioyEIcORoZAQii2ZBfg3fppxzHykG7KPvhXwiDDcTwxayskFFdqOmEvdyMSI2qAZBMfLlHSGisx2Kn6nPr01XnIdGZBpCSvqLtuk29tVGZAzpFvBP9Uj3eC3qXItQZDZD";
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

      if (!sessions[from]) sessions[from] = { step: "awal" };
      const session = sessions[from];
      let reply = null;

      // === FITUR BARU: Menampilkan daftar layanan dari Firestore ===
      if (userMessage.includes("layanan")) {
        try {
          const snapshot = await layananRef.get();
          const layananAktif = snapshot.docs
            .map(doc => doc.data())
            .filter(service => service.status === "active");

          if (layananAktif.length === 0) {
            reply = "Saat ini belum ada layanan yang tersedia.";
          } else {
            reply = "*Daftar Layanan:*\n" + layananAktif.map((s, i) =>
              `${i + 1}. ${s.name} - ${s.description}`).join("\n");
          }

          await sendTextMessage(from, reply);
          return res.sendStatus(200);
        } catch (err) {
          console.error("Gagal ambil layanan:", err);
          await sendTextMessage(from, "Terjadi kesalahan mengambil daftar layanan.");
          return res.sendStatus(200);
        }
      }

      if (session.step === "menunggu_pilihan" && userMessage === "1") {
        reply = `Anda memilih Paket 100 GB seharga Rp20.000.\n\nUntuk melanjutkan pembelian, silakan transfer ke:\n💳 BCA 1234567890 a.n. PT Contoh Data\n\nSetelah transfer, ketik *konfirmasi*.`;
        session.step = "menunggu_konfirmasi";
      } else if (session.step === "menunggu_pilihan" && userMessage === "2") {
        reply = `Anda memilih Paket Unlimited 30 Hari seharga Rp100.000.000.\n\nUntuk melanjutkan pembelian, silakan transfer ke:\n💳 BCA 1234567890 a.n. PT Contoh Data\n\nSetelah transfer, ketik *konfirmasi*.`;
        session.step = "menunggu_konfirmasi";
      } else if (userMessage.includes("konfirmasi") && session.step === "menunggu_konfirmasi") {
        const pending = JSON.parse(fs.readFileSync(PENDING_FILE));
        pending.push({ from, timestamp: Date.now() });
        fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

        reply = `Terima kasih! Permintaan Anda telah dicatat. Mohon tunggu admin memverifikasi pembayaran.`;
        session.step = "selesai";
      } else if (session.step === "selesai" && userMessage.includes("hai")) {
        session.step = "menunggu_pilihan";
        await sendInteractiveButton(from, "Silakan pilih paket kembali:");
        return res.sendStatus(200);
      } else {
        reply = `Ketik *1* atau *2* untuk memilih paket, atau *konfirmasi* jika sudah transfer.`;
      }

      if (reply) await sendTextMessage(from, reply);
      return res.sendStatus(200);
    }
  }
  res.sendStatus(404);
});

// Helper untuk kirim tombol interaktif
async function sendInteractiveButton(to, messageText) {
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
        body: { text: messageText },
        action: {
          buttons: [
            { type: "reply", reply: { id: "1", title: "Paket 100 GB" } },
            { type: "reply", reply: { id: "2", title: "Paket Unlimited" } }
          ]
        }
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
