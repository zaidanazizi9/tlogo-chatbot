import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProfilePopup } from "./ProfilePopup";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                        <ProfilePopup onClose={() => setIsOpen(false)} />
                    )}
                </div>
            </div>
        </header>
    );
}
