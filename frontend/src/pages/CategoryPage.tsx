"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { db } from "../config/firestore";
import {
    collection,
    deleteDoc,
    doc,
    addDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import CategoryList from "../components/CategoryList";
import { ClipLoader } from "react-spinners";

interface Category {
    id: string;
    name: string;
    linkedServicesCount?: number;
}

export default function CategoryPage() {
    const [showForm, setShowForm] = useState(false);
    const [categoriesToDelete, setCategoriesToDelete] =
        useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Ambil data kategori
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "category"));
                const categoryList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setCategories(categoryList);
                setIsLoading(false);
            } catch (error) {
                console.error("Gagal mengambil data kategori:", error);
                toast.error("Gagal mengambil data kategori.");
            }
        };

        fetchCategories();
    }, []);

    // Tambah kategori
    const addNewCategory = async (name: string): Promise<boolean> => {
        const originalName = name.trim();
        const normalizedName = originalName.toLowerCase();

        if (!originalName) {
            toast.error("Mohon isi nama kategori.");
            return false;
        }

        try {
            const categoriesRef = collection(db, "category");
            const q = query(
                categoriesRef,
                where("name_lower", "==", normalizedName)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast.error("Kategori sudah ada!");
                return false;
            }

            const docRef = await addDoc(categoriesRef, {
                name: originalName,
                name_lower: normalizedName,
                createdAt: new Date(),
            });

            setCategories((prev) => [
                ...prev,
                { id: docRef.id, name: originalName },
            ]);
            setName("");
            toast.success("Kategori berhasil ditambahkan!");
            return true;
        } catch (err) {
            console.error("Gagal menambahkan kategori:", err);
            toast.error("Terjadi kesalahan saat menambahkan kategori.");
            return false;
        }
    };

    // Hapus kategori
    const handleDeleteCategory = async (cat: Category) => {
        const linkedServicesCount = await getServiceCountByCategoryName(
            cat.name
        );
        setCategoriesToDelete({ ...cat, linkedServicesCount });
    };

    // Hitung jumlah service yang memiliki kategori tertentu
    const getServiceCountByCategoryName = async (categoryName: string) => {
        try {
            const servicesRef = collection(db, "services");
            const q = query(servicesRef, where("category", "==", categoryName));
            const snapshot = await getDocs(q);
            return snapshot.size; // jumlah service aktif
        } catch (error) {
            console.error("Gagal mengambil data services:", error);
            return 0;
        }
    };

    return isLoading ? (
        <div className="flex items-center -translate-y-20 justify-center h-screen">
            <ClipLoader size={80} color="rgba(22, 163,74)" />
        </div>
    ) : (
        <div className="space-y-6 ">
            {/* Header Kategori */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-green-800">
                        Manajemen Kategori
                    </h2>
                    <p className="text-gray-500">
                        Kelola semua kategori yang tersedia
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            {/* List Kategori */}
            <CategoryList
                categories={categories}
                onDeleteCat={handleDeleteCategory}
            />

            {/* Modal Hapus */}
            {categoriesToDelete && (
                <div className="fixed inset-0 -top-10 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-4">
                            Konfirmasi Hapus
                        </h3>
                        {categoriesToDelete.linkedServicesCount &&
                        categoriesToDelete.linkedServicesCount > 0 ? (
                            <p className="text-red-600 mt-2 text-sm">
                                Kategori ini memiliki{" "}
                                <span className="font-semibold">
                                    {categoriesToDelete.linkedServicesCount}{" "}
                                    layanan aktif
                                </span>
                                .
                                <br />
                                <span className="block mt-1">
                                    Tidak bisa dihapus sampai semua layanan
                                    tersebut{" "}
                                    <span className="font-semibold underline">
                                        dihapus
                                    </span>{" "}
                                    atau{" "}
                                    <span className="font-semibold underline">
                                        dipindahkan
                                    </span>{" "}
                                    ke kategori lain.
                                </span>
                            </p>
                        ) : (
                            <p>
                                Yakin ingin menghapus kategori{" "}
                                <strong>{categoriesToDelete.name}</strong>?
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setCategoriesToDelete(null)}
                                className="px-4 py-2 border rounded text-gray-700"
                            >
                                Batal
                            </button>

                            {/* Hanya tampilkan tombol Hapus jika tidak ada layanan aktif */}
                            {(!categoriesToDelete.linkedServicesCount ||
                                categoriesToDelete.linkedServicesCount ===
                                    0) && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteDoc(
                                                doc(
                                                    db,
                                                    "category",
                                                    categoriesToDelete.id
                                                )
                                            );
                                            setCategories(
                                                categories.filter(
                                                    (c) =>
                                                        c.id !==
                                                        categoriesToDelete.id
                                                )
                                            );
                                            toast.success(
                                                "Kategori berhasil dihapus!"
                                            );
                                            setCategoriesToDelete(null);
                                        } catch (error) {
                                            toast.error(
                                                "Gagal menghapus kategori."
                                            );
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah */}
            {showForm && (
                <div className="fixed -top-10 inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Tambah Kategori Baru
                        </h3>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama kategori"
                            className="w-full px-3 py-2 border rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setName("");
                                }}
                                className="px-4 py-2 border rounded text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={async () => {
                                    const success = await addNewCategory(name);
                                    if (success) setShowForm(false);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
