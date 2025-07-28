"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
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

interface Category {
    id: string;
    name: string;
}

export default function CategoryPage() {
    const [showForm, setShowForm] = useState(false);
    const [categoriesToDelete, setCategoriesToDelete] =
        useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");

    //ambil data kategori
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "category"));
                const categoryList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error("Gagal mengambil data kategori:", error);
                toast.error("Gagal mengambil data kategori.");
            }
        };

        fetchCategories();
    }, []);

    //fungsi untuk menambahkan kategori baru
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

            await addDoc(categoriesRef, {
                name: originalName,
                name_lower: normalizedName,
                createdAt: new Date(),
            });

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

    //fungsi untuk menghapus kategori
    const handleDeleteCategory = (cat: Category) => {
        setCategoriesToDelete(cat);
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
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Layanan</span>
                    </button>
                </div>
            </div>

            <CategoryList
                categories={categories}
                onDeleteCat={handleDeleteCategory}
            />

            {categoriesToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-4">
                            Konfirmasi Hapus
                        </h3>
                        <p>
                            Yakin ingin menghapus layanan{" "}
                            <strong>{categoriesToDelete.name}</strong>?
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setCategoriesToDelete(null)}
                                className="px-4 py-2 border rounded text-gray-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        console.log(categoriesToDelete);
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

                                        setCategories(
                                            categories.filter(
                                                (s) => s !== categoriesToDelete
                                            )
                                        );
                                        toast.success(
                                            "Layanan berhasil dihapus!"
                                        );
                                        setCategoriesToDelete(null);
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
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-md">
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
                                    if (success) {
                                        setShowForm(false);
                                    }
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
