import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-green-100 via-teal-50 to-blue-50 shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Kiri: Judul atau logo kecil */}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-green-800">Dashboard</h1>
        </div>

        {/* Kanan: Profil Admin */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}