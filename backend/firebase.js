const admin = require('firebase-admin');
const serviceAccount = require('./chatbot-4d0fe-firebase-adminsdk-fbsvc-93fb12db18.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { db };
