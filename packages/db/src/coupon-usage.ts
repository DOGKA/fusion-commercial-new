/**
 * Kupon kullanım sayımı — TEK KURAL, İKİ UYGULAMA.
 *
 * Burada durmasının sebebi: hem storefront (doğrulama + sipariş oluşturma) hem
 * admin paneli (kupon listesi, kupon detayı, analitik) aynı sayıyı göstermek
 * zorunda. İki yerde iki tanım olsa müşteriye "limit doldu" derken admin
 * panelinde "hiç kullanılmamış" yazardı.
 *
 * ── SAYAÇ NEDEN SAKLANMIYOR, TÜRETİLİYOR ─────────────────────────────────────
 * `Coupon.usageCount` kolonu sipariş oluşturulurken artıyordu ve **hiçbir yerde
 * geri alınmıyordu**. Yani ödemesi başarısız olan (para alınmamış) veya iptal
 * edilen siparişler de kuponu tüketmiş sayılıyordu: 50 kişilik bir kupon, 50
 * başarısız kart denemesiyle tükenebilirdi.
 *
 * Kolonu geri alma yolunu seçmedik, çünkü siparişi iptal eden/başarısızlaştıran
 * yol sayısı fazla (admin tek sipariş güncelleme, toplu güncelleme, sipariş
 * silme, ödeme callback'i) ve **birini atlamak sessizce yanlış sayıya** yol
 * açardı. Bunun yerine sayı her seferinde `Order` tablosundan hesaplanıyor:
 * kaydın kendisi kanıt olduğu için sayaç hiç kayamaz, geriye dönük düzeltme
 * gerekmez. Kişi başı sayım (`perUserLimit`) da zaten böyle çalışıyor.
 *
 * ── HANGİ SİPARİŞ "KULLANILMIŞ" SAYILIR ──────────────────────────────────────
 * Elenenler:
 *  - `status: CANCELLED` — sipariş iptal, indirim geçersiz, stok geri verilmiş.
 *  - `paymentStatus: FAILED` — para alınmadı. Kart reddedilince sipariş
 *    silinmiyor, `PENDING` + `FAILED` olarak kalıyor
 *    (`fusionmarkt/src/app/api/payment/callback/route.ts`). Sayılsaydı tek bir
 *    kart reddi hem kuponun genel hakkını hem müşterinin kişisel hakkını
 *    yakardı; müşteri ödemeyi tekrar deneyemezdi.
 *
 * Sayılanlar: ödemesi bekleyen havale siparişleri (indirim rezerve edilmiş) ve
 * `REFUNDED` siparişler (indirim o an gerçekten işledi; ürünün sonradan iade
 * edilmesi kupon hakkını geri getirmiyor).
 */

import type { Prisma, PrismaClient } from "@prisma/client";

/** `Order` üzerinde "bu kupon fiilen kullanıldı" filtresi. */
export const USED_COUPON_ORDER_FILTER = {
  status: { not: "CANCELLED" },
  paymentStatus: { not: "FAILED" },
} satisfies Pick<Prisma.OrderWhereInput, "status" | "paymentStatus">;

/** Transaction içinde de çağrılabilsin diye istemci parametre olarak alınıyor. */
export type CouponUsageClient = PrismaClient | Prisma.TransactionClient;

// ─── MAĞAZA GENELİ (`Coupon.usageLimit`) ──────────────────────────────────────

/** Kuponun kaç geçerli siparişte kullanıldığı (tüm müşteriler). */
export async function countCouponUsage(
  client: CouponUsageClient,
  couponId: string
): Promise<number> {
  return client.order.count({
    where: { couponId, ...USED_COUPON_ORDER_FILTER },
  });
}

/** Birden çok kupon için tek sorguda sayım — liste ekranları için. */
export async function countCouponUsageMany(
  client: CouponUsageClient,
  couponIds: string[]
): Promise<Map<string, number>> {
  return groupCountByCoupon(client, couponIds, {});
}

/** `usageLimit` null ise sınır yok. */
export function isUsageLimitReached(
  usageLimit: number | null,
  usedCount: number
): boolean {
  if (usageLimit === null) return false;
  return usedCount >= usageLimit;
}

// ─── KİŞİ BAŞI (`Coupon.perUserLimit`) ────────────────────────────────────────

/** Kullanıcının bu kuponla verdiği geçerli sipariş sayısı. */
export async function countUserCouponUsage(
  client: CouponUsageClient,
  userId: string,
  couponId: string
): Promise<number> {
  return client.order.count({
    where: { userId, couponId, ...USED_COUPON_ORDER_FILTER },
  });
}

/** Birden çok kupon için tek sorguda kişisel sayım. */
export async function countUserCouponUsageMany(
  client: CouponUsageClient,
  userId: string,
  couponIds: string[]
): Promise<Map<string, number>> {
  return groupCountByCoupon(client, couponIds, { userId });
}

/**
 * Kişisel hak tükendi mi?
 *
 * `perUserLimit <= 0` "sınır yok" demek: alan `@default(1)` ve `Int` (nullable
 * değil), dolayısıyla "sınırsız"ı ifade etmenin tek yolu 0 (veya negatif).
 */
export function isPerUserLimitReached(
  perUserLimit: number,
  usedCount: number
): boolean {
  if (perUserLimit <= 0) return false;
  return usedCount >= perUserLimit;
}

// ─── ortak ────────────────────────────────────────────────────────────────────

async function groupCountByCoupon(
  client: CouponUsageClient,
  couponIds: string[],
  extraWhere: Prisma.OrderWhereInput
): Promise<Map<string, number>> {
  if (couponIds.length === 0) return new Map();

  const rows = await client.order.groupBy({
    by: ["couponId"],
    where: { couponId: { in: couponIds }, ...extraWhere, ...USED_COUPON_ORDER_FILTER },
    _count: { _all: true },
  });

  return new Map(
    rows
      .filter((row): row is typeof row & { couponId: string } => row.couponId !== null)
      .map((row) => [row.couponId, row._count._all])
  );
}
