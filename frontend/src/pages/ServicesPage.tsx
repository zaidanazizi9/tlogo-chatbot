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
import { ClipLoader } from "react-spinners";

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    termsAndConditions: string;
    procedure: string;
    time: string;
    notes: string;
    place: string;
    status: "active" | "inactive";
}

const colorClasses: Record<string, { bg: string; dot: string }> = {
    blue: { bg: "bg-blue-100", dot: "bg-blue-600" },
    green: { bg: "bg-green-100", dot: "bg-green-600" },
    yellow: { bg: "bg-yellow-100", dot: "bg-yellow-600" },
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(
        null
    );
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
    const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "category"));
                const categoryList = snapshot.docs.map(
                    (doc) => doc.data().name
                );
                setCategories(categoryList);
                setIsLoading(false);
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

    return isLoading ? (
        <div className="flex items-center -translate-y-20 justify-center h-screen">
            <ClipLoader size={80} color="rgba(22, 163,74)" />
        </div>
    ) : (
        <div className="space-y-8 px-6 py-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-green-800">
                        Manajemen Layanan
                    </h2>
                    <p className="text-gray-500">
                        Kelola semua layanan yang tersedia
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Dropdown Kategori */}
                    <div className="relative w-48">
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex justify-between items-center cursor-pointer hover:border-green-500 focus:ring-2 focus:ring-green-400 text-sm"
                        >
                            <span>
                                {selectedCategory === "Semua"
                                    ? "Semua Kategori"
                                    : selectedCategory}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`${
                                    isDropdownOpen ? "rotate-180" : ""
                                } transition-transform`}
                            />
                        </div>
                        {isDropdownOpen && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto text-sm">
                                <li
                                    onClick={() => {
                                        setSelectedCategory("Semua");
                                        setIsDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-green-100"
                                >
                                    Semua Kategori
                                </li>
                                {categories.map((cat) => (
                                    <li
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-green-100"
                                    >
                                        {cat}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Dropdown Status */}
                    <div className="relative w-48">
                        <div
                            onClick={() =>
                                setIsStatusDropdownOpen(!isStatusDropdownOpen)
                            }
                            className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex justify-between items-center cursor-pointer hover:border-green-500 focus:ring-2 focus:ring-green-400 text-sm"
                        >
                            <span>
                                {selectedStatus === "Semua"
                                    ? "Semua Status"
                                    : selectedStatus === "active"
                                    ? "Aktif"
                                    : "Nonaktif"}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`${
                                    isStatusDropdownOpen ? "rotate-180" : ""
                                } transition-transform`}
                            />
                        </div>

                        {isStatusDropdownOpen && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto text-sm">
                                <li
                                    onClick={() => {
                                        setSelectedStatus("Semua");
                                        setIsStatusDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-green-100"
                                >
                                    Semua Status
                                </li>
                                <li
                                    onClick={() => {
                                        setSelectedStatus("active");
                                        setIsStatusDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-green-100"
                                >
                                    Aktif
                                </li>
                                <li
                                    onClick={() => {
                                        setSelectedStatus("inactive");
                                        setIsStatusDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 cursor-pointer hover:bg-green-100"
                                >
                                    Nonaktif
                                </li>
                            </ul>
                        )}
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
                        count: services.filter((s) => s.status === "active")
                            .length,
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
                        <div
                            className={`p-3 ${colorClasses[color].bg} rounded-xl`}
                        >
                            <div
                                className={`w-6 h-6 ${colorClasses[color].dot} rounded-full`}
                            />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">{label}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {count}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daftar Layanan */}
            <ServiceList
                services={services
                    .filter((s) =>
                        selectedCategory === "Semua"
                            ? true
                            : s.category === selectedCategory
                    )
                    .filter((s) =>
                        selectedStatus === "Semua"
                            ? true
                            : s.status === selectedStatus
                    )}
                onDeleteService={handleDeleteService}
                onEditService={handleEditService}
            />

            {/* Dialog Konfirmasi Hapus */}
            {serviceToDelete && (
                <div className="fixed -top-10 inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Konfirmasi Hapus
                        </h3>
                        <p className="text-sm text-gray-600">
                            Yakin ingin menghapus layanan{" "}
                            <strong>{serviceToDelete.name}</strong>?
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
                                        );
                                        toast.success(
                                            "Layanan berhasil dihapus!"
                                        );
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
