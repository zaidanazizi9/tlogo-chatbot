"use client"

import { useState } from "react"
import Header from "../Chatbot/components/header"
import Sidebar from "../Chatbot/components/sidebar"
import ServicesPage from "../Chatbot/components/services-page"
import { BarChart3, Users, Package, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Banner Logo & Welcome Message */}
          <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow">
            <img src="/logo-tlogo.png" alt="Logo Panel Tani" className="w-24 h-24 object-contain mb-4" />
            <h1 className="text-2xl font-bold text-green-800">Selamat Datang, Admin!</h1>
            <p className="text-gray-600 mt-2">Kelola layanan pertanian dengan mudah melalui dashboard ini.</p>
          </div>

          {/* Info Total Layanan */}
          <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}