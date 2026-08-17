/**
 * Google Ads dönüşüm event'leri.
 *
 * Google etiketi (AW-17546279426) siteye GTM container'ı GTM-P92SX9GL
 * üzerinden yükleniyor; container'ın içinde "Initialization" tetikleyicisine
 * bağlı tek bir Google Tag var, başka hiçbir event etiketi yok. Yani
 * dönüşümü buradan göndermek çift sayıma yol açmıyor.
 *
 * EVENT ADI RASTGELE DEĞİL: Google Ads tarafında dönüşüm işlemleri event
 * adına göre eşleniyor (ccd_conversion_marking kuralları). Ads hesabında
 * dönüşüm olarak işaretli adlar şunlar:
 *   conversion_event_add_to_cart, conversion_event_purchase,
 *   conversion_event_page_view, purchase, qualify_lead, close_convert_lead
 * Aşağıdaki ad değiştirilirse Ads dönüşümü saymayı bırakır.
 *
 * DİKKAT: Satın alma dönüşümü eklenirken `purchase` VEYA
 * `conversion_event_purchase` gönderilmeli, ikisi birden değil — her ikisi
 * de dönüşüm olarak işaretli olduğu için sipariş iki kez sayılır.
 */

const ADD_TO_CART_EVENT = "conversion_event_add_to_cart";
const CURRENCY = "TRY";

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
  window.gtag("event", ADD_TO_CART_EVENT, {
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
