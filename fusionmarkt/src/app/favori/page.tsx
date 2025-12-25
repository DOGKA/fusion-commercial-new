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
  X,
  Check
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { cn, formatPrice } from "@/lib/utils";
import ParticleField from "@/components/three/ParticleField";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function FavoritesPage() {
  const { items, removeItem, clearFavorites, itemCount } = useFavorites();
  const { addItem: addToCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Delete selected items
  const deleteSelectedItems = () => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        removeItem(item.productId, item.variant?.id);
      }
    });
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  // Add item to cart
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

  // Add selected items to cart
  const addSelectedToCart = async () => {
    for (const id of selectedItems) {
      const item = items.find(i => i.id === id);
      if (item) {
        await handleAddToCart(item);
      }
    }
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className="min-h-screen bg-[#060606] relative">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField className="opacity-10" particleCount={30} color="#ec4899" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-[120px] pb-20">
        <div className="container max-w-6xl">
          
          {/* ═══════════════════════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative mb-12">
            {/* Gradient blur accent */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/25 rounded-2xl mb-6">
                <Heart className="w-8 h-8 text-pink-400" fill="currentColor" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Favorilerim
              </h1>
              <p className="text-white/40 text-sm">
                {itemCount > 0 
                  ? `${itemCount} ürün favorilerinizde`
                  : "Favorileriniz boş"
                }
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              TOOLBAR
          ═══════════════════════════════════════════════════════════════════ */}
          {items.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                {!isSelectionMode ? (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSelectionMode(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all"
                      >
                        <Check size={14} />
                        Seç
                      </button>
                      <button
                        type="button"
                        onClick={clearFavorites}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400/70 hover:text-red-400 bg-red-500/[0.05] hover:bg-red-500/[0.1] border border-red-500/[0.1] rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                        Tümünü Temizle
                      </button>
                    </div>
                    <span className="text-xs text-white/30">{itemCount} ürün</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllItems}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all",
                          selectedItems.size === items.length 
                            ? "text-pink-400 bg-pink-500/10 border border-pink-500/20" 
                            : "text-white/50 hover:text-white bg-white/[0.03] border border-white/[0.06]"
                        )}
                      >
                        <Check size={14} />
                        {selectedItems.size === items.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                      </button>
                      <button
                        type="button"
                        onClick={addSelectedToCart}
                        disabled={selectedItems.size === 0}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all",
                          selectedItems.size > 0 
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15" 
                            : "text-white/25 bg-white/[0.02] border border-white/[0.04] cursor-not-allowed"
                        )}
                      >
                        <ShoppingBag size={14} />
                        Sepete Ekle ({selectedItems.size})
                      </button>
                      <button
                        type="button"
                        onClick={deleteSelectedItems}
                        disabled={selectedItems.size === 0}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all",
                          selectedItems.size > 0 
                            ? "text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15" 
                            : "text-white/25 bg-white/[0.02] border border-white/[0.04] cursor-not-allowed"
                        )}
                      >
                        <Trash2 size={14} />
                        Sil ({selectedItems.size})
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedItems(new Set());
                      }}
                      className="p-2 text-white/40 hover:text-white transition-all"
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              FAVORITES LIST - Card Style Design
          ═══════════════════════════════════════════════════════════════════ */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Link
                href="/magaza"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white font-medium text-base rounded-xl transition-all shadow-lg shadow-pink-500/25"
              >
                <Sparkles size={16} />
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
                    onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                    className={cn(
                      "favorites-item-row group relative transition-all duration-200",
                      isSelectionMode && "cursor-pointer",
                      isSelectionMode && selectedItems.has(item.id)
                        ? "ring-2 ring-pink-500/40"
                        : ""
                    )}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isSelectionMode ? '28px 88px 1fr auto' : '88px 1fr auto',
                      gap: '14px',
                      alignItems: 'center',
                      backgroundColor: isSelectionMode && selectedItems.has(item.id) 
                        ? 'rgba(236, 72, 153, 0.05)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '18px',
                      padding: '12px',
                    }}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        className={cn(
                          "w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all",
                          selectedItems.has(item.id)
                            ? "bg-pink-500 border-pink-500 text-white"
                            : "bg-transparent border-white/30 text-transparent hover:border-pink-400"
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    )}

                    {/* Image - Squircle */}
                    <Link href={`/urun/${item.slug}`}>
                      <div 
                        className="relative overflow-hidden flex items-center justify-center"
                        style={{ 
                          width: '88px', 
                          height: '88px',
                          backgroundColor: '#0a0a0a',
                          borderRadius: '14px',
                        }}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="88px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <ImagePlaceholder type="product" iconSize="sm" />
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">
                        {item.brand}
                      </p>
                      <Link href={`/urun/${item.slug}`}>
                        <h3 className="text-[14px] font-semibold text-white leading-snug line-clamp-2 hover:text-white/80 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-[11px] text-white/35 mt-1">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                    </div>

                    {/* Price & Actions - Compact Right Column */}
                    <div className="flex items-center gap-4">
                      {/* Price */}
                      <div className="text-right min-w-[100px]">
                        {savings > 0 && (
                          <div className="flex items-center justify-end gap-2 mb-0.5">
                            <span className="text-[11px] text-white/35 line-through">
                              {formatPrice(item.originalPrice!)} ₺
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {formatPrice(savings)} ₺ kazanç
                            </span>
                          </div>
                        )}
                        <span className="text-lg font-bold text-white">
                          {formatPrice(item.price)} ₺
                        </span>
                      </div>

                      {/* Squircle Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Add to Cart - Squircle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          disabled={addingToCart === item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '0 16px',
                            height: '44px',
                            borderRadius: '14px',
                            backgroundColor: addingToCart === item.id 
                              ? 'rgba(16, 185, 129, 0.15)' 
                              : 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(12px)',
                            border: addingToCart === item.id 
                              ? '1px solid rgba(16, 185, 129, 0.3)' 
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            color: addingToCart === item.id ? '#34D399' : 'rgba(255, 255, 255, 0.8)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {addingToCart === item.id ? (
                            <>
                              <Check size={16} />
                              <span>Eklendi</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={16} />
                              <span>Sepete Ekle</span>
                            </>
                          )}
                        </button>

                        {/* Remove Button - Squircle */}
                        {!isSelectionMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.productId, item.variant?.id);
                            }}
                            title="Favorilerden Çıkar"
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '14px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: 'rgba(255, 255, 255, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              BOTTOM CTA
          ═══════════════════════════════════════════════════════════════════ */}
          {items.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/magaza"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-all"
              >
                Alışverişe Devam Et
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
