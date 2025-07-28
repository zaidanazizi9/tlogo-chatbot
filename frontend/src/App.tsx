"use client";

import { useState } from "react";
import "../src/App.css";
import Header from "./components/header";
import Sidebar from "../src/components/Sidebar";
import ServicesPage from "../src/pages/ServicesPage";
import { BarChart3, Users, Package, TrendingUp } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CategoryPage from "./pages/CategoryPage";

function App() {
    const [activeTab, setActiveTab] = useState("services");

    const renderContent = () => {
        switch (activeTab) {
            case "services":
                return <ServicesPage />;
            case "category":
                return <CategoryPage />;
            case "dashboard":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Dashboard Overview
                            </h2>
                            <p className="text-gray-600">
                                Selamat datang di dashboard admin
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Pengguna
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            1,234
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Package className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Layanan
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            56
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Penjualan
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            Rp 45M
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Pertumbuhan
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            +12%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">
                                Aktivitas Terbaru
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                        Layanan baru "Konsultasi Digital"
                                        ditambahkan
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                        5 pengguna baru mendaftar hari ini
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                        Laporan bulanan telah dibuat
                                    </span>
                                </div>
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
