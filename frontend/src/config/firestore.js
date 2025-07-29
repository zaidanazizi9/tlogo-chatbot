// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqQ-7J83gwtHMz4zlfQvTFRqKykPh-0HA",
    authDomain: "tlogo-chatbot.firebaseapp.com",
    projectId: "tlogo-chatbot",
    storageBucket: "tlogo-chatbot.firebasestorage.app",
    messagingSenderId: "998190390911",
    appId: "1:998190390911:web:b50bc279fd3e7fa654e94a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
