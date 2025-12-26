"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Minus, Plus, Trash2, ChevronDown, ChevronUp, 
  Package, Truck, Tag, ShieldCheck 
} from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";
import { cn } from "@/lib/utils";
import type { AppliedCoupon, CheckoutItem, CheckoutTotals } from "@/types/checkout";

// Local type alias for cart items (compatible with CheckoutItem)
type CartItem = CheckoutItem;

// ═══════════════════════════════════════════════════════════════════════════
// ORDER SUMMARY COMPONENT - Sticky Right Column
// ═══════════════════════════════════════════════════════════════════════════

interface OrderSummaryProps {
  isMobile?: boolean;
}

export default function OrderSummary({ isMobile = false }: OrderSummaryProps) {
  const { 
    state, 
    updateItemQuantity, 
    removeItem, 
    formatPrice: formatPriceCtx,
    getShippingMessage 
  } = useCheckout();
  
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  
  const { items, totals, shippingMethod, appliedCoupon, couponState, couponError } = state;
  
  const shippingMessage = getShippingMessage();
  
  // Kupon uygulama
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    // Context'ten applyCoupon çağır
    setCouponLoading(false);
  };

  // Mobile Accordion Header
  if (isMobile) {
    return (
      <div className="bg-[#0a0a0a]/95 border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Accordion Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Package size={18} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-white">Sipariş Özeti</span>
              <span className="text-xs text-white/40 ml-2">({items.length} ürün)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-white">
              {formatPriceCtx(totals.grandTotal)}
            </span>
            {isExpanded ? (
              <ChevronUp size={18} className="text-white/40" />
            ) : (
              <ChevronDown size={18} className="text-white/40" />
            )}
          </div>
        </button>
        
        {/* Accordion Content */}
        {isExpanded && (
          <div className="border-t border-white/[0.06]">
            <OrderSummaryContent 
              items={items}
              totals={totals}
              shippingMethod={shippingMethod}
              shippingMessage={shippingMessage}
              appliedCoupon={appliedCoupon}
              couponState={couponState}
              couponError={couponError}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponLoading={couponLoading}
              handleApplyCoupon={handleApplyCoupon}
              updateItemQuantity={updateItemQuantity}
              removeItem={removeItem}
              formatPriceCtx={formatPriceCtx}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop Sticky Panel
  return (
    <div className="sticky top-[120px]">
      <div className="bg-[#0a0a0a]/95 border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Package size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Siparişiniz</h3>
              <span className="text-xs text-white/40">{items.length} ürün</span>
            </div>
          </div>
        </div>
        
        <OrderSummaryContent 
          items={items}
          totals={totals}
          shippingMethod={shippingMethod}
          shippingMessage={shippingMessage}
          appliedCoupon={appliedCoupon}
          couponState={couponState}
          couponError={couponError}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          couponLoading={couponLoading}
          handleApplyCoupon={handleApplyCoupon}
          updateItemQuantity={updateItemQuantity}
          removeItem={removeItem}
          formatPriceCtx={formatPriceCtx}
        />
      </div>
      
      {/* Trust Badges */}
      <div className="mt-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <div className="flex items-center gap-2 text-white/40">
          <ShieldCheck size={14} />
          <span className="text-xs">256-bit SSL ile güvenli ödeme</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER SUMMARY CONTENT (shared between mobile/desktop)
// ═══════════════════════════════════════════════════════════════════════════

interface OrderSummaryContentProps {
  items: CartItem[];
  totals: CheckoutTotals;
  shippingMethod: string;
  shippingMessage: string | null;
  appliedCoupon: AppliedCoupon | null;
  couponState: string;
  couponError: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponLoading: boolean;
  handleApplyCoupon: () => void;
  updateItemQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  formatPriceCtx: (price: number) => string;
}

function OrderSummaryContent(props: OrderSummaryContentProps) {
  const {
    items,
    totals,
    shippingMessage,
    appliedCoupon,
    couponError,
    couponCode,
    setCouponCode,
    couponLoading,
    handleApplyCoupon,
    updateItemQuantity,
    removeItem,
    formatPriceCtx,
  } = props;
  const [showCouponInput, setShowCouponInput] = useState(false);
  
  return (
    <div className="p-5 space-y-5">
      {/* Products List */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {items.map((item) => (
          <div 
            key={item.id}
            className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl group"
          >
            {/* Image */}
            <div className="relative w-14 h-14 bg-[#0d0d0d] rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-white/20" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-white/90 line-clamp-1">{item.title}</h4>
              {item.variant && typeof item.variant === 'object' && 'value' in item.variant && (
                <p className="text-[10px] text-white/40 mt-0.5">{item.variant.value}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="w-5 text-center text-xs font-medium text-white/80">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
                  >
                    <Plus size={10} />
                  </button>
                </div>
                
                {/* Price */}
                <span className="text-xs font-semibold text-white">
                  {formatPriceCtx(item.price * item.quantity)}
                </span>
              </div>
            </div>
            
            {/* Remove */}
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all self-start"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Coupon Section */}
      <div className="border-t border-white/[0.06] pt-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">{appliedCoupon.code}</span>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              -{formatPriceCtx(appliedCoupon.calculatedDiscount)}
            </span>
          </div>
        ) : (
          <>
            {!showCouponInput ? (
              <button
                onClick={() => setShowCouponInput(true)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-emerald-400 transition-colors"
              >
                <Tag size={14} />
                Kuponunuz var mı?
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Kupon kodu"
                    className="flex-1 h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Uygula
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-400">{couponError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Totals */}
      <div className="border-t border-white/[0.06] pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Ara Toplam</span>
          <span className="text-sm text-white/80">{formatPriceCtx(totals.subtotal)}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-white/40" />
            <span className="text-sm text-white/50">Kargo</span>
          </div>
          <span className={cn(
            "text-sm font-medium",
            totals.shipping === 0 ? "text-emerald-400" : "text-white/80"
          )}>
            {totals.shipping === 0 ? "Ücretsiz" : formatPriceCtx(totals.shipping)}
          </span>
        </div>
        
        {/* Discount */}
        {totals.discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">İndirim</span>
            <span className="text-sm font-medium text-emerald-400">
              -{formatPriceCtx(totals.discount)}
            </span>
          </div>
        )}
        
        {/* Grand Total */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-base font-semibold text-white">Toplam</span>
          <div className="text-right">
            <span className="text-xl font-bold text-white">{formatPriceCtx(totals.grandTotal)}</span>
            <p className="text-[10px] text-white/40">(KDV Dahil)</p>
          </div>
        </div>
      </div>
      
      {/* Shipping Message */}
      {shippingMessage && (
        <div className={cn(
          "p-3 rounded-xl text-center text-xs font-medium",
          shippingMessage.includes("fırsatından") 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
        )}>
          {shippingMessage}
        </div>
      )}
    </div>
  );
}
