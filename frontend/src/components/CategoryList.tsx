"use client";

interface Category {
    id: string;
    name: string;
}

interface ServiceListProps {
    categories: Category[];
    onDeleteCat: (cat: Category) => void;
}

export default function ServiceList({
    categories,
    onDeleteCat,
}: ServiceListProps) {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Daftar Kategori
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className=" text-gray-500">
                            <th className="pl-6 pr-12 py-3 text-left text-sm font-medium uppercase tracking-wider w-5/6">
                                Nama Kategori
                            </th>
                            <th className="pr-10 pl-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                Tindakan
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.length === 0 ? (
                            //kalau list kategori kosong, tampilkan pesan
                            <tr>
                                <td className="px-6 py-4 text-center text-gray-500">
                                    Belum ada layanan yang ditambahkan
                                </td>
                            </tr>
                        ) : (
                            //kalau list kategori tidak kosong, tampilkan daftar kategori
                            categories.map((cat, index) => (
                                <tr key={index} className="hover:bg-gray-50 ">
                                    <td className="pl-6 pr-12 py-4 break-words max-w-xs text-sm font-medium text-gray-900">
                                        {cat.name}
                                    </td>
                                    <td className="pr-10 pl-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="w-5/6 m-auto flex justify-center space-x-2">
                                            <button
                                                onClick={() => onDeleteCat(cat)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
