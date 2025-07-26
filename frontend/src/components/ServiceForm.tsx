"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { collection, addDoc, getDocs, query, where, } from "firebase/firestore"
import { db } from '../config/firestore'
import toast from "react-hot-toast"

// interface Service {
//   id: string
//   name: string
//   syarat : string
//   dokumen_diperlukan : string
//   prosedur : string
//   // price: number
//   category: string
//   status: "active" | "inactive"
// }

interface Service {
  name: string
  description: string
  category: string
  status: "active" | "inactive"
}

interface ServiceFormProps {
  onAddService: (service: Omit<Service, "id">) => void
  onClose: () => void
}

export default function ServiceForm({ onAddService, onClose }: ServiceFormProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    status: "active" as "active" | "inactive",
  })
  

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "category"))
      const categoryNames = querySnapshot.docs.map((doc) => doc.data().name)
      setCategories(categoryNames)
    }

    fetchCategories()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi form
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Mohon lengkapi semua field!")
      return
    }
    try {
        const q = query(collection(db, "services"), where("name", "==", formData.name))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          toast.error("Layanan tersebut sudah ada!")
          return
        }

        const docRef = await addDoc(collection(db, "services"), {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          status: formData.status,
        })

        onAddService({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          status: formData.status,
        })

        setFormData({
          name: "",
          description: "",
          category: "",
          status: "active",
        })

        toast.success("Layanan berhasil ditambahkan!")
        onClose()
      } 
      catch (error) {
        console.error("Gagal menambahkan dokumen:", error)
        alert("Gagal menambahkan data ke Firebase.")
      }
  }
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value

    if (selected === "__new__") {
      setShowCategoryModal(true) // Buka modal, biarkan user isi input dulu
    } else {
      setFormData(prev => ({ ...prev, category: selected }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addNewCategory = async (name: string) => {
    const originalName = name.trim()
    const normalizedName = originalName.toLowerCase()

    // if (!originalName) {
    //   toast.error("Nama kategori tidak boleh kosong!")
    //   return
    // }

    try {
      const categoriesRef = collection(db, "category")
      
      // Gunakan field "name_lower" agar case-insensitive
      const q = query(categoriesRef, where("name_lower", "==", normalizedName))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast.error("Kategori sudah ada!")
        return
      }

      // Simpan dengan 2 field: name dan name_lower
      await addDoc(categoriesRef, {
        name: originalName,
        name_lower: normalizedName,
        createdAt: new Date(),
      })

      setCategories(prev => [...prev, originalName])
      setFormData(prev => ({ ...prev, category: originalName }))
      setShowCategoryModal(false)
      setNewCategoryName("")
      toast.success("Kategori berhasil ditambahkan!")
    } catch (err) {
      console.error("Gagal menambahkan kategori:", err)
      toast.error("Terjadi kesalahan saat menambahkan kategori.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tambah Layanan Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan deskripsi layanan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
             {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
             ))}
             <option value="__new__">➕ Tambah kategori baru...</option>
             console.log(newCategory)
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                setNewCategoryName("")
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Tambah Kategori Baru</h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Masukkan nama kategori"
                className="w-full px-3 py-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategoryName("")
                  }}
                  className="px-4 py-2 border rounded text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={() => addNewCategory(newCategoryName)}
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
  )
}
