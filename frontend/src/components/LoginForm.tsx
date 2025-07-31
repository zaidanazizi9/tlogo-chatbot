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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firestore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface LoginFormProps {
    onLogin?: (email: string, password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // const handleSubmit = async (e: React.FormEvent) => {
    //   e.preventDefault();
    //   setIsLoading(true);

    //   // Simulasi loading
    //   setTimeout(() => {
    //     if (onLogin) {
    //       onLogin(email, password);
    //     }
    //     setIsLoading(false);
    //   }, 1000);
    // };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;
            console.log("Login berhasil:", user.email);
            // onLogin?.(email, password);
            if (onLogin) {
                await onLogin(email, password);
            }
        } catch (error: any) {
            console.error("Login gagal:", error);
            if (error.code === "auth/user-not-found") {
                toast.error(
                    "Akun tidak ditemukan. Silakan daftar terlebih dahulu."
                );
            } else if (error.code === "auth/wrong-password") {
                toast.error("Kata sandi salah.");
            } else {
                toast.error("Login gagal. Coba lagi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🤖</span>
                </div>
                <CardTitle className="text-gray-800">
                    Masuk ke ChatBot
                </CardTitle>
                <CardDescription>
                    Silakan masukkan informasi Anda untuk melanjutkan
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                            placeholder="Masukkan kata sandi Anda"
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
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sedang Masuk...
                            </div>
                        ) : (
                            "✨ Masuk Sekarang"
                        )}
                    </Button>
                </form>

                {/* Bagian lupa password */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Lupa kata sandi?
                        <button className="text-green-600 hover:text-green-700 font-medium ml-1 hover:underline">
                            Klik di sini
                        </button>
                    </p>
                </div>

                {/* Bagian daftar akun baru */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Belum punya akun?
                        <Link to="/register">Daftar di sini</Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    // return (
    //   <Card className="w-full max-w-md mx-auto">
    //     <CardHeader>
    //       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
    //         <span className="text-4xl">🤖</span>
    //       </div>
    //       <CardTitle className="text-gray-800">Masuk ke ChatBot</CardTitle>
    //       <CardDescription>
    //         Silakan masukkan informasi Anda untuk melanjutkan
    //       </CardDescription>
    //     </CardHeader>

    //     <CardContent>
    //       <form onSubmit={handleSubmit} className="space-y-6">
    //         <div className="space-y-2">
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             📧 Email Anda
    //           </label>
    //           <Input
    //             type="email"
    //             placeholder="contoh: admin@chatbot.com"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             required
    //             className="text-base"
    //           />
    //         </div>

    //         <div className="space-y-2">
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             🔒 Kata Sandi
    //           </label>
    //           <Input
    //             type="password"
    //             placeholder="Masukkan kata sandi Anda"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             required
    //             className="text-base"
    //           />
    //         </div>

    //         <Button
    //           type="submit"
    //           size="large"
    //           disabled={isLoading}
    //           className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    //         >
    //           {isLoading ? (
    //             <div className="flex items-center justify-center gap-2">
    //               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    //               Sedang Masuk...
    //             </div>
    //           ) : (
    //             "✨ Masuk Sekarang"
    //           )}
    //         </Button>
    //       </form>

    //       <div className="mt-8 text-center">
    //         <p className="text-sm text-gray-500">
    //           Lupa kata sandi?
    //           <button className="text-green-600 hover:text-green-700 font-medium ml-1 hover:underline">
    //             Klik di sini
    //           </button>
    //         </p>
    //       </div>
    //     </CardContent>
    //   </Card>
    // );
};
