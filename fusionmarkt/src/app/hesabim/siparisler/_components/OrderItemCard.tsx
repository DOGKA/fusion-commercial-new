"use client";

/**
 * Detay sayfasındaki sipariş kalemi (plan 03 Faz 3.6).
 *
 * Adet, görselin üstünde rozet olarak duruyor — referansta adet hiç
 * gösterilmiyor, bu bizde bilinçli bir iyileştirme (`00-KARARLAR` madde 5).
 *
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Package } from "lucide-react";
import { formatPrice } from "../../_lib/format";
import type { OrderDetailItem } from "../_lib/detail-types";
import { toneClass } from "./order-status-ui";

interface OrderItemCardProps {
  item: OrderDetailItem;
  /** Sipariş seviyesindeki masaüstü aksiyonu; yalnız ilk kaleme verilir. */
  desktopOrderAction?: ReactNode;
}

export default function OrderItemCard({
  item,
  desktopOrderAction,
}: OrderItemCardProps) {
  const image = item.product?.thumbnail || item.product?.images?.[0] || null;
  const name = item.product?.name ?? "Ürün artık satışta değil";

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-glass-bg p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="relative shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-background">
            {image ? (
              <Image src={image} alt={name} fill sizes="64px" className="object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package size={20} aria-hidden="true" className="text-foreground-disabled" />
              </div>
            )}
          </div>
          {item.quantity > 1 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-background px-1 text-[10px] font-medium tabular-nums text-foreground">
              ×{item.quantity}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {item.product?.brand && (
            <p className="account-eyebrow truncate">
              {item.product.brand}
            </p>
          )}

          {item.product?.slug ? (
            <Link
              href={`/urun/${item.product.slug}`}
              className="line-clamp-2 break-words text-[13px] text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)]"
            >
              {name}
            </Link>
          ) : (
            <p className="line-clamp-2 break-words text-[13px] text-foreground-tertiary">
              {name}
            </p>
          )}

          {item.variantInfo?.name && item.variantInfo?.value && (
            <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
              {item.variantInfo.name}: {item.variantInfo.value}
            </p>
          )}

          <p className="mt-1 text-[11px] tabular-nums text-foreground-muted">
            {item.quantity} adet × {formatPrice(item.price)}
          </p>
        </div>

        <span className="shrink-0 whitespace-nowrap text-right text-[13px] font-medium tabular-nums text-foreground">
          {formatPrice(item.subtotal)}
        </span>
      </div>

      {desktopOrderAction && (
        <div className="flex flex-nowrap items-stretch gap-2">
          {desktopOrderAction}
        </div>
      )}

      {/* Yorum onaydan geçmeden yayına çıkmıyor; kullanıcı kendi yorumunu
          ürün sayfasında göremeyince "kayboldu mu?" diye düşünmesin. */}
      {item.myReview && !item.myReview.isApproved && (
        <p className={`text-[11px] ${toneClass("warning")}`}>
          Değerlendirmeniz onay bekliyor.
        </p>
      )}
    </div>
  );
}
