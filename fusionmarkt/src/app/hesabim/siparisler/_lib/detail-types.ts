/**
 * `GET /api/orders/[orderNumber]/detail` yanıtının şekli.
 *
 * Liste yanıtındaki `Order` tipinden AYRI tutuluyor ve `_lib/types.ts`'e
 * konmuyor: iki uç bilinçli olarak farklı şeyler döndürüyor. Liste sayfalama
 * için yalın (`statusHistory` yok, `permissions` yok), detay ise sunucuda
 * hesaplanmış `permissions` ve `timeline` taşıyor. Tek tipte birleştirilirse
 * her alan opsiyonel olmak zorunda kalır ve "bu alan hangi uçtan gelir"
 * bilgisi tipten okunamaz hale gelir.
 */

import type {
  RequestTypeKey,
  ReturnReasonKey,
  StoredReturnReasonKey,
} from "@/lib/orders";
import type { OrderStatus, PaymentStatus } from "../../_lib/types";

export type TimelineStepKey = "created" | "paid" | "preparing" | "shipped" | "delivered";

export type TimelineState = "approved" | "inprogress" | "future";

export interface OrderTimelineStep {
  key: TimelineStepKey;
  /**
   * Adımın SABİT adı (`_lib/timeline.ts → TIMELINE_STEP_LABELS`). Gerçekleşip
   * gerçekleşmediğine göre değişmez; onu `state` ve `date` anlatır. Eskiden
   * ikinci bir `futureLabel` alanı vardı ve gerçekleşmemiş adımda "Kargoya
   * verilecek" basılıyordu (plan 07 M-14 ile kaldırıldı).
   */
  label: string;
  state: TimelineState;
  /** Yalnızca gerçekleşmiş adımlarda dolu — gelecek adımda tarih uydurulmaz. */
  date: string | null;
  /** Bu adımdan SONRAKİ çizginin dolum oranı (referansın kısmi dolum deseni). */
  lineFill: 0 | 50 | 100;
  hint: string | null;
}

export interface OrderDetailProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  images: string[];
  brand: string | null;
  isActive: boolean;
}

/**
 * Kullanıcının bu ürüne DAHA ÖNCE yazdığı yorum.
 *
 * `isApproved` iki durumu birlikte taşıyor (onay bekliyor / yayında); "reddedildi"
 * ayrı bir durum olarak yok, o yüzden arayüzde asla "onaylanmadı" yazılmıyor
 * (ertelenenler sicili F2-35).
 */
export interface OrderItemMyReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface OrderDetailItem {
  id: string;
  /** Ürün katalogdan silinmişse `null` (şemada `productId String?`). */
  productId: string | null;
  bundleId: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  product: OrderDetailProduct | null;
  canReview: boolean;
  canReorder: boolean;
  /** Doluysa buton "Değerlendir" değil "Değerlendirmemi düzenle" olur. */
  myReview: OrderItemMyReview | null;
}

export interface OrderDetailAddress {
  id: string;
  title: string | null;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
}

export interface OrderDetailReturnRequest {
  id: string;
  requestType: RequestTypeKey;
  requestTypeLabel: string;
  reason: StoredReturnReasonKey | null;
  reasonLabel: string | null;
  description: string | null;
  images: string[];
  status: string;
  adminNote: string | null;
  returnAddress: string | null;
  returnInstructions: string | null;
  /**
   * Yalnızca talep onaylandığında ve fiziksel gönderi beklenen tiplerde dolu
   * olur. Bekleyen/reddedilen talepte ve fatura taleplerinde `null`.
   */
  returnCode: string | null;
  /**
   * İnceleme olumsuz çıkıp ürün müşteriye geri gönderildiğinde dolar. Yalnızca
   * "ürün bize ulaştı ama iade kabul edilmedi" yolunda anlamlı.
   */
  sendBackCarrier: string | null;
  sendBackTrackingNumber: string | null;
  sendBackAt: string | null;
  /**
   * Talebin kapsadığı kalemler. **Boş dizi "tüm sipariş" demek** — hem alan
   * eklenmeden önceki tüm kayıtlar hem de müşterinin her şeyi seçtiği durum.
   * Yani dolu dizi her zaman kısmi bir talebi gösterir.
   */
  items: OrderDetailRequestItem[];
  createdAt: string;
}

export interface OrderDetailRequestItem {
  orderItemId: string;
  quantity: number;
  name: string;
  variantInfo: string | null;
}

export interface OrderDetailCancellationRequest {
  id: string;
  status: string;
  reason: string | null;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  paymentMethod: string | null;

  totals: {
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax: number;
    total: number;
    /**
     * Bugüne kadar iade edilen tutar. Kısmi iadede sipariş `DELIVERED` kaldığı
     * için durum rozetinden anlaşılmıyor; müşterinin "ne kadarı geri geldi"
     * sorusunun tek cevabı bu.
     */
    refundedAmount: number;
  };
  couponCode: string | null;

  timestamps: {
    createdAt: string;
    paidAt: string | null;
    confirmedAt: string | null;
    preparingAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    refundedAt: string | null;
  };

  shipping: {
    trackingNumber: string | null;
    carrierName: string | null;
    carrier: {
      id: string;
      name: string;
      phone: string | null;
      website: string | null;
      trackingUrl: string | null;
    } | null;
  };

  invoice: {
    url: string | null;
    uploadedAt: string | null;
    state: "active" | "pending" | "hidden";
  };

  items: OrderDetailItem[];

  addresses: {
    shipping: OrderDetailAddress | null;
    billing: OrderDetailAddress | null;
  };

  customerNote: string | null;

  requests: {
    cancellation: OrderDetailCancellationRequest | null;
    returns: OrderDetailReturnRequest[];
  };

  /**
   * Kurallar SUNUCUDA `lib/orders.ts` ile hesaplanır. İstemci bunları tekrar
   * hesaplamaz — kural iki yerde yaşarsa ayrışır (detay ucunun başlığındaki not).
   */
  permissions: {
    canCancel: boolean;
    canReturn: boolean;
    canTrack: boolean;
    canReview: boolean;
    availableRequestTypes: RequestTypeKey[];
    availableReturnReasons: ReturnReasonKey[];
    disabledReason: string | null;
  };

  timeline: OrderTimelineStep[];

  history: { status: string; date: string | null; note: string | null }[];
}
