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
import { ListTodo } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./config/firestore";
import { SignIn, SignUp } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRule";
import SessionTimeoutEnforcer from "./components/SetTimeOut";
import { collection, getCountFromServer } from "firebase/firestore";
import { BarLoader, ClipLoader } from "react-spinners";

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
        return <BarLoader color="rgba(22, 163,74)" />;
    }

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //         if (user) {
    //             const sessionDoc = await getDoc(
    //                 doc(db, "userSessions", user.uid)
    //             );
    //             const storedSessionId = localStorage.getItem("sessionId");

    //             if (
    //                 !sessionDoc.exists() ||
    //                 sessionDoc.data().sessionId !== storedSessionId
    //             ) {
    //                 toast.error(
    //                     "Login tidak sah. Anda login di perangkat lain."
    //                 );
    //                 await signOut(auth);
    //                 localStorage.removeItem("sessionId");
    //                 return;
    //             }

    //             // sesi valid, lanjutkan
    //             setIsLoggedIn(true);
    //         } else {
    //             setIsLoggedIn(false);
    //         }
    //         setCheckingAuth(false);
    //     });

    //     return () => unsubscribe();
    // }, []);

    return (
        // <Router>
        //     <Toaster position="top-right" reverseOrder={false} />

        //     <Routes>
        //         {/* Jika user sudah login, redirect dari /login dan /register ke dashboard */}
        //         <Route
        //             path="/login"
        //             element={
        //                 isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />
        //             }
        //         />
        //         <Route
        //             path="/register"
        //             element={
        //                 isLoggedIn ? (
        //                     <Navigate to="/" replace />
        //                 ) : (
        //                     <RegisterPage />
        //                 )
        //             }
        //         />

        //         {/* Halaman utama hanya bisa diakses jika sudah login */}
        //         <Route
        //             path="/*"
        //             element={
        //                 isLoggedIn ? (
        //                     <AppLayout />
        //                 ) : (
        //                     <Navigate to="/login" replace />
        //                 )
        //             }
        //         />
        //     </Routes>
        // </Router>
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                <Route
                    path="/login"
                    element={
                        <SignIn
                            path="/login"
                            routing="path"
                            signInUrl="/login"
                            fallbackRedirectUrl="/dashboard" // default redirect
                            forceRedirectUrl="/dashboard" // override redirect sepenuhnya
                            oidcPrompt="select_account" // 💡 agar Google selalu tampilkan pilihan akun
                        />
                    }
                />
                <Route
                    path="/register"
                    element={
                        <SignUp
                            path="/sign-up"
                            routing="path"
                            forceRedirectUrl="/dashboard"
                            fallbackRedirectUrl="/dashboard"
                            oidcPrompt="select_account"
                        />
                    }
                />
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
