import { LogOut, Mail, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

interface ProfilePopupProps {
    onClose: () => void;
}
export function ProfilePopup({ onClose }: ProfilePopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);
    const { signOut } = useClerk();
    const { user } = useUser();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleLogout = async () => {
        try {
            localStorage.removeItem("loginTime");
            await signOut({ redirectUrl: "/login" });
            window.location.href = "/login"; // gunakan salah satu, lebih aman reload
        } catch (error) {
            toast.error("Gagal logout");
        }
    };

    return (
        <div
            ref={popupRef}
            className="fixed top-16 right-6 w-72 z-[9999] shadow-lg border bg-white/100 p-4 rounded-xl"
        >
            {/* Konten Card */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium bg-gray-100 text-green-600">
                        JD
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                            {user!.firstName} {user!.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                            Admin
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pl-[8px]">
                    <div className="flex items-center space-x-3 text-sm">
                        <User className="w-5 h-5 text-muted-foreground text-gray-600" />
                        <span className="text-foreground">
                            {user!.firstName} {user!.lastName}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                        <Mail className="w-5 h-5 text-muted-foreground text-gray-600" />
                        <span className="text-foreground truncate">
                            {user!.emailAddresses[0]!.emailAddress}
                        </span>
                    </div>
                </div>

                <div className="pt-3 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full justify-start text-sm h-9 pl-[10px] flex items-center text-destructive hover:bg-destructive/10 rounded-md"
                    >
                        <LogOut className="w-5 h-5 mr-2 text-red-600" />
                        <span className="text-red-600">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
