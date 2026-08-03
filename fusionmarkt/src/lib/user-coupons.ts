/**
 * "Kuponlarım" listesinin sorgusu — tek kaynak.
 *
 * Neden ayrı dosya: aynı listeyi hem `GET /api/user/coupons` hem de sayfanın
 * sunucu tarafı ilk render'ı (F2-45) kullanıyor. Mantık route handler'ında
 * kalsaydı sayfa onu import edemez, sorgu ikinci kez yazılırdı — iki kopya
 * zamanla birbirinden ayrılır. `lib/wishlist.ts` aynı deseni izliyor.
 *
 * KİŞİSELLEŞTİRME YOK: kişiye özel kupon atama (`UserCoupon`) bilinçli olarak
 * kapsam dışı. Listeyi belirleyen tek şey `Coupon.showInMyCoupons` bayrağı, yani
 * tüm oturumlu kullanıcılar aynı kuponları görüyor.
 *
 * BAYRAK KULLANIM HAKKI DEĞİL, DUYURU: bayrağı kapalı bir kupon da geçerlidir,
 * onu yalnızca kodu bilenler kullanır. Buradaki liste "kodunu duyurduğumuz
 * kuponlar"; kaç kez kullanılabileceğini `perUserLimit` belirliyor.
 *
 * SAYAÇ GÖSTERİLMİYOR: mağaza geneli kullanım sayısı kullanıcıya özel değil.
 * "0/50" göstermek "bu kuponu 50 kez kullanabilirsin" gibi okunur. Onun yerine
 * tükenen kupon listeden tamamen düşürülüyor, sayı hiç dönmüyor.
 */

import { prisma } from "@/lib/prisma";
import {
  countCouponUsage,
  countCouponUsageMany,
  countUserCouponUsage,
  countUserCouponUsageMany,
  isPerUserLimitReached,
  isUsageLimitReached,
  perUserLimitMessage,
  USAGE_LIMIT_MESSAGE,
} from "@/lib/coupon-usage";
import type {
  UserCoupon,
  UserCouponsResponse,
  CouponUrgency,
} from "@/app/hesabim/kuponlar/_lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Son geçerlilik tarihine kalan süreye göre aciliyet etiketi.
 *
 * Gün sayısı yukarı yuvarlanıyor: bugün bitiyorsa (kalan < 1 gün) "son gün".
 * `endDate` yoksa kupon süresiz, etiket de yok.
 */
function urgencyOf(endDate: Date | null, now: Date): CouponUrgency {
  if (!endDate) return null;
  const remaining = endDate.getTime() - now.getTime();
  if (remaining <= DAY_MS) return "last_day";
  if (remaining <= 3 * DAY_MS) return "last_3_days";
  if (remaining <= 7 * DAY_MS) return "last_7_days";
  return null;
}

const formatAmount = (value: number) =>
  value.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

/**
 * Kartın orta bandındaki koşul cümlesi.
 *
 * Admin bir `description` yazdıysa ona dokunulmuyor — elle yazılmış metin her
 * zaman türetilenden iyi. Yoksa indirim + alt limit + üst sınırdan cümle kurulur.
 */
function conditionTextOf(coupon: {
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  freeShipping: boolean;
}): string {
  if (coupon.description?.trim()) return coupon.description.trim();

  const discount =
    coupon.discountType === "PERCENTAGE"
      ? `%${formatAmount(coupon.discountValue)} indirim`
      : `${formatAmount(coupon.discountValue)} ₺ indirim`;

  const parts: string[] = [];

  if (coupon.minOrderAmount && coupon.minOrderAmount > 0) {
    parts.push(`${formatAmount(coupon.minOrderAmount)} ₺ ve üzeri alışverişlerde ${discount}`);
  } else {
    parts.push(`Tüm siparişlerde ${discount}`);
  }

  if (coupon.discountType === "PERCENTAGE" && coupon.maxDiscount) {
    parts.push(`en fazla ${formatAmount(coupon.maxDiscount)} ₺`);
  }

  if (coupon.freeShipping) {
    parts.push("ücretsiz kargo");
  }

  return `${parts.join(", ")}.`;
}

/**
 * Kullanıcının "Kuponlarım" ekranında göreceği kuponlar.
 *
 * Tükenmiş (mağaza geneli) ve kişisel hakkı dolmuş kuponlar listeye hiç
 * girmiyor — kodu görüp kopyalayıp ödeme adımında "kullandınız" duvarına
 * çarpmak en kötü sıra.
 */
/** Kart çizmek için gereken alanlar; liste ve tek kod sorgusu aynı seti okuyor. */
const couponCardSelect = {
  id: true,
  code: true,
  description: true,
  discountType: true,
  discountValue: true,
  minOrderAmount: true,
  maxDiscount: true,
  usageLimit: true,
  perUserLimit: true,
  endDate: true,
  freeShipping: true,
  excludeSaleItems: true,
  allowedCategories: true,
  allowedProducts: true,
  excludedCategories: true,
  excludedProducts: true,
} as const;

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: unknown;
  minOrderAmount: unknown;
  maxDiscount: unknown;
  usageLimit: number | null;
  perUserLimit: number;
  endDate: Date | null;
  freeShipping: boolean;
  excludeSaleItems: boolean;
  allowedCategories: string[];
  allowedProducts: string[];
  excludedCategories: string[];
  excludedProducts: string[];
};

export async function getUserCoupons(userId: string): Promise<UserCouponsResponse> {
  const now = new Date();

  const rows = await prisma.coupon.findMany({
    where: {
      showInMyCoupons: true,
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    select: couponCardSelect,
    // Aciliyeti olanlar önce: bitiş tarihi yakın olan üstte, süresiz kuponlar
    // en sonda. Eşitlikte yüksek indirim önce.
    orderBy: [{ endDate: { sort: "asc", nulls: "last" } }, { discountValue: "desc" }],
  });

  // Mağaza geneli tükenen kuponlar listeye hiç girmiyor. Sayı `usageCount`
  // kolonundan DEĞİL siparişlerden geliyor: kolon başarısız ödemelerde geri
  // alınmıyordu, yani kupon gerçekte tükenmemişken tükenmiş görünebilirdi.
  const limitedIds = rows.filter((c) => c.usageLimit !== null).map((c) => c.id);
  const totalUsageByCoupon = await countCouponUsageMany(prisma, limitedIds);

  const inStock = rows.filter(
    (c) => !isUsageLimitReached(c.usageLimit, totalUsageByCoupon.get(c.id) ?? 0)
  );

  const usageByCoupon = await countUserCouponUsageMany(
    prisma,
    userId,
    inStock.map((c) => c.id)
  );

  const available = inStock.filter(
    (c) => !isPerUserLimitReached(c.perUserLimit, usageByCoupon.get(c.id) ?? 0)
  );

  return { coupons: await toUserCoupons(available, now), count: available.length };
}

/**
 * Kupon satırlarını istemci sözleşmesine çevirir.
 *
 * Liste (`getUserCoupons`) ve tek kod sorgusu (`checkCouponCode`) aynı kartı
 * çiziyor; kısıt isimlerini çözen sorgular burada toplandı ki iki yol zamanla
 * farklı görünmesin.
 */
async function toUserCoupons(available: CouponRow[], now: Date): Promise<UserCoupon[]> {
  // Kısıtlar veritabanında ID dizisi; istemciye isim ve slug gidiyor. Tek
  // sorguda tüm kuponların kategorileri, tek sorguda ürünleri çekiliyor.
  const categoryIds = [
    ...new Set(available.flatMap((c) => [...c.allowedCategories, ...c.excludedCategories])),
  ];
  const productIds = [
    ...new Set(available.flatMap((c) => [...c.allowedProducts, ...c.excludedProducts])),
  ];

  const [categories, products] = await Promise.all([
    categoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true },
        })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const productById = new Map(products.map((p) => [p.id, p]));

  return available.map((coupon) => {
    const discountValue = Number(coupon.discountValue);
    const minOrderAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null;
    const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;

    // Silinmiş kategori/ürün ID'leri haritada yok — sessizce düşüyorlar.
    const allowedCategories = coupon.allowedCategories
      .map((id) => categoryById.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const allowedProducts = coupon.allowedProducts
      .map((id) => productById.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    const excludedCategories = coupon.excludedCategories
      .map((id) => categoryById.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const excludedProducts = coupon.excludedProducts
      .map((id) => productById.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    // "Ürünlere git" hedefi: kupon tek bir yere kilitliyse oraya, aksi halde
    // mağazaya. İstemci hiçbir zaman ID görmüyor.
    let targetUrl = "/magaza";
    if (allowedProducts.length === 1 && allowedCategories.length === 0) {
      targetUrl = `/urun/${allowedProducts[0].slug}`;
    } else if (allowedCategories.length === 1 && allowedProducts.length === 0) {
      targetUrl = `/kategori/${allowedCategories[0].slug}`;
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      endDate: coupon.endDate ? coupon.endDate.toISOString() : null,
      freeShipping: coupon.freeShipping,
      // Kişi başı kullanım hakkı. Kalan hak değil, toplam hak: kullanıcının
      // kaç kez kullandığını göstermek "1/1" gibi sayaçlara dönüşür, oysa
      // hakkı dolan kupon zaten listede yok. 0 = sınırsız.
      perUserLimit: coupon.perUserLimit,
      urgency: urgencyOf(coupon.endDate, now),
      conditionText: conditionTextOf({
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        freeShipping: coupon.freeShipping,
      }),
      targetUrl,
      restrictions: {
        categories: allowedCategories,
        products: allowedProducts,
        excludedCategories,
        excludedProducts,
        excludeSaleItems: coupon.excludeSaleItems,
      },
    };
  });
}

/**
 * Tek kupon kodunun kullanılabilirliği (F2-31).
 *
 * Listede olmayan kuponlar da geçerli olabilir: `showInMyCoupons` bir duyuru
 * bayrağı, kullanım hakkı değil. Kodu elinde olan kullanıcı burada kodun
 * çalışıp çalışmadığını ödeme adımına gelmeden görebiliyor.
 *
 * SEPET HESABI YOK: alt limit ("500 ₺ üzeri") ve sepet içeriğine bağlı
 * kısıtlar burada **kontrol edilmiyor**, yalnızca koşul olarak gösteriliyor.
 * Sepet boşken alt limiti kontrol etmek geçerli bir kuponu "geçersiz" diye
 * göstermek olurdu. Bağlayıcı kontrol ödeme adımındaki
 * `POST /api/public/validate-coupon` ve sipariş oluşturmada kalıyor.
 */
export type CouponCheckResult =
  | { found: true; coupon: UserCoupon; listed: boolean }
  | { found: false; reason: string };

export async function checkCouponCode(
  userId: string,
  rawCode: string
): Promise<CouponCheckResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { found: false, reason: "Kupon kodu giriniz." };

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    select: { ...couponCardSelect, isActive: true, startDate: true, showInMyCoupons: true },
  });

  // Var olmayan kod ile pasif kod aynı cevabı alıyor: farklı cevap vermek,
  // deneme yanılmayla geçerli kod aramayı kolaylaştırırdı.
  if (!coupon || !coupon.isActive) {
    return { found: false, reason: "Bu kod geçerli değil." };
  }

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    return { found: false, reason: "Bu kupon henüz başlamadı." };
  }
  if (coupon.endDate && coupon.endDate < now) {
    return { found: false, reason: "Bu kuponun süresi dolmuş." };
  }

  if (coupon.usageLimit !== null) {
    const totalUsed = await countCouponUsage(prisma, coupon.id);
    if (isUsageLimitReached(coupon.usageLimit, totalUsed)) {
      return { found: false, reason: USAGE_LIMIT_MESSAGE };
    }
  }

  const used = await countUserCouponUsage(prisma, userId, coupon.id);
  if (isPerUserLimitReached(coupon.perUserLimit, used)) {
    return { found: false, reason: perUserLimitMessage(coupon.perUserLimit) };
  }

  const [mapped] = await toUserCoupons([coupon], now);
  return { found: true, coupon: mapped, listed: coupon.showInMyCoupons };
}
