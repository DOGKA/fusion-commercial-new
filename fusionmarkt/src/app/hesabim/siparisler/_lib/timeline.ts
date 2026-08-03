/**
 * Sipariş çizelgesinin adımları — liste ve detay için TEK kaynak.
 *
 * Neden ayrı dosya: aynı çizelge iki yerde çiziliyor. Liste akordiyonunun
 * elinde `/api/orders` yanıtı (`Order`), detay sayfasının elinde sunucunun
 * hesapladığı `timeline` var. Adımlar iki yerde ayrı hesaplandığı sürece aynı
 * sipariş iki sayfada farklı görünüyordu — liste "Kargoda" derken detay
 * "Kargoya verildi" diyordu (plan 07 M-15).
 *
 * Dosya Prisma'ya dokunmuyor, o yüzden hem sunucudaki `lib/order-detail.ts`
 * hem de istemci bileşenleri aynı fonksiyonu çağırabiliyor.
 *
 * ETİKETLER SABİT (plan 07 M-14): adım adı zamana göre değişmiyor. Mağaza
 * kargo ve teslim bilgisini admin panelinden elle giriyor; "Kargoya verilecek"
 * gibi gelecek zamanlı bir metin, adımın adını sürekli değiştirdiği için
 * müşteriye iki farklı aşama varmış gibi görünüyordu. Adımın gerçekleşip
 * gerçekleşmediğini ikon, renk ve tarih anlatıyor.
 *
 * ÖDEME ADIMI M-14'ün BİLİNÇLİ İSTİSNASI. Orada yasaklanan şey gelecek zaman
 * kipiydi; buradaki fark kip değil, gerçekten BAŞKA BİR DURUM. Havaleyle
 * verilen siparişte para henüz hesaba geçmemişken "Ödeme onaylandı" yazmak
 * yanlış bilgi — müşteri ödemenin alındığını sanıyordu. Kart ödemesinde böyle
 * bir ara durum yok, o yüzden metin ödeme yöntemine göre ayrışıyor.
 *
 * "Tahmini tarih üretilmez" kuralı AYNEN geçerli: gerçekleşmemiş adımda
 * `date` her zaman `null` kalıyor.
 */

import { isDelivered, isPaid, isPreparing, isShipped } from "@/lib/orders";
import type { OrderTimelineStep, TimelineStepKey } from "./detail-types";

export const TIMELINE_STEP_LABELS: Record<TimelineStepKey, string> = {
  created: "Sipariş alındı",
  paid: "Ödeme onaylandı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
};

/**
 * Çizelgenin ihtiyaç duyduğu asgari sipariş şekli.
 *
 * Tarihler hem `Date` (Prisma kaydı) hem `string` (API yanıtı) olabiliyor;
 * `lib/orders.ts`'teki kural fonksiyonlarıyla aynı yaklaşım.
 */
export interface OrderTimelineSource {
  status: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  preparingAt?: Date | string | null;
  shippedAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  carrierName?: string | null;
}

/**
 * Ödemesi henüz alınmamış siparişin ödeme adımı ne diyecek?
 *
 * Yöntem eşlemesi `OrderPaymentSummary` ile aynı desende: veritabanına yazılan
 * güncel değer `"BANK_TRANSFER"`, ama eski kayıtlarda `"HAVALE"`, `"EFT"` ve
 * kart tarafında `"iyzico"` de geçiyor, o yüzden tam eşleşme değil içerik
 * araması yapılıyor.
 *
 * Admin ödemeyi onayladığında `paymentStatus` `"PAID"` olup `paidAt` doluyor;
 * etiket kendiliğinden "Ödeme onaylandı"ya dönüyor, ek bir iş gerekmiyor.
 */
function pendingPaymentLabel(method: string | null | undefined): string {
  const raw = (method || "").toUpperCase();
  const isTransfer =
    raw.includes("TRANSFER") || raw.includes("HAVALE") || raw.includes("EFT");
  return isTransfer ? "Havale ödemesi bekleniyor" : "Ödeme bekleniyor";
}

/**
 * İstemci sözleşmesi her tarihi `string` yazıyor. Bozuk damga çizelgeyi
 * çökertmesin diye geçersiz tarih `null` dönüyor: adım tarihsiz basılır.
 */
function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildOrderTimeline(order: OrderTimelineSource): OrderTimelineStep[] {
  const paidDone = isPaid(order);
  // `preparingAt` boş kalabiliyor; sipariş onayı da hazırlığın başladığını gösterir.
  const preparingStamp = order.preparingAt ?? order.confirmedAt;
  const preparingDone = isPreparing(order);
  const shippedDone = isShipped(order);
  const deliveredDone = isDelivered(order);

  const step = (
    key: TimelineStepKey,
    done: boolean,
    isCurrent: boolean,
    stamp: Date | string | null | undefined,
    hint: string | null = null,
    label: string = TIMELINE_STEP_LABELS[key]
  ): OrderTimelineStep => ({
    key,
    label,
    state: done ? "approved" : isCurrent ? "inprogress" : "future",
    date: done ? iso(stamp) : null,
    lineFill: done ? 100 : isCurrent ? 50 : 0,
    hint: done || isCurrent ? hint : null,
  });

  return [
    step("created", true, false, order.createdAt),
    step(
      "paid",
      paidDone,
      !paidDone,
      order.paidAt,
      null,
      paidDone ? TIMELINE_STEP_LABELS.paid : pendingPaymentLabel(order.paymentMethod)
    ),
    step("preparing", preparingDone, paidDone && !preparingDone, preparingStamp),
    step(
      "shipped",
      shippedDone,
      preparingDone && !shippedDone,
      order.shippedAt,
      order.carrierName ?? null
    ),
    step("delivered", deliveredDone, shippedDone && !deliveredDone, order.deliveredAt),
  ];
}
