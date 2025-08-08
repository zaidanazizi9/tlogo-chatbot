import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

import Header from "./components/header";
import Sidebar from "./components/Sidebar";
import ServicesPage from "./pages/ServicesPage";
import CategoryPage from "./pages/CategoryPage";
import { ListTodo } from "lucide-react";
import { db } from "./config/firestore";
import ProtectedRoute from "./components/ProtectedRule";
import SessionTimeoutEnforcer from "./components/SetTimeOut";
import { collection, getCountFromServer } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
import { SignIn, SignUp } from "@clerk/clerk-react";
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}
function DashboardPage() {
    const [totalServices, setTotalServices] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTotalServices = async () => {
            try {
                const coll = collection(db, "services");
                const snapshot = await getCountFromServer(coll);
                setTotalServices(snapshot.data().count);
                setIsLoading(false);
            } catch (error) {
                console.error("Gagal mengambil total layanan:", error);
            }
        };

        fetchTotalServices();
    }, []);

    return isLoading ? (
        <div className="flex items-center -translate-y-20 justify-center h-screen">
            <ClipLoader size={80} color="rgba(22, 163,74)" />
        </div>
    ) : (
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
                    <ListTodo className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-600">
                        Total Layanan yang Tersedia
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        {totalServices}
                    </p>
                </div>
            </div>
        </div>
    );
}

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
                <SessionTimeoutEnforcer />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                {/* Route publik untuk login */}
                <Route
                    path="/login/*" // semua jalur OTP juga termasuk
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-100">
                            <SignIn
                                path="/login"
                                routing="path"
                                signInUrl="/login"
                                fallbackRedirectUrl="/dashboard" // atau "/"
                                appearance={{
                                    elements: {
                                        card: "shadow-xl rounded-xl border border-gray-200", // tambahan custom
                                    },
                                }}
                            />
                        </div>
                    }
                />

                {/* Route publik untuk register */}
                <Route
                    path="/register"
                    element={
                        <SignUp
                            path="/register"
                            routing="path"
                            fallbackRedirectUrl="/dashboard"
                        />
                    }
                />

                {/* Semua route lain dibungkus dengan ProtectedRoute */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
