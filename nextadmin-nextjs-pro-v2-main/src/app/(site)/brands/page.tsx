"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl: string | null;
  website?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    products: number;
    bundles: number;
  };
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  website: string;
  isActive: boolean;
  sortOrder: number;
}

export default function BrandsPage() {
  const [showModal, setShowModal] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    website: "",
    isActive: true,
    sortOrder: 0,
  });
        
  // Markaları API'den yükle
  const fetchBrands = async () => {
            try {
      const res = await fetch("/api/brands?includeInactive=true&includeProductCount=true");
              if (res.ok) {
                const data = await res.json();
        setBrands(data.brands || []);
            }
      } catch (error) {
      console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Slug otomatik oluştur
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      website: "",
      isActive: true,
      sortOrder: 0,
    });
    setEditingBrand(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
      website: brand.website || "",
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
    });
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : "/api/brands";
      const method = editingBrand ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchBrands();
        setShowModal(false);
        resetForm();
        alert(editingBrand ? "Marka güncellendi!" : "Marka oluşturuldu!");
      } else {
        const error = await res.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !brand.isActive }),
      });

      if (res.ok) {
        await fetchBrands();
      } else {
        const error = await res.json();
        alert(error.error || "Durum güncellenemedi");
      }
    } catch (error) {
      console.error("Error toggling brand:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleDelete = async (brand: Brand) => {
    const productCount = brand._count?.products || 0;
    const bundleCount = brand._count?.bundles || 0;

    if (productCount > 0 || bundleCount > 0) {
      alert(`Bu markaya ${productCount} ürün ve ${bundleCount} paket bağlı. Önce bunları kaldırın.`);
      return;
    }

    if (!confirm(`"${brand.name}" markasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBrands();
        alert("Marka silindi!");
      } else {
        const error = await res.json();
        alert(error.error || "Marka silinemedi");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Bir hata oluştu");
    }
  };

  const stats = {
    total: brands.length,
    active: brands.filter(b => b.isActive).length,
    totalProducts: brands.reduce((sum, b) => sum + (b._count?.products || 0), 0),
    totalBundles: brands.reduce((sum, b) => sum + (b._count?.bundles || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Markalar</h1>
          <p className="text-gray-500">Ürün markalarını yönetin</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Marka
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Toplam Marka</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          <p className="text-sm text-gray-500">Aktif Marka</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
          <p className="text-sm text-gray-500">Toplam Ürün</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-purple-500">{stats.totalBundles}</p>
          <p className="text-sm text-gray-500">Toplam Paket</p>
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-lg font-medium mb-2">Henüz marka eklenmedi</p>
          <p className="text-sm">Yeni marka eklemek için yukarıdaki butonu kullanın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center p-2 overflow-hidden">
                  {brand.logoUrl ? (
                    <Image 
                      src={brand.logoUrl} 
                      alt={brand.name}
                      width={64}
                      height={64}
                      className="max-w-full max-h-full object-contain dark:invert"
                      style={{ filter: 'brightness(0)' }}
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleActive(brand)}
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${brand.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10 hover:bg-green-200" : "bg-red-100 text-red-600 dark:bg-red-500/10 hover:bg-red-200"}`}
                >
                  {brand.isActive ? "Aktif" : "Pasif"}
                </button>
              </div>
              <h3 className="font-semibold text-dark dark:text-white">{brand.name}</h3>
              <p className="text-sm text-gray-500">/{brand.slug}</p>
              {brand.website && (
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate block mt-1"
                >
                  {brand.website.replace('https://', '').replace('www.', '')}
                </a>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-stroke dark:border-dark-3">
                <div className="text-sm text-gray-500">
                  <span>{brand._count?.products || 0} ürün</span>
                  {(brand._count?.bundles || 0) > 0 && (
                    <span className="ml-2 text-purple-500">{brand._count?.bundles} paket</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(brand)}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-2"
                    title="Düzenle"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(brand)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Sil"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marka Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark dark:text-white">
                {editingBrand ? "Marka Düzenle" : "Yeni Marka Ekle"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Marka Adı *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Traffi Gloves"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="traffi-gloves"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Marka hakkında kısa açıklama..."
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Logo URL</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
                {formData.logoUrl && (
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-dark-2 rounded-lg">
                    <Image 
                      src={formData.logoUrl} 
                      alt="Logo önizleme"
                      width={100}
                      height={50}
                      className="max-h-12 object-contain mx-auto"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Sıralama</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Düşük sayı önce gösterilir</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 rounded text-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-dark dark:text-white cursor-pointer">
                  Aktif
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 rounded-lg border border-stroke py-2.5 text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-dark-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : editingBrand ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
