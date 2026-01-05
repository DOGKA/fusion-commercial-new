"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ============================================
// INLINE PRODUCT CARD PREVIEW COMPONENT
// Orijinal ProductCard ile BİREBİR AYNI tasarım
// ============================================

interface ProductVariant {
  id: string;
  name: string;
  type: "color" | "size";
  value: string;
  inStock: boolean;
  color?: string | null;
  image?: string | null;
}

interface ProductBadge {
  label: string;
  color: string;
  bgColor: string;
  icon?: string | null;
}

interface Product {
  id: string | number;
  slug: string;
  title: string;
  brand?: string;
  subtitle?: string;
  videoLabel?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockQuantity?: number;
  ratingAverage?: number;
  ratingCount?: number;
  freeShipping?: boolean;
  image?: string;
  variants?: ProductVariant[];
  badges?: ProductBadge[];
}

const SQUIRCLE = { sm: '10px', md: '14px', lg: '18px', xl: '24px' };

// Color validation helper
const isValidColorValue = (value?: string | null) => {
  if (!value) return false;
  const val = value.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) return true;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(val)) return true;
  const namedColors = ["white", "black", "gray", "grey", "silver", "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "beige", "navy", "teal", "turquoise", "cyan", "magenta", "gold", "maroon"];
  return namedColors.includes(val.toLowerCase());
};

// Icons as inline SVGs
const HeartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ShoppingBagIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "rgba(255,255,255,0.2)"} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const PlayIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#22d3ee" stroke="#22d3ee" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BadgeCheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

function ProductCardPreview({ product }: { product: Product }) {
  const [favoriteHover, setFavoriteHover] = useState(false);
  const [quickViewHover, setQuickViewHover] = useState(false);
  const [cartHover, setCartHover] = useState(false);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0 }).format(price);

  const {
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
    badges,
    videoLabel,
  } = product;

  const savingAmount = originalPrice ? originalPrice - price : 0;
  const isOutOfStock = stockStatus === "out_of_stock";
  const hasVariants = variants && variants.length > 0;

  return (
    <div 
      className={`h-[750px] flex flex-col bg-[#131313]/90 backdrop-blur-sm overflow-hidden border border-white/[0.06] hover:border-white/10 transition-all duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}
      style={{ borderRadius: SQUIRCLE.xl }}
    >
      {/* IMAGE AREA - 1:1 aspect ratio, object-cover */}
      <div className="relative aspect-square flex-shrink-0 bg-[#0a0a0a]">
        {image ? (
          <Image 
            src={image} 
            alt={title} 
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges - Sol üst */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {badges && badges.length > 0 && badges.map((badgeItem, idx) => {
            if (!badgeItem.label || typeof badgeItem.label !== 'string' || badgeItem.label.trim() === '') return null;
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
        </div>

        {/* Action Buttons - Sağ üst */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Favorilere Ekle */}
          <button
            type="button"
            onMouseEnter={() => setFavoriteHover(true)}
            onMouseLeave={() => setFavoriteHover(false)}
            title="Favorilere Ekle"
            style={{
              width: 36,
              height: 36,
              borderRadius: SQUIRCLE.md,
              backgroundColor: favoriteHover ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: favoriteHover ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: favoriteHover ? 'white' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: favoriteHover ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <HeartIcon />
          </button>

          {/* Hızlı İncele */}
          <button
            type="button"
            onMouseEnter={() => setQuickViewHover(true)}
            onMouseLeave={() => setQuickViewHover(false)}
            title="Hızlı İncele"
            style={{
              width: 36,
              height: 36,
              borderRadius: SQUIRCLE.md,
              backgroundColor: quickViewHover ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: quickViewHover ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: quickViewHover ? 'white' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: quickViewHover ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <EyeIcon />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-sm font-medium text-white/80">Stokta Yok</span>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col p-3 pt-3">
        {/* ÜST KISIM - Brand, Title */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            {brand || '\u00A0'}
          </p>
          <h3 className="text-[13px] font-medium text-white leading-tight line-clamp-2 min-h-[36px]">
            {title}
          </h3>
        </div>

        {/* ORTA KISIM - Subtitle, Variants, Video Label */}
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-[12px] text-white/45 truncate min-h-[18px]">
            {subtitle || "\u00A0"}
          </p>

          {/* Variants - 32x32 squircle kutular */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '32px', flexWrap: 'wrap' }}>
            {hasVariants ? (
              variants!.slice(0, 5).map((v) => {
                const swatchColor = isValidColorValue(v.color) ? v.color! : isValidColorValue(v.value) ? v.value : undefined;
                const showTextOnColor = !swatchColor;
                const displayValue = v.value || v.name;
                const backgroundImage = !swatchColor && v.image ? `url(${v.image})` : undefined;

                if (v.type === "color") {
                  return (
                    <span
                      key={v.id}
                      style={{
                        width: '32px',
                        height: '32px',
                        boxSizing: 'border-box',
                        borderRadius: SQUIRCLE.sm,
                        border: v.inStock ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(255,255,255,0.1)',
                        backgroundColor: swatchColor || 'rgba(255,255,255,0.05)',
                        backgroundImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'rgba(255,255,255,0.85)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      title={v.name}
                    >
                      {showTextOnColor && (
                        <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>
                          {displayValue}
                        </span>
                      )}
                    </span>
                  );
                }

                return (
                  <span
                    key={v.id}
                    style={{
                      width: '32px',
                      height: '32px',
                      boxSizing: 'border-box',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '500',
                      borderRadius: SQUIRCLE.sm,
                      border: v.inStock ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(255,255,255,0.1)',
                      color: v.inStock ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                      backgroundColor: v.inStock ? 'rgba(255,255,255,0.05)' : 'transparent',
                      textDecoration: v.inStock ? 'none' : 'line-through',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    title={v.name}
                  >
                    {displayValue}
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
                <PlayIcon />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {videoLabel}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Spacer - 8px like original */}
        <div style={{ height: '8px' }} />

        {/* ALT KISIM - Rating, Shipping, Stock */}
        <div className="flex flex-col">
          {/* Rating - Sarı borderli pill, 5 yıldız */}
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
              {/* 5 Yıldız */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(ratingAverage || 0)} />
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
              <BadgeCheckIcon />
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
          {/* Eski fiyat & Kazanç */}
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

          {/* Güncel fiyat & Sepete Ekle */}
          <div className="h-[48px] flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-white">
              {formatPrice(price)}
              <span className="text-sm font-normal text-white/50 ml-1">₺</span>
            </span>

            {/* SEPETE EKLE - 46x46 Squircle, hover yeşil */}
            <button
              type="button"
              disabled={isOutOfStock}
              onMouseEnter={() => !isOutOfStock && setCartHover(true)}
              onMouseLeave={() => setCartHover(false)}
              title={isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
              style={{
                width: 46,
                height: 46,
                borderRadius: SQUIRCLE.lg,
                backgroundColor: isOutOfStock 
                  ? 'rgba(255,255,255,0.05)' 
                  : cartHover 
                    ? 'rgba(16, 185, 129, 0.95)'
                    : 'rgba(255,255,255,0.1)',
                backdropFilter: isOutOfStock ? 'none' : 'blur(16px)',
                WebkitBackdropFilter: isOutOfStock ? 'none' : 'blur(16px)',
                border: isOutOfStock 
                  ? 'none' 
                  : cartHover 
                    ? '1px solid rgba(16, 185, 129, 0.6)' 
                    : '1px solid rgba(255,255,255,0.15)',
                color: isOutOfStock 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: cartHover && !isOutOfStock ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: cartHover && !isOutOfStock 
                  ? '0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <ShoppingBagIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lock Icon SVG Component
const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
    />
  </svg>
);

// ============================================
// SYSTEM BADGE CONFIG (same as badge-config.ts)
// ============================================

const LOW_STOCK_THRESHOLD = 5;
const NEW_PRODUCT_DAYS = 30;

type SystemBadgeType = "DISCOUNT_PERCENT" | "LOW_STOCK" | "NEW_PRODUCT";

const SYSTEM_BADGE_STYLES: Record<SystemBadgeType, { color: string; bgColor: string }> = {
  DISCOUNT_PERCENT: { color: "#FFFFFF", bgColor: "#EF4444" },
  LOW_STOCK: { color: "#FFFFFF", bgColor: "#F59E0B" },
  NEW_PRODUCT: { color: "#FFFFFF", bgColor: "#22C55E" },
};

interface SystemBadge {
  type: SystemBadgeType;
  label: string;
  color: string;
  bgColor: string;
  isSystem: true;
}

// Helper functions
// Mevcut schema: price = indirimli fiyat, comparePrice = orijinal fiyat
function isOnSale(price: number, comparePrice: number | null | undefined, saleEndDate: Date | string | null | undefined): boolean {
  if (!comparePrice || comparePrice <= price) return false;
  if (!saleEndDate) return true;
  const endDate = typeof saleEndDate === "string" ? new Date(saleEndDate) : saleEndDate;
  endDate.setHours(23, 59, 59, 999);
  return endDate >= new Date();
}

function calculateDiscountPercent(price: number, comparePrice: number | null | undefined): number {
  if (!comparePrice || comparePrice <= 0 || price <= 0 || price >= comparePrice) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

function isNewProduct(createdAt: Date | string | null | undefined): boolean {
  if (!createdAt) return false;
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const diffDays = (new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_PRODUCT_DAYS;
}

function isLowStock(stock: number | null | undefined): boolean {
  if (stock === null || stock === undefined) return false;
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}

function generateSystemBadges(product: ProductWithBadges): SystemBadge[] {
  const badges: SystemBadge[] = [];

  // 1. İndirim Rozeti
  // Mevcut schema: price = indirimli fiyat, comparePrice = orijinal fiyat
  const saleActive = isOnSale(product.price, product.comparePrice, product.saleEndDate);
  if (saleActive && product.comparePrice) {
    const discountPercent = calculateDiscountPercent(product.price, product.comparePrice);
    if (discountPercent > 0) {
      badges.push({
        type: "DISCOUNT_PERCENT",
        label: `%${discountPercent} İndirim`,
        ...SYSTEM_BADGE_STYLES.DISCOUNT_PERCENT,
        isSystem: true,
      });
    }
  }

  // 2. Düşük Stok Rozeti
  if (isLowStock(product.stock)) {
    badges.push({
      type: "LOW_STOCK",
      label: `Son ${product.stock} adet`,
      ...SYSTEM_BADGE_STYLES.LOW_STOCK,
      isSystem: true,
    });
  }

  // 3. Yeni Ürün Rozeti
  if (isNewProduct(product.createdAt)) {
    badges.push({
      type: "NEW_PRODUCT",
      label: "Yeni",
      ...SYSTEM_BADGE_STYLES.NEW_PRODUCT,
      isSystem: true,
    });
  }

  return badges;
}

// ============================================
// INTERFACES
// ============================================

interface Badge {
  id: string;
  label: string;
  slug: string;
  color: string;
  bgColor: string;
  icon?: string | null;
  priority: number;
  isActive: boolean;
  autoApply: boolean;
  autoApplyRule?: string | null;
  _count?: {
    productBadges: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ProductVariantData {
  id: string;
  name: string;
  type: "color" | "size";
  value: string;
  inStock: boolean;
  color?: string | null;
  image?: string | null;
}

interface ProductWithBadges {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  price: number;
  comparePrice?: number | null;  // Orijinal fiyat (karşılaştırma)
  saleEndDate?: string | null;   // İndirim bitiş tarihi
  stock: number;
  brand?: string | null;
  freeShipping?: boolean;
  createdAt?: string;
  // Yeni alanlar - ProductCard ile birebir uyum için
  shortDescription?: string | null;  // Subtitle için
  ratingAverage?: number | null;
  ratingCount?: number | null;
  videoUrl?: string | null;           // Video label için
  variants?: ProductVariantData[];    // Varyantlar
  productBadges?: Array<{
    position: number;
    badge: Badge;
  }>;
}

interface BadgeFormData {
  label: string;
  slug: string;
  color: string;
  bgColor: string;
  icon?: string;
  priority: number;
  isActive: boolean;
  autoApply: boolean;
  autoApplyRule?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function BadgesPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "assign" | "preview">("badges");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [products, setProducts] = useState<ProductWithBadges[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<BadgeFormData>({
    label: "",
    slug: "",
    color: "#FFFFFF",
    bgColor: "#22C55E",
    icon: "",
    priority: 0,
    isActive: true,
    autoApply: false,
    autoApplyRule: "",
  });

  // Fetch badges
  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/badges?includeInactive=true");
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
    fetchProducts();
  }, []);

  // Badge CRUD operations
  const handleCreateBadge = async () => {
    try {
      const res = await fetch("/api/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchBadges();
        setShowBadgeModal(false);
        resetForm();
        alert("Rozet başarıyla oluşturuldu!");
      } else {
        const error = await res.json();
        alert(error.error || "Rozet oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating badge:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge) return;

    try {
      const res = await fetch(`/api/badges/${editingBadge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchBadges();
        setShowBadgeModal(false);
        setEditingBadge(null);
        resetForm();
        alert("Rozet başarıyla güncellendi!");
      } else {
        const error = await res.json();
        alert(error.error || "Rozet güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating badge:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm("Bu rozeti silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/badges/${badgeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBadges();
        alert("Rozet başarıyla silindi!");
      } else {
        const error = await res.json();
        alert(error.error || "Rozet silinemedi");
      }
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Bir hata oluştu");
    }
  };

  // Product badge assignment
  const handleAssignBadge = async (productId: string, badgeId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId }),
      });

      if (res.ok) {
        await fetchProducts();
        alert("Rozet başarıyla atandı!");
      } else {
        const error = await res.json();
        alert(error.error || "Rozet atanamadı");
      }
    } catch (error) {
      console.error("Error assigning badge:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleRemoveBadge = async (productId: string, badgeId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/badges/${badgeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProducts();
        // Update selected product if it's the one being modified
        if (selectedProduct?.id === productId) {
          const updatedProduct = products.find(p => p.id === productId);
          if (updatedProduct) {
            setSelectedProduct(updatedProduct);
          }
        }
      } else {
        const error = await res.json();
        alert(error.error || "Rozet kaldırılamadı");
      }
    } catch (error) {
      console.error("Error removing badge:", error);
      alert("Bir hata oluştu");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingBadge(null);
    setShowBadgeModal(true);
  };

  const openEditModal = (badge: Badge) => {
    setFormData({
      label: badge.label,
      slug: badge.slug,
      color: badge.color,
      bgColor: badge.bgColor,
      icon: badge.icon || "",
      priority: badge.priority,
      isActive: badge.isActive,
      autoApply: badge.autoApply,
      autoApplyRule: badge.autoApplyRule || "",
    });
    setEditingBadge(badge);
    setShowBadgeModal(true);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      slug: "",
      color: "#FFFFFF",
      bgColor: "#22C55E",
      icon: "",
      priority: 0,
    isActive: true,
    autoApply: false,
      autoApplyRule: "",
    });
  };

  // Auto-generate slug from label
  const handleLabelChange = (label: string) => {
    setFormData({
      ...formData,
      label,
      slug: label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  // Stats
  // Sistem rozetlerini hesapla (tüm ürünler için)
  const systemBadgeStats = {
    discountCount: products.filter(p => isOnSale(p.price, p.comparePrice, p.saleEndDate)).length,
    lowStockCount: products.filter(p => isLowStock(p.stock)).length,
    newProductCount: products.filter(p => isNewProduct(p.createdAt)).length,
  };
  const totalSystemBadges = systemBadgeStats.discountCount + systemBadgeStats.lowStockCount + systemBadgeStats.newProductCount;
  
  // İstatistikler (Manuel + Sistem Rozetleri)
  const stats = {
    // Manuel rozetler + 3 sistem rozeti türü
    total: badges.length + 3, // 3 sistem rozeti türü: İndirim, Düşük Stok, Yeni
    // Aktif manuel rozetler + aktif sistem rozetleri (hepsi aktif)
    active: badges.filter(b => b.isActive).length + 3,
    // Manuel atamalar + sistem rozeti atamaları
    totalAssigned: badges.reduce((sum, b) => sum + (b._count?.productBadges || 0), 0) + totalSystemBadges,
    // Sistem rozetleri sayısı
    systemBadges: totalSystemBadges,
  };

  // Get all badges for a product (manual + system)
  const getAllBadgesForProduct = (product: ProductWithBadges): Array<{ label: string; color: string; bgColor: string; isSystem: boolean; badgeId?: string }> => {
    const systemBadges = generateSystemBadges(product).map(sb => ({
      label: sb.label,
      color: sb.color,
      bgColor: sb.bgColor,
      isSystem: true,
    }));

    const manualBadges = (product.productBadges || []).map(pb => ({
      label: pb.badge.label,
      color: pb.badge.color,
      bgColor: pb.badge.bgColor,
      isSystem: false,
      badgeId: pb.badge.id,
    }));

    // Sistem rozetleri önce, sonra manuel
    return [...systemBadges, ...manualBadges];
  };

  // Convert product to ProductCard format for preview
  // Orijinal ProductCard ile birebir aynı yapıda
  const convertToProductCardFormat = (product: ProductWithBadges): Product => {
    const allBadges = getAllBadgesForProduct(product);
    
    // Determine if sale is active
    // Schema: price = indirimli fiyat, comparePrice = orijinal fiyat
    const saleActive = isOnSale(product.price, product.comparePrice, product.saleEndDate);
    const displayPrice = product.price;
    const originalPrice = saleActive && product.comparePrice && product.comparePrice > product.price 
      ? product.comparePrice 
      : undefined;

    // Video label - videoUrl varsa "Videolu Ürün" göster
    const videoLabel = product.videoUrl ? "Videolu Ürün" : undefined;

    // Variants dönüşümü
    const variants: ProductVariant[] | undefined = product.variants?.map(v => ({
      id: v.id,
      name: v.name,
      type: v.type,
      value: v.value,
      inStock: v.inStock,
      color: v.color,
      image: v.image,
    }));

    return {
      id: product.id,
      slug: product.slug,
      title: product.name,
      subtitle: product.shortDescription || undefined,
      brand: product.brand || "",
      price: displayPrice,
      originalPrice: originalPrice,
      discountPercent: saleActive && product.comparePrice 
        ? calculateDiscountPercent(product.price, product.comparePrice)
        : undefined,
      stockStatus: product.stock > LOW_STOCK_THRESHOLD ? "in_stock" : product.stock > 0 ? "low_stock" : "out_of_stock",
      stockQuantity: product.stock,
      ratingAverage: product.ratingAverage || 0,
      ratingCount: product.ratingCount || 0,
      freeShipping: product.freeShipping || false,
      image: product.thumbnail || undefined,
      videoLabel: videoLabel,
      variants: variants,
      badges: allBadges.length > 0 ? allBadges.map(b => ({
        label: b.label,
        color: b.color,
        bgColor: b.bgColor,
        icon: null,
      })) : undefined,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Ürün Rozetleri</h1>
          <p className="text-gray-500">Ürünlerinize rozet ekleyin ve yönetin</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Rozet
        </button>
      </div>

      {/* System Badges Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <LockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Otomatik Sistem Rozetleri</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Aşağıdaki rozetler ürün verilerine göre otomatik oluşturulur ve manuel silinemez:
            </p>
            <ul className="mt-2 text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• <span className="font-medium">%XX İndirim</span> - İndirimli ürünlerde otomatik gösterilir</li>
              <li>• <span className="font-medium">Son X adet</span> - Stok ≤ {LOW_STOCK_THRESHOLD} olduğunda gösterilir</li>
              <li>• <span className="font-medium">Yeni</span> - Son {NEW_PRODUCT_DAYS} gün içinde eklenen ürünlerde gösterilir</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stroke dark:border-dark-3">
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "badges"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          Rozetler
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "assign"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          Ürünlere Ata
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          Önizleme
        </button>
      </div>

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Toplam Rozet Türü</p>
              <p className="text-xs text-gray-400 mt-1">{badges.length} manuel + 3 sistem</p>
            </div>
            <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-sm text-gray-500">Aktif Rozet</p>
              <p className="text-xs text-gray-400 mt-1">{badges.filter(b => b.isActive).length} manuel + 3 sistem</p>
            </div>
            <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
              <p className="text-2xl font-bold text-primary">{stats.totalAssigned}</p>
              <p className="text-sm text-gray-500">Toplam Rozet Ataması</p>
              <p className="text-xs text-gray-400 mt-1">
                {badges.reduce((sum, b) => sum + (b._count?.productBadges || 0), 0)} manuel + {stats.systemBadges} sistem
              </p>
            </div>
            <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
              <p className="text-2xl font-bold text-blue-500">{stats.systemBadges}</p>
              <p className="text-sm text-gray-500">Sistem Rozeti Ataması</p>
              <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                <p>🏷️ {systemBadgeStats.discountCount} indirimli</p>
                <p>📦 {systemBadgeStats.lowStockCount} düşük stok</p>
                <p>✨ {systemBadgeStats.newProductCount} yeni ürün</p>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: badge.bgColor, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badge.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-gray-100 text-gray-600 dark:bg-gray-500/10"}`}>
                    {badge.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Slug:</span>
                    <span className="font-medium text-dark dark:text-white font-mono text-xs">{badge.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Öncelik:</span>
                    <span className="font-medium text-dark dark:text-white">{badge.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atanan Ürün:</span>
                    <span className="font-medium text-dark dark:text-white">{badge._count?.productBadges || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-stroke dark:border-dark-3">
                  <button 
                    onClick={() => openEditModal(badge)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="px-3 py-2 rounded-lg text-sm border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          {badges.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-lg font-medium mb-2">Henüz manuel rozet eklenmedi</p>
              <p className="text-sm">Sistem rozetleri (İndirim, Stok, Yeni) otomatik olarak eklenir</p>
            </div>
          )}
        </>
      )}

      {/* Assign Tab */}
      {activeTab === "assign" && (
        <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
            <h2 className="text-lg font-semibold text-dark dark:text-white">Ürünlere Rozet Ata</h2>
            <p className="text-sm text-gray-500 mt-1">
              <LockIcon className="inline w-4 h-4 mr-1" />
              Kilit ikonlu rozetler sistem tarafından otomatik oluşturulur ve silinemez
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ürün</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mevcut Rozetler</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Rozet Ekle</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const productBadgeIds = product.productBadges?.map(pb => pb.badge.id) || [];
                  const availableBadges = badges.filter(b => b.isActive && !productBadgeIds.includes(b.id));
                  const allBadges = getAllBadgesForProduct(product);

                  return (
                    <tr 
                      key={product.id} 
                      className={`border-b border-stroke last:border-0 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2 cursor-pointer ${selectedProduct?.id === product.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.thumbnail && (
                            <Image src={product.thumbnail} alt={product.name} width={40} height={40} className="w-10 h-10 rounded object-cover" unoptimized />
                          )}
                          <div>
                            <span className="font-medium text-dark dark:text-white block">{product.name}</span>
                            <span className="text-xs text-gray-500">
                              {product.price.toLocaleString('tr-TR')} ₺
                              {product.comparePrice && isOnSale(product.price, product.comparePrice, product.saleEndDate) && (
                                <span className="text-green-600 ml-2">
                                  (Orijinal: {product.comparePrice.toLocaleString('tr-TR')} ₺)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                          {allBadges.map((badge, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: badge.bgColor, color: badge.color }}
                            >
                              {badge.isSystem && <LockIcon className="w-3 h-3" />}
                              {badge.label}
                              {!badge.isSystem && badge.badgeId && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveBadge(product.id, badge.badgeId!);
                                  }}
                                  className="ml-1 hover:opacity-70"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                          {allBadges.length === 0 && (
                          <span className="text-sm text-gray-400">Rozet yok</span>
                        )}
                      </div>
                    </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select 
                          className="rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-dark-3"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignBadge(product.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                        <option value="">Rozet Seç...</option>
                          {availableBadges.map(badge => (
                            <option key={badge.id} value={badge.id}>{badge.label}</option>
                        ))}
                      </select>
                    </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                            setActiveTab("preview");
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Önizle
                        </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Henüz ürün bulunmuyor</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="space-y-6">
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="text-lg font-semibold text-dark dark:text-white mb-4">ProductCard Önizleme</h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedProduct 
                ? `"${selectedProduct.name}" ürününün mağazada nasıl görüneceğini aşağıda görebilirsiniz.`
                : "Önizleme için 'Ürünlere Ata' sekmesinden bir ürün seçin."}
            </p>

            {selectedProduct ? (
              <div className="max-w-sm mx-auto">
                <ProductCardPreview 
                  product={convertToProductCardFormat(selectedProduct)} 
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p>Ürün seçilmedi</p>
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-md font-semibold text-dark dark:text-white mb-4">Ürün Bilgileri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Ürün Adı:</span>
                    <p className="font-medium text-dark dark:text-white">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Satış Fiyatı:</span>
                    <p className="font-medium text-dark dark:text-white">{selectedProduct.price.toLocaleString('tr-TR')} ₺</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Orijinal Fiyat:</span>
                    <p className="font-medium text-dark dark:text-white">
                      {selectedProduct.comparePrice && isOnSale(selectedProduct.price, selectedProduct.comparePrice, selectedProduct.saleEndDate)
                        ? `${selectedProduct.comparePrice.toLocaleString('tr-TR')} ₺`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">İndirim Bitişi:</span>
                    <p className="font-medium text-dark dark:text-white">
                      {selectedProduct.saleEndDate
                        ? new Date(selectedProduct.saleEndDate).toLocaleDateString('tr-TR')
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Stok:</span>
                    <p className="font-medium text-dark dark:text-white">{selectedProduct.stock} adet</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Oluşturulma:</span>
                    <p className="font-medium text-dark dark:text-white">
                      {selectedProduct.createdAt
                        ? new Date(selectedProduct.createdAt).toLocaleDateString('tr-TR')
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Toplam Rozet:</span>
                    <p className="font-medium text-dark dark:text-white">{getAllBadgesForProduct(selectedProduct).length}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sistem Rozeti:</span>
                    <p className="font-medium text-dark dark:text-white">
                      {generateSystemBadges(selectedProduct).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge Breakdown */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-md font-semibold text-dark dark:text-white mb-4">Rozet Detayları</h3>
                <div className="space-y-3">
                  {getAllBadgesForProduct(selectedProduct).map((badge, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-2"
                    >
                      <div className="flex items-center gap-3">
            <span
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: badge.bgColor, color: badge.color }}
            >
                          {badge.isSystem && <LockIcon className="w-3 h-3" />}
                          {badge.label}
            </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {badge.isSystem ? (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            Otomatik
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            Manuel
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {getAllBadgesForProduct(selectedProduct).length === 0 && (
                    <p className="text-center text-gray-500 py-4">Bu üründe rozet bulunmuyor</p>
                  )}
          </div>
        </div>
            </>
          )}
      </div>
      )}

      {/* Badge Create/Edit Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-dark border-b border-stroke dark:border-dark-3 px-6 py-4">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                {editingBadge ? "Rozet Düzenle" : "Yeni Rozet Oluştur"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Rozet Metni *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    placeholder="Örn: Yeni Ürün"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Örn: new-product"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Yazı Rengi</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Arka Plan Rengi</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Öncelik (Yüksek önce gösterilir)</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 rounded text-primary"
                  />
                  <span className="text-sm font-medium">Aktif</span>
                </label>
              </div>

              {/* Preview */}
              <div className="border-t border-stroke dark:border-dark-3 pt-4">
                <p className="text-sm font-medium mb-3">Önizleme</p>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ backgroundColor: formData.bgColor, color: formData.color }}
                  >
                    {formData.label || "Rozet Metni"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Mağazada böyle görünecek
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-dark border-t border-stroke dark:border-dark-3 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  setEditingBadge(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3"
              >
                İptal
              </button>
              <button
                onClick={editingBadge ? handleUpdateBadge : handleCreateBadge}
                disabled={!formData.label || !formData.slug}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {editingBadge ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
