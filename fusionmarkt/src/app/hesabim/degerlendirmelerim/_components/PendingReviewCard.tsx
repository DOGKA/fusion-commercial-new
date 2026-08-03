"use client";

/**
 * "Değerlendirmeni beklediğimiz" ürün kartı.
 *
 * Kartın altındaki geniş yıldız şeridi referanstaki hızlı puanlama deseni:
 * yıldıza basmak yorumu göndermiyor, formu O PUANLA ön-dolduruyor. Tek tıkla
 * puan gönderimi yapılmıyor çünkü `POST /api/reviews` yorum metnini zorunlu
 * tutuyor ve bu zorunluluk yorum kalitesi için kasıtlı (`00-KARARLAR:430`).
 *
 * REFERANSTAN SAPMA: referans kartta ürünün ORTALAMA puanı ve toplam yorum
 * sayısı da yazıyor. Çıkarıldı — "senden yorum bekliyoruz" kartında başkalarının
 * puanını göstermek kullanıcıyı etkiliyor ve ek sorgu maliyeti getiriyor.
 */

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import StarRating from "@/components/review/StarRating";
import type { PendingReviewItem } from "../_lib/types";

interface PendingReviewCardProps {
  item: PendingReviewItem;
  onPickRating: (item: PendingReviewItem, rating: number) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function PendingReviewCard({
  item,
  onPickRating,
}: PendingReviewCardProps) {
  return (
    <article className="min-w-0 rounded-xl border border-border bg-glass-bg p-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.name}
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package size={18} className="text-foreground-disabled" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {item.brand && (
            <p className="account-eyebrow">
              {item.brand}
            </p>
          )}

          <Link
            href={`/urun/${item.slug}`}
            className="line-clamp-2 break-words text-[13px] text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)]"
          >
            {item.name}
          </Link>

          {item.variantInfo?.name && item.variantInfo?.value && (
            <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
              <span className="text-foreground-muted">{item.variantInfo.name}:</span>{" "}
              <span className="font-medium text-foreground-secondary">
                {item.variantInfo.value}
              </span>
            </p>
          )}

          <p className="mt-1 text-[11px] text-foreground-muted">
            {formatDate(item.deliveredAt)} tarihinde teslim edildi
          </p>
        </div>
      </div>

      <div className="mt-2 border-t border-border pt-1">
        <StarRating
          value={0}
          onChange={(rating) => onPickRating(item, rating)}
          size={28}
          fill
          ariaLabel={`${item.name} için puan ver`}
        />
      </div>
    </article>
  );
}
