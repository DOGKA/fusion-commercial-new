"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
  isActive: boolean;
  website?: string;
}

// Gerçek markalarımız (veritabanından ürün sayıları)
const defaultBrands: Brand[] = [
  { 
    id: "1", 
    name: "Traffi Gloves", 
    slug: "traffi", 
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765962257332-0dpfvn-traffi-black-logo.svg", 
    productCount: 20, 
    isActive: true,
    website: "https://www.traffiglove.com"
  },
  { 
    id: "2", 
    name: "Initial Entropy Energy", 
    slug: "ieetek", 
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303842-jrbbwi-ieetek-logo-white.png", 
    productCount: 9, 
    isActive: true,
    website: "https://www.ieetek.com"
  },
  { 
    id: "3", 
    name: "Telescopics", 
    slug: "telesteps", 
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898302743-wbcw3c-telescopics-white.png", 
    productCount: 2, 
    isActive: true,
    website: "https://telestepsladders.com"
  },
  { 
    id: "4", 
    name: "RGP Balls", 
    slug: "rgp-balls", 
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303622-oblcj-rgp-logo-white.svg", 
    productCount: 0, 
    isActive: false,
    website: "https://www.rgpballs.com"
  },
];

export default function BrandsPage() {
  const [showModal, setShowModal] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(defaultBrands);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // localStorage'dan markaları yükle ve ürün sayılarını çek
  useEffect(() => {
    async function loadBrands() {
      try {
        // localStorage'dan kayıtlı markaları kontrol et
        const savedBrands = localStorage.getItem('fusionmarkt_brands');
        const baseBrands = savedBrands ? JSON.parse(savedBrands) : defaultBrands;
        
        // Her marka için ürün sayısını çek
        const updatedBrands = await Promise.all(
          baseBrands.map(async (brand: Brand) => {
            try {
              const res = await fetch(`/api/products?brand=${encodeURIComponent(brand.name)}&limit=1`);
              if (res.ok) {
                const data = await res.json();
                return { ...brand, productCount: data.total || brand.productCount || 0 };
              }
            } catch (e) {
              // Hata olursa mevcut sayıyı kullan
            }
            return brand;
          })
        );
        setBrands(updatedBrands);
      } catch (error) {
        console.error("Error loading brands:", error);
        setBrands(defaultBrands);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  const handleToggleActive = (brandId: string) => {
    setBrands(prev => prev.map(b => 
      b.id === brandId ? { ...b, isActive: !b.isActive } : b
    ));
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
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Marka
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{brands.length}</p>
          <p className="text-sm text-gray-500">Toplam Marka</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{brands.filter(b => b.isActive).length}</p>
          <p className="text-sm text-gray-500">Aktif Marka</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">{brands.reduce((sum, b) => sum + b.productCount, 0)}</p>
          <p className="text-sm text-gray-500">Toplam Ürün</p>
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center p-2 overflow-hidden">
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="max-w-full max-h-full object-contain dark:invert"
                      style={{ filter: 'brightness(0)' }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleActive(brand.id)}
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
                <span className="text-sm text-gray-500">{brand.productCount} ürün</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingBrand(brand)}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-2"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10">
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

      {/* Yeni Marka Modal */}
      {(showModal || editingBrand) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark dark:text-white">
                {editingBrand ? "Marka Düzenle" : "Yeni Marka Ekle"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingBrand(null); }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newBrand: Brand = {
                id: editingBrand?.id || Date.now().toString(),
                name: formData.get('name') as string,
                slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                logo: formData.get('logo') as string || null,
                website: formData.get('website') as string || undefined,
                productCount: editingBrand?.productCount || 0,
                isActive: true,
              };
              
              if (editingBrand) {
                setBrands(prev => prev.map(b => b.id === editingBrand.id ? newBrand : b));
              } else {
                setBrands(prev => [...prev, newBrand]);
              }
              
              // localStorage'a kaydet
              const updatedBrands = editingBrand 
                ? brands.map(b => b.id === editingBrand.id ? newBrand : b)
                : [...brands, newBrand];
              localStorage.setItem('fusionmarkt_brands', JSON.stringify(updatedBrands));
              
              setShowModal(false);
              setEditingBrand(null);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Marka Adı *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingBrand?.name || ""}
                  placeholder="Örn: Traffi Gloves"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Logo URL</label>
                <input
                  name="logo"
                  type="url"
                  defaultValue={editingBrand?.logo || ""}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Website</label>
                <input
                  name="website"
                  type="url"
                  defaultValue={editingBrand?.website || ""}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingBrand(null); }}
                  className="flex-1 rounded-lg border border-stroke py-2.5 text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-dark-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary py-2.5 text-white hover:bg-primary/90"
                >
                  {editingBrand ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
