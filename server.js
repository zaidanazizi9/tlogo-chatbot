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

//Inisialisasi Firebase Admin SDK
const serviceAccount = require("./backend/tlogo-chatbot-firebase-adminsdk-fbsvc-082cb084b4.json");

const sessions = {}; //melacak sesi user

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const layananRef = db.collection("services");

//Fungsi untuk mengirim pesan bingung
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

// Menerima pesan masuk dari WhatsApp Gateway
app.post("/webhook", async (req, res) => {
    const body = req.body;

    // === ✅ HANDLE WA GATEWAY (Slackersender, wagw.readytoride.id) ===
    // 🟢 SLACKERSENDER Webhook
    if (body.from && body.message) {
        const from = body.from;
        const userMessage = body.message.toLowerCase();

        console.log("📥 Pesan diterima dari:", from);
        console.log("💬 Isi pesan:", userMessage);

        if (isUserConfused(userMessage)) {
            await sendAdminContactButton(
                from,
                "Sepertinya Anda mengalami kesulitan."
            );
            return res.sendStatus(200);
        }

        const layananRef = db.collection("services");
        const layananSnapshot = await layananRef.get();
        const layananList = layananSnapshot.docs.map((doc) => doc.data());

        const layananDitemukan = layananList.find((layanan) => {
            const nama = layanan.name.toLowerCase();
            return nama.split(" ").some((kata) => userMessage.includes(kata));
        });

        if (layananDitemukan) {
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

                const kategoriUnik = [
                    ...new Set(layananAktif.map((l) => l.category)),
                ];

                console.log("🧩 Kategori ditemukan:", kategoriUnik); // <== Tambahkan ini

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

        if (userMessage.startsWith("kategori_")) {
            const selectedKategori = userMessage
                .replace("kategori_", "")
                .replace(/_/g, " ");
            console.log("👉 Kategori dipilih:", selectedKategori);

            try {
                const snapshot = await layananRef
                    .where("status", "==", "active")
                    .get();
                const layananDalamKategori = snapshot.docs
                    .map((doc) => doc.data())
                    .filter(
                        (service) =>
                            service.category.toLowerCase() ===
                            selectedKategori.toLowerCase()
                    );

                if (layananDalamKategori.length === 0) {
                    await sendTextMessage(
                        from,
                        `Tidak ditemukan layanan dalam kategori *${capitalize(
                            selectedKategori
                        )}*.`
                    );
                } else {
                    await sendInteractiveLayananButton(
                        from,
                        layananDalamKategori
                    );
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
                    (l) =>
                        l.name.toLowerCase() === namaLayananSlug.toLowerCase()
                );

                if (!layanan) {
                    await sendTextMessage(
                        from,
                        `❌ Layanan *${capitalize(
                            namaLayananSlug
                        )}* tidak ditemukan.`
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

        if (
            ["hai", "halo", "hi", "menu"].some((k) => userMessage.includes(k))
        ) {
            await sendTextMessage(
                from,
                "Halo! Ketik *layanan* untuk melihat daftar layanan desa."
            );
            return res.sendStatus(200);
        }

        if (!layananDitemukan) {
            try {
                console.log(`🤖 Mengirim pertanyaan ke Gemini: ${userMessage}`);
                const snapshot = await layananRef
                    .where("status", "==", "active")
                    .get();
                const daftarLayanan = snapshot.docs.map(
                    (doc) => doc.data().name
                );
                const aiReply = await callGeminiAPI(userMessage, daftarLayanan);
                console.log(`✅ Balasan Gemini: ${aiReply}`);
                await sendTextMessage(from, aiReply);
            } catch (err) {
                console.error("❌ Error Gemini:", err);
                await sendAdminContactButton(from);
            }
            return res.sendStatus(200);
        }

        return res.sendStatus(200);
    }

    res.sendStatus(404);
});

//Handle kirim pesan
// async function sendInteractiveKategoriButton(to, kategoriList) {
//   const buttons = kategoriList.slice(0, 3).map((kategori) => ({
//     type: "reply",
//     reply: {
//       id: `kategori_${kategori.toLowerCase().replace(/\s+/g, "_")}`,
//       title: kategori,
//     },
//   }));

//   const openingText = `📌 *Layanan Desa Tlogo*\n\nHalo! Berikut beberapa *kategori layanan* yang tersedia di Desa Tlogo. Silakan pilih salah satu kategori untuk melihat daftar layanan yang tersedia di dalamnya:\n`;

//   return await fetch(
//     `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         type: "interactive",
//         interactive: {
//           type: "button",
//           body: {
//             text: openingText,
//           },
//           action: {
//             buttons,
//           },
//         },
//       }),
//     }
//   );
// }

// //Codingan percobaan
// async function sendInteractiveLayananButton(to, layananList) {
//   const buttons = layananList.slice(0, 3).map((layanan) => ({
//     type: "reply",
//     reply: {
//       id: `layanan_${layanan.name.toLowerCase().replace(/\s+/g, "_")}`,
//       title:
//         layanan.name.length > 20
//           ? layanan.name.slice(0, 17) + "..."
//           : layanan.name,
//     },
//   }));

//   console.log("📨 Kirim tombol layanan ke:", to);
//   console.log("📋 Tombol:", buttons);

//   const text = `📋 Berikut adalah daftar layanan yang tersedia dalam kategori ini. Silakan pilih salah satu:`;

//   return await fetch(
//     `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         type: "interactive",
//         interactive: {
//           type: "button",
//           body: { text },
//           action: { buttons },
//         },
//       }),
//     }
//   );
// }
// // Mengirim pesan balasan ke Gateway
// const sendTextMessage = async (number, message) => {
//     try {
//         const res = await fetch("https://wagw.readytoride.id/send-message", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 api_key: "de33ZtRbkwjE1OYRb8HYsJDzEOXjmO",
//                 sender: "6285850211470",
//                 number: number,
//                 message: message,
//             }),
//         });

//         const result = await res.text(); // atau gunakan res.json() jika respon-nya JSON
//         console.log("📤 Balasan Gateway:", result);
//     } catch (err) {
//         console.error("❌ Gagal kirim pesan:", err);
//     }
// };

// // Helper untuk kirim tombol kontak admin
// // Jika user mengalami kesulitan, kirimkan tombol untuk menghubungi admin
// async function sendAdminContactButton(to) {
//   const adminPhone = "6281287789220";
//   const adminLink = `https://wa.me/${adminPhone}?text=Halo%20Admin,%20saya%20butuh%20bantuan%20lebih%20lanjut.`;
//   const desaWebsite = "https://tlogo-blitar.desa.id"; // Ganti dengan link resmimu

//   const text =
//     `Sepertinya Anda mengalami kesulitan.\n\n` +
//     `Hubungi Admin di sini:\n${adminLink}\n\n` +
//     `Atau kunjungi website resmi kami:\n${desaWebsite}`;

//   return await fetch(
//     `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         text: { body: text },
//       }),
//     }
//   );
// }

const sendTextMessage = async (number, message) => {
    try {
        const res = await fetch("https://wagw.readytoride.id/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: "de33ZtRbkwjE1OYRb8HYsJDzEOXjmO",
                sender: "6285850211470",
                number: number,
                message: message,
            }),
        });

        const result = await res.text(); // atau gunakan res.json() jika respon-nya JSON
        console.log("📤 Balasan Gateway:", result);
    } catch (err) {
        console.error("❌ Gagal kirim pesan:", err);
    }
};

async function sendInteractiveKategoriButton(to, kategoriList) {
    const buttons = kategoriList.slice(0, 3).map((kategori) => ({
        type: "copy",
        id: `kategori_${kategori.toLowerCase().replace(/\s+/g, "_")}`,
        displayText: kategori,
    }));

    const message = `📌 *Layanan Desa Tlogo*\n\nHalo! Berikut beberapa *kategori layanan* yang tersedia di Desa Tlogo. Silakan pilih salah satu kategori untuk melihat daftar layanan yang tersedia di dalamnya:\n`;

    try {
        const res = await fetch("https://wagw.readytoride.id/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sender: "6285850211470",
                api_key: "de33ZtRbkwjE1OYRb8HYsJDzEOXjmO",
                number: to,
                message,
                footer: "Pilih kategori",
                button: buttons,
            }),
        });

        const result = await res.text();
        console.log("📤 Response dari wagw:", result);
    } catch (error) {
        console.error("❌ Error kirim kategori button:", error);
    }
}

async function sendInteractiveLayananButton(to, layananList) {
    const buttons = layananList.slice(0, 4).map((layanan) => ({
        type: "reply",
        displayText:
            layanan.name.length > 20
                ? layanan.name.slice(0, 17) + "..."
                : layanan.name,
    }));

    const message = `📋 Berikut adalah daftar layanan yang tersedia dalam kategori ini. Silakan pilih salah satu:`;

    return await fetch("https://wagw.readytoride.id/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: "6285850211470",
            api_key: "de33ZtRbkwjE1OYRb8HYsJDzEOXjmO",
            number: to,
            message,
            footer: "Pilih layanan",
            button: buttons,
        }),
    });
}

async function sendAdminContactButton(to, customMessage = null) {
    const adminPhone = "6281287789220";
    const adminLink =
        "https://wa.me/6281287789220?text=Halo%20Admin,%20saya%20butuh%20bantuan%20lebih%20lanjut.";
    const desaWebsite = "https://tlogo-blitar.desa.id";

    const message =
        customMessage ||
        `Sepertinya Anda mengalami kesulitan.\n\nHubungi Admin di sini:\n${adminLink}\n\nAtau kunjungi website resmi kami:\n${desaWebsite}`;

    const buttons = [
        {
            type: "call",
            displayText: "Hubungi Admin",
            phoneNumber: adminPhone,
        },
        {
            type: "url",
            displayText: "Kunjungi Website",
            url: desaWebsite,
        },
        {
            type: "copy",
            displayText: "Salin Nomor",
            copyCode: adminPhone,
        },
    ];

    return await fetch("https://wagw.readytoride.id/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: "6285850211470",
            api_key: "de33ZtRbkwjE1OYRb8HYsJDzEOXjmO",
            number: to,
            message,
            footer: "Pilih salah satu aksi",
            button: buttons,
        }),
    });
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
