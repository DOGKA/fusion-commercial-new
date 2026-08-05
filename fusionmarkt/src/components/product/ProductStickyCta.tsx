"use client";

import {
  memo,
  useEffect,
  useState,
  type ComponentProps,
  type RefObject,
} from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils";

type StickyCartProduct = ComponentProps<typeof AddToCartButton>["product"];

interface ProductStickyCtaProps {
  priceSectionRef: RefObject<HTMLDivElement | null>;
  product: StickyCartProduct;
  price: number;
  comparePrice?: number | null;
  disabled: boolean;
  requiresVariant: boolean;
}

/**
 * Görünürlük state'i ürün görünümünden özellikle ayrıdır. Safari sabit CTA'yı
 * gösterip gizlerken bu state değişse bile açıklamadaki büyük innerHTML ağacı
 * yeniden render edilmez.
 */
function ProductStickyCta({
  priceSectionRef,
  product,
  price,
  comparePrice,
  disabled,
  requiresVariant,
}: ProductStickyCtaProps) {
  const [pastPrice, setPastPrice] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const priceSection = priceSectionRef.current;
    if (!priceSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setPastPrice((current) => (current === next ? current : next));
      },
      { threshold: 0 },
    );

    observer.observe(priceSection);
    return () => observer.disconnect();
  }, [priceSectionRef]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        setFooterVisible((current) => (current === next ? current : next));
      },
      { threshold: 0 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const visible = pastPrice && !footerVisible;
  const hasDiscount = comparePrice != null && comparePrice > price;

  return (
    <>
      <div
        aria-hidden={!visible}
        className="product-sticky-cta md:hidden fixed bottom-0 left-0 right-0 z-[90] border-t"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
          boxShadow: "0 -12px 24px -8px rgba(0,0,0,0.18)",
          paddingBottom: "env(safe-area-inset-bottom)",
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
          transition: visible
            ? "opacity 180ms ease-out"
            : "opacity 140ms ease-in, visibility 0s linear 140ms",
          contain: "layout paint style",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
          willChange: "opacity",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 24px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {hasDiscount && comparePrice != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--foreground-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(comparePrice)} TL
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#10B981",
                  }}
                >
                  {formatPrice(comparePrice - price)} TL kazanç
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                }}
              >
                {formatPrice(price)}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--foreground-tertiary)",
                    marginLeft: "4px",
                  }}
                >
                  TL
                </span>
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--foreground-muted)",
                }}
              >
                KDV Dahil
              </span>
            </div>
          </div>
          <AddToCartButton
            product={product}
            variant="text"
            size="sm"
            className="flex-shrink-0"
            disabled={disabled}
            requiresVariant={requiresVariant}
          />
        </div>
      </div>

      <div
        aria-hidden={!visible}
        className={`hidden md:block fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-1rem)] max-w-[600px] -translate-x-1/2 transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="flex items-center gap-3 md:gap-5 border border-[var(--glass-border)] bg-[var(--surface)] px-4 py-3 md:px-6 md:py-4 shadow-xl backdrop-blur-xl"
          style={{ borderRadius: 20 }}
        >
          <div className="flex flex-col gap-0.5 min-w-0 shrink-0 min-h-[40px] md:min-h-[52px]">
            <div className="flex items-baseline gap-2">
              {hasDiscount && comparePrice != null && (
                <span className="text-[10px] md:text-sm line-through text-[var(--foreground-muted)]">
                  {formatPrice(comparePrice)} TL
                </span>
              )}
              <span className="text-base md:text-2xl font-bold text-[var(--foreground)] whitespace-nowrap">
                {formatPrice(price)} TL
              </span>
            </div>
            {hasDiscount && comparePrice != null && (
              <span
                className="inline-flex items-center self-start px-2 py-0.5 text-[9px] md:text-xs font-semibold text-emerald-500 bg-emerald-500/20"
                style={{ borderRadius: 8 }}
              >
                Kazanç: {formatPrice(comparePrice - price)} TL
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-end">
            <AddToCartButton
              product={product}
              variant="text"
              size="md"
              className="!flex-1 !min-w-0 !px-2.5 md:!px-4 !py-1.5 md:!py-2.5 !text-[12px] md:!text-[15px] !leading-tight !font-semibold !whitespace-nowrap !bg-emerald-500 !text-white hover:!bg-emerald-600 !rounded-[16px]"
              disabled={disabled}
              requiresVariant={requiresVariant}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ProductStickyCta);
