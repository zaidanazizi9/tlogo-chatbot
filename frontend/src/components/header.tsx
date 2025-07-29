// header.tsx
import { useNavigate } from "react-router-dom";
import { User, LogIn, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firestore";
import toast from "react-hot-toast";

export default function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      toast.success("Anda berhasil logout");
    } catch (error) {
      toast.error("Anda gagal logout");
    }
  };

  return (
    <header className="bg-gradient-to-r from-green-100 via-teal-50 to-blue-50 shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-green-800">Dashboard</h1>

        <div className="relative" ref={menuRef}>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <div className="px-4 text-sm text-gray-900 font-semibold">
                  Wahyu Gantenk
                </div>
                <div className="px-4 pb-2 text-sm text-gray-500 font-medium">
                  SayaWahyu@gmail.com
                </div>

                <div className="border-t border-gray-100 my-1"></div>
                <div className="border-t border-gray-100 my-1"></div>
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

// import { Link, useNavigate } from "react-router-dom";
// import { User } from "lucide-react";
// import LoginPage from "../pages/LoginPage";

// export default function Header() {
//   const navigate = useNavigate();

//   const handleGoToLogin = () => {
//     navigate("/login"); // pastikan route /login ada di router
//   };
//   return (
//     <header className="bg-gradient-to-r from-green-100 via-teal-50 to-blue-50 shadow-sm border-b border-gray-200 px-6 py-3">
//       <div className="flex items-center justify-between">
//         {/* Kiri: Judul atau logo kecil */}
//         <div className="flex items-center space-x-2">
//           <h1 className="text-lg font-semibold text-green-800">Dashboard</h1>
//         </div>
//         {/* Kanan: Profil Admin */}
//         <div className="flex items-center space-x-3">
//           <div className="flex items-center space-x-2">
//             <div
//               className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
//               // onClick={() => {
//               //    onClick={handleGoToLogin}
//               //   <LoginPage />;
//               // }}
//             >
//               <User className="w-4 h-4 text-white" />
//             </div>
//             <span className="text-sm font-medium text-gray-700">Admin</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
