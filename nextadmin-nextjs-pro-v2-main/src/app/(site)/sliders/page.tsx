"use client";

import { useState, useEffect, useCallback } from "react";
import ListWithPreview, { ListItem, FilterConfig } from "@/components/templates/ListWithPreview";
import { PreviewFrame } from "@/components/preview";

// ============================================
// TYPES
// ============================================

interface Slider extends ListItem {
  badge?: string | null;
  badgeIcon?: string | null;
  title: string;
  titleHighlight?: string | null;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  button2Text?: string | null;
  button2Link?: string | null;
  theme: string;
  textAlign: string;
  overlayColor?: string | null;
  overlayOpacity: number;
  effect: string;
}

// ============================================
// FILTER CONFIG
// ============================================

const SLIDER_FILTERS: FilterConfig[] = [
  {
    key: "effect",
    label: "Efekt",
    options: [
      { value: "FADE", label: "Fade" },
      { value: "SLIDE", label: "Slide" },
      { value: "PARALLAX", label: "Parallax" },
      { value: "NONE", label: "Yok" },
    ],
  },
];

// ============================================
// SLIDER PREVIEW COMPONENT
// ============================================

function SliderPreview({ slider, viewMode }: { slider: Slider; viewMode: "web" | "mobile" | "wide" }) {
  const isMobile = viewMode === "mobile";

  // Get overlay style
  const getOverlayStyle = () => {
    const opacity = slider.overlayOpacity || 50;
    const color = slider.overlayColor || "#000000";
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity / 100})` };
  };

  // Get text alignment class
  const getTextAlignClass = () => {
    switch (slider.textAlign) {
      case "CENTER":
        return "items-center text-center";
      case "RIGHT":
        return "items-end text-right";
      default:
        return "items-start text-left";
    }
  };

  return (
    <PreviewFrame mode={viewMode}>
      <div className="relative w-full h-full bg-gray-900">
        {/* Background Image */}
        {slider.desktopImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${isMobile && slider.mobileImage ? slider.mobileImage : slider.desktopImage})`,
            }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0" style={getOverlayStyle()} />

        {/* Content */}
        <div className={`relative h-full flex flex-col justify-center p-6 ${getTextAlignClass()}`}>
          {/* Badge */}
          {slider.badge && (
            <div className="fm-badge bg-white/20 text-white text-[10px] mb-3">
              {slider.badgeIcon && <span className="w-3 h-3">⚡</span>}
              {slider.badge}
            </div>
          )}

          {/* Title */}
          <h2 className={`text-white font-bold mb-2 ${isMobile ? "text-lg" : "text-xl"}`}>
            {slider.title}
            {slider.titleHighlight && (
              <span className="bg-gradient-to-r from-fm-green to-fm-cyan bg-clip-text text-transparent">
                {" "}{slider.titleHighlight}
              </span>
            )}
          </h2>

          {/* Subtitle */}
          {slider.subtitle && (
            <p className={`text-white/70 mb-4 ${isMobile ? "text-xs" : "text-sm"}`}>
              {slider.subtitle}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            {slider.buttonText && (
              <span className={`bg-white text-dark rounded-full font-medium ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}>
                {slider.buttonText}
              </span>
            )}
            {slider.button2Text && (
              <span className={`border border-white/50 text-white rounded-full font-medium ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}>
                {slider.button2Text}
              </span>
            )}
          </div>
        </div>

        {/* Effect indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white/70 text-[8px] rounded">
          {slider.effect}
        </div>
      </div>
    </PreviewFrame>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function SlidersListPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sliders?limit=100");
      if (res.ok) {
        const data = await res.json();
        setSliders(data.sliders || []);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const handleToggleActive = async (slider: Slider) => {
    try {
      const res = await fetch(`/api/admin/sliders/${slider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slider.isActive }),
      });

      if (res.ok) {
        setSliders((prev) =>
          prev.map((s) => (s.id === slider.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (error) {
      console.error("Error toggling slider:", error);
    }
  };

  const handleDelete = async (slider: Slider) => {
    try {
      const res = await fetch(`/api/admin/sliders/${slider.id}`, { method: "DELETE" });
      if (res.ok) {
        setSliders((prev) => prev.filter((s) => s.id !== slider.id));
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
    }
  };

  const listItems = sliders.map((slider) => ({
    ...slider,
    type: slider.effect,
    placement: slider.theme,
  }));

  return (
    <ListWithPreview
      items={listItems}
      loading={loading}
      moduleName="Sliderlar"
      moduleSlug="sliders"
      filters={SLIDER_FILTERS}
      renderPreview={(item, viewMode) => (
        <SliderPreview slider={item as Slider} viewMode={viewMode} />
      )}
      showWidePreview={false}
      onToggleActive={handleToggleActive}
      onDelete={handleDelete}
      createButtonLabel="Yeni Slider"
    />
  );
}
