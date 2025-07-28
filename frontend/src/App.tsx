"use client";

import { useState } from "react";
import "../src/App.css";
import Header from "./components/header";
import Sidebar from "../src/components/Sidebar";
import ServicesPage from "../src/pages/ServicesPage";
import CategoryPage from "./pages/CategoryPage";
import { Toaster } from "react-hot-toast";
import { BarChart3, Users, Package, TrendingUp } from "lucide-react";

function App() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const totalLayanan = 56;

    const renderContent = () => {
        switch (activeTab) {
            case "services":
                return <ServicesPage />;
            case "category":
                return <CategoryPage />;
            case "dashboard":
                return (
                    <div className="space-y-6">
                        {/* Banner Logo & Welcome */}
                        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow">
                            <img
                                src="/logo-tlogo.png"
                                alt="Logo Panel Tani"
                                className="w-24 h-24 object-contain mb-4"
                            />
                            <h1 className="text-2xl font-bold text-green-800">
                                Selamat Datang, Admin!
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Kelola layanan dengan mudah melalui dashboard
                                ini.
                            </p>
                        </div>

                        {/* Info Total Layanan */}
                        <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Layanan Tani
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {totalLayanan}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Halaman dalam pengembangan
                            </h3>
                            <p className="text-gray-600">
                                Fitur ini akan segera tersedia
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster position="top-right" reverseOrder={false} />
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default App;
