"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Truck } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";

// Squircle border-radius
const SQUIRCLE = {
  sm: '10px',
  md: '14px',
};

interface RelatedProductVariant {
  id: string;
  name: string;
  type: string;
  value: string;
  colorCode?: string | null;
  image?: string | null;
  stock: number;
  isActive: boolean;
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  thumbnail?: string;
  images?: string[];
  brand?: string;
  stock?: number;
  freeShipping?: boolean;
  shortDescription?: string;
  variants?: RelatedProductVariant[];
}

interface RelatedProductCardProps {
  product: RelatedProduct;
  cardStyle?: React.CSSProperties;
}

// Color validation helper
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

export default function RelatedProductCard({ product, cardStyle }: RelatedProductCardProps) {
  const { isFavorite, toggleItem } = useFavorites();
  const [selectedVariant, setSelectedVariant] = useState<RelatedProductVariant | null>(null);
  const [variantError, setVariantError] = useState(false);
  
  const hasVariants = product.variants && product.variants.length > 0;
  const productImage = product.thumbnail || product.images?.[0];
  const savings = product.comparePrice ? product.comparePrice - product.price : 0;
  const isRelatedFavorite = isFavorite(String(product.id));

  const handleNeedsVariant = () => {
    setVariantError(true);
    setTimeout(() => setVariantError(false), 2500);
  };

  return (
    <a 
      href={`/urun/${product.slug}`}
      className="related-product-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'stretch',
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '16px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        ...cardStyle,
      }}
    >
      {/* Top Row: Image + Info - Desktop: horizontal, Mobile: vertical */}
      <div className="related-product-top" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div className="related-product-image" style={{
          position: 'relative',
          width: '100px',
          minWidth: '100px',
          height: '100px',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {productImage ? (
            <Image 
              src={productImage} 
              alt={product.name}
              fill
              className="object-cover"
              sizes="100px"
              quality={85}
            />
          ) : (
            <span style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>GÖRSEL</span>
          )}
        </div>

        <div className="related-product-info" style={{ flex: 1, minWidth: 0 }}>
          {product.brand && (
            <p style={{ fontSize: '10px', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {product.brand}
            </p>
          )}
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '6px', lineHeight: '1.3' }}>
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="hidden sm:block" style={{ fontSize: '12px', color: 'var(--foreground-tertiary)', marginBottom: '8px' }}>
              {product.shortDescription.substring(0, 50)}...
            </p>
          )}
          
          {/* Variant Selection for Related Products */}
          {hasVariants && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginBottom: '8px',
              flexWrap: 'wrap',
            }}>
              {product.variants!.slice(0, 5).map((v) => {
                const swatchColor = isValidColorValue(v.colorCode) ? v.colorCode! : isValidColorValue(v.value) ? v.value : undefined;
                const isSelected = selectedVariant?.id === v.id;
                const isOutOfStock = v.stock <= 0;
                
                return (
                  <span
                    key={v.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isOutOfStock) {
                        setSelectedVariant(v);
                        setVariantError(false);
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: '26px',
                      height: '26px',
                      boxSizing: 'border-box',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '500',
                      borderRadius: SQUIRCLE.sm,
                      border: isOutOfStock 
                        ? '2px solid var(--border)' 
                        : isSelected 
                          ? '2px solid #10B981' 
                          : variantError 
                            ? '2px solid #EF4444' 
                            : '2px solid var(--border-secondary)',
                      color: isOutOfStock 
                        ? 'var(--foreground-muted)' 
                        : isSelected 
                          ? '#10B981' 
                          : 'var(--foreground-secondary)',
                      backgroundColor: swatchColor 
                        ? swatchColor 
                        : isOutOfStock 
                          ? 'transparent' 
                          : isSelected 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : 'var(--glass-bg)',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected 
                        ? '0 0 0 2px rgba(16, 185, 129, 0.3)' 
                        : variantError 
                          ? '0 0 0 2px rgba(239, 68, 68, 0.3)' 
                          : undefined,
                      transform: isSelected ? 'scale(1.08)' : undefined,
                      opacity: isOutOfStock ? 0.4 : 1,
                    }}
                    title={isOutOfStock ? `${v.name} (Stokta Yok)` : isSelected ? `${v.name} (Seçili)` : v.name}
                  >
                    {!swatchColor && (v.value || v.name)}
                    {isOutOfStock && (
                      <span style={{
                        position: 'absolute',
                        width: '120%',
                        height: '2px',
                        backgroundColor: 'var(--foreground-muted)',
                        transform: 'rotate(-45deg)',
                        top: '50%',
                        left: '-10%',
                      }} />
                    )}
                  </span>
                );
              })}
            </div>
          )}
          
          {product.freeShipping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={10} />
                Ücretsiz Kargo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Price + Actions */}
      <div className="related-product-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="related-product-price-section" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {savings > 0 && (
            <>
              <span style={{ fontSize: '11px', color: 'var(--foreground-muted)', textDecoration: 'line-through' }}>
                {formatPrice(product.comparePrice ?? 0)} TL
              </span>
              <span className="related-savings-badge" style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>
                {formatPrice(savings)} TL kazanç
              </span>
            </>
          )}
          <div className="related-product-current-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span 
              className="related-main-price" 
              style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: 'var(--foreground)' 
              }}
            >
              {formatPrice(product.price)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--foreground-tertiary)' }}>TL</span>
          </div>
        </div>
        <div className="related-product-buttons" style={{ display: 'flex', gap: '8px' }}>
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.name,
              brand: product.brand || '',
              price: product.price,
              originalPrice: product.comparePrice,
              image: productImage,
              variant: selectedVariant ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                type: selectedVariant.type,
                value: selectedVariant.value,
              } : undefined,
            }}
            variant="text"
            size="sm"
            requiresVariant={hasVariants}
            onNeedsVariant={handleNeedsVariant}
          />
          <button 
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              toggleItem({
                productId: String(product.id),
                slug: product.slug,
                title: product.name,
                brand: product.brand || '',
                price: product.price,
                originalPrice: product.comparePrice,
                image: productImage,
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: isRelatedFavorite ? 'rgba(236, 72, 153, 0.15)' : 'var(--glass-bg)',
              border: isRelatedFavorite ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border)',
              borderRadius: '14px',
              color: isRelatedFavorite ? '#ec4899' : 'var(--foreground-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Heart size={16} fill={isRelatedFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </a>
  );
}

