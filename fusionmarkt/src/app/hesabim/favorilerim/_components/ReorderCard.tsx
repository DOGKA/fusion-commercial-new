"use client";

/**
 * "Tekrar al" kartı.
 *
 * Favori kartından ayrı: burada fiyat GÖSTERİLMİYOR, çünkü elimizdeki tek fiyat
 * satın alma anındaki fiyat. Güncel fiyat sepete eklerken `useReorder` içinde
 * üründen taze okunuyor ve değişmişse kullanıcıya bildiriliyor.
 */

import Image from "next/image";
import Link from "next/link";
import { Loader2, RotateCcw } from "lucide-react";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import type { ReorderProduct } from "../_lib/useReorderProducts";

interface ReorderCardProps {
  product: ReorderProduct;
  busy: boolean;
  onReorder: (product: ReorderProduct) => void;
}

export default function ReorderCard({ product, busy, onReorder }: ReorderCardProps) {
  return (
    <div className="flex min-w-0 flex-row overflow-hidden rounded-xl border border-border bg-glass-bg transition-colors hover:border-border-hover sm:flex-col">
      <Link
        href={`/urun/${product.slug}`}
        className="account-media-well relative block h-28 w-28 shrink-0 sm:h-auto sm:w-auto sm:aspect-square"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 112px, 240px"
            className="object-contain p-1.5 sm:p-0"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[11px] text-foreground-disabled">
            Görsel yok
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3">
        {product.brand && (
          <p className="line-clamp-1 break-words text-[11px] font-medium tracking-wider text-foreground-muted">
            {product.brand.toLocaleUpperCase("en-US")}
          </p>
        )}
        <Link
          href={`/urun/${product.slug}`}
          className="line-clamp-3 break-words text-[13px] leading-snug text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)] sm:line-clamp-2"
        >
          {product.title}
        </Link>

        {product.variantInfo?.value && (
          <span className="mt-1 truncate text-[11px] text-foreground-muted">
            {product.variantInfo.value}
          </span>
        )}

        {/* mt-auto: kart yüksekliği ürün adının satır sayısıyla değişse de
            "Tekrar al" butonu ızgarada aynı hizada kalır. */}
        <span className="mt-auto pt-2 text-[11px] text-foreground-muted">
          {new Date(product.lastOrderedAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          tarihinde sipariş verdiniz
        </span>

        <button
          type="button"
          onClick={() => onReorder(product)}
          disabled={busy}
          className={`account-btn acc-chip-accent mt-3 w-full inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-fg)] ${DISABLED_TONE}`}
        >
          {busy ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw size={13} aria-hidden="true" />
          )}
          {busy ? "Ekleniyor..." : "Tekrar al"}
        </button>
      </div>
    </div>
  );
}
