// src/components/ProtectedRoute.tsx
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { BarLoader, ClipLoader } from "react-spinners";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <ClipLoader size={80} color="rgba(22, 163,74)" />
            </div>
        );
    }

    if (!isSignedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!localStorage.getItem("loginTime")) {
        localStorage.setItem("loginTime", String(Date.now()));
    }

    return <>{children}</>;
}
