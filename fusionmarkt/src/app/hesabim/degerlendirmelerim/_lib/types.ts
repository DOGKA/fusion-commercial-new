/**
 * `GET /api/reviews/me` yanıt tipleri.
 *
 * Uç hem yazılmış yorumları hem "değerlendirmeni beklediğimiz" ürünleri tek
 * seferde döndürüyor; iki sekmenin sayacı da aynı yanıttan çıkıyor.
 */

export interface MyReviewProduct {
  name: string;
  slug: string;
  thumbnail: string | null;
  brand: string | null;
}

export interface MyReview {
  id: string;
  productId: string | null;
  bundleId: string | null;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  /** Yorumda görünen ad — kullanıcı tam ya da maskeli seçmiş olabilir. */
  displayName: string | null;
  isVerified: boolean;
  /**
   * `false` iki durumu birlikte taşıyor: onay bekliyor VE reddedildi. Ayırt
   * edemediğimiz için arayüzde asla "onaylanmadı" yazılmıyor (sicil F2-35).
   */
  isApproved: boolean;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: MyReviewProduct | null;
}

export interface PendingReviewItem {
  /** `p:<productId>` veya `b:<bundleId>` — liste anahtarı ve tekillik kontrolü. */
  key: string;
  orderItemId: string;
  productId: string | null;
  bundleId: string | null;
  name: string;
  slug: string;
  thumbnail: string | null;
  brand: string | null;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  orderNumber: string;
  deliveredAt: string;
}

export interface MyReviewStats {
  total: number;
  /** Kullanıcının verdiği ortalama puan; yorum yoksa `null`. */
  average: number | null;
  pendingApproval: number;
  awaitingReview: number;
}

export interface MyReviewsResponse {
  reviews: MyReview[];
  pending: PendingReviewItem[];
  stats: MyReviewStats;
}
