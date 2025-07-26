"use client";

import React, { useEffect, useState } from "react";
import BreadCrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";

const tabs = ["Categories", "Logo", "Banner"];

const Customization = () => {
    const [activeTab, setActiveTab] = useState("Categories");
    const [categories, setCategories] = useState<string[]>([]);
    const [subCategories, setSubCategories] = useState<Record<string, string[]>>({});
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState("");
    const [newSubCategory, setNewSubCategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        const fetchCustomization = async () => {
            try {
                const res = await axiosInstance.get("/admin/api/get-all");
                const data = res.data;

                setCategories(data.categories || []);
                setSubCategories(data.subCategories || {});
                setLogo(data.logo || null);
                setBanner(data.banner || null);
            } catch (err) {
                console.error("Failed to fetch customization data", err);
            }
        };
        fetchCustomization();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await axiosInstance.post("/admin/api/add-category", {
                category: newCategory,
            });
            setCategories((prev) => [...prev, newCategory]);
            setNewCategory("");
        } catch (error) {
            console.error("Error adding category", error);
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !selectedCategory) return;
        try {
            await axiosInstance.post("/admin/api/add-subcategory", {
                category: selectedCategory,
                subCategory: newSubCategory,
            });
            setSubCategories((prev) => ({
                ...prev,
                [selectedCategory]: [...(prev[selectedCategory] || []), newSubCategory],
            }));
            setNewSubCategory("");
        } catch (error) {
            console.error("Error adding subcategory", error);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axiosInstance.post("/admin/api/upload-logo", formData);
            setLogo(res.data.logo);
        } catch (err) {
            console.error("Logo upload failed", err);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axiosInstance.post("/admin/api/upload-banner", formData);
            setBanner(res.data.banner);
        } catch (err) {
            console.error("Banner upload failed", err);
        }
    };

    return (
        <div className="w-full min-h-screen p-8 bg-black text-white">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Customization</h2>
                <BreadCrumbs title="Customization" />
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : "text-gray-400"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === "Categories" && (
                    <div className="space-y-6">
                        {categories.length === 0 ? (
                            <p className="text-gray-400">No categories found.</p>
                        ) : (
                            categories.map((cat, idx) => (
                                <div key={idx} className="mb-6">
                                    <p className="font-semibold mb-2">{cat}</p>
                                    {subCategories?.[cat]?.length > 0 ? (
                                        <div className="pl-4 space-y-1">
                                            {subCategories[cat].map((subCat, subIdx) => (
                                                <p key={subIdx} className="text-sm text-gray-300">
                                                    - {subCat}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 pl-4">No subcategories</p>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Add New Category */}
                        <div className="pt-4 space-y-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="New category"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="px-3 py-2 rounded-md outline-none text-sm bg-gray-800 text-white flex-1"
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                                >
                                    Add Category
                                </button>
                            </div>

                            <div className="flex space-x-2">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 rounded-md outline-none text-sm bg-gray-800 text-white flex-1"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="New subcategory"
                                    value={newSubCategory}
                                    onChange={(e) => setNewSubCategory(e.target.value)}
                                    className="px-3 py-2 rounded-md outline-none text-sm bg-gray-800 text-white flex-1"
                                />
                                <button
                                    onClick={handleAddSubCategory}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                                >
                                    Add Subcategory
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Logo" && (
                    <div className="space-y-4">
                        {logo ? (
                            <img
                                src={logo}
                                alt="Platform Logo"
                                className="w-[120px] h-auto border border-gray-600 p-2 bg-white"
                            />
                        ) : (
                            <p className="text-gray-400">No logo uploaded.</p>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="text-sm text-white"
                        />
                    </div>
                )}

                {activeTab === "Banner" && (
                    <div className="space-y-4">
                        {banner ? (
                            <img
                                src={banner}
                                alt="Platform Banner"
                                className="w-full max-w-[600px] h-auto border border-gray-600 rounded"
                            />
                        ) : (
                            <p className="text-gray-400">No banner uploaded.</p>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="text-sm text-white"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customization;