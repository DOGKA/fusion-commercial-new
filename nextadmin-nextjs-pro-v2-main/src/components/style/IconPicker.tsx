"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";

// ============================================
// TYPES
// ============================================

export interface IconValue {
  type: "preset" | "custom" | "none";
  presetId?: string;
  customUrl?: string;
}

export interface IconPickerProps {
  value: IconValue;
  onChange: (value: IconValue) => void;
  onOpenMediaLibrary?: () => void;
  label?: string;
  showToggle?: boolean;
}

// ============================================
// PRESET ICONS (Lucide-style SVG)
// ============================================

export const PRESET_ICONS: Record<string, { label: string; icon: ReactNode }> = {
  battery: {
    label: "Batarya",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
        <line x1="23" y1="13" x2="23" y2="11" />
      </svg>
    ),
  },
  sun: {
    label: "Güneş",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  plug: {
    label: "Fiş",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8h12z" />
      </svg>
    ),
  },
  package: {
    label: "Paket",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  bolt: {
    label: "Yıldırım",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
      </svg>
    ),
  },
  bag: {
    label: "Çanta",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  gift: {
    label: "Hediye",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,12 20,22 4,22 4,12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  star: {
    label: "Yıldız",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
      </svg>
    ),
  },
  truck: {
    label: "Kargo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  tag: {
    label: "Etiket",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  discount: {
    label: "İndirim",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="2" />
        <circle cx="15" cy="15" r="2" />
        <line x1="7" y1="17" x2="17" y2="7" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      </svg>
    ),
  },
  heart: {
    label: "Kalp",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  ladder: {
    label: "Merdiven",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="2" x2="8" y2="22" />
        <line x1="16" y1="2" x2="16" y2="22" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  glove: {
    label: "Eldiven",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14v-3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
        <path d="M10 11V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v5" />
        <path d="M14 9V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v8" />
        <path d="M18 14v-3" />
        <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2" />
        <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
      </svg>
    ),
  },
};

export const PRESET_ICON_IDS = Object.keys(PRESET_ICONS) as (keyof typeof PRESET_ICONS)[];

// ============================================
// MAIN COMPONENT
// ============================================

export default function IconPicker({
  value,
  onChange,
  onOpenMediaLibrary,
  label = "İkon",
  showToggle = true,
}: IconPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(value.type === "custom");
  const [customUrlInput, setCustomUrlInput] = useState(value.customUrl || "");

  // Get current icon display
  const getCurrentIcon = () => {
    if (value.type === "none") return null;
    if (value.type === "preset" && value.presetId && PRESET_ICONS[value.presetId]) {
      return PRESET_ICONS[value.presetId].icon;
    }
    if (value.type === "custom" && value.customUrl) {
      return (
        <Image
          src={value.customUrl}
          alt="Custom icon"
          width={24}
          height={24}
          className="object-contain"
          unoptimized
        />
      );
    }
    return null;
  };

  // Handle toggle on/off
  const handleToggle = () => {
    if (value.type === "none") {
      // Turn on - select first preset
      onChange({ type: "preset", presetId: "battery" });
    } else {
      // Turn off
      onChange({ type: "none" });
    }
  };

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    onChange({ type: "preset", presetId });
    setShowCustomInput(false);
  };

  // Handle custom URL submit
  const handleCustomUrlSubmit = () => {
    if (customUrlInput.trim()) {
      onChange({ type: "custom", customUrl: customUrlInput.trim() });
    }
  };

  // If icon is off, only show toggle
  if (value.type === "none") {
    return (
      <div className="space-y-3">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark dark:text-white">{label}</label>
            {showToggle && (
              <button
                onClick={handleToggle}
                className="text-xs text-primary hover:underline"
              >
                + İkon Ekle
              </button>
            )}
          </div>
        )}
        <div className="p-4 border border-dashed border-stroke dark:border-dark-3 rounded-lg text-center">
          <p className="text-sm text-gray-5">İkon kapalı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-dark dark:text-white">{label}</label>
          {showToggle && (
            <button
              onClick={handleToggle}
              className="text-xs text-red hover:underline"
            >
              İkonu Kaldır
            </button>
          )}
        </div>
      )}

      {/* Current Selection Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-1 dark:bg-dark-2 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-dark-3 flex items-center justify-center">
          <div className="w-6 h-6 text-dark dark:text-white">
            {getCurrentIcon()}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-dark dark:text-white">
            {value.type === "preset" && value.presetId
              ? PRESET_ICONS[value.presetId]?.label || value.presetId
              : value.type === "custom"
              ? "Özel İkon"
              : "Seçilmedi"}
          </p>
          <p className="text-xs text-gray-5">
            {value.type === "preset" ? "Hazır ikon" : "Yüklenen ikon"}
          </p>
        </div>
      </div>

      {/* Preset Grid */}
      <div>
        <p className="text-xs font-medium text-gray-5 mb-2">Hazır İkonlar</p>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_ICON_IDS.map((id) => {
            const isSelected = value.type === "preset" && value.presetId === id;

            return (
              <button
                key={id}
                onClick={() => handlePresetSelect(id)}
                className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-dark"
                    : "bg-gray-1 dark:bg-dark-2 text-gray-5 hover:bg-gray-2 dark:hover:bg-dark-3 hover:text-dark dark:hover:text-white"
                }`}
                title={PRESET_ICONS[id].label}
              >
                <div className="w-5 h-5">{PRESET_ICONS[id].icon}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Icon Section */}
      <div>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <svg
            className={`w-3 h-3 transition-transform ${showCustomInput ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Özel İkon Kullan
        </button>

        {showCustomInput && (
          <div className="mt-3 space-y-3">
            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://... (SVG, PNG, WebP)"
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 outline-none focus:border-primary"
              />
              <button
                onClick={handleCustomUrlSubmit}
                disabled={!customUrlInput.trim()}
                className="px-3 h-9 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Uygula
              </button>
            </div>

            {/* Media Library Button */}
            {onOpenMediaLibrary && (
              <button
                onClick={onOpenMediaLibrary}
                className="w-full h-9 border border-dashed border-stroke dark:border-dark-3 rounded-lg text-sm text-gray-5 hover:border-primary hover:text-primary transition-colors"
              >
                📁 Medya Kütüphanesinden Seç
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ICON RENDERER (for preview)
// ============================================

export function renderIcon(value: IconValue, className = "w-5 h-5"): ReactNode {
  if (value.type === "none") return null;

  if (value.type === "preset" && value.presetId && PRESET_ICONS[value.presetId]) {
    return <div className={className}>{PRESET_ICONS[value.presetId].icon}</div>;
  }

  if (value.type === "custom" && value.customUrl) {
    return (
      <Image
        src={value.customUrl}
        alt="Icon"
        width={20}
        height={20}
        className={`${className} object-contain`}
        unoptimized
      />
    );
  }

  return null;
}
