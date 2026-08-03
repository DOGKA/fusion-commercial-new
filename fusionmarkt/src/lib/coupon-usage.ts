/**
 * Kupon kullanım sayımı — storefront önyüzü.
 *
 * Sayma kuralının kendisi `@repo/db`'de (`packages/db/src/coupon-usage.ts`),
 * çünkü admin paneli de aynı sayıyı göstermek zorunda. Burada yalnızca
 * müşteriye gösterilen Türkçe metinler var; onlar veri katmanına ait değil.
 *
 * Kuralın özeti: sayı `Coupon.usageCount` kolonundan değil `Order` tablosundan
 * türetiliyor; iptal edilen ve **ödemesi başarısız** siparişler sayılmıyor.
 * Gerekçesi ve ayrıntısı `@repo/db` tarafındaki dosyada.
 */

export {
  USED_COUPON_ORDER_FILTER,
  countCouponUsage,
  countCouponUsageMany,
  countUserCouponUsage,
  countUserCouponUsageMany,
  isPerUserLimitReached,
  isUsageLimitReached,
} from "@repo/db";

/** Kişisel hakkı dolan müşteriye gösterilecek metin. */
export function perUserLimitMessage(perUserLimit: number): string {
  return perUserLimit === 1
    ? "Bu kuponu daha önce kullandınız."
    : `Bu kuponu en fazla ${perUserLimit} kez kullanabilirsiniz, hakkınız doldu.`;
}

/** Kuponun mağaza geneli hakkı dolduğunda gösterilecek metin. */
export const USAGE_LIMIT_MESSAGE = "Bu kupon kullanım limitine ulaşmış.";
