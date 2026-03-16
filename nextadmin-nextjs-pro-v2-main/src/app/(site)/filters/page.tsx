"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AttributeValue {
  id: string;
  name: string;
  slug: string;
  value?: string;
  color?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  values: AttributeValue[];
}

interface FilterPreset {
  id: string;
  name: string;
  slug: string;
}

interface FilterOption {
  id?: string;
  name: string;
  value: string;
  color?: string;
}

interface Filter {
  id: string;
  name: string;
  sourceType: string;
  filterType: string;
  displayStyle: string;
  showCount: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
  allowMultiple: boolean;
  showHierarchy: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  order: number;
  isActive: boolean;
  attribute?: Attribute;
  preset?: FilterPreset;
  autoPopulate: boolean;
  selectedTermIds: string[];
  createdAt: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  options?: FilterOption[];
}

const filterTypeLabels: Record<string, string> = {
  CHECKBOX: "Çoklu Seçim",
  RADIO: "Tekli Seçim",
  COLOR_SWATCH: "Renk Paleti",
  IMAGE_SWATCH: "Görsel",
  RANGE: "Aralık",
  DROPDOWN: "Açılır Menü",
};

const displayStyleLabels: Record<string, string> = {
  LIST: "Liste",
  INLINE: "Yan Yana",
  GRID: "Izgara",
  DROPDOWN: "Açılır Menü",
};

// Helper function to get options from filter
const getFilterOptions = (filter: Filter): (AttributeValue | FilterOption)[] => {
  // Önce custom options'a bak, yoksa attribute values'a bak
  if (filter.options && filter.options.length > 0) {
    return filter.options;
  }
  return filter.attribute?.values || [];
};

// Helper function to get options count
const getOptionsCount = (filter: Filter): number => {
  return getFilterOptions(filter).length;
};

export default function FiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtreleri kategoriye göre gruplandır
  const groupedFilters = filters.reduce((acc, filter) => {
    const categoryName = filter.categoryName || 'Genel';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(filter);
    return acc;
  }, {} as Record<string, Filter[]>);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/filters");
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        setFilters(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
      setFilters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu filtreyi silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/filters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFilters(filters.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };

  const toggleActive = async (filter: Filter) => {
    try {
      const res = await fetch(`/api/filters/${filter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !filter.isActive }),
      });
      if (res.ok) {
        setFilters(
          filters.map((f) =>
            f.id === filter.id ? { ...f, isActive: !f.isActive } : f
          )
        );
      }
    } catch (error) {
      console.error("Error updating filter:", error);
    }
  };

  // Calculate total options safely
  const totalOptions = filters.reduce((acc, f) => acc + getOptionsCount(f), 0);
  const colorFiltersCount = filters.filter((f) => f.filterType === "COLOR_SWATCH").length;

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
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Ürün Filtreleri
          </h1>
          <p className="text-gray-500">
            YITH tarzı filtreler oluşturun ve yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/filters/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Yeni Filtre
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{filters.length}</p>
              <p className="text-sm text-gray-500">Toplam Filtre</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {filters.filter((f) => f.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Aktif Filtre</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {totalOptions}
              </p>
              <p className="text-sm text-gray-500">Toplam Seçenek</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {colorFiltersCount}
              </p>
              <p className="text-sm text-gray-500">Renk Filtresi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="px-6 py-4 border-b border-stroke dark:border-dark-3">
          <h2 className="font-semibold text-dark dark:text-white">
            Filtre Listesi
          </h2>
        </div>

        {filters.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <p className="text-gray-500 mb-4">Henüz filtre oluşturulmamış</p>
            <Link
              href="/filters/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              İlk Filtreyi Oluştur
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-2">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Filtre Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Kaynak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Görünüm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Seçenekler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-dark-3">
                {Object.entries(groupedFilters).map(([categoryName, categoryFilters]) => (
                  <React.Fragment key={`category-group-${categoryName}`}>
                    {/* Kategori Başlığı */}
                    <tr className="bg-gray-50 dark:bg-dark-2">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            📁 {categoryName}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({categoryFilters.length} filtre)
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Kategori Filtreleri */}
                    {categoryFilters.map((filter) => {
                      const options = getFilterOptions(filter);
                      const optionsCount = options.length;
                      
                      return (
                        <tr key={filter.id} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                          <td className="px-6 py-4 pl-12">
                            <div>
                              <p className="font-medium text-dark dark:text-white">
                                {filter.name}
                              </p>
                              {filter.attribute && (
                                <p className="text-xs text-gray-500">
                                  Özellik: {filter.attribute.name}
                                </p>
                              )}
                            </div>
                          </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-dark-3 dark:text-gray-300">
                          {filter.sourceType === "ATTRIBUTE" ? "Özellik" : filter.sourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {filterTypeLabels[filter.filterType] || filter.filterType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {displayStyleLabels[filter.displayStyle] || filter.displayStyle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-dark dark:text-white">
                            {optionsCount}
                          </span>
                          {filter.filterType === "COLOR_SWATCH" && optionsCount > 0 && (
                            <div className="flex -space-x-1">
                              {options.slice(0, 5).map((opt, idx) => (
                                <div
                                  key={opt.id || `opt-${idx}`}
                                  className="w-5 h-5 rounded-full border-2 border-white dark:border-dark-2"
                                  style={{ backgroundColor: opt.color || "#ccc" }}
                                  title={opt.name}
                                />
                              ))}
                              {optionsCount > 5 && (
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-dark-3 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-dark-2">
                                  +{optionsCount - 5}
                                </div>
                              )}
                            </div>
                          )}
                          {filter.filterType === "RANGE" && (
                            <span className="text-xs text-gray-500">
                              {filter.minValue ?? 0} - {filter.maxValue ?? "∞"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(filter)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            filter.isActive ? "bg-primary" : "bg-gray-300 dark:bg-dark-3"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              filter.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/filters/${filter.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 text-gray-500 hover:text-primary transition-colors"
                            title="Düzenle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(filter.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="font-semibold text-dark dark:text-white mb-4">
          Filtre Tipleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              <span className="font-medium text-dark dark:text-white">Çoklu Seçim</span>
            </div>
            <p className="text-sm text-gray-500">Birden fazla seçenek seçilebilir (checkbox)</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="3.5" /><path d="M3 13.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /><path d="M14 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /></svg>
              <span className="font-medium text-dark dark:text-white">Renk Paleti</span>
            </div>
            <p className="text-sm text-gray-500">Renk kutuları ile görsel seçim</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
              <span className="font-medium text-dark dark:text-white">Aralık</span>
            </div>
            <p className="text-sm text-gray-500">Fiyat veya değer aralığı (slider)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
