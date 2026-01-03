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
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: '20px',
        alignItems: 'center',
        backgroundColor: 'rgba(19, 19, 19, 0.9)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '16px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        ...cardStyle,
      }}
    >
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px',
        backgroundColor: '#0a0a0a',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {productImage ? (
          <Image 
            src={productImage} 
            alt={product.name}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>GÖRSEL</span>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {product.brand || 'FUSIONMARKT'}
        </p>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
          {product.name}
        </h3>
        {product.shortDescription && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
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
                      ? '2px solid rgba(255,255,255,0.08)' 
                      : isSelected 
                        ? '2px solid #10B981' 
                        : variantError 
                          ? '2px solid #EF4444' 
                          : '2px solid rgba(255,255,255,0.2)',
                    color: isOutOfStock 
                      ? 'rgba(255,255,255,0.25)' 
                      : isSelected 
                        ? '#10B981' 
                        : 'rgba(255,255,255,0.7)',
                    backgroundColor: swatchColor 
                      ? swatchColor 
                      : isOutOfStock 
                        ? 'transparent' 
                        : isSelected 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : 'rgba(255,255,255,0.05)',
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
                      backgroundColor: 'rgba(255,255,255,0.4)',
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {product.freeShipping && (
            <>
              <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={10} />
                Ücretsiz Kargo
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>•</span>
            </>
          )}
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Stok: {product.stock} adet</span>
        </div>
      </div>

      <div className="related-product-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '180px' }}>
        <div className="related-product-price-section" style={{ textAlign: 'right' }}>
          {savings > 0 && (
            <div className="related-product-discount" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                {formatPrice(product.comparePrice ?? 0)} TL
              </span>
              <span className="related-savings-badge" style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>
                {formatPrice(savings)} TL kazanç
              </span>
            </div>
          )}
          <div className="related-product-current-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span 
              className="related-main-price" 
              style={{ 
                fontSize: 'var(--related-price-size, 20px)', 
                fontWeight: 'bold', 
                color: 'white' 
              }}
            >
              {formatPrice(product.price)}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>TL</span>
          </div>
        </div>
        <div className="related-product-buttons" style={{ display: 'flex', gap: '8px' }}>
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.name,
              // Brand boşsa "FusionMarkt" gibi mock fallback basma
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
                // Brand boşsa "FusionMarkt" gibi mock fallback basma
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
              backgroundColor: isRelatedFavorite ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
              border: isRelatedFavorite ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              color: isRelatedFavorite ? '#ec4899' : 'rgba(255,255,255,0.5)',
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

