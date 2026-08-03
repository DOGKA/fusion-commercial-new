/**
 * KISMİ İADE TUTAR HESABI (F2-72)
 *
 * Talep siparişin tamamını kapsıyorsa hesap gerekmez: eski akış iyzico'daki tüm
 * işlemleri iade eder. Bu dosya yalnızca **kısmi** iadeler için, yani talebin
 * `ReturnRequestItem` kaydı olduğu durumlar için yazıldı.
 *
 * Üç tuzak var, üçü de burada kapatılıyor:
 *
 * 1. **Kupon indirimi kalem fiyatlarına yansımıyor.** `OrderItem.price` liste
 *    fiyatı; indirim sipariş düzeyinde `orders.discount` olarak duruyor.
 *    `price × adet` iade etmek, indirimli alınan malın parasını tam ödemek
 *    olurdu. İndirim kalemlere tutarları oranında dağıtılıyor.
 *
 * 2. **Kargo iade edilmiyor.** Kalan kalemler için gönderi zaten yapıldı
 *    (kullanıcı kararı, 31 Tem). Sepetteki `SHIPPING` kalemi atlanıyor.
 *
 * 3. **KDV ayrıca eklenmiyor.** `orders.tax` alanı `taxIncluded`, yani bilgi
 *    amaçlı; `total = subtotal + shipping - discount`. Tutara tekrar eklemek
 *    çifte ödeme olurdu.
 */

/** Hesap için gereken sipariş bilgisi. */
export interface RefundOrderInput {
  subtotal: number;
  discount: number;
  total: number;
  refundedAmount: number;
}

/** Talebin kapsadığı bir kalem. */
export interface RefundItemInput {
  orderItemId: string;
  /** Ürün kimliği; iyzico işlemiyle eşleştirmenin anahtarı. */
  productId: string | null;
  /** İade edilen adet. */
  quantity: number;
  /** Sipariş edilen toplam adet. */
  orderedQuantity: number;
  /** Kalemin birim fiyatı (indirim uygulanmamış). */
  unitPrice: number;
  variantId: string | null;
}

export interface RefundBreakdownLine extends RefundItemInput {
  /** İndirim payı düşülmeden önceki tutar. */
  grossAmount: number;
  /** Bu kaleme düşen indirim payı. */
  discountShare: number;
  /** Fiilen iade edilecek tutar. */
  refundAmount: number;
}

export interface RefundBreakdown {
  lines: RefundBreakdownLine[];
  /** İade edilecek toplam (kargo hariç, indirim düşülmüş). */
  total: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Kısmi iade tutarını kalem kalem hesaplar.
 *
 * İndirim oranı sipariş ARA TOPLAMI üzerinden bulunuyor; kargo ara toplama
 * dahil olmadığı için indirim payı da kargoyla kirlenmiyor.
 */
export function calculateRefund(
  order: RefundOrderInput,
  items: RefundItemInput[]
): RefundBreakdown {
  // Ara toplam sıfırsa (teorik olarak tamamı indirimli sipariş) oran hesabı
  // sıfıra bölme olurdu; o durumda indirim payı da yok sayılıyor.
  const discountRatio =
    order.subtotal > 0 ? Math.min(order.discount / order.subtotal, 1) : 0;

  const lines = items.map((item) => {
    const grossAmount = round2(item.unitPrice * item.quantity);
    const discountShare = round2(grossAmount * discountRatio);
    return {
      ...item,
      grossAmount,
      discountShare,
      refundAmount: round2(grossAmount - discountShare),
    };
  });

  return {
    lines,
    total: round2(lines.reduce((sum, line) => sum + line.refundAmount, 0)),
  };
}

/**
 * Hesaplanan tutar siparişte iade edilebilecek olanı aşıyor mu?
 *
 * ⚠️ Bu, aynı kalemin iki kez iade edilmesine karşı SON savunma hattı. İlk
 * savunma, aynı sipariş için aynı anda birden fazla açık talep bulunamaması
 * (`OPEN_REQUEST_STATUSES` kontrolü, storefront tarafında). Ama talepler sırayla
 * açılıp kapanabildiği için toplam da kontrol edilmeli: üç kalemli siparişin
 * üç kalemi üç ayrı talepte iade edilirse toplam siparişin tamamına ulaşır ve
 * dördüncü bir talep hiçbir şey iade etmemeli.
 *
 * Kargo bedeli iade edilmediği için tavan `total` değil `total - shipping`
 * olmalı; ama `subtotal - discount` zaten buna eşit
 * (`total = subtotal + shipping - discount`), o yüzden doğrudan o kullanılıyor.
 */
export function refundExceedsRemaining(
  order: RefundOrderInput,
  amount: number
): { exceeds: boolean; remaining: number } {
  const refundable = round2(order.subtotal - order.discount);
  const remaining = round2(refundable - order.refundedAmount);
  // Küsurat yuvarlamaları yüzünden birkaç kuruşluk aşımlar oluşabiliyor;
  // 1 kuruşluk tolerans gerçek bir aşımı gizlemez ama sahte alarm da vermez.
  return { exceeds: amount > remaining + 0.01, remaining };
}

/**
 * Kısmi iadelerin toplamı siparişin tamamına ulaştı mı?
 *
 * Ulaştıysa sipariş fiilen tükenmiştir ve `REFUNDED` işaretlenmelidir; aksi
 * hâlde tamamı parça parça iade edilmiş bir sipariş sonsuza kadar `DELIVERED`
 * görünürdü.
 */
export function isFullyRefunded(
  order: RefundOrderInput,
  newlyRefunded: number
): boolean {
  const refundable = round2(order.subtotal - order.discount);
  if (refundable <= 0) return false;
  return round2(order.refundedAmount + newlyRefunded) >= refundable - 0.01;
}

/**
 * Bir kalemin iyzico işlemi içinden iade edilecek payı.
 *
 * iyzico her sepet kalemi için ayrı bir `paymentTransactionId` tutuyor ve iade
 * o işlem üzerinden yapılıyor. Kalemin yalnızca bir kısmı iade ediliyorsa
 * (5 adetten 2'si) işlem tutarının o kadarlık payı isteniyor.
 *
 * ⚠️ `paidPrice` kullanılıyor, `price` değil: taksitli ödemede müşterinin fiilen
 * ödediği tutar `paidPrice`, iade de onun üzerinden yapılmalı.
 */
export function transactionRefundShare(
  transactionPaidPrice: number,
  refundQuantity: number,
  orderedQuantity: number
): number {
  if (orderedQuantity <= 0) return 0;
  if (refundQuantity >= orderedQuantity) return round2(transactionPaidPrice);
  return round2((transactionPaidPrice * refundQuantity) / orderedQuantity);
}
