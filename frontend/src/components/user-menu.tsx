"use client";

import { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, User } from "lucide-react";
// import { CustomAvatar } from "../components/ui/CustomAvatar"
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menutup menu ketika klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    console.log("Login clicked!");
    setIsOpen(false); // Tutup menu setelah klik
    // Tambahkan logika login Anda di sini
  };

  const handleLogout = () => {
    console.log("Logout clicked!");
    setIsOpen(false); // Tutup menu setelah klik
    // Tambahkan logika logout Anda di sini
  };

  const handleProfile = () => {
    console.log("Profile clicked!");
    setIsOpen(false); // Tutup menu setelah klik
    // Tambahkan logika navigasi ke profil di sini
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* <CustomAvatar
          src="/placeholder.svg?height=100&width=100"
          alt="Admin Avatar"
          fallback="AD"
          className="cursor-pointer"
        /> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div className="block px-4 py-2 text-sm text-gray-700 font-semibold">
              My Account
            </div>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogin}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
