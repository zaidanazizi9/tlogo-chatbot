import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

import Header from "./components/header";
import Sidebar from "./components/Sidebar";
import ServicesPage from "./pages/ServicesPage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from "./pages/LoginPage";
import { Package } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firestore";
import RegisterPage from "./pages/RegisterPage";

// <<<<<<< HEAD
//     const totalLayanan = 56;

//     const renderContent = () => {
//         switch (activeTab) {
//             case "services":
//                 return <ServicesPage />;
//             case "category":
//                 return <CategoryPage />;
//             case "dashboard":
//                 return (
//                     <div className="space-y-6">
//                         {/* Banner Logo & Welcome */}
//                         <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow">
//                             <img
//                                 src="/logo-tlogo.png"
//                                 alt="Logo Panel Tani"
//                                 className="w-24 h-24 object-contain mb-4"
//                             />
//                             <h1 className="text-2xl font-bold text-green-800">
//                                 Selamat Datang, Admin!
//                             </h1>
//                             <p className="text-gray-600 mt-2">
//                                 Kelola layanan dengan mudah melalui dashboard
//                                 ini.
//                             </p>
//                         </div>

//                         {/* Info Total Layanan */}
//                         <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
//                             <div className="p-3 bg-green-100 rounded-full">
//                                 <Package className="w-6 h-6 text-green-600" />
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-600">
//                                     Total Layanan Tani
//                                 </p>
//                                 <p className="text-2xl font-bold text-gray-800">
//                                     {totalLayanan}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 );
//             default:
//                 return (
//                     <div className="flex items-center justify-center h-64">
//                         <div className="text-center">
//                             <h3 className="text-lg font-medium text-gray-900">
//                                 Halaman dalam pengembangan
//                             </h3>
//                             <p className="text-gray-600">
//                                 Fitur ini akan segera tersedia
//                             </p>
//                         </div>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="flex h-screen bg-gray-100">
//             <Toaster position="top-right" reverseOrder={false} />
//             <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <Header />
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
//                     {renderContent()}
//                 </main>
//             </div>
// =======
function DashboardPage() {
    const totalLayanan = 56;

    return (
        <div className="space-y-6">
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
                    Kelola layanan dengan mudah melalui dashboard ini.
                </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                    <Package className="w-6 h-6 text-green-600" />
                    {/* >>>>>>> origin/main */}
                </div>
                <div>
                    <p className="text-sm text-gray-600">Total Layanan Tani</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {totalLayanan}
                    </p>
                </div>
            </div>
        </div>
    );
}

// <<<<<<< HEAD
// export default App;
// =======
function AppLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardPage />;
            case "services":
                return <ServicesPage />;
            case "category":
                return <CategoryPage />;
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

function App() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
            setCheckingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    if (checkingAuth) {
        return <p className="p-4 text-center">Loading...</p>;
    }

    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />

            <Routes>
                {/* Jika user sudah login, redirect dari /login dan /register ke dashboard */}
                <Route
                    path="/login"
                    element={
                        isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />
                    }
                />
                <Route
                    path="/register"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/" replace />
                        ) : (
                            <RegisterPage />
                        )
                    }
                />

                {/* Halaman utama hanya bisa diakses jika sudah login */}
                <Route
                    path="/*"
                    element={
                        isLoggedIn ? (
                            <AppLayout />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

// "use client";

// import { useState } from "react";
// import "../src/App.css";
// import Header from "./components/header";
// import Sidebar from "../src/components/Sidebar";
// import ServicesPage from "../src/pages/ServicesPage";
// import CategoryPage from "./pages/CategoryPage";
// import { Toaster } from "react-hot-toast";
// import { BarChart3, Users, Package, TrendingUp } from "lucide-react";
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import LoginPage from "./pages/LoginPage";

// function App() {

//     const [activeTab, setActiveTab] = useState("dashboard");

//     const totalLayanan = 56; // Ganti dengan nilai dinamis kalau ada

//     const renderContent = () => {
//         switch (activeTab) {
//             case "services":
//                 return <ServicesPage />;
//             case "category":
//                 return <CategoryPage />;
//             case "dashboard":
//                 return (
//                     <div className="space-y-6">
//                         {/* Banner Logo & Welcome */}
//                         <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow">
//                             <img
//                                 src="/logo-tlogo.png"
//                                 alt="Logo Panel Tani"
//                                 className="w-24 h-24 object-contain mb-4"
//                             />
//                             <h1 className="text-2xl font-bold text-green-800">
//                                 Selamat Datang, Admin!
//                             </h1>
//                             <p className="text-gray-600 mt-2">
//                                 Kelola layanan dengan mudah melalui dashboard ini.
//                             </p>
//                         </div>

//                         {/* Info Total Layanan */}
//                         <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
//                             <div className="p-3 bg-green-100 rounded-full">
//                                 <Package className="w-6 h-6 text-green-600" />
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-600">Total Layanan Tani</p>
//                                 <p className="text-2xl font-bold text-gray-800">{totalLayanan}</p>
//                             </div>
//                         </div>
//                     </div>
//                 );
//             default:
//                 return (
//                     <div className="flex items-center justify-center h-64">
//                         <div className="text-center">
//                             <h3 className="text-lg font-medium text-gray-900">
//                                 Halaman dalam pengembangan
//                             </h3>
//                             <p className="text-gray-600">
//                                 Fitur ini akan segera tersedia
//                             </p>
//                         </div>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="flex h-screen bg-gray-100">
//             <Toaster position="top-right" reverseOrder={false} />
//             <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <Header />
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
//                     {renderContent()}
//                 </main>
//             </div>
//         </div>
//     );
// }

// export default App;
// >>>>>>> origin/main
