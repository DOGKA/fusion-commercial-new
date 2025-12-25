"use client";

import { useState } from "react";
import Image from "next/image";

// ============================================
// TYPES
// ============================================

export interface BackgroundImageValue {
  url: string | null;
  alt?: string;
  overlayOpacity: number;
  overlayGradient: boolean;
  overlayColor?: string;
}

export interface BackgroundImageControlProps {
  value: BackgroundImageValue;
  onChange: (value: BackgroundImageValue) => void;
  onOpenMediaLibrary: () => void;
  label?: string;
  hint?: string;
  aspectRatio?: "16/9" | "9/16" | "1/1" | "3/1";
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BackgroundImageControl({
  value,
  onChange,
  onOpenMediaLibrary,
  label = "Arka Plan Görseli",
  hint,
  aspectRatio = "16/9",
}: BackgroundImageControlProps) {
  const [showOverlaySettings, setShowOverlaySettings] = useState(
    value.overlayOpacity > 0 || value.overlayGradient
  );

  // Handle image clear
  const handleClear = () => {
    onChange({
      ...value,
      url: null,
      alt: undefined,
    });
  };

  // Handle overlay opacity change
  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...value,
      overlayOpacity: opacity,
    });
  };

  // Handle overlay gradient toggle
  const handleGradientToggle = () => {
    onChange({
      ...value,
      overlayGradient: !value.overlayGradient,
    });
  };

  // Handle overlay color change
  const handleColorChange = (color: string) => {
    onChange({
      ...value,
      overlayColor: color,
    });
  };

  // Get aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "16/9":
        return "aspect-video";
      case "9/16":
        return "aspect-[9/16]";
      case "1/1":
        return "aspect-square";
      case "3/1":
        return "aspect-[3/1]";
      default:
        return "aspect-video";
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark dark:text-white">
          {label}
        </label>
      )}

      {/* Image Preview / Upload Area */}
      {value.url ? (
        <div className="relative group">
          {/* Image Preview */}
          <div
            className={`relative ${getAspectClass()} rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2`}
          >
            <Image
              src={value.url}
              alt={value.alt || "Background"}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Overlay Preview */}
            {(value.overlayOpacity > 0 || value.overlayGradient) && (
              <div
                className="absolute inset-0"
                style={{
                  background: value.overlayGradient
                    ? `linear-gradient(180deg, transparent 0%, ${value.overlayColor || "rgba(0,0,0,0.8)"} 100%)`
                    : value.overlayColor || `rgba(0,0,0,${value.overlayOpacity / 100})`,
                  opacity: value.overlayGradient ? 1 : value.overlayOpacity / 100,
                }}
              />
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={onOpenMediaLibrary}
                className="px-4 py-2 bg-white text-dark rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Değiştir
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red text-white rounded-lg text-sm font-medium hover:bg-red-dark transition-colors"
              >
                Kaldır
              </button>
            </div>
          </div>

          {/* Alt Text Display */}
          {value.alt && (
            <p className="mt-1 text-xs text-gray-5 truncate">
              Alt: {value.alt}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenMediaLibrary}
          className={`w-full ${getAspectClass()} border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer`}
        >
          <svg className="w-8 h-8 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-5">Görsel Seç</span>
        </button>
      )}

      {/* Hint */}
      {hint && (
        <p className="text-xs text-gray-5">{hint}</p>
      )}

      {/* Overlay Settings Toggle */}
      {value.url && (
        <button
          onClick={() => setShowOverlaySettings(!showOverlaySettings)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showOverlaySettings ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Overlay Ayarları
        </button>
      )}

      {/* Overlay Settings Panel */}
      {value.url && showOverlaySettings && (
        <div className="p-4 bg-gray-1 dark:bg-dark-2 rounded-lg space-y-4">
          {/* Opacity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-5">Overlay Opaklığı</span>
              <span className="text-xs text-dark dark:text-white">{value.overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value.overlayOpacity}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Gradient Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-dark dark:text-white">Gradient Overlay</span>
              <p className="text-xs text-gray-5">Alt kısımda yoğunlaşan overlay</p>
            </div>
            <button
              onClick={handleGradientToggle}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                value.overlayGradient ? "bg-primary" : "bg-gray-4"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  value.overlayGradient ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Overlay Color */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-5">Overlay Rengi</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={value.overlayColor || "#000000"}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-stroke dark:border-dark-3"
              />
              <div className="flex-1 flex items-center gap-2">
                {["#000000", "#1a1a2e", "#16213e", "#0f3460"].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-md transition-all ${
                      value.overlayColor === color
                        ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-dark-2"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER FUNCTION
// ============================================

export function getOverlayStyle(value: BackgroundImageValue): React.CSSProperties {
  if (!value.url) return {};

  if (value.overlayGradient) {
    return {
      background: `linear-gradient(180deg, transparent 0%, ${value.overlayColor || "rgba(0,0,0,0.8)"} 100%)`,
    };
  }

  if (value.overlayOpacity > 0) {
    const color = value.overlayColor || "#000000";
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${value.overlayOpacity / 100})`,
    };
  }

  return {};
}
