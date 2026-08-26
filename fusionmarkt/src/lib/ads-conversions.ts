/**
 * Google Ads dönüşüm event'leri.
 *
 * ZİNCİR: site → GA4 → Google Ads. Ads'teki ADD_TO_CART dönüşümünün kaynağı
 * "Web sitesi (Google Analytics (GA4))", yani olay önce GA4 mülküne düşmek
 * zorunda; Ads etiketine doğrudan göndermenin karşılığı yok.
 *
 * EVENT ADI RASTGELE DEĞİL: Ads dönüşüm işlemi tam olarak
 * `conversion_event_add_to_cart` adını bekliyor (Hedefler ekranındaki "GA4
 * etkinliği" alanı). Ad değişirse Ads dönüşümü saymayı bırakır.
 *
 * `send_to` ZORUNLU: gtag.js siteye GTM container'ındaki Google Ads etiketi
 * (AW-17546279426) üzerinden yükleniyor. Bu kurulumda `send_to` verilmeyen
 * event hiçbir hedefe ulaşmıyor — dataLayer'a giriyor ama ağa tek istek
 * çıkmıyor (26 Ağu 2026'da canlı sitede ölçüldü, dönüşüm bu yüzden 9 gün
 * boyunca hiç veri almadı). GA4 ölçüm kimliği açıkça verilmeli; page_view
 * zaten böyle çalışıyor.
 */

import { getPublicSettings } from "@/lib/public-settings-client";

const ADD_TO_CART_EVENT = "conversion_event_add_to_cart";
const PURCHASE_EVENT = "conversion_event_purchase";
const PURCHASE_DEDUP_PREFIX = "ads_purchase_";
const CURRENCY = "TRY";

/**
 * Olayı GA4 mülküne yollar. Ölçüm kimliği admin ayarından geliyor, o yüzden
 * gönderim asenkron; çağıranların beklemesi gerekmiyor.
 */
function sendToGa4(eventName: string, params: Record<string, unknown>): void {
  void getPublicSettings().then((settings) => {
    const ga4Id = settings?.googleAnalyticsId;
    if (!ga4Id) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    window.gtag("event", eventName, { ...params, send_to: ga4Id });
  });
}

interface AddToCartConversionInput {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variantId?: string;
  isBundle?: boolean;
  bundleId?: string;
}

export function trackAddToCartConversion(input: AddToCartConversionInput): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const quantity = input.quantity > 0 ? input.quantity : 1;
  const itemId = input.isBundle && input.bundleId
    ? `bundle-${input.bundleId}`
    : input.variantId
      ? `${input.productId}-${input.variantId}`
      : input.productId;

  // Onay durumu bilerek kontrol edilmiyor: Consent Mode v2 varsayılanları
  // layout.tsx'te denied. Event yine de gönderilmeli, Google reklam çerezi
  // yokken çerezsiz ping alıp dönüşümü modelliyor. Burada onay beklemek
  // reddeden ziyaretçilerin dönüşümünü tamamen kaybettiriyordu.
  sendToGa4(ADD_TO_CART_EVENT, {
    value: input.price * quantity,
    currency: CURRENCY,
    items: [
      {
        item_id: itemId,
        item_name: input.title,
        price: input.price,
        quantity,
      },
    ],
  });
}

interface PurchaseItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  variantId?: string;
}

interface PurchaseConversionInput {
  transactionId: string;
  value: number;
  items: PurchaseItem[];
}

/**
 * Sipariş onay sayfasından bir kez gönderilir.
 *
 * DİKKAT: Ads hesabında satın alma tarafında henüz dönüşüm işlemi yok. Bu
 * olay GA4'e düşer, ama Ads'te sayılabilmesi için GA4'te anahtar etkinlik
 * olarak işaretlenip Ads'e içe aktarılması gerekiyor.
 */
export function trackPurchaseConversion(input: PurchaseConversionInput): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!input.transactionId) return;

  const dedupKey = `${PURCHASE_DEDUP_PREFIX}${input.transactionId}`;
  try {
    if (sessionStorage.getItem(dedupKey)) return;
    sessionStorage.setItem(dedupKey, "1");
  } catch {
    // Depolama kapalıysa Google transaction_id ile tekilleştirir.
  }

  sendToGa4(PURCHASE_EVENT, {
    transaction_id: input.transactionId,
    value: input.value,
    currency: CURRENCY,
    items: input.items.map((item) => ({
      item_id: item.variantId && item.productId
        ? `${item.productId}-${item.variantId}`
        : item.productId || item.title,
      item_name: item.title,
      price: item.price,
      quantity: item.quantity > 0 ? item.quantity : 1,
    })),
  });
}
