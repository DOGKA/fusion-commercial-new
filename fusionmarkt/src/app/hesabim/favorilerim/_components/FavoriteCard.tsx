"use client";

/**
 * Favori kartı.
 *
 * `components/ui/ProductCard` bilinçli olarak yeniden kullanılmadı: oradaki kalp
 * `isFavorite(productId)` ile varyantı hesaba katmadan kontrol ediyor, yani
 * varyantlı bir favoride kalp boş görünür ve tıklanınca varyantsız yeni bir
 * favori EKLER. Bu ekranda doğru davranış için ayrı kart yazıldı.
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Loader2, ShoppingCart, TrendingDown, X } from "lucide-react";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import { getFavoriteCartBlock, type FavoriteItem } from "@/context/FavoritesContext";
import { formatPrice } from "../../_lib/format";

interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove: (productId: string, variantId?: string) => void;
  onAddToCart: (productId: string, variantId?: string) => Promise<void>;
}

export default function FavoriteCard({ item, onRemove, onAddToCart }: FavoriteCardProps) {
  const [adding, setAdding] = useState(false);

  // Oturumluda sunucu listesinden, misafirde wishlist-status zenginleştirmesinden.
  // Stok henüz gelmediyse (undefined) "tükendi" basılmaz.
  const outOfStock = item.stock === 0 || item.isActive === false;
  const cartBlock = getFavoriteCartBlock(item);
  const dropped =
    item.priceAtAdd != null && item.priceAtAdd > item.price
      ? item.priceAtAdd - item.price
      : null;
  const discounted =
    item.originalPrice != null && item.originalPrice > item.price
      ? item.originalPrice
      : null;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAddToCart(item.productId, item.variant?.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex min-w-0 flex-row overflow-hidden rounded-xl border border-border bg-glass-bg transition-colors hover:border-border-hover sm:flex-col">
      <button
        type="button"
        onClick={() => onRemove(item.productId, item.variant?.id)}
        aria-label={`${item.title} ürününü beğendiklerimden çıkar`}
        className="account-icon-btn account-icon-btn--round absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground-muted backdrop-blur transition-colors hover:border-[color:var(--acc-danger-border)] hover:text-[color:var(--acc-danger-fg)]"
      >
        <X size={14} aria-hidden="true" />
      </button>

      <Link
        href={`/urun/${item.slug}`}
        className="account-media-well relative block h-28 w-28 shrink-0 sm:h-auto sm:w-auto sm:aspect-square"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 112px, 240px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[11px] text-foreground-disabled">
            Görsel yok
          </span>
        )}

        {outOfStock && (
          <span className="acc-tone-danger absolute inset-x-0 bottom-0 py-1.5 bg-background/85 backdrop-blur text-center text-[11px] font-medium">
            Tükendi
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3 pr-11 sm:pr-3">
        {item.brand && (
          <p className="line-clamp-1 break-words text-[11px] font-medium tracking-wider text-foreground-muted">
            {item.brand.toLocaleUpperCase("en-US")}
          </p>
        )}
        <Link
          href={`/urun/${item.slug}`}
          className="line-clamp-3 break-words text-[13px] leading-snug text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)] sm:line-clamp-2"
        >
          {item.title}
        </Link>

        {item.variant && (
          <span className="mt-1 truncate text-[11px] text-foreground-muted">
            {item.variant.type ? `${item.variant.type}: ` : ""}
            {item.variant.value || item.variant.name}
          </span>
        )}

        {/* mt-auto: fiyat ve buton, başlık bir mı iki satır mı olursa olsun
            ızgaradaki tüm kartlarda aynı hizada kalsın. */}
        <div className="mt-auto pt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-semibold text-foreground tabular-nums">
            {formatPrice(item.price)}
          </span>
          {discounted && (
            <span className="text-[11px] text-foreground-muted line-through tabular-nums">
              {formatPrice(discounted)}
            </span>
          )}
        </div>

        {dropped && (
          <span className="acc-chip-accent mt-1.5 inline-flex max-w-full items-center gap-1 self-start px-2 py-0.5 rounded-full text-[10px] font-medium">
            <TrendingDown size={11} className="shrink-0" aria-hidden="true" />
            <span className="truncate tabular-nums">{formatPrice(dropped)} düştü</span>
          </span>
        )}

        {cartBlock ? (
          <Link
            href={`/urun/${item.slug}`}
            className="account-btn mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-border bg-background px-3 text-[12px] font-medium text-foreground-secondary transition-colors hover:border-[color:var(--acc-accent-border)] hover:text-foreground"
          >
            {cartBlock === "NEEDS_VARIANT" ? "Seçenek seç" : "Ürüne git"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className={`account-btn acc-chip-accent mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-fg)] ${DISABLED_TONE}`}
          >
            {adding ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <ShoppingCart size={13} aria-hidden="true" />
            )}
            {adding ? "Ekleniyor..." : "Sepete ekle"}
          </button>
        )}
      </div>
    </div>
  );
}
