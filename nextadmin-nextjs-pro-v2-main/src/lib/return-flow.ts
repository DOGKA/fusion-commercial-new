import type { RequestStatus } from "@repo/db";

/**
 * İADE AKIŞININ DURUM MAKİNESİ
 *
 * İki ayrı onay var ve karıştırılmamaları kritik:
 *
 *   1. `approve`  → "İade inceleme talebi onaylandı." Müşteri iade kodunu alır
 *                   ve kargoya verebilir. **Para çıkmaz, stok geri yüklenmez.**
 *   2. `receive`  → Koli depoya ulaştı, kod eşleşti. Hâlâ para çıkmaz.
 *   3. `refund`   → "İade onaylandı." İnceleme olumlu: stok geri yüklenir,
 *                   ödeme iade edilir, sipariş REFUNDED olur.
 *
 * Eskiden 1. adım üçünü birlikte yapıyordu; ürün yola çıkmadan para çıkıyordu.
 * `reject` iki noktada mümkün: gönderim öncesi (talep haksız) ve inceleme
 * sonrası (ürün hasarlı/eksik geldi).
 */

export type ReturnAction =
  | "approve"
  | "receive"
  | "refund"
  | "reject"
  | "send-back";

export const RETURN_ACTIONS: ReturnAction[] = [
  "approve",
  "receive",
  "refund",
  "reject",
  "send-back",
];

/** Bir aksiyonun izin verdiği başlangıç durumları. */
const ALLOWED_FROM: Record<ReturnAction, RequestStatus[]> = {
  approve: ["PENDING_ADMIN_APPROVAL"],
  receive: ["APPROVED"],
  refund: ["RECEIVED"],
  // Gönderim öncesi ret + inceleme sonrası ret.
  reject: ["PENDING_ADMIN_APPROVAL", "RECEIVED"],
  // Ürün depomuzdayken reddedildi; müşteriye geri gönderiliyor.
  "send-back": ["REJECTED"],
};

/**
 * `send-back` bir durum geçişi DEĞİL: talep `REJECTED` kalır, yalnızca kargo
 * bilgisi kaydedilir. Durum makinesinde durmasının sebebi izin kontrolünün tek
 * yerde olması.
 */
const NEXT_STATUS: Record<ReturnAction, RequestStatus> = {
  approve: "APPROVED",
  receive: "RECEIVED",
  refund: "COMPLETED",
  reject: "REJECTED",
  "send-back": "REJECTED",
};

/**
 * Ürünün müşteriye geri gönderilmesi gerekiyor mu?
 *
 * Yalnızca dar bir yolda olur: inceleme talebi onaylandı → müşteri gönderdi →
 * koli teslim alındı (`receivedAt`) → inceleme olumsuz çıktı (`REJECTED`).
 * İlk aşamada reddedilen taleplerde ürün bize hiç gelmediği için geri
 * gönderilecek bir şey de yoktur; `receivedAt` kontrolü bu ikisini ayırıyor.
 */
export function needsSendBack(req: {
  status: RequestStatus;
  receivedAt: Date | string | null;
  sendBackAt: Date | string | null;
}): boolean {
  return req.status === "REJECTED" && !!req.receivedAt && !req.sendBackAt;
}

/** Bu aksiyon bu durumdan uygulanabilir mi? */
export function canApply(action: ReturnAction, from: RequestStatus): boolean {
  return ALLOWED_FROM[action].includes(from);
}

export function nextStatus(action: ReturnAction): RequestStatus {
  return NEXT_STATUS[action];
}

/**
 * Aksiyon reddedildiğinde admin'e gösterilecek açıklama. Jenerik "bu talep
 * zaten işlenmiş" mesajı iki aşamalı akışta yanıltıcı: talep işlenmiş olabilir
 * ama sıradaki adım başka bir aksiyon olabilir.
 */
export function rejectionReason(
  action: ReturnAction,
  from: RequestStatus
): string {
  if (from === "COMPLETED") return "Bu iadenin ödemesi zaten yapıldı.";
  if (from === "REJECTED" && action !== "send-back") {
    return "Bu talep zaten reddedilmiş.";
  }

  switch (action) {
    case "send-back":
      return "Geri gönderim bilgisi yalnızca inceleme sonrası reddedilen taleplere girilebilir.";
    case "approve":
      return "Bu talep zaten onaylanmış.";
    case "receive":
      return from === "PENDING_ADMIN_APPROVAL"
        ? "Talep henüz onaylanmadı; müşteriye iade kodu verilmeden koli beklenemez."
        : "Bu koli zaten teslim alınmış olarak işaretlendi.";
    case "refund":
      return from === "APPROVED"
        ? "Ürün henüz teslim alınmadı. Para iadesi ancak koli depoya ulaşıp incelendikten sonra yapılabilir."
        : "Bu talep para iadesine uygun durumda değil.";
    case "reject":
      return "Bu talep bu aşamada reddedilemez.";
  }
}

/** Ödemenin ve stoğun hareket ettiği tek aksiyon. */
export function movesMoney(action: ReturnAction): boolean {
  return action === "refund";
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING_ADMIN_APPROVAL: "İnceleme talebi bekliyor",
  APPROVED: "İnceleme talebi onaylandı · kargo bekleniyor",
  RECEIVED: "Ürün teslim alındı · inceleniyor",
  COMPLETED: "İade onaylandı · ödeme iade edildi",
  REJECTED: "Reddedildi",
};

/**
 * Cayma hakkında ödeme en geç 14 gün içinde yapılmak zorunda. Koli depoya
 * ulaştıktan sonra bu kadar gün geçtiyse admin uyarılır — iki aşamalı akışın
 * riski, incelemenin sahipsiz kalıp talebin RECEIVED'da unutulması.
 */
export const REFUND_DEADLINE_DAYS = 14;

export function daysSince(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000));
}
