/**
 * Sipariş durumunun GÖRSEL karşılığı.
 *
 * Kural ve etiketler `lib/orders.ts`'te; burada yalnızca ikon ve renk sınıfı
 * var. Ayrı durmalarının sebebi `lib/orders.ts` başlığında yazılı: o dosya API
 * route'larından import edildiği için React/lucide taşıyamaz.
 *
 * Renk sınıfları sipariş yüzeyinin TEK çözüm noktası (plan 07 §3/Agent B.6):
 * durum rozeti, iptal bloğu, talep kartları hepsi buradaki haritadan geçiyor.
 * Bileşenlerde tek tek `text-red-400` yazılırsa light temada 2.8:1 kontrastla
 * kalınıyor ve hangi bileşenin kaçırdığı ancak Lighthouse çıktısından
 * anlaşılıyor.
 */

import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  type OrderStatusKey,
  type PaymentStatusKey,
  type StatusTone,
} from "@/lib/orders";

/**
 * Sipariş yüzeyinin ton çeşnisi. `lib/orders.ts`'teki `StatusTone`'a ek olarak
 * `accent` var: o dosya yalnızca DURUM tonlarını tanımlıyor, `accent` ise
 * sipariş durumu olmayan olumlu vurgular (birincil buton, marka yeşili) için.
 * Ayrı bir ton eklemek `lib/orders.ts`'i genişletmek anlamına gelirdi ve orası
 * API route'larının da okuduğu kural dosyası — sunum kararı burada kalıyor.
 */
export type UiTone = StatusTone | "accent";

/**
 * Ton → `account.css` yardımcı sınıfı. `tone` yalnız metin rengi, `chip` renk +
 * zemin + kenarlık; ikisi de light/dark için ayrı hex'e çözülen `--acc-*`
 * token'larına bağlı (plan 07 §2.2).
 */
const TONE_CLASSES: Record<UiTone, { tone: string; chip: string }> = {
  accent: { tone: "acc-tone-accent", chip: "acc-chip-accent" },
  warning: { tone: "acc-tone-warning", chip: "acc-chip-warning" },
  info: { tone: "acc-tone-info", chip: "acc-chip-info" },
  progress: { tone: "acc-tone-progress", chip: "acc-chip-progress" },
  success: { tone: "acc-tone-success", chip: "acc-chip-success" },
  danger: { tone: "acc-tone-danger", chip: "acc-chip-danger" },
  neutral: { tone: "acc-tone-neutral", chip: "acc-chip-neutral" },
};

/** Yalnız metin rengi veren yardımcı sınıf. */
export const toneClass = (tone: UiTone) => TONE_CLASSES[tone].tone;

/** Renk + zemin + kenarlık veren yardımcı sınıf (rozet, uyarı kutusu). */
export const chipClass = (tone: UiTone) => TONE_CLASSES[tone].chip;

/**
 * Ton çipinin üstüne gelince zemin bir tık koyulaşır: her tonun kendi
 * `-bg-hover` değişkeni `-bg` yerine geçiyor. Sabit bir Tailwind tonu yerine
 * token kullanmak, light ve dark temada doğru yönde koyulaşmayı ve metin rengi
 * değişmediği için kontrastın düşmemesini sağlıyor — hover zeminleri de
 * AA (4.5:1) eşiğinden çözüldü.
 *
 * Burası eskiden `-border` değişkenini hover ZEMİNİ olarak kullanıyordu. O
 * değişkenin görevi çipin dış sınırını karta karşı 3:1'e taşımak; ikisi aynı
 * anda tutulamaz, çünkü sınır için gereken koyuluk zemin olarak kullanıldığında
 * metni okunmaz yapıyor. İki görev iki değişkene ayrıldı.
 *
 * Sınıflar TAM METİN yazılı: Tailwind kaynak taramasını dizeler üzerinden
 * yapıyor, `hover:bg-[...var(--acc-${tone}...)]` gibi kurulan bir ad üretilmez.
 */
const TONE_HOVER: Record<UiTone, string> = {
  accent: "hover:bg-[color:var(--acc-accent-bg-hover)]",
  warning: "hover:bg-[color:var(--acc-warning-bg-hover)]",
  info: "hover:bg-[color:var(--acc-info-bg-hover)]",
  progress: "hover:bg-[color:var(--acc-progress-bg-hover)]",
  success: "hover:bg-[color:var(--acc-success-bg-hover)]",
  danger: "hover:bg-[color:var(--acc-danger-bg-hover)]",
  neutral: "hover:bg-[color:var(--acc-neutral-bg-hover)]",
};

export const chipHoverClass = (tone: UiTone) => TONE_HOVER[tone];

const STATUS_ICONS: Record<OrderStatusKey, LucideIcon> = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: RefreshCw,
};

/**
 * Sürecin bittiğini kendi başına söyleyen durumlar.
 *
 * Bu durumlarda ödeme etiketi TEKRAR olur: iptal edilip parası iade edilmiş
 * siparişte özet satırı "İptal Edildi · İade Edildi" basıyor ve müşteri iki
 * ayrı olay olduğunu sanıyor (plan 07 B-4). Ayrım burada duruyor çünkü
 * `lib/orders.ts` API route'larından da import ediliyor ve bu tamamen sunum
 * kararı.
 */
const TERMINAL_ORDER_STATUSES: OrderStatusKey[] = ["CANCELLED", "REFUNDED"];

export function isTerminalOrderStatus(status: string): boolean {
  return (TERMINAL_ORDER_STATUSES as string[]).includes(status);
}

export interface OrderStatusPresentation {
  label: string;
  /** Yalnız metin rengi. */
  toneClass: string;
  /** Renk + zemin + kenarlık. */
  chipClass: string;
  icon: LucideIcon;
}

/** Bilinmeyen durum gelirse çökmek yerine nötr görünüm döner. */
export function orderStatusUi(status: string): OrderStatusPresentation {
  const key = status as OrderStatusKey;
  const tone = ORDER_STATUS_TONES[key] ?? "neutral";
  return {
    label: ORDER_STATUS_LABELS[key] ?? status,
    toneClass: toneClass(tone),
    chipClass: chipClass(tone),
    icon: STATUS_ICONS[key] ?? Package,
  };
}

export function paymentStatusUi(paymentStatus: string): { label: string; toneClass: string } {
  const key = paymentStatus as PaymentStatusKey;
  return {
    label: PAYMENT_STATUS_LABELS[key] ?? paymentStatus,
    toneClass: toneClass(PAYMENT_STATUS_TONES[key] ?? "warning"),
  };
}
