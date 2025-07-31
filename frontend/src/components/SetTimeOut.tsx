import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 jam

export default function SessionTimeoutEnforcer() {
    const { signOut } = useClerk();

    useEffect(() => {
        const now = Date.now();
        const loginTime = localStorage.getItem("loginTime");

        if (loginTime) {
            const elapsed = now - Number(loginTime);

            if (elapsed > SESSION_TIMEOUT_MS) {
                console.warn("Session expired. Logging out...");
                signOut(); // Logout jika sudah lebih dari 3 jam
            }
        } else {
            // Jika belum ada loginTime (misalnya baru login), set sekarang
            localStorage.setItem("loginTime", String(now));
        }
    }, [signOut]);

    return null;
}
