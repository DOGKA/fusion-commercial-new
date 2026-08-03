/**
 * Değerlendirmelerim sorgusu — tek kaynak.
 *
 * Hem `GET /api/reviews/me` hem de sayfanın sunucu tarafı ilk render'ı (F2-45)
 * bunu kullanıyor. Mantık route handler'ında kalsaydı sayfa import edemez,
 * iki kopya zamanla ayrışırdı.
 *
 * ── "Bekleyenler" NEDEN SUNUCUDA HESAPLANIYOR ────────────────────────────────
 * Plan bunu istemcide türetmeyi öngörüyordu: `GET /api/orders`'tan teslim
 * edilmiş siparişleri çek, yorum yazılanları çıkar. O yol iki yerde kırılıyor:
 *  1. `/api/orders` sayfa başına en fazla 50 sipariş veriyor (`MAX_LIMIT`).
 *     51. siparişten sonraki ürünler bekleyenler listesinde hiç görünmezdi.
 *  2. O uç sipariş başına adres, tutar ve talep özetlerini de taşıyor; liste
 *     için gereken tek şey ürün kimliği ve teslim tarihi.
 */

import { prisma } from "@/lib/prisma";
import type { MyReviewsResponse } from "@/app/hesabim/degerlendirmelerim/_lib/types";

/** Ürün ve paket kimliklerini tek küme içinde ayırt edebilmek için. */
const productKey = (id: string) => `p:${id}`;
const bundleKey = (id: string) => `b:${id}`;

const iso = (value: Date | null | undefined): string | null =>
  value ? value.toISOString() : null;

export async function getMyReviews(userId: string): Promise<MyReviewsResponse> {
  const [reviews, deliveredOrders] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productId: true,
        bundleId: true,
        rating: true,
        title: true,
        comment: true,
        images: true,
        displayName: true,
        isVerified: true,
        isApproved: true,
        adminReply: true,
        adminReplyAt: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: { id: true, name: true, slug: true, thumbnail: true, images: true, brand: true },
        },
        bundle: {
          select: { id: true, name: true, slug: true, thumbnail: true, images: true, brand: true },
        },
      },
    }),

    // Değerlendirme yalnızca teslim edilmiş siparişlerde açılıyor
    // (`lib/orders.ts` `canReview`), o yüzden filtre burada da `DELIVERED`.
    prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      orderBy: { deliveredAt: "desc" },
      select: {
        orderNumber: true,
        deliveredAt: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            bundleId: true,
            variantInfo: true,
            product: {
              select: { id: true, name: true, slug: true, thumbnail: true, images: true, brand: true },
            },
            bundle: {
              select: { id: true, name: true, slug: true, thumbnail: true, images: true, brand: true },
            },
          },
        },
      },
    }),
  ]);

  const reviewed = new Set(
    reviews.flatMap((r) => [
      ...(r.productId ? [productKey(r.productId)] : []),
      ...(r.bundleId ? [bundleKey(r.bundleId)] : []),
    ])
  );

  /**
   * Bekleyenler. Aynı ürün birden fazla siparişte olabilir; `seen` kümesi
   * tekrarları eler ve siparişler teslim tarihine göre sıralı geldiği için
   * elde kalan kayıt EN YENİ teslimat olur.
   *
   * Katalogdan silinmiş ürünler (`product === null`) atlanıyor: yorum
   * `productId` ile yazılıyor ve `POST /api/reviews` ürünün varlığını
   * doğruluyor, yani o kalem için form açılsa bile gönderim reddedilirdi.
   */
  const seen = new Set<string>();
  const pending: MyReviewsResponse["pending"] = [];

  for (const order of deliveredOrders) {
    for (const item of order.items) {
      const target = item.product ?? item.bundle;
      if (!target) continue;

      const key = item.productId
        ? productKey(item.productId)
        : item.bundleId
          ? bundleKey(item.bundleId)
          : null;
      if (!key || reviewed.has(key) || seen.has(key)) continue;

      seen.add(key);
      pending.push({
        key,
        orderItemId: item.id,
        productId: item.productId,
        bundleId: item.bundleId,
        name: target.name,
        slug: target.slug,
        thumbnail: target.thumbnail || target.images?.[0] || null,
        brand: target.brand,
        variantInfo: item.variantInfo ? JSON.parse(item.variantInfo) : null,
        orderNumber: order.orderNumber,
        // ISO metin: SSR yolunda Date nesnesi istemciye geçmez (bkz. dilim 21).
        deliveredAt: (order.deliveredAt ?? order.createdAt).toISOString(),
      });
    }
  }

  const total = reviews.length;
  const pendingApproval = reviews.filter((r) => !r.isApproved).length;

  return {
    reviews: reviews.map((r) => {
      const target = r.product ?? r.bundle;
      return {
        id: r.id,
        productId: r.productId,
        bundleId: r.bundleId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images,
        displayName: r.displayName,
        isVerified: r.isVerified,
        isApproved: r.isApproved,
        adminReply: r.adminReply,
        adminReplyAt: iso(r.adminReplyAt),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        // Ürün silinmişse yorum kaydı `onDelete: Cascade` ile birlikte
        // gittiği için normalde buraya düşmez; yine de savunmacı davranıyoruz.
        product: target
          ? {
              name: target.name,
              slug: target.slug,
              thumbnail: target.thumbnail || target.images?.[0] || null,
              brand: target.brand,
            }
          : null,
      };
    }),

    pending,

    stats: {
      total,
      /**
       * Kullanıcının VERDİĞİ ortalama puan — ürünlerin ortalaması değil.
       * Yorum yoksa `null`; sıfır göstermek "0 puan verdin" gibi okunur.
       */
      average: total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : null,
      pendingApproval,
      awaitingReview: pending.length,
    },
  };
}
