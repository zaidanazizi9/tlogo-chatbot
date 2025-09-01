require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const fs = require("fs");
const path = require("path");
// const admin = require("firebase-admin");
const { callGeminiAPI } = require("./gemini");

app.use(express.json());
app.use(express.static("public")); // untuk menyajikan file statis dari folder public

const PORT = process.env.PORT || 3000;

//Inisialisasi Firebase Admin SDK
const sessions = {}; //melacak sesi user
const userState = new Map(); // userState: { phoneNumber -> selectedCategory }

// const db = admin.firestore();
const { db } = require("./firebase");
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
    console.log("📥 Webhook HIT");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    const body = req.body;

    // === ✅ HANDLE WA GATEWAY (Slackersender, wagw.readytoride.id) ===
    // 🟢 SLACKERSENDER Webhook
    if (body.from && body.message) {
        const from = body.from;
        const userMessage = body.message.toLowerCase();

        console.log("📥 Pesan diterima dari:", from);
        console.log("💬 Isi pesan:", userMessage);

        if (isUserConfused(userMessage)) {
            await sendAdminContactButton(from);
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
            const m = userMessage;
            const name = layananDitemukan.name;

            // Keyword checks
            const mHas = (keyword) => m.includes(keyword);
            const hasSyarat = mHas("syarat");
            const hasProsedur = mHas("prosedur");
            const hasWaktu = mHas("waktu") || mHas("jadwal");
            const hasTempat = mHas("tempat") || mHas("lokasi");

            const infoParts = [];

            if (hasSyarat) {
                infoParts.push(
                    `📄 *Syarat & Ketentuan ${name}*\n${layananDitemukan.termsAndConditions}`
                );
            }
            if (hasProsedur) {
                infoParts.push(
                    `🔄 *Prosedur ${name}*\n${layananDitemukan.procedure}`
                );
            }
            if (hasWaktu) {
                infoParts.push(
                    `🕒 *Waktu Pelayanan ${name}*\n${layananDitemukan.time}`
                );
            }
            if (hasTempat) {
                infoParts.push(
                    `📍 *Tempat Pelayanan ${name}*\n${layananDitemukan.place}`
                );
            }

            if (infoParts.length > 0) {
                reply = infoParts.join("\n\n");
            } else {
                // Default if no specific keyword is detected
                reply =
                    `ℹ️ *${name}*\n\n` +
                    `📄 *Syarat:*\n${layananDitemukan.termsAndConditions}\n\n` +
                    `🔄 *Prosedur:*\n${layananDitemukan.procedure}\n\n` +
                    `🕒 *Jadwal:*\n${layananDitemukan.time}`;
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
                ].slice(0, 3);
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

        // Jika user kirim angka 1 atau 2 digit
        if (/^\d{1,2}$/.test(userMessage.trim())) {
            const userSelection = parseInt(userMessage.trim(), 10);

            // 1. Cek apakah user sudah pilih kategori sebelumnya?
            if (userState.has(from)) {
                const { kategori, layananList } = userState.get(from);
                if (userSelection > 0 && userSelection <= layananList.length) {
                    const selectedLayanan = layananList[userSelection - 1];
                    function formatField(label, value) {
                        const val = value?.trim();
                        return val && val !== "-"
                            ? `*${label}:*\n${val}\n\n`
                            : "";
                    }

                    const detailMsg =
                        `📄 *Detail Layanan: ${selectedLayanan.name}*\n\n` +
                        formatField("Deskripsi", selectedLayanan.description) +
                        formatField("Catatan", selectedLayanan.notes) +
                        formatField(
                            "Syarat & Ketentuan",
                            selectedLayanan.termsAndConditions
                        ) +
                        formatField("Prosedur", selectedLayanan.procedure) +
                        formatField("Tempat Pelayanan", selectedLayanan.place) +
                        formatField("Waktu Pelayanan", selectedLayanan.time);

                    await sendTextMessage(from, detailMsg);

                    userState.delete(from); // hapus state setelah selesai
                } else {
                    await sendTextMessage(from, "Nomor layanan tidak valid.");
                }

                return res.sendStatus(200);
            }

            // 2. Jika belum pilih kategori, berarti ini adalah pilihan kategori
            const snapshot = await layananRef
                .where("status", "==", "active")
                .get();
            const layananAktif = snapshot.docs.map((doc) => doc.data());

            const kategoriUnik = [
                ...new Set(layananAktif.map((l) => l.category)),
            ].slice(0, 9);

            const index = userSelection - 1;
            if (index >= 0 && index < kategoriUnik.length) {
                const selectedKategori = kategoriUnik[index];
                console.log(
                    "👉 Kategori dipilih dari angka:",
                    selectedKategori
                );

                const layananDalamKategori = layananAktif.filter(
                    (l) =>
                        l.category.toLowerCase() ===
                        selectedKategori.toLowerCase()
                );

                if (layananDalamKategori.length === 0) {
                    await sendTextMessage(
                        from,
                        `Tidak ditemukan layanan dalam kategori *${selectedKategori}*.`
                    );
                } else {
                    await sendInteractiveLayananButton(
                        from,
                        layananDalamKategori
                    );
                    userState.set(from, {
                        kategori: selectedKategori,
                        layananList: layananDalamKategori,
                    }); // simpan kategori yg dipilih user
                }

                return res.sendStatus(200);
            } else {
                await sendTextMessage(from, "Nomor kategori tidak valid.");
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
                "Halo! Apakah ada yang bisa saya bantu? \n\nJika Anda ingin melihat informasi layanan yang ada di desa, Anda bisa ketik *layanan* untuk melihat daftar layanan desa."
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

const sendTextMessage = async (number, message) => {
    try {
        const res = await fetch("https://wagw.readytoride.id/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.WAGW_API_KEY,
                sender: process.env.WA_NUMBER,
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
    const textList = kategoriList
        .slice(0, 9) // maksimal 9 agar mudah dibaca
        .map((kategori, i) => `${i + 1}. ${kategori}`)
        .join("\n");

    const message = `📌 *Layanan Desa Tlogo*\n\nBerikut daftar *kategori layanan* yang tersedia:\n\n${textList}\n\nKetik *angka* kategori (misal: *1*) untuk melihat layanan dalam kategori tersebut.`;

    try {
        const res = await sendTextMessage(to, message);
        console.log("📤 Kategori list sent.");
    } catch (err) {
        console.error("❌ Gagal kirim list kategori:", err);
    }
}

async function sendInteractiveLayananButton(to, layananList) {
    const buttons = layananList.slice(0, 4).map((layanan, index) => ({
        type: "reply",
        id: `layanan_${index + 1}`,
        displayText:
            layanan.name.length > 20
                ? `${index + 1}. ${layanan.name.slice(0, 17)}...`
                : `${index + 1}. ${layanan.name}`,
    }));

    const daftarTeks = layananList
        .slice(0, 9)
        .map((layanan, index) => `*${index + 1}.* ${layanan.name}`)
        .join("\n");

    const message = `📋 *Daftar Layanan Tersedia*\n\n${daftarTeks}\n\nSilakan pilih salah satu layanan berikut.`;

    try {
        const res = await fetch("https://wagw.readytoride.id/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sender: "6285191330330",
                api_key: "nMLUrJsihSYRO93y2LC2DammLFvph8",
                number: to,
                message,
                footer: "Pilih layanan",
                button: buttons,
            }),
        });

        const result = await res.text();
        console.log("📤 Response dari wagw:", result);
    } catch (err) {
        console.error("❌ Error kirim daftar layanan:", err);
    }
}

async function sendAdminContactButton(to, customMessage = null) {
    const adminPhone = "6281287789220";
    const adminLink =
        "https://wa.me/6281287789220?text=Halo%20Admin,%20saya%20butuh%20bantuan%20lebih%20lanjut.";
    const desaWebsite = "https://tlogo-blitar.desa.id";

    const message = `Sepertinya Anda mengalami kesulitan.\n\nHubungi Admin di sini:\n${adminLink}\n\nAtau kunjungi website resmi kami:\n${desaWebsite}`;

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
            sender: "6285191330330",
            api_key: "nMLUrJsihSYRO93y2LC2DammLFvph8",
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
