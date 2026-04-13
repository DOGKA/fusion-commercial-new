"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  Check
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { cn, formatPrice } from "@/lib/utils";
import ParticleField from "@/components/three/ParticleField";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function FavoritesPage() {
  const { items, removeItem, itemCount } = useFavorites();
  const { addItem: addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (item: typeof items[0]) => {
    setAddingToCart(item.id);
    await addToCart({
      productId: item.productId,
      slug: item.slug,
      title: item.title,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      variant: item.variant,
    });
    setAddingToCart(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField className="opacity-10" particleCount={30} color="#ec4899" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-[80px] sm:pt-[100px] lg:pt-[120px] pb-10 sm:pb-16 lg:pb-20">
        <div className="container max-w-6xl">
          
          {/* HEADER */}
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 sm:w-96 h-60 sm:h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/25 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 lg:mb-6">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-400" fill="currentColor" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground dark:text-white tracking-tight mb-1.5 sm:mb-3">
                Favorilerim
              </h1>
              <p className="text-foreground-muted dark:text-white/40 text-xs sm:text-sm">
                {itemCount > 0 
                  ? `${itemCount} ürün favorilerinizde`
                  : "Favorileriniz boş"
                }
              </p>
            </div>
          </div>

          {/* FAVORITES LIST - Checkout Style */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-24 text-center">
              <Link
                href="/magaza"
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-foreground bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/25 hover:border-pink-500/30 rounded-full transition-all no-underline"
              >
                <Sparkles size={12} />
                Ürünleri Keşfet
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const savings = item.originalPrice && item.originalPrice > item.price 
                  ? item.originalPrice - item.price 
                  : 0;
                
                return (
                  <div
                    key={item.id}
                    className="group"
                    style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px" }}
                  >
                    {/* Image */}
                    <Link href={`/urun/${item.slug}`} className="flex-shrink-0">
                      <div style={{ position: "relative", width: "64px", height: "64px", backgroundColor: "var(--background-secondary)", borderRadius: "8px", overflow: "hidden" }}>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ImagePlaceholder type="product" iconSize="sm" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/urun/${item.slug}`}>
                        <h4 style={{ fontSize: "14px", fontWeight: "500", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </h4>
                      </Link>
                      {item.variant && (
                        <p style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>
                          {item.variant.value}
                        </p>
                      )}

                      {/* Price Info */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {/* Row 1: Original price + savings */}
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[15px] font-semibold text-foreground">
                            {formatPrice(item.originalPrice ?? item.price)}
                          </span>
                          <span className="text-[11px] text-foreground-muted">₺</span>
                          {savings > 0 && (
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {formatPrice(savings)} kazanç
                            </span>
                          )}
                        </div>

                        {/* Row 2: Discounted price */}
                        {savings > 0 && (
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            <span className="text-[10px] text-foreground-tertiary">İndirimli Fiyat:</span>
                            <span className="text-[11px] text-foreground font-medium">{formatPrice(item.price)} ₺</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Vertical */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id}
                        title="Sepete Ekle"
                        className={cn(
                          "transition-colors",
                          addingToCart === item.id ? "text-emerald-400" : "text-foreground-muted hover:text-emerald-400"
                        )}
                        style={{ padding: "8px", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }}
                      >
                        {addingToCart === item.id ? <Check size={18} /> : <ShoppingBag size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variant?.id)}
                        title="Favorilerden Çıkar"
                        className="text-foreground-muted hover:text-red-400 transition-colors"
                        style={{ padding: "8px", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM CTA */}
          {items.length > 0 && (
            <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
              <Link
                href="/magaza"
                className="inline-flex items-center gap-1.5 text-foreground-muted hover:text-foreground text-xs sm:text-sm transition-all"
              >
                Alışverişe Devam Et
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
