"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronDown, ChevronUp, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface FilterOption {
  id: string;
  name: string;
  value: string;
  color?: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  type: "CHECKBOX" | "RADIO" | "COLOR_SWATCH" | "RANGE";
  options: FilterOption[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
}

interface SelectedFilters {
  [filterId: string]: string[];
}

interface RangeValues {
  [filterId: string]: { min: number; max: number };
}

interface FilterSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  selectedFilters: SelectedFilters;
  rangeValues: RangeValues;
  onFilterChange: (filterId: string, values: string[]) => void;
  onRangeChange: (filterId: string, min: number, max: number) => void;
  onClearAll: () => void;
  onApply: () => void;
  themeColor?: string;
  categoryName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER SIDE PANEL (MiniCart Style)
// ═══════════════════════════════════════════════════════════════════════════

export default function FilterSidePanel({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  rangeValues,
  onFilterChange,
  onRangeChange,
  onClearAll,
  onApply,
  themeColor = "#8B5CF6",
  categoryName = "Ürünler",
}: FilterSidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Toplam seçili filtre sayısı
  const totalSelectedCount = Object.values(selectedFilters).reduce(
    (acc, vals) => acc + vals.length,
    0
  );

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Handle checkbox/radio change
  const handleOptionChange = (
    filterId: string,
    optionValue: string,
    filterType: string
  ) => {
    const current = selectedFilters[filterId] || [];

    if (filterType === "RADIO") {
      // Radio: sadece bir seçenek
      onFilterChange(filterId, current.includes(optionValue) ? [] : [optionValue]);
    } else {
      // Checkbox: toggle
      if (current.includes(optionValue)) {
        onFilterChange(
          filterId,
          current.filter((v) => v !== optionValue)
        );
      } else {
        onFilterChange(filterId, [...current, optionValue]);
      }
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with blur */}
      <div
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[420px]",
          "bg-white dark:bg-gradient-to-b dark:from-[#0d0d0d] dark:to-[#080808]",
          "border-l border-gray-200 dark:border-white/[0.06]",
          "flex flex-col shadow-2xl shadow-black/60",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: `${themeColor}20` }}
            />
            <div
              className="absolute -top-4 right-12 w-20 h-20 rounded-full blur-2xl animate-pulse"
              style={{ backgroundColor: `${themeColor}10`, animationDelay: "1s" }}
            />
          </div>

          {/* Grid Header */}
          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5">
            {/* Filter Icon */}
            <div className="relative group">
              <div
                className="w-12 h-12 backdrop-blur-sm border flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}05 100%)`,
                  borderColor: `${themeColor}25`,
                  borderRadius: "16px",
                }}
              >
                <svg
                  className="w-[22px] h-[22px]"
                  style={{ color: themeColor }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              {/* Badge */}
              {totalSelectedCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-background"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`,
                    boxShadow: `0 4px 12px ${themeColor}40`,
                  }}
                >
                  {totalSelectedCount}
                </span>
              )}
            </div>

            {/* Title Block */}
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-foreground tracking-tight">
                Filtreler
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-foreground-muted font-medium">
                  {categoryName}
                </span>
                {totalSelectedCount > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-foreground-muted" />
                    <span
                      className="text-[14px] font-semibold tracking-tight"
                      style={{ color: themeColor }}
                    >
                      {totalSelectedCount} seçili
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-glass-bg-hover rounded-lg transition-all duration-200"
              aria-label="Kapat"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Subtle divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mx-4" />

          {/* Clear All Button */}
          {totalSelectedCount > 0 && (
            <div className="px-4 pt-3 pb-3">
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-foreground-tertiary hover:text-foreground hover:bg-glass-bg-hover rounded-lg transition-all"
              >
                <RotateCcw size={14} />
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FILTER GROUPS
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div
                className="w-20 h-20 border flex items-center justify-center mb-5"
                style={{
                  background: "var(--glass-bg)",
                  borderColor: "var(--border)",
                  borderRadius: "24px",
                }}
              >
                <svg
                  className="w-10 h-10 text-foreground-disabled"
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
              </div>
              <p className="text-foreground-secondary text-base font-medium">
                Bu kategori için filtre tanımlanmamış
              </p>
            </div>
          ) : (
            filters.map((group) => {
              const isCollapsed = collapsedGroups.has(group.id);
              const selectedInGroup = selectedFilters[group.id] || [];

              return (
                <div
                  key={group.id}
                  className="bg-glass-bg border border-border rounded-xl overflow-hidden"
                >
                  {/* Group Header */}
                  <button
                    onClick={() => group.isCollapsible !== false && toggleGroup(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 text-left transition-colors",
                      group.isCollapsible !== false && "hover:bg-glass-bg-hover cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-foreground">
                        {group.name}
                      </span>
                      {selectedInGroup.length > 0 && (
                        <span
                          className="px-2 py-0.5 text-[11px] font-semibold rounded-full"
                          style={{
                            backgroundColor: `${themeColor}20`,
                            color: themeColor,
                          }}
                        >
                          {selectedInGroup.length}
                        </span>
                      )}
                    </div>
                    {group.isCollapsible !== false && (
                      isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-foreground-muted" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-foreground-muted" />
                      )
                    )}
                  </button>

                  {/* Group Options */}
                  {!isCollapsed && (
                    <div className="px-4 pb-4 space-y-2">
                      {group.type === "COLOR_SWATCH" ? (
                        // Color Swatch
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((opt) => {
                            const isSelected = selectedInGroup.includes(opt.value);
                            return (
                              <button
                                key={opt.id}
                                onClick={() =>
                                  handleOptionChange(group.id, opt.value, group.type)
                                }
                                className={cn(
                                  "relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
                                  isSelected
                                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0d0d0d]"
                                    : "border-border"
                                )}
                                style={{
                                  backgroundColor: opt.color || "#ccc",
                                  borderColor: isSelected ? themeColor : undefined,
                                  "--tw-ring-color": isSelected ? themeColor : undefined,
                                } as React.CSSProperties}
                                title={opt.name}
                              >
                                {isSelected && (
                                  <Check
                                    className="absolute inset-0 m-auto w-4 h-4"
                                    style={{
                                      color:
                                        opt.color &&
                                        parseInt(opt.color.replace("#", ""), 16) > 0xffffff / 2
                                          ? "#000"
                                          : "#fff",
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : group.type === "RANGE" ? (
                        // Range Slider - Kompakt tasarım (overflow fix)
                        <div className="space-y-2 w-full min-w-0">
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <input
                              type="number"
                              placeholder="Min"
                              value={rangeValues[group.id]?.min || ""}
                              onChange={(e) =>
                                onRangeChange(
                                  group.id,
                                  Number(e.target.value),
                                  rangeValues[group.id]?.max || 0
                                )
                              }
                              className="w-full min-w-0 flex-1 px-2 py-1.5 bg-glass-bg border border-border rounded-lg text-foreground text-xs placeholder:text-foreground-muted focus:outline-none focus:border-border-hover"
                            />
                            <span className="text-foreground-muted text-xs flex-shrink-0">-</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={rangeValues[group.id]?.max || ""}
                              onChange={(e) =>
                                onRangeChange(
                                  group.id,
                                  rangeValues[group.id]?.min || 0,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full min-w-0 flex-1 px-2 py-1.5 bg-glass-bg border border-border rounded-lg text-foreground text-xs placeholder:text-foreground-muted focus:outline-none focus:border-border-hover"
                            />
                          </div>
                        </div>
                      ) : (
                        // Checkbox / Radio
                        <div className="space-y-1">
                          {group.options.map((opt) => {
                            const isSelected = selectedInGroup.includes(opt.value);
                            return (
                              <button
                                key={opt.id}
                                onClick={() =>
                                  handleOptionChange(group.id, opt.value, group.type)
                                }
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                                  isSelected
                                    ? "bg-glass-bg-hover"
                                    : "hover:bg-glass-bg"
                                )}
                              >
                                {/* Checkbox/Radio indicator */}
                                <div
                                  className={cn(
                                    "w-5 h-5 flex items-center justify-center border-2 transition-colors",
                                    group.type === "RADIO" ? "rounded-full" : "rounded-md",
                                    isSelected
                                      ? "border-transparent"
                                      : "border-border"
                                  )}
                                  style={
                                    isSelected
                                      ? { backgroundColor: themeColor }
                                      : {}
                                  }
                                >
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-white dark:text-white" strokeWidth={3} />
                                  )}
                                </div>

                                {/* Option Name */}
                                <span
                                  className={cn(
                                    "flex-1 text-[14px] transition-colors",
                                    isSelected ? "text-foreground font-medium" : "text-foreground-secondary"
                                  )}
                                >
                                  {opt.name}
                                </span>

                                {/* Count */}
                                {opt.count !== undefined && (
                                  <span className="text-[12px] text-foreground-muted">
                                    ({opt.count})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER - Apply Button
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-border bg-background-secondary dark:bg-gradient-to-t dark:from-black/40 dark:to-transparent">
          <div className="p-5 space-y-3">
            {/* Apply Button */}
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`,
                boxShadow: `0 8px 24px ${themeColor}25`,
                borderRadius: "16px",
              }}
            >
              Filtreleri Uygula
              {totalSelectedCount > 0 && (
                <span className="px-2 py-0.5 bg-white/30 rounded-full text-[12px]">
                  {totalSelectedCount}
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-glass-bg border border-border hover:bg-glass-bg-hover hover:border-border-hover text-foreground-secondary hover:text-foreground font-medium text-base transition-all duration-300"
              style={{ borderRadius: "14px" }}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

