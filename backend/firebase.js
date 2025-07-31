const admin = require("firebase-admin");
const serviceAccount = require("./tlogo-chatbot-firebase-adminsdk-fbsvc-082cb084b4.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { db };