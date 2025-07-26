// admin.js
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ACCESS_TOKEN = "EAAI0wxW3W2IBPMDnCVKCJ4MeBZBPj4DDzKO2DQ7s01Ml1LJHTLQOZCxK2MTINaIqNlzee9sSr9qjgK0JwWR9FOGetiOGe4ZCkddoln5bQHrf3nAkVF3Yzzj00OuZCZCY3AYuRL8xT8Th0qIK9x56gRDKOf07VPSxiJJPIdaBwXderPuECJvmJhkmSOk6ZCgAZDZD";
const PHONE_NUMBER_ID = "693707970499139";
const PENDING_FILE = "pending_verifikasi.json";


// Ambil pending
let pending = JSON.parse(fs.readFileSync(PENDING_FILE));

if (pending.length === 0) {
  console.log("Tidak ada yang perlu diverifikasi.");
  process.exit();
}

const target = pending.shift();
fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

console.log(`📨 Mengirim verifikasi ke ${target.from}...`);

fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messaging_product: "whatsapp",
    to: target.from,
    text: { body: "✅ Pembayaran Anda telah diverifikasi. Paket akan segera diproses." }
  })
}).then(res => res.json())
  .then(data => {
    console.log("✅ Verifikasi terkirim:", data);
  });
