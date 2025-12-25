"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================

export interface ListItem {
  id: string;
  name: string;
  type?: string;
  placement?: string;
  slot?: string;
  isActive: boolean;
  desktopImage?: string | null;
  mobileImage?: string | null;
  backgroundImage?: string | null;
  updatedAt?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface ListWithPreviewProps<T extends ListItem> {
  // Data
  items: T[];
  loading?: boolean;
  
  // Module config
  moduleName: string;
  moduleSlug: string; // e.g., "banners", "sliders"
  
  // Filters
  filters: FilterConfig[];
  
  // Preview
  renderPreview: (item: T, viewMode: "web" | "mobile" | "wide") => ReactNode;
  showWidePreview?: boolean | ((item: T) => boolean);
  
  // Actions
  onToggleActive?: (item: T) => Promise<void>;
  onDelete?: (item: T) => Promise<void>;
  
  // Custom
  createButtonLabel?: string;
}

// ============================================
// DEBOUNCE HOOK
// ============================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// ICONS
// ============================================

const SearchIcon = () => (
  <svg className="w-[18px] h-[18px] text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const WideIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function ListWithPreview<T extends ListItem>({
  items,
  loading = false,
  moduleName,
  moduleSlug,
  filters,
  renderPreview,
  showWidePreview = false,
  onToggleActive,
  onDelete,
  createButtonLabel = "Yeni Ekle",
}: ListWithPreviewProps<T>) {
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [viewMode, setViewMode] = useState<"web" | "mobile" | "wide">("web");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      // Active status filter
      if (activeFilters.activeStatus) {
        if (activeFilters.activeStatus === "active" && !item.isActive) return false;
        if (activeFilters.activeStatus === "inactive" && item.isActive) return false;
      }

      // Type filter
      if (activeFilters.type && activeFilters.type !== "all") {
        if (item.type !== activeFilters.type) return false;
      }

      // Placement/Slot filter
      if (activeFilters.placement && activeFilters.placement !== "all") {
        if (item.placement !== activeFilters.placement && item.slot !== activeFilters.placement) return false;
      }

      return true;
    });
  }, [items, debouncedSearch, activeFilters]);

  // Select first item if none selected
  useEffect(() => {
    if (!selectedItem && filteredItems.length > 0) {
      setSelectedItem(filteredItems[0]);
    }
  }, [filteredItems, selectedItem]);

  // Check if wide preview should be shown
  const canShowWide = useMemo(() => {
    if (!selectedItem) return false;
    if (typeof showWidePreview === "function") {
      return showWidePreview(selectedItem);
    }
    return showWidePreview;
  }, [selectedItem, showWidePreview]);

  // Get thumbnail for item
  const getThumbnail = (item: T): string | null => {
    return item.desktopImage || item.mobileImage || item.backgroundImage || null;
  };

  // Handle toggle active
  const handleToggle = async (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleActive || togglingId) return;
    
    setTogglingId(item.id);
    try {
      await onToggleActive(item);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle delete
  const handleDelete = async (item: T) => {
    if (!onDelete || deletingId) return;
    
    setDeletingId(item.id);
    try {
      await onDelete(item);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      {/* ============================================
       * LEFT PANEL - List (4 cols)
       * ============================================ */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] flex flex-col bg-white dark:bg-gray-dark rounded-fm-md shadow-fm-card overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stroke dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white mb-3">
            {moduleName}
          </h2>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara (isim / id / kısa içerik)"
              className="w-full h-10 pl-10 pr-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent text-sm outline-none focus:border-primary dark:focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-stroke dark:border-dark-3 space-y-3">
          {/* Active Status Filter - Always present */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-5 w-16">Durum:</span>
            <div className="flex gap-1 flex-1">
              {[
                { value: "all", label: "Tümü" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Pasif" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilters((prev) => ({ ...prev, activeStatus: opt.value === "all" ? "" : opt.value }))}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    (activeFilters.activeStatus || "all") === opt.value
                      ? "bg-primary text-white"
                      : "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3 dark:hover:bg-dark-3"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <span className="text-xs text-gray-5 w-16">{filter.label}:</span>
              <select
                value={activeFilters[filter.key] || "all"}
                onChange={(e) => setActiveFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                className="flex-1 h-8 px-2 text-xs rounded-md border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
              >
                <option value="all">Tümü</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-gray-2 dark:bg-dark-2 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-5 text-sm">Sonuç bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-stroke dark:divide-dark-3">
              {filteredItems.map((item) => {
                const thumbnail = getThumbnail(item);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : "hover:bg-gray-1 dark:hover:bg-dark-2 border-l-2 border-l-transparent"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-gray-2 dark:bg-dark-2 overflow-hidden flex-shrink-0">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark dark:text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.type && (
                          <span className="text-xs text-gray-5 truncate">
                            {item.type}
                          </span>
                        )}
                        {(item.placement || item.slot) && (
                          <span className="text-xs text-gray-5 truncate">
                            • {item.placement || item.slot}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Active Toggle */}
                      <button
                        onClick={(e) => handleToggle(item, e)}
                        disabled={togglingId === item.id}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          item.isActive ? "bg-fm-success" : "bg-gray-4"
                        } ${togglingId === item.id ? "opacity-50" : ""}`}
                        title={item.isActive ? "Pasife al" : "Aktif et"}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            item.isActive ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/${moduleSlug}/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md text-gray-5 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Düzenle"
                      >
                        <EditIcon />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(item.id);
                        }}
                        className="p-1.5 rounded-md text-gray-5 hover:text-red hover:bg-red/10 transition-colors"
                        title="Sil"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="p-4 border-t border-stroke dark:border-dark-3">
          <Link
            href={`/${moduleSlug}/new`}
            className="flex items-center justify-center gap-2 w-full h-10 bg-primary text-white rounded-fm-sm hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            <PlusIcon />
            {createButtonLabel}
          </Link>
        </div>
      </div>

      {/* ============================================
       * RIGHT PANEL - Preview (8 cols)
       * ============================================ */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-dark rounded-fm-md shadow-fm-card overflow-hidden">
        {selectedItem ? (
          <>
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-stroke dark:border-dark-3">
              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  {selectedItem.name}
                </h3>
                <p className="text-sm text-gray-5 mt-0.5">Önizleme</p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-2 dark:bg-dark-2 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("web")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === "web"
                      ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                      : "text-gray-5 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <MonitorIcon />
                  Web
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === "mobile"
                      ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                      : "text-gray-5 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <PhoneIcon />
                  Mobil
                </button>
                {canShowWide && (
                  <button
                    onClick={() => setViewMode("wide")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      viewMode === "wide"
                        ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                        : "text-gray-5 hover:text-dark dark:hover:text-white"
                    }`}
                  >
                    <WideIcon />
                    Geniş
                  </button>
                )}
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-1 dark:bg-dark-2 overflow-auto">
              {renderPreview(selectedItem, viewMode)}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between p-4 border-t border-stroke dark:border-dark-3">
              <div className="flex items-center gap-2">
                <span
                  className={`fm-badge ${
                    selectedItem.isActive
                      ? "bg-fm-success/10 text-fm-success"
                      : "bg-gray-3 dark:bg-dark-3 text-gray-5"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedItem.isActive ? "bg-fm-success" : "bg-gray-4"
                    }`}
                  />
                  {selectedItem.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/${moduleSlug}/${selectedItem.id}`}
                  className="px-4 py-2 bg-primary text-white rounded-fm-sm hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Düzenle
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gray-2 dark:bg-dark-2 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-1">
              Önizleme
            </h3>
            <p className="text-gray-5">Sol listeden bir öğe seçin.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-dark rounded-fm-md shadow-fm-modal p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red/10 flex items-center justify-center">
                <TrashIcon />
              </div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Silmek istediğinizden emin misiniz?
              </h3>
              <p className="text-sm text-gray-5 mb-6">
                Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingId !== null}
                  className="flex-1 px-4 py-2.5 border border-stroke dark:border-dark-3 rounded-fm-sm hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    const item = items.find((i) => i.id === deleteConfirm);
                    if (item) handleDelete(item as T);
                  }}
                  disabled={deletingId !== null}
                  className="flex-1 px-4 py-2.5 bg-red text-white rounded-fm-sm hover:bg-red-dark transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {deletingId ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
