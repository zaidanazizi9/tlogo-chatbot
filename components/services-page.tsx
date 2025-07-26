"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import ServiceForm from "./service-form"
import ServiceList from "./service-list"

interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: "active" | "inactive"
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Konsultasi IT",
      description: "Layanan konsultasi teknologi informasi untuk bisnis",
      price: 500000,
      category: "konsultasi",
      status: "active",
    },
    {
      id: "2",
      name: "Desain Website",
      description: "Pembuatan desain website modern dan responsif",
      price: 2000000,
      category: "desain",
      status: "active",
    },
  ])
  const [showForm, setShowForm] = useState(false)

  const handleAddService = (newService: Omit<Service, "id">) => {
    const service: Service = {
      ...newService,
      id: Date.now().toString(),
    }
    setServices([...services, service])
  }

  const handleDeleteService = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      setServices(services.filter((service) => service.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Layanan</h2>
          <p className="text-gray-600">Kelola semua layanan yang tersedia</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan</span>
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Layanan</p>
              <p className="text-2xl font-semibold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Layanan Aktif</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kategori</p>
              <p className="text-2xl font-semibold text-gray-900">{new Set(services.map((s) => s.category)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rata-rata Harga</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.length > 0
                  ? `Rp ${Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length / 1000)}K`
                  : "Rp 0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ServiceList services={services} onDeleteService={handleDeleteService} />

      {showForm && <ServiceForm onAddService={handleAddService} onClose={() => setShowForm(false)} />}
    </div>
  )
}
