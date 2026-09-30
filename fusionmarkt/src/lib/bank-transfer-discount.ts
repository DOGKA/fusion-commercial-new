/**
 * Havale/EFT ödemelerinde uygulanan ekstra indirim.
 *
 * Ödeme ekranı ve sunucu (`computeOrderPricing`) aynı fonksiyonu çağırıyor;
 * iki taraf kuruşu kuruşuna aynı tutarı bulmazsa sunucu siparişi
 * `PRICE_MISMATCH` ile reddeder.
 *
 * Taban: kupon düşüldükten sonraki ürün tutarı. Kargo dahil değil.
 */
export const BANK_TRANSFER_DISCOUNT_RATE = 0.05;

export const BANK_TRANSFER_DISCOUNT_LABEL = `Havale İndirimi (%${BANK_TRANSFER_DISCOUNT_RATE * 100})`;

export function bankTransferDiscount(subtotal: number, couponDiscount: number): number {
  const base = Math.max(0, subtotal - couponDiscount);
  return Math.round(base * BANK_TRANSFER_DISCOUNT_RATE * 100) / 100;
}
