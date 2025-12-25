"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ListWithPreview, { ListItem, FilterConfig } from "@/components/templates/ListWithPreview";
import { PreviewFrame } from "@/components/preview";
import { PRESET_ICONS } from "@/components/style/IconPicker";

// ============================================
// TYPES
// ============================================

interface BannerCard {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  buttonText?: string | null;
  buttonLink: string;
  icon?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  desktopColSpan: number;
  desktopRowSpan: number;
  mobileColSpan?: number;
  mobileRowSpan?: number;
  order: number;
  isActive: boolean;
}

interface Banner extends ListItem {
  bannerType: string;
  placement: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  backgroundColor?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  cards: BannerCard[];
}

// ============================================
// FILTER CONFIG
// ============================================

const BANNER_FILTERS: FilterConfig[] = [
  {
    key: "type",
    label: "Tip",
    options: [
      { value: "GRID", label: "Kategori Grid" },
      { value: "SINGLE", label: "Tekli Banner" },
      { value: "HERO", label: "Hero Banner" },
      { value: "CAROUSEL", label: "Carousel" },
    ],
  },
  {
    key: "placement",
    label: "Konum",
    options: [
      { value: "HOME_CATEGORY", label: "Ana Sayfa Kategori" },
      { value: "HOME_HERO", label: "Ana Sayfa Hero" },
      { value: "HOME_PROMO", label: "Ana Sayfa Promosyon" },
      { value: "SHOP_HEADER", label: "Mağaza Üst" },
    ],
  },
];

// ============================================
// BANNER PREVIEW COMPONENT
// ============================================

function BannerPreview({ banner, viewMode }: { banner: Banner; viewMode: "web" | "mobile" | "wide" }) {
  // Get gradient style
  const getGradientStyle = () => {
    if (banner.gradientFrom && banner.gradientTo) {
      return {
        background: `linear-gradient(135deg, ${banner.gradientFrom}, ${banner.gradientTo})`,
      };
    }
    if (banner.backgroundColor) {
      return { backgroundColor: banner.backgroundColor };
    }
    return { backgroundColor: "#1a1a2e" };
  };

  // Render HOME_CATEGORY grid cards - Frontend ile birebir aynı
  const renderHomeCategoryGrid = () => {
    if (!banner.cards || banner.cards.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-white/50 text-sm">
          Kart yok
        </div>
      );
    }

    const isMobile = viewMode === "mobile";
    // Web preview için satır yüksekliği - frontend oranında
    const rowHeight = isMobile ? 140 : 120;
    const gapSize = 10;

    return (
      <div className="w-full h-full p-3 relative overflow-auto" style={{ background: "#0A0A0A" }}>
        {/* Mesh gradient overlay - Frontend ile aynı */}
        <div className="absolute inset-0 opacity-50" style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.03) 100%)",
        }} />
        
        {/* Bento Grid - Frontend ile birebir aynı: 4 kolon web, 1 kolon mobil */}
        <div 
          className="relative z-10 grid"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
            gridAutoRows: `${rowHeight}px`,
            gap: `${gapSize}px`,
          }}
        >
          {banner.cards.map((card) => {
            const isLarge = !isMobile && card.desktopColSpan >= 2 && card.desktopRowSpan >= 2;
            
            // Grid span style - Dinamik kolon/satır span desteği
            const gridStyle: React.CSSProperties = {};
            if (!isMobile) {
              if (card.desktopColSpan > 1) gridStyle.gridColumn = `span ${card.desktopColSpan}`;
              if (card.desktopRowSpan > 1) gridStyle.gridRow = `span ${card.desktopRowSpan}`;
            }
            
            return (
              <div
                key={card.id}
                className="group relative overflow-hidden flex flex-col h-full"
                style={{ 
                  ...gridStyle,
                  background: `linear-gradient(135deg, ${card.gradientFrom || "#1f2937"} 0%, ${card.gradientTo || "#0f172a"} 100%)`,
                  backdropFilter: "blur(30px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                }}
              >
                {/* Dark overlay for contrast - Frontend ile aynı */}
                <div className="absolute inset-0 bg-black/25" />
                
                {/* Badge - Top Left - Frontend ile birebir aynı stiller */}
                {card.badge && (
                  <div className={`absolute ${isMobile ? "top-3 left-3" : "top-2.5 left-2.5"}`}>
                    <span 
                      className={`inline-flex items-center font-medium ${isMobile ? "px-2.5 py-1 text-[10px]" : "px-2 py-0.5 text-[8px]"}`}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "9999px",
                        color: "rgba(250, 250, 250, 0.75)",
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                )}
                
                {/* Icon - Top Right - Frontend ile birebir aynı */}
                {card.icon && (
                  <div className={`absolute ${isMobile ? "top-3 right-3" : "top-2.5 right-2.5"}`}>
                    <div 
                      className={`flex items-center justify-center ${isMobile ? "w-8 h-8 rounded-xl" : "w-6 h-6 rounded-lg"}`}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div className={`${isMobile ? "w-4 h-4" : "w-3 h-3"} text-[#E31E24]`}>
                        {PRESET_ICONS[card.icon]?.icon || <span className="text-[8px]">●</span>}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Content - Bottom - Frontend ile birebir aynı */}
                <div className={`relative z-10 mt-auto ${isMobile ? "p-4" : isLarge ? "p-4" : "p-3"}`}>
                  <h3 
                    className={`font-semibold mb-1 line-clamp-2 ${
                      isMobile ? "text-base" : isLarge ? "text-sm" : "text-xs"
                    }`}
                    style={{ color: "#FAFAFA" }}
                  >
                    {card.title || "Başlık"}
                  </h3>
                  {card.subtitle && (
                    <p 
                      className={`mb-2 line-clamp-2 ${isMobile ? "text-sm" : isLarge ? "text-xs" : "text-[10px]"}`}
                      style={{ color: "rgba(250, 250, 250, 0.75)" }}
                    >
                      {card.subtitle}
                    </p>
                  )}
                  
                  {/* CTA - Frontend ile birebir aynı: #E31E24 rengi */}
                  <div 
                    className={`flex items-center gap-1 font-medium ${isMobile ? "text-sm" : "text-xs"}`} 
                    style={{ color: "#E31E24" }}
                  >
                    <span>{card.buttonText || "Keşfet"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render SHOP_CATEGORY banner - Frontend exact match (glassmorphism card)
  const renderShopCategoryBanner = () => {
    const card = banner.cards?.[0];
    const isMobile = viewMode === "mobile";
    const bannerColors = {
      from: banner.gradientFrom || "#10b981",
      to: banner.gradientTo || "#059669"
    };
    const cardWidth = isMobile ? "220px" : "240px";
    const cardHeight = isMobile ? "420px" : "480px";

    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "#060606" }}>
        <div 
          className="relative rounded-2xl overflow-hidden border border-white/10"
          style={{
            width: cardWidth,
            minHeight: cardHeight,
            maxHeight: cardHeight,
            background: `linear-gradient(145deg, ${bannerColors.from}18 0%, ${bannerColors.to}08 100%)`,
          }}
        >
          {/* Gradient orb */}
          <div 
            className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-40"
            style={{ background: `radial-gradient(circle, ${bannerColors.from} 0%, transparent 70%)` }}
          />
          
          {/* Content - height sabit, içerik dikeyde dağılımlı */}
          <div 
            className="relative flex flex-col p-6"
            style={{ height: cardHeight }}
          >
            {/* Badge - üstte */}
            <div 
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[11px] font-semibold w-fit"
              style={{ 
                background: `${bannerColors.from}30`,
                color: bannerColors.from,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bannerColors.from }} />
              <span>{card?.badge || "Ürünler"}</span>
            </div>

            {/* Title - ortada, flex-1 ile boşluğu kaplar */}
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-xl font-bold text-white leading-snug mb-2">
                {banner.title || card?.title || banner.name}
              </h4>
              <p className="text-xs text-white/50">
                {banner.subtitle || card?.subtitle || "Kaliteli ürünleri keşfedin"}
              </p>
            </div>

            {/* CTA Button - altta */}
            <div 
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 backdrop-blur-sm"
              style={{ 
                background: `${bannerColors.from}20`,
              }}
            >
              <span className="text-xs font-semibold text-white">{banner.buttonText || card?.buttonText || "Tümünü Gör"}</span>
              <span className="text-white text-sm">›</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render SHOP_HEADER / single banner (slim hero like frontend)
  const renderSingleBanner = () => {
    if (banner.placement === "SHOP_HEADER") {
      const from = banner.gradientFrom || "#10b981";
      const to = banner.gradientTo || "#059669";
      const hasImage = banner.desktopImage || banner.mobileImage;
      const isMobile = viewMode === "mobile";

      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-white/10"
            style={{
              height: isMobile ? 100 : 140,
              background: `linear-gradient(90deg, ${to} 0%, ${from} 50%, ${to} 100%)`,
            }}
          >
            {hasImage && (
              <img
                src={banner.desktopImage || banner.mobileImage || ""}
                alt={banner.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Content Overlay - Frontend ile aynı layout */}
            <div className="absolute inset-0 flex items-end p-4">
              <div className="flex-1">
                {banner.title && (
                  <h3 className="text-white text-sm font-semibold mb-0.5">
                    {banner.title}
                  </h3>
                )}
                {banner.subtitle && (
                  <p className="text-white/80 text-[10px] line-clamp-1">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              {banner.buttonText && (
                <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl">
                  {banner.buttonText}
                  <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>

            {!hasImage && !banner.title && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white/50">{banner.placement} banner ekleyin</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    const hasImage = banner.desktopImage || banner.mobileImage;
    
    return (
      <div 
        className="relative h-full"
        style={{
          background: banner.gradientFrom && banner.gradientTo
            ? `linear-gradient(135deg, ${banner.gradientFrom} 0%, ${banner.gradientTo} 100%)`
            : "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.10) 100%)",
        }}
      >
        {/* Background Image */}
        {hasImage && (
          <img
            src={viewMode === "mobile" && banner.mobileImage ? banner.mobileImage : banner.desktopImage || ""}
            alt={banner.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay with content if no image */}
        {!hasImage && (
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {banner.title && (
              <h3 className="text-sm font-bold text-white mb-1">{banner.title}</h3>
            )}
            {banner.subtitle && (
              <p className="text-xs text-white/70 mb-2">{banner.subtitle}</p>
            )}
            {banner.buttonText && (
              <span className="text-[10px] bg-white text-dark px-2 py-1 rounded w-fit">
                {banner.buttonText}
              </span>
            )}
          </div>
        )}

        {/* Placeholder text if no content */}
        {!hasImage && !banner.title && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/30">{banner.placement} banner ekleyin</span>
          </div>
        )}
      </div>
    );
  };

  // Decide which render function to use based on placement
  const renderContent = () => {
    if (banner.placement === "HOME_CATEGORY") {
      return renderHomeCategoryGrid();
    }
    if (banner.placement.startsWith("SHOP_CATEGORY_")) {
      return renderShopCategoryBanner();
    }
    // SHOP_HEADER, HOME_HERO, etc. - single banner style
    return renderSingleBanner();
  };

  return (
    <PreviewFrame mode={viewMode}>
      {renderContent()}
    </PreviewFrame>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function BannersListPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners?limit=100");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle toggle active
  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) =>
            b.id === banner.id ? { ...b, isActive: !b.isActive } : b
          )
        );
      }
    } catch (error) {
      console.error("Error toggling banner:", error);
    }
  };

  // Handle delete
  const handleDelete = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  // Check if wide preview should be shown - Geniş önizleme kapalı
  const showWidePreview = (banner: Banner) => {
    return false;
  };

  // Map banners to list items
  const listItems = banners.map((banner) => ({
    ...banner,
    type: banner.bannerType,
  }));

  return (
    <ListWithPreview
      items={listItems}
      loading={loading}
      moduleName="Bannerlar"
      moduleSlug="banners"
      filters={BANNER_FILTERS}
      renderPreview={(item, viewMode) => (
        <BannerPreview banner={item as Banner} viewMode={viewMode} />
      )}
      showWidePreview={showWidePreview}
      onToggleActive={handleToggleActive}
      onDelete={handleDelete}
      createButtonLabel="Yeni Banner"
    />
  );
}
