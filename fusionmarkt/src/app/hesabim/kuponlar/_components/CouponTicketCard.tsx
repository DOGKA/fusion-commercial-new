"use client";

/**
 * Kupon bilet kartı.
 *
 * Referanstan FARKLI olan bilinçli iki nokta:
 *  - Kod gizli değil, kartın üzerinde ve kopyalanabilir. Kişiye özel kupon
 *    dağıtımı olmadığı için "kuponu hesabıma ekle" diye bir adım yok.
 *  - Kullanım sayacı ("0/50") hiç gösterilmiyor; o sayı kullanıcıya değil tüm
 *    mağazaya ait, yanıltıcı olurdu. Tükenen kupon listeye hiç gelmiyor.
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, Copy, Truck, Info, Calendar } from "lucide-react";
import type { UserCoupon } from "../_lib/types";

interface CouponTicketCardProps {
  coupon: UserCoupon;
  onShowDetails: (coupon: UserCoupon) => void;
}

const URGENCY_LABEL: Record<"last_day" | "last_3_days" | "last_7_days", string> = {
  last_day: "Son gün",
  last_3_days: "Son 3 gün",
  last_7_days: "Son 7 gün",
};

const URGENCY_CLASS: Record<"last_day" | "last_3_days" | "last_7_days", string> = {
  last_day: "acc-chip-danger",
  last_3_days: "acc-chip-warning",
  last_7_days: "acc-chip-neutral",
};

const formatAmount = (value: number) =>
  value.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function CouponTicketCard({ coupon, onShowDetails }: CouponTicketCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pano izni yoksa kod zaten ekranda yazılı; seçip kopyalanabilir.
      setCopied(false);
    }
  }, [coupon.code]);

  const isPercentage = coupon.discountType === "PERCENTAGE";

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-border bg-glass-bg">
      <div className="flex min-w-0 flex-col sm:flex-row">
        {/* Mobilde indirim başlığı kartın üst bandıdır; geniş ekranda bilet köküne döner. */}
        <div className="flex w-full shrink-0 items-baseline justify-center gap-1.5 border-b border-dashed border-border bg-[var(--acc-accent-bg)] px-3 py-3 text-center sm:w-[104px] sm:flex-col sm:items-center sm:justify-center sm:gap-0.5 sm:border-b-0 sm:border-r sm:px-2 sm:py-4">
          <span className="acc-tone-accent break-words text-[22px] font-bold leading-tight tabular-nums">
            {isPercentage ? `%${formatAmount(coupon.discountValue)}` : formatAmount(coupon.discountValue)}
          </span>
          <span className="text-[12px] text-foreground-muted sm:text-[11px]">
            {isPercentage ? "indirim" : "₺ indirim"}
          </span>
        </div>

        <div className="min-w-0 flex-1 p-3">
          {(coupon.urgency || coupon.freeShipping) && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {coupon.urgency && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${URGENCY_CLASS[coupon.urgency]}`}
                >
                  {URGENCY_LABEL[coupon.urgency]}
                </span>
              )}
              {coupon.freeShipping && (
                <span className="acc-chip-info inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <Truck size={11} aria-hidden="true" />
                  Ücretsiz kargo
                </span>
              )}
            </div>
          )}

          <p className="break-words text-[13px] leading-relaxed text-foreground-secondary">
            {coupon.conditionText}
          </p>

          {coupon.minOrderAmount ? (
            <p className="mt-1 text-[11px] text-foreground-muted tabular-nums">
              Alt limit: {formatAmount(coupon.minOrderAmount)} ₺
            </p>
          ) : null}

          <p className="mt-1 flex items-start gap-1 text-[11px] text-foreground-muted">
            <Calendar size={11} className="mt-[2px] shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              {coupon.endDate
                ? `${formatDate(coupon.endDate)} tarihine kadar geçerli`
                : "Süresiz geçerli"}
            </span>
          </p>
        </div>
      </div>

      {/* Alt bant: kod + aksiyonlar */}
      <div className="grid grid-cols-2 items-center gap-2 border-t border-dashed border-border px-3 py-3 sm:flex sm:flex-wrap sm:py-2.5">
        {/* Kod uzunluğu sınırsız; `break-all` olmadan uzun kodlar bandı taşırıyor. */}
        <button
          type="button"
          onClick={handleCopy}
          className="col-span-2 inline-flex min-h-[44px] min-w-0 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1 text-left text-[13px] font-medium tracking-wider text-foreground transition-colors hover:border-[color:var(--acc-accent-border)] sm:col-span-1 sm:min-h-[40px] sm:w-auto sm:max-w-full sm:justify-start"
          aria-label={`${coupon.code} kupon kodunu kopyala`}
        >
          <span className="min-w-0 break-all font-mono">{coupon.code}</span>
          {copied ? (
            <Check size={14} className="acc-tone-accent shrink-0" aria-hidden="true" />
          ) : (
            <Copy size={14} className="shrink-0 text-foreground-muted" aria-hidden="true" />
          )}
        </button>

        <span role="status" aria-live="polite" className="acc-tone-accent sr-only text-[11px] sm:not-sr-only">
          {copied ? "Kopyalandı!" : ""}
        </span>

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:flex-wrap sm:items-center sm:gap-1">
          <button
            type="button"
            onClick={() => onShowDetails(coupon)}
            // Listede aynı metinli birden çok buton oluyor; kod olmadan ekran
            // okuyucu hangi kuponun detayı olduğunu ayırt edemiyor.
            aria-label={`${coupon.code} kuponunun koşulları`}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-foreground-muted transition-colors hover:bg-glass-bg-hover hover:text-foreground sm:min-h-[40px] sm:border-transparent"
          >
            <Info size={13} aria-hidden="true" />
            Detaylar
          </button>
          <Link
            href={coupon.targetUrl}
            aria-label={`${coupon.code} kuponunun geçerli olduğu ürünlere git`}
            className="acc-chip-accent inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-fg)] sm:min-h-[40px]"
          >
            Ürünlere git
          </Link>
        </div>
      </div>
    </article>
  );
}
