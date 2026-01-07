"use client";

import { useState, Fragment, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Eye, BadgeCheck, Truck } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
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

export default function BundleProductCard({ bundle, className, priority = false }: BundleProductCardProps) {
  const [favoriteHover, setFavoriteHover] = useState(false);
  const [quickViewHover, setQuickViewHover] = useState(false);
  
  const { isFavorite, toggleItem } = useFavorites();
  
  const favoriteId = `bundle-${bundle.id}`;
  const isProductFavorite = isFavorite(favoriteId);

  const {
    id,
    slug,
    name,
    price,
    totalValue,
    savings,
    savingsPercent,
    thumbnail,
    stock,
    items,
    itemCount,
    ratingAverage,
    ratingCount,
    freeShipping,
    hasVariants,
  } = bundle;

  const isOutOfStock = stock <= 0;

  // Items'ı productId'ye göre grupla - aynı ürün 1 kere gösterilsin
  // Varyasyonlu ürünlerde miktar 1 olarak gösterilir (paket 1 ürün içerir, varyant seçimi yapılacak)
  const groupedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const groupMap = new Map<string, { productName: string; quantity: number }>();
    
    for (const item of items) {
      if (!item.product) continue;
      const pid = item.product.id;
      
      if (!groupMap.has(pid)) {
        // İlk item'ın quantity'sini al (varyasyonlar aynı quantity'ye sahip olmalı)
        groupMap.set(pid, {
          productName: item.product.name,
          quantity: item.quantity,
        });
      }
      // Aynı ürünün farklı varyantları için quantity'yi toplamıyoruz
      // Çünkü paket 1 ürün içeriyor, sadece varyant seçimi yapılacak
    }
    
    return Array.from(groupMap.entries()).map(([id, data]) => ({
      id,
      productName: data.productName,
      quantity: data.quantity,
    }));
  }, [items]);

  return (
    <div className={cn("relative", className)} style={{ height: '640px', display: 'flex', flexDirection: 'column' }}>
      <Link href={`/urun/${slug}`} className="block" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              sizes="(max-width: 768px) 100vw, 280px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder type="product" text="PAKET GÖRSELİ" iconSize="lg" />
          )}
            
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {/* Bundle Badge */}
            <span 
              className="inline-flex items-center justify-center gap-1 text-[11px] font-bold backdrop-blur-md text-center"
              style={{ 
                minWidth: 75, 
                height: 28, 
                padding: '0 12px', 
                borderRadius: SQUIRCLE.sm,
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
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
            
            {/* Discount Badge */}
            {savingsPercent > 0 && (
              <span 
                className="inline-flex items-center justify-center text-[11px] font-semibold backdrop-blur-md text-center"
                style={{ 
                  minWidth: 85, 
                  height: 28, 
                  padding: '0 14px', 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                %{savingsPercent} İndirim
              </span>
            )}
            {/* Stock Badge - Son 1 adet */}
            {stock === 1 && !isOutOfStock && (
              <span 
                className="inline-flex items-center justify-center text-[11px] font-semibold backdrop-blur-md text-center"
                style={{ 
                  minWidth: 85, 
                  height: 28, 
                  padding: '0 14px', 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#F97316',
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
                className="inline-flex items-center justify-center text-[11px] font-semibold backdrop-blur-md text-center"
                style={{ 
                  minWidth: 85, 
                  height: 28, 
                  padding: '0 14px', 
                  borderRadius: SQUIRCLE.sm,
                  backgroundColor: '#6B7280',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Stok Yok
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Favorilere Ekle */}
            <button
              type="button"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                toggleItem({
                  productId: favoriteId,
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

{/* Out of Stock Overlay - REMOVED, using badge instead */}
        </div>

        {/* CONTENT AREA */}
        <div 
          className={cn(
            "flex-1 flex flex-col p-3 pt-3 backdrop-blur-sm border border-border border-t-0 transition-all duration-300",
            "bg-surface/90 dark:bg-surface/90",
            "hover:border-border-hover"
          )}
          style={{ 
            borderBottomLeftRadius: SQUIRCLE.xl, 
            borderBottomRightRadius: SQUIRCLE.xl 
          }}
        >
          {/* ÜST KISIM - Brand & Title - ProductCard ile aynı yapı */}
          <div className="flex flex-col gap-1">
            {/* Marka satırı - "Bundle / Paket" */}
            <p className="text-[10px] text-violet-400/70 uppercase tracking-widest font-medium">
              Bundle / Paket
            </p>
            <h3 
              style={{ 
                fontSize: '20px', 
                fontWeight: 500, 
                color: 'var(--foreground)', 
                lineHeight: 1.4, 
                minHeight: '36px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {name}
            </h3>
          </div>

          {/* ORTA KISIM - Paket İçeriği KOMPAKT GRİD */}
          <div className="flex flex-col gap-1.5 mt-2">
            {/* Paket İçeriği - ürünler productId'ye göre gruplandırılmış */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {groupedItems.length > 0 ? (
                <>
                  {groupedItems.slice(0, 4).map((group) => (
                    <div
                      key={group.id}
                      style={{
                        padding: '4px 6px',
                        borderRadius: SQUIRCLE.sm,
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        columnGap: '8px',
                        alignItems: 'center',
                        minWidth: 0,
                      }}
                    >
                      <span style={{ 
                        fontSize: '10px', 
                        color: 'var(--foreground-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '16px',
                        minWidth: 0,
                      }}>
                        {group.productName}
                      </span>
                      <span style={{ 
                        fontSize: '10px', 
                        color: 'var(--foreground-muted)', 
                        fontWeight: 500,
                        textAlign: 'right',
                        lineHeight: '16px',
                        whiteSpace: 'nowrap',
                      }}>
                        x{group.quantity}
                      </span>
                    </div>
                  ))}
                  {groupedItems.length > 4 && (
                    <div style={{ 
                      fontSize: '9px', 
                      color: 'rgba(255,255,255,0.35)',
                      textAlign: 'center',
                      paddingTop: '2px',
                    }}>
                      +{groupedItems.length - 4} ürün daha
                    </div>
                  )}
                </>
              ) : (
                <span style={{ 
                  fontSize: '10px', 
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                }}>
                  {itemCount} ürün içerir
                </span>
              )}
            </div>
          </div>

          {/* Spacer - flex grow */}
          <div style={{ flex: 1 }} />

          {/* ALT KISIM - Rating, Stock */}
          <div className="flex flex-col">
            {/* Rating */}
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
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={11} 
                      className={star <= Math.round(ratingAverage || 0) 
                        ? "fill-amber-400 text-amber-400" 
                        : "fill-transparent text-foreground-disabled"
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

            {/* Shipping & Distribütör */}
            <div className="flex items-center gap-3 flex-wrap">
              {freeShipping && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <Truck size={12} />
                  Ücretsiz Kargo
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                <BadgeCheck size={12} className="text-amber-400" />
                Yetkili Distribütör
              </span>
            </div>

            {/* 12 Taksit İmkanı */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[10px] text-violet-400 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
                12 Taksit İmkanı
              </span>
            </div>
          </div>

          {/* PRICE SECTION - ProductCard ile aynı düzen */}
            <div className="pt-2 mt-1 border-t border-border/60">
            {/* Eski fiyat & Kazanç */}
            <div className="h-[20px]">
              {totalValue && totalValue > price ? (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-foreground-muted line-through font-medium">
                    {formatPrice(totalValue)}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {formatPrice(savings)} kazanç
                  </span>
                </div>
              ) : null}
            </div>

            {/* Güncel fiyat & Sepete Ekle - ProductCard ile AYNI konumda */}
            <div className="h-[48px] flex items-center justify-between gap-3">
              <span className="text-xl font-bold text-foreground">
                {formatPrice(price)}
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

