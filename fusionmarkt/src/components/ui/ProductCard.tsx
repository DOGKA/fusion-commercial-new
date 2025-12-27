"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Eye, Play, BadgeCheck } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useFavorites } from "@/context/FavoritesContext";

export interface ProductVariant {
  id: string;
  name: string;
  type: "color" | "size";
  value: string;
  inStock: boolean;
  color?: string | null;
  image?: string | null;
}

export interface ProductBadge {
  label: string;
  color: string;
  bgColor: string;
  icon?: string | null;
}

export interface Product {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  videoLabel?: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockQuantity?: number;
  ratingAverage?: number;
  ratingCount?: number;
  freeShipping?: boolean;
  image?: string;
  variants?: ProductVariant[];
  badge?: string; // Legacy - deprecated, use badges array instead
  badges?: ProductBadge[];
}

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean; // For LCP optimization
}

// formatPrice is imported from @/lib/utils

// iOS-style Squircle border-radius
const SQUIRCLE = {
  sm: '10px',   // Badges, pills
  md: '14px',   // Action buttons
  lg: '18px',   // Cart button
  xl: '24px',   // Card
};

const isValidColorValue = (value?: string | null) => {
  if (!value) return false;
  const val = value.trim();

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) {
    return true;
  }

  if (/^(rgb|rgba|hsl|hsla)\(/i.test(val)) return true;

  const namedColors = [
    "white", "black", "gray", "grey", "silver", "red", "blue", "green",
    "yellow", "orange", "purple", "pink", "brown", "beige", "navy",
    "teal", "turquoise", "cyan", "magenta", "gold", "maroon",
  ];

  return namedColors.includes(val.toLowerCase());
};

export default function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [favoriteHover, setFavoriteHover] = useState(false);
  const [quickViewHover, setQuickViewHover] = useState(false);
  const { isFavorite, toggleItem } = useFavorites();
  
  // Check if this product is in favorites
  const isProductFavorite = isFavorite(String(product.id));

  const {
    slug,
    title,
    subtitle,
    brand,
    price,
    originalPrice,
    stockStatus,
    stockQuantity,
    ratingAverage,
    ratingCount,
    freeShipping,
    image,
    variants,
    badge,
    badges,
    videoLabel,
  } = product;

  const savingAmount = originalPrice ? originalPrice - price : 0;
  const isOutOfStock = stockStatus === "out_of_stock";

  // Variants ve videoLabel birlikte olabilir
  const hasVariants = variants && variants.length > 0;

  return (
    <div className={cn("relative", className, isOutOfStock && "opacity-60")}>
      <Link href={`/urun/${slug}`} className="block">
        {/* IMAGE AREA - Tam genişlik, card'ın üstünde */}
        <div 
          className="relative w-full bg-[#0a0a0a] overflow-hidden"
          style={{ 
            paddingBottom: '100%',
            borderTopLeftRadius: SQUIRCLE.xl, 
            borderTopRightRadius: SQUIRCLE.xl 
          }}
        >
          {image ? (
            <Image 
              src={image} 
              alt={title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 280px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder type="product" text="ÜRÜN GÖRSELİ" iconSize="lg" />
          )}
            
            {/* Badges - Squircle */}
            {/* 
              Yeni sistem: Tüm rozetler (sistem + manuel) badges array'de geliyor.
              Sistem rozetleri: İndirim yüzdesi, Düşük stok, Yeni ürün
              Manuel rozetler: Admin tarafından atanan rozetler
              
              NOT: hasDiscount ve isLowStock artık kullanılmıyor,
              bu bilgiler badges array içinde geliyor.
            */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {/* Badges array system - tüm rozetler burada */}
              {badges && badges.length > 0 && badges.map((badgeItem, idx) => {
                // Badge label'ın geçerli olduğunu kontrol et
                if (!badgeItem.label || typeof badgeItem.label !== 'string' || badgeItem.label.trim() === '') {
                  return null;
                }
                
                return (
                <span 
                    key={idx}
                    className="inline-flex items-center justify-center text-[11px] font-semibold backdrop-blur-md text-center"
                    style={{ 
                      minWidth: 85, 
                      height: 28, 
                      padding: '0 14px', 
                      borderRadius: SQUIRCLE.sm,
                      backgroundColor: badgeItem.bgColor || '#22C55E',
                      color: badgeItem.color || '#FFFFFF',
                      border: `1px solid ${(badgeItem.color || '#FFFFFF')}20`
                    }}
                  >
                    {badgeItem.label}
                </span>
                );
              })}
              {/* Legacy badge support (fallback for old data without badges array) */}
              {(!badges || badges.length === 0) && badge && typeof badge === 'string' && badge.trim() !== '' && (
                <span 
                  className="inline-flex items-center justify-center text-[11px] font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-white text-center"
                  style={{ minWidth: 85, height: 28, padding: '0 14px', borderRadius: SQUIRCLE.sm }}
                >
                  {badge}
                </span>
              )}
            </div>

            {/* Action Buttons - Glassmorphism Squircle - Bağımsız hover */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {/* Favorilere Ekle - Hızlı İncele butonu gibi her zaman temalı */}
              <button
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  toggleItem({
                    productId: String(product.id),
                    slug: slug,
                    title: title,
                    brand: brand,
                    price: price,
                    originalPrice: originalPrice,
                    image: image,
                  });
                }}
                onMouseEnter={() => setFavoriteHover(true)}
                onMouseLeave={() => setFavoriteHover(false)}
                title={isProductFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: SQUIRCLE.md,
                  backgroundColor: isProductFavorite ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                  backdropFilter: favoriteHover ? 'blur(16px) saturate(1.2)' : 'blur(12px) saturate(1.1)',
                  WebkitBackdropFilter: favoriteHover ? 'blur(16px) saturate(1.2)' : 'blur(12px) saturate(1.1)',
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
                <Heart size={15} fill={isProductFavorite ? 'currentColor' : 'none'} />
              </button>

              {/* Hızlı İncele */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onMouseEnter={() => setQuickViewHover(true)}
                onMouseLeave={() => setQuickViewHover(false)}
                title="Hızlı İncele"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: SQUIRCLE.md,
                  backgroundColor: 'transparent',
                  backdropFilter: quickViewHover ? 'blur(16px) saturate(1.2)' : 'blur(12px) saturate(1.1)',
                  WebkitBackdropFilter: quickViewHover ? 'blur(16px) saturate(1.2)' : 'blur(12px) saturate(1.1)',
                  border: quickViewHover ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: quickViewHover ? 'rgba(52, 211, 153, 0.95)' : 'rgba(52, 211, 153, 0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <Eye size={15} />
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
                <span className="text-sm font-medium text-white/80">Stokta Yok</span>
              </div>
            )}
          </div>

          {/* CONTENT AREA - Ayrı container, image'ın altında */}
          <div 
            className="flex-1 flex flex-col p-3 pt-3 bg-[#131313]/90 backdrop-blur-sm border border-white/[0.06] border-t-0 hover:border-white/10 transition-all duration-300"
            style={{ 
              borderBottomLeftRadius: SQUIRCLE.xl, 
              borderBottomRightRadius: SQUIRCLE.xl 
            }}
          >
            {/* ÜST KISIM - Brand, Title, Subtitle */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                {brand}
              </p>
              <h3 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 500, 
                  color: 'white', 
                  lineHeight: 1.4, 
                  minHeight: '36px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {title}
              </h3>
            </div>

            {/* ORTA KISIM - Subtitle, Variants, Video Label - gap-2 (8px) */}
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[12px] text-white/45 truncate min-h-[18px]">
                {subtitle || "\u00A0"}
              </p>

              {/* Variants */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '32px', flexWrap: 'wrap' }}>
                {hasVariants ? (
                  variants!.slice(0, 5).map((v) => {
                    const swatchColor = isValidColorValue(v.color) ? v.color! : isValidColorValue(v.value) ? v.value : undefined;
                    const showTextOnColor = !swatchColor;
                    const displayValue = v.value || v.name;
                    const backgroundImage = !swatchColor && v.image ? `url(${v.image})` : undefined;

                    if (v.type === "color") {
                      const isOutOfStock = !v.inStock;
                      return (
                        <span
                          key={v.id}
                          style={{
                            position: 'relative',
                            width: '32px',
                            height: '32px',
                            boxSizing: 'border-box',
                            borderRadius: SQUIRCLE.sm,
                            border: isOutOfStock ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(255,255,255,0.2)',
                            backgroundColor: swatchColor || 'rgba(255,255,255,0.05)',
                            backgroundImage,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: 'rgba(255,255,255,0.85)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.4 : 1,
                            transition: 'all 0.2s ease',
                          }}
                          title={isOutOfStock ? `${v.name} (Stokta Yok)` : v.name}
                        >
                          {showTextOnColor && (
                            <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>
                              {displayValue}
                            </span>
                          )}
                          {/* Stokta yok çizgisi */}
                          {isOutOfStock && (
                            <span style={{
                              position: 'absolute',
                              width: '120%',
                              height: '2px',
                              backgroundColor: 'rgba(255,255,255,0.5)',
                              transform: 'rotate(-45deg)',
                              top: '50%',
                              left: '-10%',
                            }} />
                          )}
                        </span>
                      );
                    }

                    const isOutOfStock = !v.inStock;
                    return (
                      <span
                        key={v.id}
                        style={{
                          position: 'relative',
                          width: '32px',
                          height: '32px',
                          boxSizing: 'border-box',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '500',
                          borderRadius: SQUIRCLE.sm,
                          border: isOutOfStock ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(255,255,255,0.2)',
                          color: isOutOfStock ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                          backgroundColor: isOutOfStock ? 'transparent' : 'rgba(255,255,255,0.05)',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        title={isOutOfStock ? `${v.name} (Stokta Yok)` : v.name}
                      >
                        {displayValue}
                        {/* Stokta yok çizgisi */}
                        {isOutOfStock && (
                          <span style={{
                            position: 'absolute',
                            width: '120%',
                            height: '2px',
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            transform: 'rotate(-45deg)',
                            top: '50%',
                            left: '-10%',
                          }} />
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>

              {/* Video Label */}
              <div className="min-h-[28px]">
                {videoLabel && (
                  <span 
                    className="inline-flex items-center justify-center gap-2"
                    style={{
                      minWidth: 150,
                      height: 26,
                      padding: '0 14px',
                      backgroundColor: 'rgba(34, 211, 238, 0.08)',
                      border: '1px solid rgba(34, 211, 238, 0.25)',
                      borderRadius: SQUIRCLE.sm,
                    }}
                  >
                    <Play size={11} style={{ color: '#22d3ee', fill: '#22d3ee' }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {videoLabel}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Spacer - küçük */}
            <div style={{ height: '8px' }} />

            {/* ALT KISIM - Rating, Shipping, Stock */}
            <div className="flex flex-col">
              {/* Rating - Video Label ile aynı biçim, beyaz arka plan, sarı yıldızlar */}
              <div className="min-h-[28px]">
                <span 
                  className="inline-flex items-center justify-center gap-1.5"
                  style={{
                    minWidth: 150,
                    height: 26,
                    padding: '0 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(251, 191, 36, 0.35)',
                    borderRadius: SQUIRCLE.sm,
                  }}
                >
                  {/* 5 Yıldız - Sarı */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={11} 
                        className={star <= Math.round(ratingAverage || 0) 
                          ? "fill-amber-400 text-amber-400" 
                          : "fill-transparent text-white/20"
                        }
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                    {ratingAverage?.toFixed(1) || "-"}
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                    ({ratingCount || 0})
                  </span>
                </span>
              </div>

              {/* Shipping & Yetkili Distribütör */}
              <div className="flex items-center gap-3 flex-wrap">
                {freeShipping && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Ücretsiz Kargo
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                  <BadgeCheck size={12} className="text-amber-400" />
                  Yetkili Distribütör
                </span>
              </div>

              {/* Stock */}
              <div className="text-[11px] text-white/45">
                {stockQuantity && !isOutOfStock ? `Stok: ${stockQuantity} adet` : "\u00A0"}
              </div>
            </div>

            {/* PRICE SECTION */}
            <div className="pt-2 mt-1 border-t border-white/[0.08]">
              {/* ROW 9: Eski fiyat & Kazanç - 20px */}
              <div className="h-[20px]">
                {originalPrice && originalPrice > price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-white/40 line-through font-medium">
                      {formatPrice(originalPrice)} ₺
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {formatPrice(savingAmount)} ₺ kazanç
                    </span>
                  </div>
                ) : null}
              </div>

              {/* ROW 10: Güncel fiyat & Sepete Ekle - 48px */}
              <div className="h-[48px] flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-white">
                  {formatPrice(price)}
                  <span className="text-sm font-normal text-white/50 ml-1">₺</span>
                </span>

                {/* SEPETE EKLE - AddToCartButton with loading/success states */}
                <AddToCartButton
                  product={{
                    productId: String(product.id),
                    slug: slug,
                    title: title,
                    brand: brand,
                    price: price,
                    originalPrice: originalPrice,
                    image: image,
                  }}
                  variant="icon"
                  disabled={isOutOfStock}
                  size="md"
                />
              </div>
            </div>
          </div>
      </Link>
    </div>
  );
}
