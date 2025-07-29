"use client";

import type React from "react";
import { useState } from "react";
import { X, Clock, Tag, FileText, List, User, Shield } from "lucide-react";

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

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    formData: Service;
}

const DetailPopup: React.FC<PopupProps> = ({ isOpen, onClose, formData }) => {
    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        return status === "active"
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-red-100 text-red-800 border-red-200";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Detail Layanan
                    </h2>
                    {/* <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button> */}
                    <div className="flex justify-end px-6">
                        <button
                            onClick={onClose}
                            className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Nama Layanan
                            </h3>
                            <p className="text-gray-900">
                                {formData.name || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </h3>
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {formData.description || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-start space-x-3">
                        <Tag className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </h3>
                            <p className="text-gray-900">
                                {formData.category || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Waktu
                            </h3>
                            <p className="text-gray-900">
                                {formData.time || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Tempat */}
                    <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Tempat
                            </h3>
                            <p className="text-gray-900">
                                {formData.place || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                Status
                            </h3>
                            <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    formData.status
                                )}`}
                            >
                                {formData.status.charAt(0).toUpperCase() +
                                    formData.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Procedure */}
                    <div className="flex items-start space-x-3">
                        <List className="w-5 h-5 text-teal-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                Prosedur
                            </h3>
                            <p className="text-gray-900 whitespace-pre-wrap leading-none">
                                {formData.procedure || "Not specified"}
                            </p>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                Syarat dan Ketentuan
                            </h3>
                            <p className="text-gray-900 whitespace-pre-wrap leading-none">
                                {formData.termsAndConditions || "Not specified"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">
                                Catatan
                            </h3>
                            <p className="text-gray-900 whitespace-pre-wrap leading-none">
                                {formData.notes || "Not specified"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {/* <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default DetailPopup;
