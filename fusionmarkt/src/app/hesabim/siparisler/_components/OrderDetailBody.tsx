"use client";

/**
 * Akordiyonun açılan gövdesi: zaman çizelgesi, ürünler, özet, fatura,
 * adres, not ve talep aksiyonları.
 *
 * `OrdersView`'dan olduğu gibi çıkarıldı; iki davranış düzeltmesi var:
 *  1. Silinmiş ürün (`item.product === null`) artık çökmüyor. Şemada
 *     `OrderItem.product` nullable ve eski kod `item.product.thumbnail`
 *     yazıyordu — katalogdan kaldırılmış bir ürünü olan sipariş açıldığında
 *     kart patlıyordu.
 */

import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  invoiceRowState,
  isOpenRequestStatus,
} from "@/lib/orders";
import { formatPrice, formatDate } from "../../_lib/format";
import type { Order } from "../../_lib/types";
import { buildOrderTimeline } from "../_lib/timeline";
import { chipClass, chipHoverClass, toneClass } from "./order-status-ui";
import OrderTimeline from "./OrderTimeline";
import OrderAddressDetails from "./OrderAddressDetails";
import RequestStatusCards, { type RequestDetail } from "./RequestStatusCards";

interface OrderDetailBodyProps {
  order: Order;
  requestDetail: RequestDetail | undefined;
}

export default function OrderDetailBody({
  order,
  requestDetail,
}: OrderDetailBodyProps) {
  const closed = order.status === "CANCELLED" || order.status === "REFUNDED";
  const invoiceState = invoiceRowState(order);

  // Süreci devam eden her talep "İade et" butonunu kapatır: kolisi yolda olan
  // müşteri ikinci bir talep açmamalı.
  const hasPendingReturnRequest =
    order.hasPendingReturnRequest ||
    (!!requestDetail?.returnStatus &&
      isOpenRequestStatus(requestDetail.returnStatus));

  return (
    <div className="order-expanded-content space-y-4 border-t border-border bg-background p-4">
      {/* Zaman çizelgesi ancak sipariş yaşıyorsa anlamlı; iptal/iade edilmiş
          siparişte yarım dolu bir çubuk kafa karıştırıyor.

          Adımlar detay sayfasıyla AYNI fonksiyondan geliyor: liste eskiden
          kendi etiketlerini üretiyordu ("Kargoda") ve aynı sipariş iki ekranda
          farklı görünüyordu (plan 07 M-15). */}
      {!closed && <OrderTimeline steps={buildOrderTimeline(order)} />}

      {closed && (
        <div
          className={`rounded-lg p-3 ${chipClass(
            order.status === "CANCELLED" ? "danger" : "neutral"
          )}`}
        >
          <p className="text-[13px]">
            {order.status === "CANCELLED"
              ? `Sipariş ${formatDate(order.cancelledAt)} tarihinde iptal edildi.`
              : order.refundedAt
                ? `Sipariş ${formatDate(order.refundedAt)} tarihinde iade edildi.`
                : "Sipariş iade edildi."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="account-subsection-label">Ürünler</p>
        {order.items.map((item) => {
          const image = item.product?.thumbnail || item.product?.images?.[0] || null;
          const name = item.product?.name ?? "Ürün artık satışta değil";

          return (
            <div
              key={item.id}
              className="order-item-row account-inset flex items-start gap-2 rounded-lg border border-border p-2 sm:gap-3"
            >
              <div className="order-item-image account-media-well relative h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12">
                {image ? (
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={16} aria-hidden="true" className="text-foreground-disabled" />
                  </div>
                )}
              </div>
              <div className="order-item-info min-w-0 flex-1">
                {item.product?.slug ? (
                  <Link
                    href={`/urun/${item.product.slug}`}
                    className="line-clamp-2 break-words text-[13px] text-foreground transition-colors hover:text-[color:var(--acc-accent-fg)]"
                  >
                    {name}
                  </Link>
                ) : (
                  <p className="line-clamp-2 break-words text-[13px] text-foreground-tertiary">
                    {name}
                  </p>
                )}
                {item.variantInfo?.name && item.variantInfo?.value && (
                  <p className="truncate text-[11px] text-foreground-muted">
                    {item.variantInfo.name}: {item.variantInfo.value}
                  </p>
                )}
                <p className="whitespace-nowrap text-[11px] tabular-nums text-foreground-muted">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="order-item-price shrink-0 whitespace-nowrap text-right text-[13px] font-medium tabular-nums text-foreground">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="account-inset-strong space-y-2 rounded-lg border border-border p-3">
        <div className="flex justify-between gap-2 text-[12px]">
          <span className="min-w-0 text-foreground-muted">Ara Toplam</span>
          <span className="shrink-0 tabular-nums text-foreground-secondary">
            {formatPrice(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between gap-2 text-[12px]">
          <span className="min-w-0 text-foreground-muted">Kargo</span>
          <span
            className={`shrink-0 tabular-nums ${
              order.shippingCost === 0 ? toneClass("success") : "text-foreground-secondary"
            }`}
          >
            {order.shippingCost === 0 ? "Ücretsiz" : formatPrice(order.shippingCost)}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between gap-2 text-[12px]">
            <span className="min-w-0 break-words text-foreground-muted">
              İndirim{order.couponCode ? ` (${order.couponCode})` : ""}
            </span>
            <span className={`${toneClass("success")} shrink-0 tabular-nums`}>
              -{formatPrice(order.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-2 border-t border-border pt-2 text-[14px]">
          <div className="min-w-0">
            <span className="font-medium text-foreground">Toplam</span>
            <span className="ml-1 text-[10px] text-foreground-muted">(KDV dahil)</span>
          </div>
          <span className="shrink-0 font-semibold tabular-nums text-foreground">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Fatura satırı henüz teslim edilmemiş siparişte hiç gösterilmiyor:
          boş bir "-" satırı müşteriye faturanın kaybolduğunu düşündürüyordu. */}
      {invoiceState !== "hidden" && (
        <div className="account-inset flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg border border-border p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText size={16} aria-hidden="true" className="shrink-0 text-foreground-muted" />
            <span className="truncate text-[13px] text-foreground-secondary">Fatura</span>
          </div>
          {invoiceState === "active" && order.invoiceUrl ? (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-[12px] font-medium transition-colors ${chipClass("accent")} ${chipHoverClass("accent")}`}
            >
              <FileText size={12} aria-hidden="true" />
              Faturayı İndir
              <ExternalLink size={10} aria-hidden="true" />
            </a>
          ) : (
            <span
              className={`${toneClass("warning")} inline-flex w-full items-center gap-1.5 text-[11px] sm:w-auto sm:text-[12px]`}
            >
              <Clock size={12} aria-hidden="true" className="shrink-0" />
              <span className="min-w-0">Hazır Olduğunda İndirebilirsiniz</span>
            </span>
          )}
        </div>
      )}

      {order.shippingAddress && (
        <div className="account-inset-strong rounded-lg border border-border p-3">
          <p className="account-subsection-label mb-3">Teslimat Adresi</p>
          <OrderAddressDetails address={order.shippingAddress} />
        </div>
      )}

      {order.customerNote && (
        <div className="account-inset rounded-lg border border-border p-3">
          <p className="mb-1 text-[12px] text-foreground-muted">Sipariş Notu</p>
          <p className="text-[13px] italic text-foreground-secondary">
            &quot;{order.customerNote}&quot;
          </p>
        </div>
      )}

      <div className="space-y-3 border-t border-border pt-3">
        <RequestStatusCards detail={requestDetail} />

        {!closed && (
          <>
            {order.status === "SHIPPED" && !hasPendingReturnRequest && (
              <div className={`rounded-lg p-3 ${chipClass("warning")}`}>
                <p className="flex items-start gap-2 text-[12px]">
                  <AlertCircle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    Ürününüz kargolandı. Bu aşamada iptal sağlayamamaktayız. İade talebiniz
                    olursa lütfen iade işlemlerini başlatınız.
                  </span>
                </p>
              </div>
            )}

          </>
        )}

        {/* Akordiyon özet gösteriyor; sözleşmeler, fatura adresi, "Tekrar al" ve
            "Değerlendir" yalnızca detay sayfasında. Masaüstü kullanıcısının da
            oraya bir kapısı olmalı, yoksa bu özellikler yalnızca mobilde
            kalır. */}
        <Link
          href={`/hesabim/siparisler/${encodeURIComponent(order.orderNumber)}`}
          className="account-btn group flex min-h-[52px] items-center justify-between gap-3 rounded-lg border border-border px-4 py-2.5 transition-colors hover:border-[color:var(--acc-accent-border)]"
        >
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-foreground">
              Sipariş detayını görüntüle
            </span>
            <span className="block truncate text-[11px] text-foreground-tertiary">
              Fatura, sözleşmeler ve tüm sipariş bilgileri
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all group-hover:translate-x-0.5 group-hover:border-[color:var(--acc-accent-border)]">
            <ChevronRight size={15} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
}