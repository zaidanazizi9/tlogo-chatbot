// src/components/ProtectedRoute.tsx
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (!isSignedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!localStorage.getItem("loginTime")) {
        localStorage.setItem("loginTime", String(Date.now()));
    }

    return <>{children}</>;
}
