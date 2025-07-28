"use client";

import {
    Home,
    Settings,
    Users,
    Package,
    BarChart3,
    FileText,
    Leaf,
    ListTree,
    Info,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Beranda",
      icon: Home,
    },
    {
      id: "services",
      label: "Layanan",
      icon: Leaf,
    },
    {
      id: "category",
      label: "Kategori",
      icon: ListTree,
    },
  ];

  return (
    <aside className="bg-gradient-to-b from-green-200 via-teal-100 to-blue-100 text-gray-800 w-72 min-h-screen p-6 flex flex-col justify-between border-r">
      {/* Header Logo */}
      <div>
        <div className="flex items-start space-x-3 mb-6">
          <img
            src="/logo-tlogo.png"
            alt="Logo Panel Tani"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-green-900">ChatBot Admin</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
            Menu
          </p>

          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full text-left px-4 py-2 rounded-xl transition-all flex items-center gap-3 ${
                activeTab === id
                  ? "bg-green-500 text-white shadow-md"
                  : "hover:bg-green-100 text-gray-700"
              }`}
            >
              <div className="p-2 bg-white rounded-full shadow">
                <Icon
                  className={`w-5 h-5 ${
                    activeTab === id ? "text-green-700" : "text-green-500"
                  }`}
                />
              </div>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Sidebar */}
      <div className="bg-green-100 text-green-900 rounded-xl p-4 mt-8 text-sm shadow">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-green-700" />
          <span className="font-semibold">Sejarah Kami</span>
        </div>
        <p className="text-xs text-green-800 leading-snug">
          Dari aliran sungai yang dulu mengalir, kini menjadi lahan subur tempat jagung dan padi tumbuh berkembang.
        </p>
      </div>
    </aside>
  );
}