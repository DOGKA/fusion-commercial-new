"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Bundle {
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
  itemCount: number;
  categories: { id: string; name: string; slug: string; isPrimary: boolean }[];
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Toplu seçim state'leri
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/bundles");
      if (res.ok) {
        const data = await res.json();
        setBundles(data.bundles || []);
      }
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş bundle'lar
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      // Arama filtresi
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          bundle.name.toLowerCase().includes(search) ||
          (bundle.sku && bundle.sku.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Durum filtresi
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !bundle.isActive) return false;
        if (statusFilter === "inactive" && bundle.isActive) return false;
      }

      return true;
    });
  }, [bundles, searchTerm, statusFilter]);

  // Tümünü seç/kaldır
  const handleSelectAll = () => {
    if (selectedIds.size === filteredBundles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBundles.map((b) => b.id)));
    }
  };

  // Tek bundle seç/kaldır
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
    if (!confirm(`${selectedIds.size} paket ürünü silmek istediğinize emin misiniz?`)) return;

    setBulkLoading(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/bundles/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setBundles((prev) => prev.filter((b) => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Toplu silme hatası:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleFeatured = async (bundleId: string, currentValue: boolean) => {
    setTogglingId(bundleId);
    
    // Optimistic update
    setBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, isFeatured: !currentValue } : b))
    );

    try {
      const res = await fetch(`/api/bundles/${bundleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });

      if (!res.ok) {
        // Rollback on error
        setBundles((prev) =>
          prev.map((b) => (b.id === bundleId ? { ...b, isFeatured: currentValue } : b))
        );
      }
    } catch (error) {
      // Rollback on error
      setBundles((prev) =>
        prev.map((b) => (b.id === bundleId ? { ...b, isFeatured: currentValue } : b))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (bundleId: string) => {
    if (!confirm("Bu paket ürünü silmek istediğinize emin misiniz?")) return;

    const previousBundles = [...bundles];
    setBundles((prev) => prev.filter((b) => b.id !== bundleId));

    try {
      const res = await fetch(`/api/bundles/${bundleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setBundles(previousBundles);
      }
    } catch (error) {
      setBundles(previousBundles);
    }
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
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
          <h1 className="text-2xl font-bold text-dark dark:text-white">Paket Ürünler</h1>
          <p className="text-gray-500">Bundle / paket ürünlerinizi yönetin</p>
        </div>
        <Link
          href="/bundles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Paket Oluştur
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{bundles.length}</p>
              <p className="text-sm text-gray-500">Toplam Paket</p>
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
              <p className="text-2xl font-bold text-dark dark:text-white">
                {bundles.filter((b) => b.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Aktif Paket</p>
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
              <p className="text-2xl font-bold text-dark dark:text-white">
                {bundles.filter((b) => b.isFeatured).length}
              </p>
              <p className="text-sm text-gray-500">Öne Çıkan</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {bundles.filter((b) => b.stock === 0).length}
              </p>
              <p className="text-sm text-gray-500">Stokta Yok</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Arama */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Ara</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Paket adı veya SKU..."
                className="w-full rounded-lg border border-stroke bg-transparent py-2.5 pl-10 pr-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:bg-gray-dark"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>

        {/* Filtre Sonucu */}
        <div className="mt-4 pt-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-dark dark:text-white">{filteredBundles.length}</span> paket bulundu
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
                paket seçildi
              </p>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-500 hover:text-dark dark:hover:text-white"
              >
                Seçimi Temizle
              </button>
            </div>

            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {bulkLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Seçilenleri Sil
            </button>
          </div>
        </div>
      )}

      {/* Bundles Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Paket Listesi</h2>
        </div>

        {filteredBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 mb-4">
              {bundles.length === 0 ? "Henüz paket ürün eklenmemiş" : "Filtrelere uygun paket bulunamadı"}
            </p>
            {bundles.length === 0 ? (
              <Link
                href="/bundles/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
              >
                İlk Paketinizi Oluşturun
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
                      checked={selectedIds.size === filteredBundles.length && filteredBundles.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Paket</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kategoriler</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fiyat</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">İçerik</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stok</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Öne Çıkar</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredBundles.map((bundle) => (
                  <tr 
                    key={bundle.id} 
                    className={`border-b border-stroke last:border-0 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2/50 transition-colors ${
                      selectedIds.has(bundle.id) ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(bundle.id)}
                        onChange={() => handleSelectOne(bundle.id)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-2 flex-shrink-0">
                          {bundle.thumbnail ? (
                            <Image
                              src={bundle.thumbnail}
                              alt={bundle.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark dark:text-white truncate max-w-[250px]">{bundle.name}</p>
                          <p className="text-sm text-gray-500">SKU: {bundle.sku || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {bundle.categories.slice(0, 2).map((cat) => (
                          <span 
                            key={cat.id}
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              cat.isPrimary 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "bg-gray-100 dark:bg-dark-2"
                            }`}
                          >
                            {cat.name}
                          </span>
                        ))}
                        {bundle.categories.length > 2 && (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-dark-2">
                            +{bundle.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {Number(bundle.price).toLocaleString("tr-TR")} ₺
                        </p>
                        {bundle.comparePrice && bundle.comparePrice > bundle.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {Number(bundle.comparePrice).toLocaleString("tr-TR")} ₺
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-600 dark:bg-violet-500/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {bundle.itemCount} ürün
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${bundle.stock === 0 ? "text-red-500" : bundle.stock <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                        {bundle.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleFeatured(bundle.id, bundle.isFeatured)}
                          disabled={togglingId === bundle.id}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            bundle.isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-dark-2"
                          } ${togglingId === bundle.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                          title={bundle.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              bundle.isFeatured ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${bundle.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                        {bundle.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(bundle.id)}
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

