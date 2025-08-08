// src/components/ProtectedRoute.tsx
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    // <<<<<<< HEAD
    const { isSignedIn, isLoaded } = useUser();
    const [showRedirect, setShowRedirect] = useState(false);

    useEffect(() => {
        if (isSignedIn && !localStorage.getItem("loginTime")) {
            localStorage.setItem("loginTime", String(Date.now()));
        }

        const timeout = setTimeout(() => {
            if (isLoaded && !isSignedIn) {
                setShowRedirect(true);
            }
        }, 1000); // delay 1 detik

        return () => clearTimeout(timeout);
    }, [isSignedIn, isLoaded]);

    if (!isLoaded || (!isSignedIn && !showRedirect)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <ClipLoader size={80} color="rgba(22, 163,74)" />
            </div>
        );
    }

    if (showRedirect && !isSignedIn) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
    // =======
    //   const { isSignedIn, isLoaded } = useUser();
    //   const [showRedirect, setShowRedirect] = useState(false);

    //   useEffect(() => {
    //     if (isSignedIn && !localStorage.getItem("loginTime")) {
    //       localStorage.setItem("loginTime", String(Date.now()));
    //     }

    //     const timeout = setTimeout(() => {
    //       if (isLoaded && !isSignedIn) {
    //         setShowRedirect(true);
    //       }
    //     }, 1000); // delay 1 detik

    //     return () => clearTimeout(timeout);
    //   }, [isSignedIn, isLoaded]);

    //   if (!isLoaded || (!isSignedIn && !showRedirect)) {
    //     return (
    //       <div className="flex items-center justify-center h-screen">
    //         <ClipLoader size={80} color="rgba(22, 163,74)" />
    //       </div>
    //     );
    //   }

    //   if (showRedirect && !isSignedIn) {
    //     return <Navigate to="/login" replace />;
    //   }

    //   return <>{children}</>;
    // >>>>>>> origin/main
}
