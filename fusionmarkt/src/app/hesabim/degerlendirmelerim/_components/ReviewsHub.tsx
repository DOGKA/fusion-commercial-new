"use client";

/**
 * Değerlendirmelerim — iki sekmenin paylaştığı gövde.
 *
 * Sekmeler URL: `/hesabim/degerlendirmelerim` ve `.../bekleyenler`. İkisi de bu
 * bileşeni `tab` prop'uyla çağırıyor, çünkü sekme SAYAÇLARI için her iki listenin
 * sayısı gerekiyor — tek istekle ikisi de geliyor (`GET /api/reviews/me`).
 *
 * "Satıcı Değerlendirmelerim" sekmesi YOK: tek satıcılı mağazayız, referansın o
 * sekmesi marketplace kavramı (`00-KARARLAR` madde 4).
 */

import { useCallback, useState } from "react";
import { Star, PackageCheck } from "lucide-react";
import {
  AccountTabs,
  AccountEmptyState,
  AccountErrorState,
  AccountSkeleton,
} from "../../_components/shared";
import ReviewFormSheet, { type ReviewTarget } from "@/components/review/ReviewFormSheet";
import { useMyReviews } from "../_lib/useMyReviews";
import type { MyReview, MyReviewsResponse, PendingReviewItem } from "../_lib/types";
import MyReviewCard from "./MyReviewCard";
import PendingReviewCard from "./PendingReviewCard";

interface ReviewsHubProps {
  tab: "done" | "pending";
  /** Sunucuda çekilen liste (F2-45); yoksa istemci kendisi çeker. */
  initialData?: MyReviewsResponse | null;
}

export default function ReviewsHub({ tab, initialData }: ReviewsHubProps) {
  const { data, loading, error, reload } = useMyReviews(initialData);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  const openEdit = useCallback((review: MyReview) => {
    setReviewTarget({
      productId: review.productId,
      bundleId: review.bundleId,
      productName: review.product?.name ?? "Ürün",
      productImage: review.product?.thumbnail ?? null,
      existingReview: {
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
      },
    });
  }, []);

  const openNew = useCallback((item: PendingReviewItem, rating: number) => {
    setReviewTarget({
      productId: item.productId,
      bundleId: item.bundleId,
      productName: item.name,
      productImage: item.thumbnail,
      initialRating: rating,
    });
  }, []);

  const tabs = [
    {
      href: "/hesabim/degerlendirmelerim",
      label: "Değerlendirdiklerim",
      count: data?.reviews.length,
      countLoading: loading,
    },
    {
      href: "/hesabim/degerlendirmelerim/bekleyenler",
      label: "Değerlendirme Bekleyenler",
      count: data?.pending.length,
      countLoading: loading,
    },
  ];

  return (
    <div>
      <AccountTabs items={tabs} ariaLabel="Değerlendirme sekmeleri" />

      {loading ? (
        <div className="mt-5">
          <AccountSkeleton variant="productCard" count={3} />
        </div>
      ) : error ? (
        <div className="mt-5">
          <AccountErrorState message={error} onRetry={reload} />
        </div>
      ) : !data ? null : (
        <div className="mt-5">
          {tab === "done" ? (
            data.reviews.length === 0 ? (
              <AccountEmptyState
                icon={Star}
                title="Henüz değerlendirme yapmadın"
                description={
                  data.pending.length > 0
                    ? `${data.pending.length} ürün değerlendirmeni bekliyor.`
                    : "Teslim aldığın ürünleri buradan değerlendirebilirsin."
                }
                action={
                  data.pending.length > 0
                    ? {
                        label: "Bekleyenleri gör",
                        href: "/hesabim/degerlendirmelerim/bekleyenler",
                      }
                    : { label: "Alışverişe başla", href: "/magaza" }
                }
              />
            ) : (
              <div className="space-y-3">
                {data.reviews.map((review) => (
                  <MyReviewCard key={review.id} review={review} onEdit={openEdit} />
                ))}
              </div>
            )
          ) : data.pending.length === 0 ? (
            <AccountEmptyState
              icon={PackageCheck}
              title="Değerlendirme bekleyen ürün yok"
              description={
                data.reviews.length > 0
                  ? "Teslim aldığın tüm ürünleri değerlendirdin."
                  : "Teslim edilen siparişlerindeki ürünler burada listelenir."
              }
              action={
                data.reviews.length > 0
                  ? {
                      label: "Değerlendirdiklerimi gör",
                      href: "/hesabim/degerlendirmelerim",
                    }
                  : { label: "Siparişlerime git", href: "/hesabim/siparisler" }
              }
            />
          ) : (
            <>
              <p className="mb-3 text-[12px] text-foreground-muted">
                Puan vermek için yıldızlara dokun — değerlendirme formu o puanla
                açılır.
              </p>
              <div className="space-y-3">
                {data.pending.map((item) => (
                  <PendingReviewCard
                    key={item.key}
                    item={item}
                    onPickRating={openNew}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <ReviewFormSheet
        target={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSuccess={() => void reload()}
      />
    </div>
  );
}
