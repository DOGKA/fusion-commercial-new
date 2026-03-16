"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  thumbnail: string | null;
  category: { name: string } | null;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  featuredCount: number;
}

// Stok durumu tipleri
type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
type StatusFilter = "all" | "active" | "inactive";
type FeaturedFilter = "all" | "featured" | "not_featured";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  
  // Toplu seçim state'leri
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkStockValue, setBulkStockValue] = useState<number>(5);
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/products/stats"),
      ]);
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri çıkar
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category?.name).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filtrelenmiş ürünler
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Arama filtresi
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(search) ||
          (product.sku && product.sku.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Kategori filtresi
      if (categoryFilter !== "all") {
        if (product.category?.name !== categoryFilter) return false;
      }

      // Stok filtresi
      if (stockFilter !== "all") {
        if (stockFilter === "out_of_stock" && product.stock > 0) return false;
        if (stockFilter === "low_stock" && (product.stock === 0 || product.stock > 5)) return false;
        if (stockFilter === "in_stock" && product.stock <= 5) return false;
      }

      // Durum filtresi
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !product.isActive) return false;
        if (statusFilter === "inactive" && product.isActive) return false;
      }

      // Öne çıkan filtresi
      if (featuredFilter !== "all") {
        if (featuredFilter === "featured" && !product.isFeatured) return false;
        if (featuredFilter === "not_featured" && product.isFeatured) return false;
      }

      return true;
    });
  }, [products, searchTerm, categoryFilter, stockFilter, statusFilter, featuredFilter]);

  // Tümünü seç/kaldır
  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Tek ürün seç/kaldır
  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toplu silme
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} ürünü silmek istediğinize emin misiniz?`)) return;

    setBulkLoading(true);
    const previousProducts = [...products];

    try {
      // Seçili ürünleri sil
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/products/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);

      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      fetchData(); // Stats'ı güncelle
    } catch (error) {
      console.error("Toplu silme hatası:", error);
      setProducts(previousProducts);
    } finally {
      setBulkLoading(false);
    }
  };

  // Toplu durum değiştir
  const handleBulkStatus = async (newStatus: boolean) => {
    if (selectedIds.size === 0) return;

    setBulkLoading(true);
    const previousProducts = [...products];

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, isActive: newStatus } : p))
    );

    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        })
      );
      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Toplu durum güncelleme hatası:", error);
      setProducts(previousProducts);
    } finally {
      setBulkLoading(false);
    }
  };

  // Toplu öne çıkan değiştir
  const handleBulkFeatured = async (newFeatured: boolean) => {
    if (selectedIds.size === 0) return;

    setBulkLoading(true);
    const previousProducts = [...products];

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, isFeatured: newFeatured } : p))
    );

    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: newFeatured }),
        })
      );
      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Toplu öne çıkan güncelleme hatası:", error);
      setProducts(previousProducts);
    } finally {
      setBulkLoading(false);
    }
  };

  // Toplu stok güncelle
  const handleBulkStock = async () => {
    if (selectedIds.size === 0) return;

    setBulkLoading(true);
    const previousProducts = [...products];

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, stock: bulkStockValue } : p))
    );

    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: bulkStockValue }),
        })
      );
      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      setShowBulkStockModal(false);
      fetchData();
    } catch (error) {
      console.error("Toplu stok güncelleme hatası:", error);
      setProducts(previousProducts);
    } finally {
      setBulkLoading(false);
    }
  };

  // Toplu işlem uygula
  const handleBulkAction = () => {
    if (!bulkAction || selectedIds.size === 0) return;

    switch (bulkAction) {
      case "delete":
        handleBulkDelete();
        break;
      case "activate":
        handleBulkStatus(true);
        break;
      case "deactivate":
        handleBulkStatus(false);
        break;
      case "feature":
        handleBulkFeatured(true);
        break;
      case "unfeature":
        handleBulkFeatured(false);
        break;
      case "stock":
        setShowBulkStockModal(true);
        break;
    }
    setBulkAction("");
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    setStatusFilter("all");
    setFeaturedFilter("all");
  };

  const toggleFeatured = async (productId: string, currentValue: boolean) => {
    setTogglingId(productId);
    
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured: !currentValue } : p))
    );

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });

      if (!res.ok) {
        // Rollback on error
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFeatured: currentValue } : p))
        );
      } else {
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            featuredCount: stats.featuredCount + (currentValue ? -1 : 1),
          });
        }
      }
    } catch (error) {
      // Rollback on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isFeatured: currentValue } : p))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setProducts(previousProducts);
      } else {
        fetchData(); // Refresh stats
      }
    } catch (error) {
      setProducts(previousProducts);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Ürünler</h1>
          <p className="text-gray-500">Tüm ürünlerinizi yönetin</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-gray-500">Toplam Ürün</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.activeProducts || 0}</p>
              <p className="text-sm text-gray-500">Aktif Ürün</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.outOfStock || 0}</p>
              <p className="text-sm text-gray-500">Stokta Yok</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.lowStock || 0}</p>
              <p className="text-sm text-gray-500">Düşük Stok</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.featuredCount || 0}</p>
              <p className="text-sm text-gray-500">Öne Çıkan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtreler
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Filtreleri Sıfırla
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Arama */}
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Ara</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün adı veya SKU..."
                className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-10 pr-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:bg-gray-dark"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stok Durumu */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Stok Durumu</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:bg-gray-dark"
            >
              <option value="all">Tümü</option>
              <option value="in_stock">Stokta (6+)</option>
              <option value="low_stock">Düşük Stok (1-5)</option>
              <option value="out_of_stock">Stokta Yok (0)</option>
            </select>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:bg-gray-dark"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          {/* Öne Çıkan */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Öne Çıkan</label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as FeaturedFilter)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:bg-gray-dark"
            >
              <option value="all">Tümü</option>
              <option value="featured">Öne Çıkan</option>
              <option value="not_featured">Öne Çıkmayan</option>
            </select>
          </div>
        </div>

        {/* Filtre Sonucu */}
        <div className="mt-4 pt-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-dark dark:text-white">{filteredProducts.length}</span> ürün bulundu
            {filteredProducts.length !== products.length && (
              <span className="text-gray-400"> ({products.length} toplam)</span>
            )}
          </p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-bold text-primary">{selectedIds.size}</span>
              </div>
              <p className="text-dark dark:text-white font-medium">
                ürün seçildi
              </p>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-500 hover:text-dark dark:hover:text-white"
              >
                Seçimi Temizle
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded-lg border border-stroke bg-white py-2 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
              >
                <option value="">Toplu İşlem Seç...</option>
                <option value="activate">✅ Aktif Yap</option>
                <option value="deactivate">❌ Pasif Yap</option>
                <option value="feature">⭐ Öne Çıkar</option>
                <option value="unfeature">☆ Öne Çıkarmayı Kaldır</option>
                <option value="stock">📦 Stok Güncelle</option>
                <option value="delete">🗑️ Sil</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock Modal */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-dark">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
              Toplu Stok Güncelle
            </h3>
            <p className="text-gray-500 mb-4">
              <span className="font-semibold text-dark dark:text-white">{selectedIds.size}</span> ürünün stokunu güncelleyeceksiniz.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-1.5">Yeni Stok Miktarı</label>
              <input
                type="number"
                min="0"
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkStockModal(false)}
                className="rounded-lg border border-stroke px-5 py-2 text-dark hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                İptal
              </button>
              <button
                onClick={handleBulkStock}
                disabled={bulkLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {bulkLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Ürün Listesi</h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 mb-4">
              {products.length === 0 ? "Henüz ürün eklenmemiş" : "Filtrelere uygun ürün bulunamadı"}
            </p>
            {products.length === 0 ? (
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
            >
              İlk Ürününüzü Ekleyin
            </Link>
            ) : (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-primary hover:bg-primary/5"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ürün</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fiyat</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stok</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Öne Çıkar
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className={`border-b border-stroke last:border-0 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2/50 transition-colors ${
                      selectedIds.has(product.id) ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-2 flex-shrink-0">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark dark:text-white truncate max-w-[300px]">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-dark-2">
                        {product.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {Number(product.price).toLocaleString("tr-TR")} ₺
                        </p>
                        {product.comparePrice && (
                          <p className="text-sm text-gray-500 line-through">
                            {Number(product.comparePrice).toLocaleString("tr-TR")} ₺
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.isFeatured)}
                          disabled={togglingId === product.id}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            product.isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-dark-2"
                          } ${togglingId === product.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                          title={product.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              product.isFeatured ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${product.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                        {product.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded p-2 hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Sil"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
