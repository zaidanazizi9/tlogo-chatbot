"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import ServiceForm from "../components/ServiceForm";
import ServiceList from "../components/ServiceList";
import { db } from "../config/firestore";
import {
    collection,
    deleteDoc,
    doc,
    addDoc,
    getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

// interface Service {
//     id: string;
//     name: string;
//     description: string;
//     // price: number
//     category: string;
//     status: "active" | "inactive";
// }

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    termsAndConditions: string;
    procedure: string;
    status: "active" | "inactive";
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [categories, setCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "category"));
        const categoryList = snapshot.docs.map((doc) => doc.data().name);
        setCategories(categoryList);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Service, "id">),
        }));
        setServices(data);
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error);
        toast.error("Gagal mengambil data layanan.");
      }
    };
    fetchServices();
  }, []);

  const handleAddService = async (newService: Omit<Service, "id">) => {
    try {
      const docRef = await addDoc(collection(db, "services"), newService);
      setServices([...services, { ...newService, id: docRef.id }]);
      toast.success("Layanan berhasil ditambahkan!");
    } catch (error) {
      toast.error("Gagal menambahkan layanan.");
      console.error(error);
    }
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  return (
    <div className="space-y-8 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Manajemen Layanan</h2>
          <p className="text-sm text-gray-500">Kelola semua layanan yang tersedia</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dropdown Kategori */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-48 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div
              className={`pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Tombol Tambah */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Layanan
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Layanan",
            count: services.length,
            color: "blue",
          },
          {
            label: "Layanan Aktif",
            count: services.filter((s) => s.status === "active").length,
            color: "green",
          },
          {
            label: "Kategori",
            count: new Set(services.map((s) => s.category)).size,
            color: "yellow",
          },
        ].map(({ label, count, color }, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow flex items-center justify-between"
          >
            <div className={`p-3 bg-${color}-100 rounded-xl`}>
              <div className={`w-6 h-6 bg-${color}-600 rounded-full`}></div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daftar Layanan */}
      <ServiceList
        services={
          selectedCategory === "Semua"
            ? services
            : services.filter((s) => s.category === selectedCategory)
        }
        onDeleteService={handleDeleteService}
        onEditService={handleEditService}
      />

      {/* Dialog Konfirmasi Hapus */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-gray-600">
              Yakin ingin menghapus layanan <strong>{serviceToDelete.name}</strong>?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setServiceToDelete(null)}
                className="text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, "services", serviceToDelete.id));
                    setServices(services.filter((s) => s.id !== serviceToDelete.id));
                    toast.success("Layanan berhasil dihapus!");
                    setServiceToDelete(null);
                  } catch (error) {
                    toast.error("Gagal menghapus layanan.");
                  }
                }}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Tambah/Edit */}
      {showForm && (
        <ServiceForm
          onAddService={handleAddService}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          initialData={editingService ?? undefined}
          isEditing={!!editingService}
        />
      )}
    </div>
  );
}