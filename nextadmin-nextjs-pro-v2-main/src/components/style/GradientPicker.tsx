"use client";

import { useState, useMemo } from "react";

// ============================================
// TYPES
// ============================================

export interface GradientValue {
  type: "preset" | "custom";
  presetId?: string;
  colors: string[];
  angle: number;
  opacity?: number;
}

export interface GradientPickerProps {
  value: GradientValue;
  onChange: (value: GradientValue) => void;
  showCustom?: boolean;
  label?: string;
}

// ============================================
// GRADIENT PRESETS
// ============================================

export const GRADIENT_PRESETS = [
  { id: "green_cyan", label: "Yeşil - Cyan", from: "#22C55E", to: "#06B6D4" },
  { id: "amber_orange", label: "Amber - Turuncu", from: "#F59E0B", to: "#F97316" },
  { id: "purple_pink", label: "Mor - Pembe", from: "#A855F7", to: "#EC4899" },
  { id: "blue_indigo", label: "Mavi - Indigo", from: "#3B82F6", to: "#6366F1" },
  { id: "red_rose", label: "Kırmızı - Rose", from: "#EF4444", to: "#F43F5E" },
  { id: "teal_green", label: "Teal - Yeşil", from: "#14B8A6", to: "#22C55E" },
  { id: "sky_blue", label: "Gök Mavisi - Mavi", from: "#0EA5E9", to: "#3B82F6" },
  { id: "violet_purple", label: "Violet - Mor", from: "#8B5CF6", to: "#A855F7" },
  { id: "none_black", label: "Yok (Siyah)", from: "#000000", to: "#000000" },
] as const;

export type GradientPresetId = typeof GRADIENT_PRESETS[number]["id"];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getGradientCSS(value: GradientValue): string {
  const opacity = value.opacity ?? 100;
  const colors = value.colors.map((c) => {
    if (opacity < 100) {
      // Convert hex to rgba
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    }
    return c;
  });

  if (colors.length === 1 || colors[0] === colors[1]) {
    return colors[0];
  }

  return `linear-gradient(${value.angle}deg, ${colors.join(", ")})`;
}

export function getPresetById(id: string) {
  return GRADIENT_PRESETS.find((p) => p.id === id);
}

export function createGradientFromPreset(presetId: string): GradientValue {
  const preset = getPresetById(presetId);
  if (!preset) {
    return { type: "preset", presetId: "none_black", colors: ["#000000", "#000000"], angle: 135 };
  }
  return {
    type: "preset",
    presetId: preset.id,
    colors: [preset.from, preset.to],
    angle: 135,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GradientPicker({
  value,
  onChange,
  showCustom = true,
  label = "Gradient",
}: GradientPickerProps) {
  const [showCustomPanel, setShowCustomPanel] = useState(value.type === "custom");

  // Get current gradient CSS
  const gradientCSS = useMemo(() => getGradientCSS(value), [value]);

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    onChange({
      type: "preset",
      presetId,
      colors: [preset.from, preset.to],
      angle: value.angle || 135,
      opacity: value.opacity,
    });
    setShowCustomPanel(false);
  };

  // Handle custom color change
  const handleColorChange = (index: number, color: string) => {
    const newColors = [...value.colors];
    newColors[index] = color;
    onChange({
      ...value,
      type: "custom",
      presetId: undefined,
      colors: newColors,
    });
  };

  // Handle add third color
  const handleAddColor = () => {
    if (value.colors.length >= 3) return;
    onChange({
      ...value,
      type: "custom",
      presetId: undefined,
      colors: [...value.colors, "#6366F1"],
    });
  };

  // Handle remove color
  const handleRemoveColor = (index: number) => {
    if (value.colors.length <= 2) return;
    const newColors = value.colors.filter((_, i) => i !== index);
    onChange({
      ...value,
      type: "custom",
      presetId: undefined,
      colors: newColors,
    });
  };

  // Handle angle change
  const handleAngleChange = (angle: number) => {
    onChange({
      ...value,
      type: "custom",
      presetId: undefined,
      angle,
    });
  };

  // Handle opacity change
  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...value,
      opacity,
    });
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark dark:text-white">
          {label}
        </label>
      )}

      {/* Current Preview */}
      <div
        className="h-12 rounded-fm-sm border border-stroke dark:border-dark-3"
        style={{ background: gradientCSS }}
      />

      {/* Preset Grid */}
      <div className="grid grid-cols-3 gap-2">
        {GRADIENT_PRESETS.map((preset) => {
          const isSelected = value.type === "preset" && value.presetId === preset.id;
          const bg = preset.from === preset.to
            ? preset.from
            : `linear-gradient(135deg, ${preset.from}, ${preset.to})`;

          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`relative h-10 rounded-lg transition-all ${
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-dark"
                  : "hover:scale-105"
              }`}
              style={{ background: bg }}
              title={preset.label}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Toggle */}
      {showCustom && (
        <button
          onClick={() => setShowCustomPanel(!showCustomPanel)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showCustomPanel ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Özel Gradient
        </button>
      )}

      {/* Custom Panel */}
      {showCustom && showCustomPanel && (
        <div className="p-4 bg-gray-1 dark:bg-dark-2 rounded-lg space-y-4">
          {/* Colors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-5">Renkler</span>
              {value.colors.length < 3 && (
                <button
                  onClick={handleAddColor}
                  className="text-xs text-primary hover:underline"
                >
                  + 3. Renk Ekle
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {value.colors.map((color, index) => (
                <div key={index} className="flex-1 relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer border border-stroke dark:border-dark-3"
                  />
                  {value.colors.length > 2 && (
                    <button
                      onClick={() => handleRemoveColor(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Angle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-5">Açı</span>
              <span className="text-xs text-dark dark:text-white">{value.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={value.angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-5">Opaklık</span>
              <span className="text-xs text-dark dark:text-white">{value.opacity ?? 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value.opacity ?? 100}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
