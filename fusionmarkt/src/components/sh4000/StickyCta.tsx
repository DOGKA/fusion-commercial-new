"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils";

const PRODUCT_SLUG =
  "5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  thumbnail?: string | null;
  images?: string[] | null;
  brand?: string | null;
}

export default function StickyCta() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/public/products/${PRODUCT_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as ProductData;
        if (isMounted) {
          setProduct(data);
        }
      } catch {
        // noop
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, []);

  const productUrl = `/urun/${PRODUCT_SLUG}`;
  const image = product?.thumbnail || product?.images?.[0] || "";
  const pricing = useMemo(() => {
    const price = product?.price ?? 0;
    const compare = product?.comparePrice ?? null;
    const savings = compare && compare > price ? compare - price : 0;
    return { price, compare, savings };
  }, [product]);

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-1rem)] max-w-[600px] -translate-x-1/2">
      <div className="flex items-center gap-3 md:gap-5 border border-[var(--glass-border)] bg-[var(--surface)] px-4 py-3 md:px-6 md:py-4 shadow-xl backdrop-blur-xl" style={{ borderRadius: 20 }}>
        {/* Sol: Fiyat Bilgisi */}
        <div className="flex flex-col gap-0.5 min-w-0 shrink-0">
          <div className="flex items-baseline gap-2">
            {pricing.compare ? (
              <span className="text-[10px] md:text-sm line-through text-[var(--foreground-muted)]">
                {formatPrice(pricing.compare)} TL
              </span>
            ) : null}
            <span className="text-base md:text-2xl font-bold text-[var(--foreground)] whitespace-nowrap">
              {formatPrice(pricing.price)} TL
            </span>
          </div>
          {pricing.savings > 0 && (
            <span className="inline-flex items-center self-start px-2 py-0.5 text-[9px] md:text-xs font-semibold text-emerald-500 bg-emerald-500/20" style={{ borderRadius: 8 }}>
              Kazanç: {formatPrice(pricing.savings)} TL
            </span>
          )}
        </div>

        {/* Sağ: Butonlar */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-end">
          <AddToCartButton
            product={{
              productId: product?.id || "",
              slug: product?.slug || PRODUCT_SLUG,
              title: product?.name || "IEETek SH4000",
              brand: product?.brand || "",
              price: pricing.price,
              originalPrice: pricing.compare ?? null,
              image,
              quantity: 1,
            }}
            variant="text"
            size="md"
            className="!flex-1 !min-w-0 !px-2.5 md:!px-4 !py-1.5 md:!py-2.5 !text-[12px] md:!text-[15px] !leading-tight !font-semibold !whitespace-nowrap !bg-emerald-500 !text-white hover:!bg-emerald-600 !rounded-[16px]"
            disabled={isLoading || !product?.id || !product?.price}
          />
        </div>
      </div>
    </div>
  );
}
