"use client";

import { Edit, Trash2, Eye } from "lucide-react";

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    termsAndConditions: string;
    procedure: string;
    status: "active" | "inactive";
}

interface ServiceListProps {
    services: Service[];
    // onDeleteService: (id: string) => void
    onDeleteService: (service: Service) => void;
    onEditService: (service: Service) => void;
}

export default function ServiceList({
    services,
    onDeleteService,
    onEditService,
}: ServiceListProps) {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Daftar Layanan
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* <thead className="bg-gray-50">
                        <tr>
                            <div className="flex bg-red-500">
                                <div className="w-3/4">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <span>Nama layanan</span>
                                    </th>
                                </div>
                                <div className="w-1/4">
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="w-5/6 m-auto flex justify-center">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                                Kategori
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="w-5/6 m-auto flex justify-center">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                                Status
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="w-5/6 m-auto flex justify-center">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                                Aksi
                                            </span>
                                        </div>
                                    </th>
                                </div>
                            </div>
                        </tr>
                    </thead> */}
                    <thead>
                        <tr className=" text-gray-500">
                            <th className="pl-6 pr-12 py-3 text-left text-sm font-medium uppercase tracking-wider w-3/4">
                                Nama Layanan
                            </th>
                            <th className="px-8  py-3 text-center text-sm font-medium uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="text-center text-sm font-medium uppercase tracking-wider">
                                Status
                            </th>
                            <th className="pr-10 pl-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                Tindakan
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Belum ada layanan yang ditambahkan
                                </td>
                            </tr>
                        ) : (
                            services.map((service) => (
                                <tr
                                    key={service.id}
                                    className="hover:bg-gray-50"
                                >
                                    {/* <td className="px-2 py-4 whitespace-nowrap"> */}
                                    <td className="pl-6 pr-12 py-4 break-words max-w-xs">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {service.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {service.description}
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td className="px-2 py-4 whitespace-nowrap"> */}
                                    <td className="px-2 py-4 break-words max-w-xs ">
                                        <div className="w-5/6 m-auto flex justify-center">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {service.category}
                                            </span>
                                        </div>
                                    </td>
                                    {/* <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(service.price)}</td> */}
                                    {/* <td className="px-2 py-4 whitespace-nowrap"> */}
                                    <td className="px-2 py-4 break-words max-w-xs">
                                        <div className="w-5/6 m-auto flex justify-center">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    service.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {service.status === "active"
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pr-10 pl-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="w-5/6 m-auto flex justify-center space-x-2">
                                            {/* <button
                                                onClick={() =>
                                                    onEditService(service)
                                                }
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button> */}
                                            <button
                                                onClick={() =>
                                                    onEditService(service)
                                                }
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    onDeleteService(service)
                                                }
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Hapus
                                            </button>

                                            {/* <button
                                                onClick={() =>
                                                    onDeleteService(service)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button> */}
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
