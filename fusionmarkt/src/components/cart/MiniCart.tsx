"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  Truck,
  Gift
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn, formatPrice } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

// Ücretsiz kargo limiti (varsayılan)
const FREE_SHIPPING_LIMIT = 2000;

// ═══════════════════════════════════════════════════════════════════════════
// MINI CART - Right Side Panel (Premium Design)
// ═══════════════════════════════════════════════════════════════════════════

// Hydration-safe mounted check (same approach as `ThemeToggle`)
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

export default function MiniCart() {
  const { items, isOpen, closeCart, itemCount, subtotal, originalSubtotal, totalSavings, removeItem, updateQuantity } = useCart();
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const summarySectionRef = useRef<HTMLDivElement>(null);
  const [isSummaryInView, setIsSummaryInView] = useState(false);
  
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
      
      // Bundle olmayan ve productId'si olan ürünleri filtrele
      const productItems = items.filter(item => !item.isBundle && item.productId);
      
      try {
        // Her zaman API'yi çağır - bundle-only sepet için cartTotal yeterli
        const res = await fetch("/api/public/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: productItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            cartTotal: subtotal, // Tam sepet toplamı (bundle dahil)
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
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closeCart]);

  useBodyScrollLock(isOpen);

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

  // Panel kapanınca kompakt çubuk durumunu sıfırla (yeniden açılışta flaş olmasın)
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => setIsSummaryInView(false));
    }
  }, [isOpen]);

  // Checkout ile aynı mantık: detaylı özet görünürken kompakt çubuk gizlenir
  const hasItems = items.length > 0;
  useEffect(() => {
    if (!isOpen || !hasItems) return;
    const root = scrollAreaRef.current;
    const summary = summarySectionRef.current;
    if (!root || !summary) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSummaryInView(entry.isIntersecting),
      { root, threshold: 0 }
    );
    observer.observe(summary);
    return () => observer.disconnect();
  }, [isOpen, hasItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with blur */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[400px]",
          // Dark theme must be the old dark panel (not light)
          isDark ? "bg-gradient-to-b from-[#0d0d0d] to-[#080808]" : "bg-white",
          "border-l border-border",
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
                className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/25 flex items-center justify-center transition-[transform,border-color] duration-300 group-hover:scale-105 group-hover:border-emerald-500/40"
                style={{ borderRadius: '16px' }}
              >
                <ShoppingBag className="w-[22px] h-[22px] text-emerald-400" strokeWidth={1.8} />
              </div>
              {/* Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-2 ring-background">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            
            {/* Title Block */}
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-foreground tracking-tight">Sepetiniz</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-foreground-muted font-medium">{itemCount} ürün</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span className="text-[14px] text-[color:var(--fusion-success-text)] font-semibold tracking-tight">{formatPrice(subtotal)} ₺</span>
              </div>
            </div>
            
            {/* Close Button - Minimal */}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors duration-200"
              aria-label="Kapat"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Subtle divider */}
          <div
            className={cn(
              "h-px bg-gradient-to-r from-transparent to-transparent mx-4",
              isDark ? "via-white/[0.06]" : "via-black/[0.08]"
            )}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SCROLLABLE CONTENT: Items + Summary (tek scroll alanı)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
        <div className={cn("px-3 py-3 space-y-2", items.length === 0 ? "flex-1" : "flex-none")}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div 
                className="w-24 h-24 bg-glass-bg border border-glass-border flex items-center justify-center mb-5"
                style={{ borderRadius: '28px' }}
              >
                <ShoppingBag className="w-12 h-12 text-foreground-disabled" />
              </div>
              <p className="text-foreground-secondary text-lg font-medium mb-6">Sepetiniz boş</p>
              <Link
                href="/magaza"
                onClick={closeCart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-foreground bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 hover:border-emerald-500/30 rounded-full transition-all no-underline"
              >
                <Sparkles size={12} />
                Ürünleri Keşfet
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-glass-bg border border-border hover:border-border-hover hover:bg-glass-bg-hover transition-colors duration-200"
                style={{ borderRadius: '14px', overflow: 'hidden' }}
              >
                {/* Grid Layout: Image | Content */}
                <div className="flex">
                  {/* Image - 1:1 Square - Clickable */}
                  <Link 
                    href={`/urun/${item.slug}`}
                    onClick={closeCart}
                    className="relative w-[72px] h-[72px] flex-shrink-0 bg-background m-2 hover:opacity-80 transition-opacity" 
                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                  >
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
                  </Link>

                  {/* Content - Right side */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                    {/* Top: Brand + Title + Variant - Clickable */}
                    <Link 
                      href={`/urun/${item.slug}`}
                      onClick={closeCart}
                      className="pr-6 hover:opacity-80 transition-opacity"
                    >
                      {!!item.brand?.trim() && (
                        <p className="text-[11px] text-foreground-muted tracking-wider font-medium">
                          {item.brand?.toLocaleUpperCase('en-US')}
                        </p>
                      )}
                      <h4 className="text-[14px] font-medium text-foreground leading-snug line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      {item.variant && (
                        <p className="text-[12px] text-foreground-muted mt-0.5">
                          {item.variant.value}
                        </p>
                      )}
                    </Link>
                    
                    {/* Bottom: Price + Quantity - Stacked on mobile, inline on desktop */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {/* Row 1: Original price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-[15px] font-semibold text-foreground">
                          {formatPrice((item.originalPrice ?? item.price) * item.quantity)}
                        </span>
                        <span className="text-[11px] text-foreground-muted">₺</span>
                      </div>
                      
                      {/* Row 2: Discounted price + savings - only if there's a discount */}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-[10px] text-foreground-tertiary">İndirimli Fiyat:</span>
                          <span className="text-[11px] text-foreground font-medium">{formatPrice(item.price * item.quantity)} ₺</span>
                          <span className="text-[10px] text-foreground-muted">•</span>
                          <span className="text-[10px] text-[color:var(--fusion-success-text)] font-medium">{formatPrice((item.originalPrice - item.price) * item.quantity)} ₺ kazanç</span>
                        </div>
                      )}
                      
                      {/* Row 3: Quantity Controls - web ile aynı (mobil+desktop aynı), tablette biraz daha kompakt */}
                      <div
                        className="minicart-quantity-controls flex items-center self-start bg-glass-bg border border-border p-0.5"
                        style={{ borderRadius: '10px' }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-glass-bg-hover transition-colors"
                          style={{ borderRadius: '8px' }}
                        >
                          <Minus className="w-3 h-3 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3" />
                        </button>
                        <span className="w-6 md:w-5 lg:w-6 text-center text-[12px] md:text-[10px] lg:text-[12px] font-semibold text-foreground-secondary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-glass-bg-hover transition-colors"
                          style={{ borderRadius: '8px' }}
                        >
                          <Plus className="w-3 h-3 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button - Top right corner */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 p-1 text-foreground-disabled hover:text-red-400 hover:bg-red-400/10 transition-[color,background-color,opacity] opacity-0 group-hover:opacity-100"
                    style={{ borderRadius: '6px' }}
                    aria-label="Ürünü Kaldır"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER - Listenin sonunda eski yerindeki detaylı özet
        ═══════════════════════════════════════════════════════════════════ */}
        {items.length > 0 && (
          <div
            className={cn(
              "border-t",
              isDark
                ? "border-white/[0.06] bg-gradient-to-t from-[#080808] via-[#0a0a0a] to-[#0d0d0d]"
                : "border-gray-200 bg-gray-50"
            )}
          >
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
                  className="flex items-center gap-3 p-3 border border-[color:var(--fusion-success-border-soft)]"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center border border-[color:var(--fusion-success-border-soft)]" style={{ borderRadius: '10px' }}>
                    <Gift className="w-5 h-5 text-[color:var(--fusion-success-text)]" />
                  </div>
                  <div className="flex-1" style={{ lineHeight: 1.2 }}>
                    <p className="text-[13px] font-semibold text-[color:var(--fusion-success-text)]" style={{ margin: 0, padding: 0 }}>Ücretsiz Kargo Kazandınız! 🎉</p>
                    <p className="text-[11px] text-[color:var(--fusion-success-text)] opacity-70" style={{ margin: '2px 0 0 0', padding: 0 }}>Siparişiniz ücretsiz kargo ile gönderilecek</p>
                  </div>
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
                  <div className="h-1.5 bg-glass-bg-hover overflow-hidden" style={{ borderRadius: '4px' }}>
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-[width] duration-500"
                      style={{ 
                        width: `${Math.min(100, (subtotal / shippingInfo.freeShippingThreshold) * 100)}%`,
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className={cn("text-[10px]", isDark ? "text-foreground-muted" : "text-slate-900")}>
                      {formatPrice(subtotal)} ₺
                    </span>
                    <span className="text-[10px] text-[color:var(--fusion-success-text)]">
                      {formatPrice(shippingInfo.freeShippingThreshold)} ₺ Ücretsiz Kargo
                    </span>
                  </div>
                </div>
              )}

              {/* Totals Breakdown */}
              <div ref={summarySectionRef} className="space-y-2">
                {/* Original Subtotal - only show if there's a discount */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-tertiary">Ara Toplam</span>
                    <span className="text-sm text-foreground-tertiary line-through">
                      {formatPrice(originalSubtotal)} ₺
                    </span>
                  </div>
                )}

                {/* Total Discount */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[color:var(--fusion-success-text)]">İndirim</span>
                    <span className="text-sm font-medium text-[color:var(--fusion-success-text)]">
                      -{formatPrice(totalSavings)} ₺
                    </span>
                  </div>
                )}

                {/* Final Total */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div>
                    <span className="text-base text-foreground-secondary">Toplam</span>
                    <p className="text-[12px] text-foreground-muted mt-0.5">{itemCount} ürün</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(subtotal)}
                      <span className="text-lg font-normal text-foreground-tertiary ml-1">₺</span>
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
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-4 px-6 text-white font-semibold text-base transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5",
                    isDark
                      ? "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-900/30"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                  )}
                  style={{ borderRadius: '16px' }}
                >
                  Ödemeye Git
                  <ArrowRight size={20} />
                </Link>

                {/* Alışverişe Devam Et - Secondary */}
                <button
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-glass-bg border border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-hover text-foreground-secondary hover:text-foreground font-medium text-base transition-colors duration-300"
                  style={{ borderRadius: '14px' }}
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* 3+ farklı ürün olduğunda, detaylı özet görünene kadar panelin altında sabit */}
        {items.length >= 3 && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 z-20 border-t transition-transform duration-300 ease-out",
              isDark
                ? "border-white/[0.06] bg-[#0a0a0a] shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.6)]"
                : "border-gray-200 bg-white shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.12)]",
              isSummaryInView
                ? "translate-y-full pointer-events-none"
                : "translate-y-0"
            )}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                {totalSavings > 0 && (
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap leading-none mb-1">
                    <span className="text-[12px] text-foreground-tertiary line-through">
                      {formatPrice(originalSubtotal)} ₺
                    </span>
                    <span className="text-[10px] font-medium text-[color:var(--fusion-success-text)]">
                      {formatPrice(totalSavings)} ₺ kazanç
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {formatPrice(subtotal)}
                    <span className="text-sm font-normal text-foreground-tertiary ml-1">₺</span>
                  </p>
                  <span className="text-[10px] text-foreground-muted">KDV Dahil</span>
                </div>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(
                  "flex items-center gap-2 flex-shrink-0 py-2.5 px-5 text-white font-semibold text-[14px] transition-colors duration-300",
                  isDark
                    ? "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-900/30"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
                )}
                style={{ borderRadius: '12px' }}
              >
                Ödemeye Git
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
