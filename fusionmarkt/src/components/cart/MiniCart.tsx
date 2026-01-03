"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Heart,
  Check,
  Sparkles,
  Truck,
  Gift
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn, formatPrice } from "@/lib/utils";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

// Ücretsiz kargo limiti (varsayılan)
const FREE_SHIPPING_LIMIT = 2000;

// ═══════════════════════════════════════════════════════════════════════════
// MINI CART - Right Side Panel (Premium Design)
// ═══════════════════════════════════════════════════════════════════════════

export default function MiniCart() {
  const { items, isOpen, closeCart: closeCartOriginal, itemCount, subtotal, originalSubtotal, totalSavings, removeItem, updateQuantity, clearCart } = useCart();
  const { addItem: addToFavorites } = useFavorites();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const prevIsOpenRef = useRef(isOpen);
  
  // Wrap closeCart to reset selection state
  const closeCart = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectionMode(false);
    closeCartOriginal();
  }, [closeCartOriginal]);
  
  // Shipping state
  const [shippingInfo, setShippingInfo] = useState<{
    hasFreeShipping: boolean;
    hasHeavyClass: boolean;
    amountToFreeShipping: number;
    freeShippingThreshold: number;
    message?: string;
  }>({
    hasFreeShipping: subtotal >= FREE_SHIPPING_LIMIT,
    hasHeavyClass: false,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_LIMIT - subtotal),
    freeShippingThreshold: FREE_SHIPPING_LIMIT,
  });

  // Fetch shipping info when cart changes
  useEffect(() => {
    const fetchShippingInfo = async () => {
      if (items.length === 0) return;
      
      try {
        const res = await fetch("/api/public/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setShippingInfo({
            hasFreeShipping: data.hasFreeShipping,
            hasHeavyClass: data.hasHeavyClass || false,
            amountToFreeShipping: data.amountToFreeShipping,
            freeShippingThreshold: data.freeShippingThreshold,
            message: data.message,
          });
        }
      } catch {
        // Fallback hesaplama
        setShippingInfo({
          hasFreeShipping: subtotal >= FREE_SHIPPING_LIMIT,
          hasHeavyClass: false,
          amountToFreeShipping: Math.max(0, FREE_SHIPPING_LIMIT - subtotal),
          freeShippingThreshold: FREE_SHIPPING_LIMIT,
        });
      }
    };
    
    fetchShippingInfo();
  }, [items, subtotal]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeCart]);

  // Track isOpen changes to reset selection when cart is closed externally
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      // Cart was just closed externally (not via closeCart)
      queueMicrotask(() => {
        setSelectedItems(new Set());
        setIsSelectionMode(false);
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

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
    selectedItems.forEach(id => removeItem(id));
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  // Move selected items to favorites
  const moveSelectedToFavorites = () => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        addToFavorites({
          productId: item.productId,
          slug: item.slug,
          title: item.title,
          brand: item.brand,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          variant: item.variant,
        });
      }
    });
    // Remove from cart after adding to favorites
    deleteSelectedItems();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with blur */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[480px]",
          "bg-gradient-to-b from-[#0d0d0d] to-[#080808]",
          "border-l border-white/[0.06]",
          "flex flex-col shadow-2xl shadow-black/60",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER / HERO SECTION - Minimal TSParticle Style
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -top-4 right-12 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-8 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Grid Header */}
          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5">
            {/* Cart Icon - Glassmorphism */}
            <div className="relative group">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/25 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/40"
                style={{ borderRadius: '16px' }}
              >
                <ShoppingBag className="w-[22px] h-[22px] text-emerald-400" strokeWidth={1.8} />
              </div>
              {/* Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-2 ring-[#0d0d0d]">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            
            {/* Title Block */}
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-white tracking-tight">Sepetiniz</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-white/35 font-medium">{itemCount} ürün</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[14px] text-emerald-400 font-semibold tracking-tight">{formatPrice(subtotal)} ₺</span>
              </div>
            </div>
            
            {/* Close Button - Minimal */}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200"
              aria-label="Kapat"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Subtle divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mx-4" />

          {/* Action Bar - Compact */}
          {items.length > 0 && (
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.04]" style={{ borderRadius: '10px' }}>
                {!isSelectionMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsSelectionMode(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
                      style={{ borderRadius: '8px' }}
                    >
                      <Check size={16} />
                      Seç
                    </button>
                    <div className="w-px h-4 bg-white/[0.06]" />
                    <button
                      type="button"
                      onClick={clearCart}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-medium text-white/50 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer"
                      style={{ borderRadius: '8px' }}
                    >
                      <Trash2 size={14} />
                      Temizle
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={selectAllItems}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-medium transition-all",
                        selectedItems.size === items.length 
                          ? "text-emerald-400 bg-emerald-500/10" 
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      )}
                      style={{ borderRadius: '8px' }}
                    >
                      <Check size={14} />
                      {selectedItems.size === items.length ? 'Kaldır' : 'Tümü'}
                    </button>
                    <div className="w-px h-4 bg-white/[0.06]" />
                    <button
                      onClick={moveSelectedToFavorites}
                      disabled={selectedItems.size === 0}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-medium transition-all",
                        selectedItems.size > 0 
                          ? "text-pink-400 hover:bg-pink-500/10" 
                          : "text-white/25 cursor-not-allowed"
                      )}
                      style={{ borderRadius: '8px' }}
                    >
                      <Heart size={14} />
                      Favori
                    </button>
                    <div className="w-px h-4 bg-white/[0.06]" />
                    <button
                      onClick={deleteSelectedItems}
                      disabled={selectedItems.size === 0}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-medium transition-all",
                        selectedItems.size > 0 
                          ? "text-red-400 hover:bg-red-500/10" 
                          : "text-white/25 cursor-not-allowed"
                      )}
                      style={{ borderRadius: '8px' }}
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                    <div className="w-px h-4 bg-white/[0.06]" />
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedItems(new Set());
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                      style={{ borderRadius: '8px' }}
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CART ITEMS LIST
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div 
                className="w-24 h-24 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] flex items-center justify-center mb-5"
                style={{ borderRadius: '28px' }}
              >
                <ShoppingBag className="w-12 h-12 text-white/15" />
              </div>
              <p className="text-white/60 text-lg font-medium mb-6">Sepetiniz boş</p>
              <button
                onClick={closeCart}
                className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all"
                style={{ borderRadius: '14px' }}
              >
                <Sparkles size={18} />
                Ürünleri Keşfet
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                className={cn(
                  "group relative bg-white/[0.02] border transition-all duration-200",
                  isSelectionMode && "cursor-pointer",
                  isSelectionMode && selectedItems.has(item.id) 
                    ? "border-emerald-500/30 bg-emerald-500/[0.06] ring-1 ring-emerald-500/20" 
                    : "border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.03]"
                )}
                style={{ borderRadius: '14px', overflow: 'hidden' }}
              >
                {/* Grid Layout: Image | Content */}
                <div className="flex">
                  {/* Selection Checkbox - Top left corner */}
                  {isSelectionMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item.id);
                      }}
                      className={cn(
                        "minicart-checkbox absolute top-3 left-3 sm:top-3 sm:left-3 z-20 w-5 h-5 sm:w-5 sm:h-5 border sm:border-2 flex items-center justify-center transition-all cursor-pointer shadow-lg rounded sm:rounded-md",
                        selectedItems.has(item.id) 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-black/80 border-white/40 text-transparent hover:border-emerald-400"
                      )}
                    >
                      <Check className="w-3 h-3 sm:w-3 sm:h-3" strokeWidth={3} />
                    </button>
                  )}

                  {/* Image - 1:1 Square */}
                  <div className="relative w-[72px] h-[72px] flex-shrink-0 bg-[#0a0a0a] m-2" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="72px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImagePlaceholder type="product" iconSize="sm" />
                      </div>
                    )}
                  </div>

                  {/* Content - Right side */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                    {/* Top: Brand + Title + Variant */}
                    <div className="pr-6">
                      {!!item.brand?.trim() && (
                        <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                          {item.brand}
                        </p>
                      )}
                      <h4 className="text-[14px] font-medium text-white/90 leading-snug line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      {item.variant && (
                        <p className="text-[12px] text-white/35 mt-0.5">
                          {item.variant.value}
                        </p>
                      )}
                    </div>
                    
                    {/* Bottom: Price + Quantity - Stacked on mobile, inline on desktop */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {/* Row 1: Original price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-[15px] font-semibold text-white">
                          {formatPrice((item.originalPrice ?? item.price) * item.quantity)}
                        </span>
                        <span className="text-[11px] text-white/40">₺</span>
                      </div>
                      
                      {/* Row 2: Discounted price + savings - only if there's a discount */}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-[10px] text-white/50">İndirimli Fiyat:</span>
                          <span className="text-[11px] text-white font-medium">{formatPrice(item.price * item.quantity)} ₺</span>
                          <span className="text-[10px] text-white/30">•</span>
                          <span className="text-[10px] text-emerald-400 font-medium">{formatPrice((item.originalPrice - item.price) * item.quantity)} ₺ kazanç</span>
                        </div>
                      )}
                      
                      {/* Row 3: Quantity Controls - smaller on mobile */}
                      <div
                        className="flex items-center self-start bg-white/[0.04] border border-white/[0.06] rounded p-px md:rounded-md md:p-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all rounded-sm md:rounded"
                        >
                          <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                        <span className="w-5 md:w-6 text-center text-[10px] md:text-[12px] font-semibold text-white/80">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all rounded-sm md:rounded"
                        >
                          <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button - Top right corner */}
                  {!isSelectionMode && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="absolute top-2 right-2 p-1 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      style={{ borderRadius: '6px' }}
                      aria-label="Ürünü Kaldır"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER - Summary & CTAs
        ═══════════════════════════════════════════════════════════════════ */}
        {items.length > 0 && (
          <div className="border-t border-white/[0.06] bg-gradient-to-t from-black/40 to-transparent">
            <div className="p-5 space-y-4">
              
              {/* Free Shipping Progress / Message */}
              {shippingInfo.hasHeavyClass ? (
                // Ağır sınıf ürün var - özel kargo
                <div 
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="w-10 h-10 bg-orange-500/20 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                    <Truck className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-orange-400">Ağır Sınıf Kargo</p>
                    <p className="text-[11px] text-orange-400/60 mt-0.5">Büyük/ağır ürünler için özel teslimat uygulanır</p>
                  </div>
                </div>
              ) : shippingInfo.hasFreeShipping ? (
                // Ücretsiz kargo kazanıldı
                <div 
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="w-10 h-10 bg-emerald-500/20 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-emerald-400">Ücretsiz Kargo Kazandınız! 🎉</p>
                    <p className="text-[11px] text-emerald-400/60 mt-0.5">Siparişiniz ücretsiz kargo ile gönderilecek</p>
                  </div>
                  <Truck className="w-5 h-5 text-emerald-400/60" />
                </div>
              ) : (
                // Ücretsiz kargoya ne kadar kaldı
                <div 
                  className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <p className="text-[12px] font-medium text-amber-400">
                      <span className="font-bold">{formatPrice(shippingInfo.amountToFreeShipping)} ₺</span> daha ekle, <span className="font-bold">ücretsiz kargo</span> kazan!
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-white/10 overflow-hidden" style={{ borderRadius: '4px' }}>
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (subtotal / shippingInfo.freeShippingThreshold) * 100)}%`,
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/30">{formatPrice(subtotal)} ₺</span>
                    <span className="text-[10px] text-emerald-400/60">{formatPrice(shippingInfo.freeShippingThreshold)} ₺ Ücretsiz Kargo</span>
                  </div>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-2">
                {/* Original Subtotal - only show if there's a discount */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Ara Toplam</span>
                    <span className="text-sm text-white/50 line-through">
                      {formatPrice(originalSubtotal)} ₺
                    </span>
                  </div>
                )}
                
                {/* Total Discount */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-400">İndirim</span>
                    <span className="text-sm font-medium text-emerald-400">
                      -{formatPrice(totalSavings)} ₺
                    </span>
                  </div>
                )}
                
                {/* Final Total */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div>
                    <span className="text-base text-white/70">Toplam</span>
                    <p className="text-[12px] text-white/30 mt-0.5">{itemCount} ürün</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(subtotal)}
                      <span className="text-lg font-normal text-white/50 ml-1">₺</span>
                    </span>
                    <p className="text-[12px] text-emerald-400/60">KDV Dahil</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                {/* Ödemeye Git - Primary */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  style={{ borderRadius: '16px' }}
                >
                  Ödemeye Git
                  <ArrowRight size={20} />
                </Link>

                {/* Alışverişe Devam Et - Secondary */}
                <button
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] text-white/70 hover:text-white font-medium text-base transition-all duration-300"
                  style={{ borderRadius: '14px' }}
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
