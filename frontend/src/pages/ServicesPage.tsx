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
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(
        null
    );
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
    const [categories, setCategories] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //ambil data kategori untuk dropdown menu
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "category"));
                const categoryList = snapshot.docs.map(
                    (doc) => doc.data().name
                );
                setCategories(categoryList);
            } catch (error) {
                console.error("Gagal mengambil kategori:", error);
            }
        };

        fetchCategories();
    }, []);

    //fetch data untuk menampilkan daftar layanan
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

    //fungsi untuk menambahkan layanan baru
    const handleAddService = async (newService: Omit<Service, "id">) => {
        try {
            const docRef = await addDoc(collection(db, "services"), newService);
            const service: Service = {
                ...newService,
                id: docRef.id,
            };
            setServices([...services, service]);
            toast.success("Layanan berhasil ditambahkan!");
        } catch (error) {
            toast.error("Gagal menambahkan layanan.");
            console.error(error);
        }
    };

    //fungsi untuk menghapus layanan
    const handleDeleteService = (service: Service) => {
        setServiceToDelete(service);
        console.log(service.name);
    };

    //fungsi untuk mengedit layanan
    const handleEditService = (service: Service) => {
        setEditingService(service);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Manajemen Layanan
                    </h2>
                    <p className="text-gray-600">
                        Kelola semua layanan yang tersedia
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                            }}
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="w-full border-none px-4 py-2 pr-10 rounded-md text-sm appearance-none bg-white"
                        >
                            <option value="Semua">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <div
                            className={`pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                        >
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Layanan</span>
                    </button>
                </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <div className="w-6 h-6 bg-blue-600 rounded"></div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Layanan
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {services.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <div className="w-6 h-6 bg-green-600 rounded"></div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Layanan Aktif
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {
                                    services.filter(
                                        (s) => s.status === "active"
                                    ).length
                                }
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
                            <p className="text-sm font-medium text-gray-600">
                                Kategori
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {new Set(services.map((s) => s.category)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ServiceList
                services={
                    selectedCategory === "Semua"
                        ? services
                        : services.filter(
                              (s) => s.category === selectedCategory
                          )
                }
                onDeleteService={handleDeleteService}
                onEditService={handleEditService}
            />

            {serviceToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-4">
                            Konfirmasi Hapus
                        </h3>
                        <p>
                            Yakin ingin menghapus layanan{" "}
                            <strong>{serviceToDelete.name}</strong>?
                        </p>

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
                                        console.log(serviceToDelete.id);
                                        await deleteDoc(
                                            doc(
                                                db,
                                                "services",
                                                serviceToDelete.id
                                            )
                                        );
                                        setServices(
                                            services.filter(
                                                (s) =>
                                                    s.id !== serviceToDelete.id
                                            )
                                        ); // hapus dari state
                                        toast.success(
                                            "Layanan berhasil dihapus!"
                                        );
                                        setServiceToDelete(null);
                                    } catch (error) {
                                        toast.error("Gagal menghapus layanan.");
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
