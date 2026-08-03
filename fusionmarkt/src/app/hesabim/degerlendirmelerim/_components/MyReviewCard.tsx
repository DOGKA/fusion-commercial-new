"use client";

/**
 * Yazılmış bir değerlendirmenin kartı.
 *
 * Referansa göre bizde FAZLA olanlar: "Doğrulanmış alışveriş" rozeti, yorum
 * fotoğrafları ve mağaza yanıtı bloğu. Referansta olup bizde OLMAYAN: "Sil"
 * butonu (`DELETE /api/reviews/[id]` yok — sicil F2-34) ve "Onaylanmadı"
 * durumu (`isApproved` tek başına bekleyeni reddedilenden ayırmıyor — F2-35).
 */

import Image from "next/image";
import Link from "next/link";
import { Star, Pencil, ShieldCheck, Clock, CheckCircle2, Store, Package } from "lucide-react";
import type { MyReview } from "../_lib/types";

interface MyReviewCardProps {
  review: MyReview;
  onEdit: (review: MyReview) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function MyReviewCard({ review, onEdit }: MyReviewCardProps) {
  const product = review.product;

  return (
    <article className="min-w-0 rounded-xl border border-border bg-glass-bg p-3">
      {/* Durum etiketi — referansta kartın sol üstünde duruyor. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {review.isApproved ? (
          <span className="acc-chip-success inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium">
            <CheckCircle2 size={11} aria-hidden="true" />
            Yayında
          </span>
        ) : (
          <span className="acc-chip-warning inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium">
            <Clock size={11} aria-hidden="true" />
            Onay bekliyor
          </span>
        )}

        {review.isVerified && (
          <span className="acc-chip-info inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium">
            <ShieldCheck size={11} aria-hidden="true" />
            Doğrulanmış alışveriş
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
          {product?.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="64px"
              className="object-contain p-0.5"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package size={18} className="text-foreground-disabled" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {product?.brand && (
            <p className="account-eyebrow">
              {product.brand}
            </p>
          )}

          {product ? (
            <Link
              href={`/urun/${product.slug}?tab=yorumlar`}
              className="line-clamp-2 break-words text-[13px] text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)]"
            >
              {product.name}
            </Link>
          ) : (
            <p className="text-[13px] text-foreground-tertiary">
              Ürün artık satışta değil
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2">
            {/* role="img": `aria-label` çıplak `span`'de duyurulmuyordu; yıldızlar
                tek bir grafik olarak okunsun, beş ayrı svg olarak değil. */}
            <span
              role="img"
              aria-label={`5 üzerinden ${review.rating} yıldız`}
              className="flex items-center gap-0.5"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    star <= review.rating
                      ? "text-[color:var(--pill-accent-amber)]"
                      : "text-foreground-disabled"
                  }
                  fill={star <= review.rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              ))}
            </span>
            <span className="text-[11px] text-foreground-muted">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(review)}
          aria-label={
            product
              ? `${product.name} değerlendirmemi düzenle`
              : "Değerlendirmemi düzenle"
          }
          className="account-icon-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-glass-bg-hover hover:text-foreground"
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3">
        {review.title && (
          <p className="mb-1 text-[13px] font-medium text-foreground">{review.title}</p>
        )}
        <p className="whitespace-pre-line break-words text-[13px] leading-relaxed text-foreground-secondary">
          {review.comment}
        </p>

        {review.images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {review.images.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={url}
                  alt={`Değerlendirme görseli ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        )}

        {review.displayName && (
          <p className="mt-2 text-[11px] text-foreground-muted">
            Yorumda görünen ad: {review.displayName}
          </p>
        )}
      </div>

      {/* Mağaza yanıtı — referansta yok, bizde var. */}
      {review.adminReply && (
        <div className="account-inset mt-3 rounded-lg border border-border p-3">
          <p className="acc-tone-accent mb-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            <Store size={11} aria-hidden="true" />
            FusionMarkt yanıtı
            {review.adminReplyAt && (
              <span className="font-normal text-foreground-muted">
                · {formatDate(review.adminReplyAt)}
              </span>
            )}
          </p>
          <p className="whitespace-pre-line break-words text-[12px] leading-relaxed text-foreground-secondary">
            {review.adminReply}
          </p>
        </div>
      )}
    </article>
  );
}
