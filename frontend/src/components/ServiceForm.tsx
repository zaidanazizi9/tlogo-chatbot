"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db } from "../config/firestore";
import toast from "react-hot-toast";

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    termsAndConditions: string;
    procedure: string;
    time: string;
    place: string;
    notes: string;
    status: "active" | "inactive";
}

interface ServiceFormProps {
    onAddService: (service: Omit<Service, "id">) => void;
    onClose: () => void;
    initialData?: Service; // opsional, karena hanya digunakan saat edit
    isEditing?: boolean;
}

export default function ServiceForm({
    onAddService,
    onClose,
    initialData,
    isEditing = false,
}: ServiceFormProps) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        termsAndConditions: "",
        procedure: "",
        category: "",
        time: "",
        notes: "",
        place: "",
        status: "active" as "active" | "inactive",
    });

    // Tambahkan ini agar `initialData` terisi saat form dibuka untuk edit
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                termsAndConditions: initialData.termsAndConditions,
                procedure: initialData.procedure,
                time: initialData.time,
                category: initialData.category,
                status: initialData.status,
                notes: initialData.notes,
                place: initialData.place,
            });
        }
    }, [initialData]);

    //fetch kategori untuk menampilkan list kategori yg tersedia ketika buat layanan
    useEffect(() => {
        const fetchCategories = async () => {
            const querySnapshot = await getDocs(collection(db, "category"));
            const categoryNames = querySnapshot.docs.map(
                (doc) => doc.data().name
            );
            setCategories(categoryNames);
        };

        fetchCategories();
    }, []);

    //set default kategori
    useEffect(() => {
        if (!formData.category && categories.length > 0) {
            setFormData((prev) => ({
                ...prev,
                category: categories[0],
            }));
        }
    }, [categories]);

    //fungsi untuk mengisi layanan
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.description ||
            !formData.category ||
            !formData.termsAndConditions ||
            !formData.notes ||
            !formData.procedure ||
            !formData.time
        ) {
            toast.error("Mohon lengkapi semua field!");
            return;
        }

        try {
            if (isEditing && initialData) {
                const docRef = doc(db, "services", initialData.id);
                await updateDoc(docRef, formData);
                toast.success("Layanan berhasil diperbarui!");
                onClose();
                return;
            }
            const q = query(
                collection(db, "services"),
                where("name", "==", formData.name)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast.error("Layanan tersebut sudah ada!");
                return;
            }

            onAddService(formData);

            setFormData({
                name: "",
                description: "",
                category: "",
                termsAndConditions: "",
                procedure: "",
                time: "",
                notes: "",
                place: "",
                status: "active",
            });

            onClose();
        } catch (error) {
            console.error("Gagal submit:", error);
            toast.error("Gagal memproses data.");
        }
    };

    //fungsi untuk mengubah kategori
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;

        if (selected === "__new__") {
            setShowCategoryModal(true); // Buka modal, biarkan user isi input dulu
        } else {
            setFormData((prev) => ({ ...prev, category: selected }));
        }
    };

    //fungsi untuk mengubah form data
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    //fungsi untuk menambahkan kategori baru dari saat mengisi layanan
    const addNewCategory = async (name: string) => {
        const originalName = name.trim();
        const normalizedName = originalName.toLowerCase();

        try {
            const categoriesRef = collection(db, "category");

            // Gunakan field "name_lower" agar case-insensitive
            const q = query(
                categoriesRef,
                where("name_lower", "==", normalizedName)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast.error("Kategori sudah ada!");
                return;
            }

            // Simpan dengan 2 field: name dan name_lower
            await addDoc(categoriesRef, {
                name: originalName,
                name_lower: normalizedName,
                createdAt: new Date(),
            });

            setCategories((prev) => [...prev, originalName]);
            setFormData((prev) => ({ ...prev, category: originalName }));
            setShowCategoryModal(false);
            setNewCategoryName("");
            toast.success("Kategori berhasil ditambahkan!");
        } catch (err) {
            console.error("Gagal menambahkan kategori:", err);
            toast.error("Terjadi kesalahan saat menambahkan kategori.");
        }
    };

    return (
        <div className="fixed -top-10 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {isEditing ? "Edit Layanan" : "Tambah Layanan Baru"}
                        </h3>
                        <p className="text-xs text-red-600 mt-1">
                            Isi dengan tanda "-" apabila kolom tidak ingin
                            diisi.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto px-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Layanan
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan nama layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan deskripsi layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Syarat dan Ketentuan
                            </label>
                            <textarea
                                name="termsAndConditions"
                                value={formData.termsAndConditions}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan syarat dan ketentuan layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prosedur
                            </label>
                            <textarea
                                name="procedure"
                                value={formData.procedure}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan prosedur layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jadwal layanan tersedia
                            </label>
                            <input
                                type="text"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan jadwal layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tempat layanan tersedia
                            </label>
                            <input
                                type="text"
                                name="place"
                                value={formData.place}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan jadwal layanan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Masukkan catatan tambahan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                                <option value="__new__">
                                    ➕ Tambah kategori baru
                                </option>
                                console.log(newCategory)
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                onClick={() => {
                                    setNewCategoryName("");
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>

                {showCategoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-80 shadow-md">
                            <h3 className="text-lg font-semibold mb-4">
                                Tambah Kategori Baru
                            </h3>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                placeholder="Masukkan nama kategori"
                                className="w-full px-3 py-2 border rounded mb-4"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setNewCategoryName("");
                                    }}
                                    className="px-4 py-2 border rounded text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        addNewCategory(newCategoryName)
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
