"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/Card";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firestore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

interface SignUpFormProps {
    onSignUp?: (email: string) => void;
}

export const RegisterForm: React.FC<SignUpFormProps> = ({ onSignUp }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // ✅ Simpan data user ke Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: serverTimestamp(),
            });
            console.log("Pendaftaran berhasil:", user.email);

            if (onSignUp) {
                onSignUp(user.email || "");
            }
        } catch (error: any) {
            toast.error("Gagal mendaftar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📝</span>
                </div>
                <CardTitle className="text-gray-800">
                    Buat Akun ChatBot
                </CardTitle>
                <CardDescription>
                    Silakan isi formulir berikut untuk mendaftar
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📧 Email Anda
                        </label>
                        <Input
                            type="email"
                            placeholder="contoh: admin@chatbot.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔒 Kata Sandi
                        </label>
                        <Input
                            type="password"
                            placeholder="Buat kata sandi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="text-base"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="large"
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Mendaftarkan...
                            </div>
                        ) : (
                            "📝 Daftar Sekarang"
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Sudah punya akun?
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium ml-1 hover:underline"
                        >
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
