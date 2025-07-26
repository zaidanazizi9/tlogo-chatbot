"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import ServiceForm from "../components/ServiceForm"
import ServiceList from "../components/ServiceList"
import { db } from '../config/firestore'
import { collection, deleteDoc, doc, addDoc, getDocs } from "firebase/firestore"
import toast from "react-hot-toast"

interface Service {
  id: string
  name: string
  description: string
  // price: number
  category: string
  status: "active" | "inactive"
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"))
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Service, "id">),
        }))
        setServices(data)
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error)
        toast.error("Gagal mengambil data layanan.")
      }
    }

    fetchServices()
  }, [])

  const handleAddService = (newService: Omit<Service, "id">) => {
    const service: Service = {
      ...newService,
      id: Date.now().toString(),
    }
    setServices([...services, service])
  }


  // const handleDeleteService = (id: string) => {
  //   if (window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
  //     setServices(services.filter((service) => service.id !== id))
  //   }
  // }

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service)
    console.log(service.name)
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

        {/* <div className="bg-white p-6 rounded-lg shadow">
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
        </div> */}
      </div>

      <ServiceList services={services} onDeleteService={handleDeleteService} />
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p>Yakin ingin menghapus layanan <strong>{serviceToDelete.name}</strong>?</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 border rounded text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log(serviceToDelete.id)
                    await deleteDoc(doc(db, "services", serviceToDelete.id)) // hapus dari Firebase
                    setServices(services.filter(s => s.id !== serviceToDelete.id)) // hapus dari state
                    toast.success("Layanan berhasil dihapus!")
                    setServiceToDelete(null)
                  } catch (error) {
                    toast.error("Gagal menghapus layanan.")
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {showForm && <ServiceForm onAddService={handleAddService} onClose={() => setShowForm(false)} />} */}
      {showForm && <ServiceForm onAddService={handleAddService} onClose={() => setShowForm(false)} />}
    </div>
  )
}
