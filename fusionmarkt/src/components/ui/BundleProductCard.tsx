"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, BadgeCheck, Play, Zap } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { readableBadgeBackground } from "@/lib/color-contrast";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useFavorites } from "@/context/FavoritesContext";

export interface BundleItem {
  id: string;
  quantity: number;
  variantId?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: number;
  } | null;
}

export interface BundleBadge {
  id: string;
  name: string;
  color: string;
  textColor?: string | null;
  icon?: string | null;
  isSystem?: boolean;
}

export interface BundleProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  totalValue: number;
  savings: number;
  savingsPercent: number;
  thumbnail?: string | null;
  stock: number;
  items: BundleItem[];
  itemCount: number;
  ratingAverage?: number;
  ratingCount?: number;
  freeShipping?: boolean;
  hasVariants?: boolean;
  badges?: BundleBadge[];
  videoLabel?: string;
}

interface BundleProductCardProps {
  bundle: BundleProduct;
  className?: string;
  priority?: boolean;
}

// iOS-style Squircle border-radius
const SQUIRCLE = {
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '24px',
};

/** "%22 İndirim" gibi oran rozeti. Kartta gösterilmiyor. */
function isDiscountRateBadge(label: string) {
  return /^%\s*\d+\s*[İI]ndirim$/i.test(label.trim());
}

// Kart kök elemanı bir container; 260px'ten dar yuvalarda (mobil ızgara)
// `@max-[259px]:` varyantlarıyla kompakt düzene geçiliyor.
const BADGE_CLASS =
  "inline-flex items-center justify-center font-semibold text-center h-7 min-w-[75px] px-3 text-[11px] @max-[259px]:h-6 @max-[259px]:min-w-0 @max-[259px]:px-2 @max-[259px]:text-[10px]";

export default function BundleProductCard({ bundle, className, priority = false }: BundleProductCardProps) {
  const [favoriteHover, setFavoriteHover] = useState(false);
  
  const { isFavorite, toggleItem } = useFavorites();
  
  const favoriteId = String(bundle.id);
  const isProductFavorite = isFavorite(favoriteId);

  const {
    id,
    slug,
    name,
    price,
    totalValue,
    savings,
    thumbnail,
    stock,
    ratingAverage,
    ratingCount,
    freeShipping,
    hasVariants,
    badges,
    videoLabel,
  } = bundle;

  const isOutOfStock = stock <= 0;

  return (
    <div className={cn("@container relative flex flex-col", className)}>
      <Link href={`/urun/${slug}`} className="flex flex-1 flex-col h-[640px] @max-[259px]:h-auto">
        {/* IMAGE AREA */}
        <div 
          className="relative w-full bg-background overflow-hidden border border-border border-b-0"
          style={{ 
            paddingBottom: '100%',
            borderTopLeftRadius: SQUIRCLE.xl, 
            borderTopRightRadius: SQUIRCLE.xl,
            flexShrink: 0
          }}
        >
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={name}
              fill
              priority={priority}
              sizes="(max-width: 1023px) 200px, 280px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder type="product" text="PAKET GÖRSELİ" iconSize="lg" />
          )}
            
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 @max-[259px]:top-2 @max-[259px]:left-2 @max-[259px]:gap-1">
            {/* Bundle Badge */}
            <span 
              className={cn(BADGE_CLASS, "gap-1 font-bold")}
              style={{ 
                borderRadius: SQUIRCLE.sm,
                // Gradient'in iki ucu da beyaz metinle 4.5:1 üzerinde kalıyor
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#FFFFFF',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="M12 22V12"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 2v10"/>
              </svg>
              PAKET
            </span>
            
            {/* Stock Badge - Son 1 adet */}
            {stock === 1 && !isOutOfStock && (
              <span 
                className={cn(BADGE_CLASS, "min-w-[85px] px-3.5")}
                style={{ 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#C2410C',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Son 1 adet
              </span>
            )}
            {/* Stock Badge - Stok Yok */}
            {isOutOfStock && (
              <span 
                className={cn(BADGE_CLASS, "min-w-[85px] px-3.5")}
                style={{ 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#6B7280',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Stok Yok
              </span>
            )}
            {/* Custom Badges */}
            {badges && badges.length > 0 && badges.filter((badge) => badge.name && !isDiscountRateBadge(badge.name)).slice(0, 3).map((badge) => {
              // Panelden gelen renk okunamayacak kadar açıksa zemini AA eşiğine kadar koyulaştır
              const badgeText = badge.textColor || '#FFFFFF';
              const badgeBackground = readableBadgeBackground(badge.color || '#7C3AED', badgeText);

              return (
              <span 
                key={badge.id}
                className={BADGE_CLASS}
                style={{ 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: badgeBackground,
                  color: badgeText,
                  border: `1px solid ${badgeText}20`
                }}
              >
                {badge.name}
              </span>
              );
            })}
            {videoLabel && (
              <span
                className={cn(BADGE_CLASS, "gap-1")}
                style={{
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#0E7490',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Play size={10} fill="currentColor" />
                <span className="@max-[259px]:hidden">Videolu Ürün</span>
                <span className="hidden @max-[259px]:inline">Video</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 @max-[259px]:top-2 @max-[259px]:right-2">
            {/* Favorilere Ekle */}
            <button
              type="button"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                toggleItem({
                  productId: favoriteId,
                  bundleId: favoriteId,
                  isBundle: true,
                  slug: slug,
                  title: name,
                  brand: "Paket",
                  price: price,
                  originalPrice: totalValue,
                  image: thumbnail || undefined,
                });
              }}
              onMouseEnter={() => setFavoriteHover(true)}
              onMouseLeave={() => setFavoriteHover(false)}
              title={isProductFavorite ? "Beğendiklerimden Çıkar" : "Beğendiklerime Ekle"}
              className="card-glass-button w-9 h-9 @max-[259px]:w-7 @max-[259px]:h-7 @max-[259px]:min-w-0! @max-[259px]:min-h-0! @max-[259px]:rounded-[10px]!"
              style={{
                borderRadius: SQUIRCLE.md,
                backgroundColor: isProductFavorite ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                border: isProductFavorite 
                  ? '1px solid rgba(236, 72, 153, 0.5)' 
                  : favoriteHover 
                    ? '1px solid rgba(236, 72, 153, 0.45)' 
                    : '1px solid rgba(236, 72, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isProductFavorite 
                  ? '#ec4899' 
                  : favoriteHover 
                    ? 'rgba(236, 72, 153, 0.95)' 
                    : 'rgba(236, 72, 153, 0.65)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isProductFavorite ? '0 2px 12px rgba(236, 72, 153, 0.25)' : '0 2px 8px rgba(0,0,0,0.12)',
                transform: isProductFavorite ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <Heart size={15} className="@max-[259px]:size-3" fill={isProductFavorite ? 'currentColor' : 'none'} />
            </button>

          </div>

{/* Out of Stock Overlay - REMOVED, using badge instead */}
        </div>

        {/* CONTENT AREA */}
        <div 
          className={cn(
            "flex flex-col p-3 pt-3 border border-border border-t-0 transition-all duration-300",
            "bg-surface/90 dark:bg-surface/90",
            "hover:border-border-hover"
          )}
          style={{ 
            borderBottomLeftRadius: SQUIRCLE.xl, 
            borderBottomRightRadius: SQUIRCLE.xl,
            flex: '1 1 auto',
            minHeight: 0,
          }}
        >
          {/* ÜST KISIM - Brand & Title - ProductCard ile aynı yapı */}
          <div className="flex flex-col gap-1">
            {/* Marka satırı - "Bundle / Paket" */}
            <p className="text-[9px] text-foreground-muted tracking-widest truncate @max-[259px]:tracking-wider">
              BUNDLE / PAKET
            </p>
            <h3 
              className="text-[18px] min-h-[2.8em] @max-[259px]:text-[13px]!"
              style={{ 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                lineHeight: 1.4, 
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {name}
            </h3>
          </div>

          {/* ORTA KISIM - ProductCard'daki varyant satırıyla aynı yükseklik; kompaktta gizli */}
          <div className="flex flex-col gap-2 mt-2">
            <div style={{ minHeight: '32px' }} />
          </div>

          <div style={{ height: '8px' }} />

          {/* ALT KISIM - Sabit yuvalar: öğe yoksa yeri görünmez tutuluyor, böylece tüm kartların boyu ve iç düzeni aynı kalıyor */}
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              {freeShipping ? (
                <span
                  className="inline-flex flex-1 items-center justify-center gap-1.5 bg-glass-bg"
                  style={{
                    height: 28,
                    padding: '0 8px',
                    border: '1px solid var(--pill-border-emerald)',
                    borderRadius: SQUIRCLE.sm,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pill-accent-emerald)' }}>
                    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
                    <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
                    <circle cx="7" cy="18" r="2"/>
                    <circle cx="17" cy="18" r="2"/>
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pill-accent-emerald)' }}>
                    Ücretsiz Kargo
                  </span>
                </span>
              ) : (
                /* Kargo ücretliyse webde Yetkili Distribütör yalnız kalmasın; mobilde yuva görünmez kalıyor */
                <span
                  className="inline-flex flex-1 items-center justify-center gap-1.5 bg-glass-bg @max-[259px]:invisible"
                  style={{
                    height: 28,
                    padding: '0 8px',
                    border: '1px solid var(--pill-border-cyan)',
                    borderRadius: SQUIRCLE.sm,
                  }}
                >
                  <Zap size={11} style={{ color: 'var(--pill-accent-cyan)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pill-accent-cyan)' }}>
                    Hızlı Teslimat
                  </span>
                </span>
              )}

              <span
                className="inline-flex flex-1 items-center justify-center gap-1 bg-glass-bg @max-[259px]:hidden"
                style={{
                  height: 28,
                  padding: '0 8px',
                  border: '1px solid var(--pill-border-amber-soft)',
                  borderRadius: SQUIRCLE.sm,
                }}
              >
                <BadgeCheck size={11} style={{ color: 'var(--pill-accent-amber)' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--foreground)' }}>
                  Yetkili Distribütör
                </span>
              </span>
            </div>

            {/* Yorum yoksa puan satırı gizleniyor ama yeri korunuyor */}
            <span
              className={cn("inline-flex items-center justify-center gap-1.5 bg-glass-bg w-full", !ratingCount && "invisible")}
              style={{
                height: 28,
                padding: '0 14px',
                border: '1px solid var(--pill-border-amber)',
                borderRadius: SQUIRCLE.sm,
              }}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={star <= Math.round(ratingAverage || 0) ? "" : "fill-transparent text-foreground-disabled"}
                    style={star <= Math.round(ratingAverage || 0)
                      ? { fill: 'var(--pill-accent-amber)', color: 'var(--pill-accent-amber)' }
                      : undefined
                    }
                  />
                ))}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--foreground)' }}>
                {ratingAverage?.toFixed(1) || "0.0"}
              </span>
              <span style={{ fontSize: 9, color: 'var(--foreground-muted)' }}>
                ({ratingCount || 0})
              </span>
            </span>
          </div>

          {/* PRICE SECTION - ProductCard ile aynı düzen */}
            <div className="pt-2" style={{ marginTop: 'auto' }}>
            {/* Eski fiyat & Kazanç */}
            <div className="h-[20px] @max-[259px]:h-[30px]">
              {totalValue && totalValue > price ? (
                <div className="flex items-center gap-2 @max-[259px]:flex-wrap @max-[259px]:gap-x-1.5 @max-[259px]:gap-y-0">
                  <span className="text-[13px] text-foreground-muted line-through font-medium @max-[259px]:text-[11px]">
                    {formatPrice(totalValue)} ₺
                  </span>
                  <span className="text-[11px] text-[color:var(--fusion-success-text)] font-semibold @max-[259px]:text-[10px]">
                    {formatPrice(savings)} ₺ kazanç
                  </span>
                </div>
              ) : null}
            </div>

            {/* Güncel fiyat & Sepete Ekle - ProductCard ile AYNI konumda */}
            <div className="h-[48px] flex items-center justify-between gap-3 @max-[259px]:gap-2">
              <span className="text-xl font-bold text-foreground @max-[259px]:text-base @max-[259px]:min-w-0 @max-[259px]:truncate">
                {formatPrice(price)}
                <span className="text-sm font-normal text-foreground-tertiary ml-1">₺</span>
              </span>

              {/* Sepete Ekle veya Varyasyon Seç Button */}
              {hasVariants ? (
                // Varyasyonlu bundle - sayfa yönlendirmesi
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/urun/${slug}`;
                  }}
                  title="Varyasyon seçmek için tıklayın"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: SQUIRCLE.md,
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    opacity: isOutOfStock ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                </button>
              ) : (
                // Basit bundle - direkt sepete ekle
                <AddToCartButton
                  product={{
                    productId: id,
                    slug,
                    title: name,
                    brand: "Bundle / Paket",
                    price,
                    originalPrice: totalValue,
                    image: thumbnail || undefined,
                    isBundle: true,
                    bundleId: id,
                  }}
                  variant="icon"
                  disabled={isOutOfStock}
                  size="md"
                />
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

