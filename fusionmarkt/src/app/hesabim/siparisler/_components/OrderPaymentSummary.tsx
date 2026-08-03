"use client";

/**
 * Ödeme bilgileri bloğu.
 *
 * Kargo ücreti 0 ise **"Bedava"** yazılıyor (`00-KARARLAR` madde 5) — "0,00 TL"
 * müşteriye ücret alınmış gibi görünüyor.
 *
 * ⚠️ Kart maskesi ve banka logosu YOK ve eklenemez: iyzico işlem kaydı yalnızca
 * `itemId, paymentTransactionId, price, paidPrice` saklıyor; iyzico'nun
 * döndürdüğü `binNumber`/`lastFourDigits` veritabanına hiç yazılmıyor
 * (`api/payment/callback/route.ts`). Yerine sade ödeme yöntemi metni.
 */

import { formatPrice } from "../../_lib/format";
import type { OrderDetail } from "../_lib/detail-types";

/** Ham `paymentMethod` değeri müşteriye gösterilecek metne çevrilir. */
function paymentMethodLabel(method: string | null, paid: boolean): string {
  const raw = (method || "").toUpperCase();
  const name =
    raw.includes("CARD") || raw.includes("KART") || raw.includes("IYZICO")
      ? "Kredi Kartı"
      : raw.includes("EFT") || raw.includes("HAVALE") || raw.includes("TRANSFER")
        ? "Havale / EFT"
        : raw.includes("KAPIDA") || raw.includes("DOOR")
          ? "Kapıda Ödeme"
          : null;

  if (!name) return paid ? "Ödendi" : "Ödeme bekleniyor";
  return paid ? `${name} ile ödendi` : `${name} — ödeme bekleniyor`;
}

interface OrderPaymentSummaryProps {
  order: OrderDetail;
}

export default function OrderPaymentSummary({ order }: OrderPaymentSummaryProps) {
  const { subtotal, shippingCost, discount, total, refundedAmount } = order.totals;
  const paid = order.paymentStatus === "PAID";

  /**
   * Kısmi iade satırı yalnızca sipariş "tamamen iade edildi" DEĞİLKEN anlamlı.
   * Tam iadede durum rozeti zaten "İade edildi" diyor; aynı bilgiyi tutar
   * satırında tekrarlamak gereksiz.
   */
  const showPartialRefund = refundedAmount > 0 && order.status !== "REFUNDED";

  return (
    <div className="space-y-2">
      <h2 className="account-subsection-label">
        Ödeme Bilgileri
      </h2>

      <div className="space-y-2 rounded-xl border border-border bg-glass-bg p-3">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
          <span className="min-w-0 text-[13px] text-foreground-secondary">
            {paymentMethodLabel(order.paymentMethod, paid)}
          </span>
          <span className="shrink-0 whitespace-nowrap text-[13px] font-medium tabular-nums text-foreground">
            {formatPrice(total)}
          </span>
        </div>

        <div className="flex justify-between gap-2 text-[12px]">
          <span className="min-w-0 text-foreground-muted">Ürünler</span>
          <span className="shrink-0 tabular-nums text-foreground-secondary">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between gap-2 text-[12px]">
          <span className="min-w-0 text-foreground-muted">Kargo</span>
          <span
            className={`shrink-0 tabular-nums ${
              shippingCost === 0 ? "acc-tone-success" : "text-foreground-secondary"
            }`}
          >
            {shippingCost === 0 ? "Bedava" : formatPrice(shippingCost)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between gap-2 text-[12px]">
            <span className="min-w-0 break-words text-foreground-muted">
              İndirim{order.couponCode ? ` (${order.couponCode})` : ""}
            </span>
            <span className="acc-tone-success shrink-0 tabular-nums">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-2 border-t border-border pt-2 text-[14px]">
          <div className="min-w-0">
            <span className="font-medium text-foreground">Genel toplam</span>
            <span className="ml-1 text-[10px] text-foreground-muted">(KDV dahil)</span>
          </div>
          <span className="shrink-0 font-semibold tabular-nums text-foreground">
            {formatPrice(total)}
          </span>
        </div>

        {showPartialRefund && (
          <div className="flex justify-between gap-2 border-t border-border pt-2 text-[12px]">
            <span className="min-w-0 text-foreground-muted">İade edilen</span>
            <span className="acc-tone-success shrink-0 tabular-nums">
              -{formatPrice(refundedAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
