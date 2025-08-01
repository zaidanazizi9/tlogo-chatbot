import type React from "react";
import { LoginForm } from "../components/LoginForm";
import toast from "react-hot-toast";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../config/firestore";
import {
    fetchSignInMethodsForEmail,
    signInWithEmailAndPassword,
} from "firebase/auth";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const handleLogin = (email: string) => {
        console.log("Login berhasil:", { email });
        toast.success("Login berhasil! Selamat datang di ChatBot Admin");
    };

    // const handleLogin = async (email: string, password: string) => {
    //     try {
    //         // 1. Cari UID berdasarkan email dari koleksi users
    //         const userQuery = query(
    //             collection(db, "users"),
    //             where("email", "==", email)
    //         );
    //         const userSnap = await getDocs(userQuery);

    //         if (userSnap.empty) {
    //             toast.error("Akun tidak ditemukan.");
    //             return;
    //         }

    //         const uid = userSnap.docs[0].id;

    //         // 2. Cek status session login
    //         const sessionRef = doc(db, "userSessions", uid);
    //         const sessionSnap = await getDoc(sessionRef);
    //         if (sessionSnap.exists() && sessionSnap.data().isLoggedIn) {
    //             toast.error("Akun sedang login di perangkat lain.");
    //             return;
    //         }

    //         // 3. Login
    //         const userCredential = await signInWithEmailAndPassword(
    //             auth,
    //             email,
    //             password
    //         );

    //         // 4. Simpan session
    //         const newSessionId = crypto.randomUUID();
    //         await setDoc(doc(db, "userSessions", uid), {
    //             isLoggedIn: true,
    //             sessionId: newSessionId,
    //             lastLogin: serverTimestamp(),
    //         });

    //         localStorage.setItem("sessionId", newSessionId);

    //         toast.success("Login berhasil!");
    //         navigate("/dashboard"); // ganti dengan rute kamu
    //     } catch (error: any) {
    //         toast.error("Gagal login: " + error.message);
    //     }
    // };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header Sederhana */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        ChatBot Admin
                    </h1>
                    <p className="text-lg text-gray-600">
                        Dashboard Pengelolaan ChatBot
                    </p>
                </div>

                {/* Form Login */}
                <LoginForm onLogin={handleLogin} />

                {/* Footer Sederhana */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Butuh bantuan?
                        <button className="text-green-600 hover:text-green-700 font-medium ml-1 hover:underline">
                            Hubungi Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
