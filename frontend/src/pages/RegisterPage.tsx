// pages/RegisterPage.tsx
"use client";

import type React from "react";
import { RegisterForm } from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = (email: string) => {
    toast.success(`Pendaftaran berhasil untuk ${email}! Silakan login`);
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Pendaftaran ChatBot
          </h1>
          <p className="text-lg text-gray-600">Buat akun admin baru</p>
        </div>

        {/* Form Sign Up */}
        <RegisterForm onSignUp={handleSignUp} />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Butuh bantuan?
            <button className="text-blue-600 hover:text-blue-700 font-medium ml-1 hover:underline">
              Hubungi Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
