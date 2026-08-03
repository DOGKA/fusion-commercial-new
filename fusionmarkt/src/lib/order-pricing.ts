/**
 * Sipariş tutarının sunucuda hesaplanması — tek yetkili kaynak.
 *
 * NEDEN VAR: Bu dosyadan önce sipariş tutarı **tamamen istemciden** geliyordu.
 * `POST /api/orders` gövdedeki `total`/`subtotal`/`discount`'ı olduğu gibi
 * kaydediyor, `POST /api/payment/initialize` ise gövdedeki `price`'ı olduğu gibi
 * iyzico'ya gönderiyordu. Yani isteği düzenleyen biri 50.000 ₺'lik sepeti 1 ₺'ye
 * ödeyebiliyordu; sipariş de 1 ₺ olarak kaydoluyordu. Hiçbir yerde ürün fiyatı
 * veritabanından okunup toplam yeniden hesaplanmıyordu.
 *
 * ÇALIŞMA BİÇİMİ: İstemcinin gönderdiği fiyatlara **hiç güvenilmiyor**; her
 * kalemin birim fiyatı veritabanından okunuyor ve toplam burada kuruluyor.
 * İstemcinin iddiası yalnızca **karşılaştırma** için kullanılıyor:
 *
 *  - İstemcinin toplamı sunucunun toplamından **düşükse** istek reddediliyor.
 *    Bu ya kurcalama ya da sayfa açıldıktan sonra zam gelmesi demek; ikisinde de
 *    müşteriden gördüğünden fazlasını tahsil etmek doğru olmaz.
 *  - İstemcinin toplamı **yüksekse** sunucunun (düşük) toplamı geçerli.
 *    Fiyat düşmüşse müşteri kârlı çıkar, mağaza zarar etmez.
 *
 * İNDİRİMDE FARKLI DAVRANIŞ: Kupon indirimi burada birebir yeniden
 * hesaplanmıyor, **üst sınırı** hesaplanıyor (bkz. `couponDiscountCap`).
 * Sebebi: `validate-coupon` kategori/ürün kısıtlarına göre "uygun tutar"
 * çıkarıyor ve o mantığı burada birebir tekrarlamak, aradaki en küçük sapmada
 * gerçek siparişleri reddederdi. Üst sınır yaklaşımı uydurma indirimi
 * ("discount: 999999") kesiyor, meşru indirime dokunmuyor.
 */

import { prisma } from "@/lib/prisma";

/** Kuruş farklarını yok saymak için eşik. */
const EPSILON = 0.01;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Ödeme akışının sepet kalemi (`checkout/payment/page.tsx` bu şekli üretiyor). */
export interface CartLineInput {
  productId?: string | null;
  quantity?: unknown;
  /** İstemcinin iddia ettiği birim fiyat — yalnızca karşılaştırma için. */
  price?: unknown;
  variantId?: string | null;
  variant?: { id?: string | null } | null;
  isBundle?: boolean;
  bundleId?: string | null;
}

export interface PricedLine {
  productId: string | null;
  bundleId: string | null;
  variantId: string | null;
  name: string;
  quantity: number;
  /** Veritabanından okunan birim fiyat. */
  unitPrice: number;
  lineTotal: number;
}

export interface OrderPricing {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export type PricingResult =
  | { ok: true; pricing: OrderPricing }
  | { ok: false; error: string; code: string };

/**
 * Sepeti veritabanı fiyatlarıyla fiyatlandırır.
 *
 * Pasif ürün/paket ve bulunamayan kayıt hata döndürür: sepette kalmış eski bir
 * ürünün sessizce 0 ₺'ye geçmesi, kurcalamayla aynı sonucu verirdi.
 */
async function priceLines(
  items: CartLineInput[]
): Promise<{ ok: true; lines: PricedLine[] } | { ok: false; error: string; code: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Sepet boş", code: "EMPTY_CART" };
  }

  const productIds = [
    ...new Set(
      items.filter((item) => !item.isBundle && item.productId).map((item) => item.productId as string)
    ),
  ];
  const bundleIds = [
    ...new Set(
      items.filter((item) => item.isBundle && item.bundleId).map((item) => item.bundleId as string)
    ),
  ];
  const variantIds = [
    ...new Set(
      items
        .map((item) => item.variantId ?? item.variant?.id ?? null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const [products, bundles, variants] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true, isActive: true },
        })
      : Promise.resolve([]),
    bundleIds.length
      ? prisma.bundle.findMany({
          where: { id: { in: bundleIds } },
          select: { id: true, name: true, price: true, isActive: true },
        })
      : Promise.resolve([]),
    variantIds.length
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, productId: true, price: true, salePrice: true, isActive: true },
        })
      : Promise.resolve([]),
  ]);

  const productById = new Map(products.map((row) => [row.id, row]));
  const bundleById = new Map(bundles.map((row) => [row.id, row]));
  const variantById = new Map(variants.map((row) => [row.id, row]));

  const lines: PricedLine[] = [];

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return { ok: false, error: "Ürün adedi geçersiz", code: "INVALID_QUANTITY" };
    }

    if (item.isBundle) {
      const bundle = item.bundleId ? bundleById.get(item.bundleId) : undefined;
      if (!bundle || !bundle.isActive) {
        return {
          ok: false,
          error: "Sepetinizdeki bir paket artık satışta değil. Lütfen sepetinizi güncelleyin.",
          code: "BUNDLE_UNAVAILABLE",
        };
      }
      const unitPrice = Number(bundle.price);
      lines.push({
        productId: item.productId ?? null,
        bundleId: bundle.id,
        variantId: null,
        name: bundle.name,
        quantity,
        unitPrice,
        lineTotal: round2(unitPrice * quantity),
      });
      continue;
    }

    const product = item.productId ? productById.get(item.productId) : undefined;
    if (!product || !product.isActive) {
      return {
        ok: false,
        error: "Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin.",
        code: "PRODUCT_UNAVAILABLE",
      };
    }

    // Fiyat kuralı ürün sayfası ve checkout doğrulamasıyla aynı olmalı:
    // salePrice → price → product.price. Aksi hâlde indirimli varyantlar ödeme
    // öncesinde geçerli görünürken sipariş oluşturulurken kalıcı 409'a düşer.
    const variantId = item.variantId ?? item.variant?.id ?? null;
    let unitPrice = Number(product.price);
    if (variantId) {
      const variant = variantById.get(variantId);
      if (!variant || !variant.isActive || variant.productId !== product.id) {
        return {
          ok: false,
          error: "Seçtiğiniz ürün seçeneği artık geçerli değil. Lütfen sepetinizi güncelleyin.",
          code: "VARIANT_UNAVAILABLE",
        };
      }
      if (variant.salePrice !== null) {
        unitPrice = Number(variant.salePrice);
      } else if (variant.price !== null) {
        unitPrice = Number(variant.price);
      }
    }

    lines.push({
      productId: product.id,
      bundleId: null,
      variantId,
      name: product.name,
      quantity,
      unitPrice,
      lineTotal: round2(unitPrice * quantity),
    });
  }

  return { ok: true, lines };
}

/**
 * Kargo bedeli — `POST /api/public/shipping/calculate` ile **aynı kurallar**.
 *
 * Kural seti bilinçli olarak orada da burada da duruyor gibi görünmesin diye o
 * uç da bu fonksiyonu çağırıyor. Müşteriye sunulan bir kargo seçimi yok: her
 * durumda tek bir bedel çıkıyor, dolayısıyla sunucu tarafında yeniden
 * hesaplamak belirsizlik taşımıyor.
 */
export async function calculateShippingCost(
  productIds: string[],
  cartTotal: number
): Promise<{ cost: number; freeShippingLimit: number; hasHeavyClass: boolean; hasFreeShipping: boolean }> {
  const DEFAULT_FREE_SHIPPING_LIMIT = 2000;
  const DEFAULT_SHIPPING_COST = 100;
  const HEAVY_CLASS_SHIPPING_COST = 1000;

  const [products, shippingSettings, shippingClasses] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, freeShipping: true, shippingClass: true, weight: true },
        })
      : Promise.resolve([]),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    prisma.$queryRaw<Array<{ slug: string; cost: number }>>`
      SELECT slug, cost FROM shipping_classes WHERE slug = 'standart-kargo' LIMIT 1
    `,
  ]);

  const freeShippingLimit = shippingSettings?.freeShippingLimit
    ? Number(shippingSettings.freeShippingLimit)
    : DEFAULT_FREE_SHIPPING_LIMIT;
  const standardShippingCost = shippingClasses[0]?.cost
    ? Number(shippingClasses[0].cost)
    : DEFAULT_SHIPPING_COST;

  const hasHeavyClass = products.some(
    (p) =>
      p.shippingClass === "agir-sinif-kargo" ||
      p.shippingClass?.includes("agir") ||
      (p.weight && Number(p.weight) >= 20)
  );

  // Ağır sınıf ücretsiz kargoya dahil değil, kendi bedeliyle gidiyor.
  if (hasHeavyClass) {
    return {
      cost: HEAVY_CLASS_SHIPPING_COST,
      freeShippingLimit,
      hasHeavyClass: true,
      hasFreeShipping: false,
    };
  }

  const hasFreeShipping =
    products.some((p) => p.freeShipping === true) ||
    products.some((p) => p.shippingClass === "ucretsiz-kargo") ||
    cartTotal >= freeShippingLimit;

  return {
    cost: hasFreeShipping ? 0 : standardShippingCost,
    freeShippingLimit,
    hasHeavyClass: false,
    hasFreeShipping,
  };
}

/**
 * Bir kuponun verebileceği **en yüksek** indirim.
 *
 * Kasten gevşek: uygun tutar yerine sepetin tamamı üzerinden hesaplanıyor.
 * Amaç meşru indirimi yeniden üretmek değil, uydurma indirimi kesmek. Kupon
 * geçersizse üst sınır 0 — yani kuponsuz indirim mümkün değil.
 */
async function couponDiscountCap(couponId: string | null, subtotal: number): Promise<number> {
  if (!couponId) return 0;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    select: {
      isActive: true,
      startDate: true,
      endDate: true,
      discountType: true,
      discountValue: true,
      maxDiscount: true,
    },
  });

  if (!coupon || !coupon.isActive) return 0;

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) return 0;
  if (coupon.endDate && coupon.endDate < now) return 0;

  let cap: number;
  if (coupon.discountType === "PERCENTAGE") {
    cap = (subtotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount) cap = Math.min(cap, Number(coupon.maxDiscount));
  } else {
    cap = Number(coupon.discountValue);
  }

  return round2(Math.min(cap, subtotal));
}

/**
 * Siparişin sunucu tarafı tutarları.
 *
 * `claimedDiscount` istemcinin uyguladığı indirim; üst sınırı aşarsa sınıra
 * çekiliyor (istek reddedilmiyor, çünkü fazlası zaten uygulanmayacak).
 */
export async function computeOrderPricing(options: {
  items: CartLineInput[];
  couponId?: string | null;
  claimedDiscount?: unknown;
}): Promise<PricingResult> {
  const priced = await priceLines(options.items);
  if (!priced.ok) return priced;

  const subtotal = round2(priced.lines.reduce((sum, line) => sum + line.lineTotal, 0));

  const productIds = priced.lines
    .map((line) => line.productId)
    .filter((id): id is string => Boolean(id));

  const [{ cost: shipping }, cap] = await Promise.all([
    calculateShippingCost(productIds, subtotal),
    couponDiscountCap(options.couponId ?? null, subtotal),
  ]);

  const claimed = Number(options.claimedDiscount);
  const discount = round2(
    Math.max(0, Math.min(Number.isFinite(claimed) ? claimed : 0, cap))
  );

  const total = round2(subtotal - discount + shipping);

  return {
    ok: true,
    pricing: { lines: priced.lines, subtotal, shipping, discount, total },
  };
}

/**
 * İstemcinin toplamı sunucununkinden düşük mü?
 *
 * Düşükse ya kurcalama var ya da sayfa açıldıktan sonra fiyat/kargo değişmiş.
 * İkisinde de doğru davranış aynı: işlemi durdurup sepeti tazeletmek. Yüksekse
 * sorun yok, sunucunun düşük toplamı geçerli olur.
 */
export function claimedTotalIsTooLow(claimedTotal: unknown, serverTotal: number): boolean {
  const claimed = Number(claimedTotal);
  if (!Number.isFinite(claimed)) return true;
  return claimed < serverTotal - EPSILON;
}

export const PRICE_MISMATCH_MESSAGE =
  "Sepetinizdeki tutar güncellendi. Lütfen sayfayı yenileyip tekrar deneyiniz.";

/**
 * iyzico sepet kalemleri.
 *
 * iyzico `basketItems` toplamının `price` ile **kuruşu kuruşuna** eşit olmasını
 * şart koşuyor. Bu yüzden indirim kalemlere orantılı dağıtılıyor, kargo ayrı
 * kalem olarak ekleniyor ve yuvarlama farkı son kalemde kapatılıyor — aksi
 * hâlde iyzico isteği reddediyor.
 */
export function buildIyzicoBasket(pricing: OrderPricing): Array<{
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}> {
  const ratio = pricing.subtotal > 0 ? (pricing.subtotal - pricing.discount) / pricing.subtotal : 1;

  const basket = pricing.lines.map((line) => ({
    id: line.bundleId ?? line.productId ?? "ITEM",
    name: line.name.substring(0, 50),
    category: line.bundleId ? "Paket" : "Genel",
    price: round2(line.unitPrice * ratio),
    quantity: line.quantity,
  }));

  if (pricing.shipping > 0) {
    basket.push({
      id: "SHIPPING",
      name: "Kargo Ücreti",
      category: "Hizmet",
      price: pricing.shipping,
      quantity: 1,
    });
  }

  const sum = round2(basket.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const drift = round2(pricing.total - sum);
  if (drift !== 0 && basket.length > 0) {
    const last = basket[basket.length - 1];
    last.price = round2(last.price + drift / last.quantity);
  }

  return basket;
}
