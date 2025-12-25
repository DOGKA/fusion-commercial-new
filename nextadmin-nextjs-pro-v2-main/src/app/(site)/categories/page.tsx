"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  themeColor?: string | null;
  isActive: boolean;
  order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    themeColor: "#8B5CF6",
    isActive: true,
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?includeAll=true");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
      .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Handle form input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  // Open modal for new category
  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", themeColor: "#8B5CF6", isActive: true });
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      themeColor: category.themeColor || "#8B5CF6",
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  // Create category
  const handleCreate = async () => {
    if (!formData.name) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || "Kategori oluşturulamadı");
      }
    } catch (error) {
      console.error("Kategori oluşturma hatası:", error);
    }
  };

  // Update category
  const handleUpdate = async () => {
    if (!editingCategory || !formData.name) return;

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
  });

      if (res.ok) {
        setShowModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || "Kategori güncellenemedi");
      }
    } catch (error) {
      console.error("Kategori güncelleme hatası:", error);
}
  };

  // Delete category
  const handleDelete = async (category: Category) => {
    const confirm = window.confirm(
      `"${category.name}" kategorisini silmek istediğinize emin misiniz?\n\n` +
      `Kategorideki ürünler "Genel" kategorisine taşınacak.`
    );

    if (!confirm) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || "Kategori silinemedi");
      }
    } catch (error) {
      console.error("Kategori silme hatası:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Kategoriler</h1>
          <p className="text-gray-500">Ürün kategorilerini yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/categories/sync-colors", { method: "POST" });
                if (res.ok) {
                  const data = await res.json();
                  alert(`${data.message}\n\nGüncellenen kategoriler:\n${data.results.map((r: any) => `• ${r.category}: ${r.color}`).join('\n')}`);
                  fetchCategories();
                } else {
                  alert("Renkler senkronize edilemedi");
                }
              } catch (error) {
                alert("Hata oluştu");
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark hover:bg-gray-50 transition-colors dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:bg-dark-2"
            title="Shop category banner renklerini kategorilere senkronize et"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Banner Renklerini Senkronize Et
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kategori
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <div className="col-span-full rounded-xl border border-stroke bg-white p-12 text-center dark:border-dark-3 dark:bg-gray-dark">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500">Henüz kategori eklenmemiş</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-dark dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                  {category.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-stroke dark:border-dark-3">
                {/* Tema Rengi */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-xs">Tema:</span>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: category.themeColor || '#8B5CF6' }}
                    title={category.themeColor || '#8B5CF6'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2" 
                    title="Düzenle"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(category)}
                    className="rounded p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10" 
                    title="Sil"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-dark">
            <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">
              {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Örn: Endüstriyel Eldivenler"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="endustriyel-eldivenler"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori açıklaması..."
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                />
              </div>

              {/* Tema Rengi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tema Rengi (Shimmer & Banner)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-stroke cursor-pointer dark:border-dark-3"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    placeholder="#8B5CF6"
                    className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white font-mono text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Kategori sayfasındaki shimmer ve banner efektleri için</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                İptal
              </button>
              <button
                onClick={editingCategory ? handleUpdate : handleCreate}
                disabled={!formData.name}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {editingCategory ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
