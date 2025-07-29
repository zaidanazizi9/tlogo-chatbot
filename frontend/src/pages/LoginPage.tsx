import type React from "react";
import { LoginForm } from "../components/LoginForm";
import toast from "react-hot-toast";

const LoginPage: React.FC = () => {
  const handleLogin = (email: string) => {
    console.log("Login berhasil:", { email });
    toast.success("Login berhasil! Selamat datang di ChatBot Admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Sederhana */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ChatBot Admin
          </h1>
          <p className="text-lg text-gray-600">Dashboard Pengelolaan ChatBot</p>
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
