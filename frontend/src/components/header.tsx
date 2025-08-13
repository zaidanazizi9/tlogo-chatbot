// header.tsx
import { User, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useClerk, useUser } from "@clerk/clerk-react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { signOut } = useClerk();
    const { user } = useUser();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        <header className="bg-gradient-to-r from-green-100 via-teal-50 to-blue-50 shadow-sm border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-green-800">
                    Dashboard
                </h1>

                <div className="relative" ref={menuRef}>
                    <div
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            Admin
                        </span>
                    </div>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                                <div className="px-4 pb-2 text-sm text-gray-500 font-medium leading-snug break-words max-w-[220px]">
                                    <span className="block">
                                        {
                                            user?.primaryEmailAddress
                                                ?.emailAddress
                                        }
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 my-1"></div>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
