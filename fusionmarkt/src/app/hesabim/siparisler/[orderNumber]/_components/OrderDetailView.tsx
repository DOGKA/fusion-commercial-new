"use client";

/**
 * Sipariş detay sayfası (plan 03 Faz 3).
 *
 * VERİ: tek kaynak `GET /api/orders/[orderNumber]/detail`. `permissions` ve
 * `timeline` sunucuda hesaplanmış geliyor; bu ekran hangi butonun görünmesi
 * gerektiğine KENDİSİ karar vermiyor. Liste ekranı hâlâ `lib/orders.ts`
 * fonksiyonlarını çağırıyor çünkü orada elinde sadece liste yanıtı var —
 * ikisi de aynı fonksiyonlara dayandığı için sonuç ayrışmıyor.
 *
 * İLK VERİ SUNUCUDAN: sayfa `getOrderDetail()` ile detayı çekip `initialOrder`
 * olarak veriyor (F2-45), bu yüzden ilk boyamada spinner yok. `load()` yerinde
 * duruyor çünkü talep açma / iptal sonrası tazeleme ona bağlı.
 *
 * (Eskiden burada "SSR yapılmadı" notu vardı: `/hesabim` altı istemci tarafı
 * auth gate'inin arkasındaydı ve sunucuda render edilen gövde kullanıcıya hiç
 * görünmeden atılırdı. Gate dilim 20'de sunucuya taşındı.)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Loader2,
  AlertCircle,
  XCircle,
  RefreshCw,
  MessageSquarePlus,
} from "lucide-react";
import { formatOrderDate } from "@/lib/orders";
import { AccountCard } from "../../../_components/shared";
import { chipClass, chipHoverClass, orderStatusUi } from "../../_components/order-status-ui";
import OrderTimeline from "../../_components/OrderTimeline";
import OrderItemCard from "../../_components/OrderItemCard";
import OrderPaymentSummary from "../../_components/OrderPaymentSummary";
import OrderAddressBlock from "../../_components/OrderAddressBlock";
import OrderDocumentLinks from "../../_components/OrderDocumentLinks";
import OrderTrackingCard from "../../_components/OrderTrackingCard";
import RequestStatusCards, { type RequestDetail } from "../../_components/RequestStatusCards";
import CancelRequestSheet from "../../_components/CancelRequestSheet";
import RequestSheet, { type RequestItemOption } from "../../_components/RequestSheet";
import type { OrderDetail } from "../../_lib/detail-types";

/**
 * Adıma bağlı aksiyon butonlarının ortak ölçüsü. Genişlik verilmiyor: bu
 * butonlar çizelgenin içinde ya da aksiyon şeridinde duruyor ve masaüstünde
 * içerikleri kadar geniş olmaları gerekiyor (plan 07 M-12).
 */
const PILL_BASE =
  "account-btn inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full border px-3 text-[11px] font-medium transition-colors";

interface OrderDetailViewProps {
  orderNumber: string;
  /** Sunucuda çekilen detay (F2-45); yoksa istemci kendisi çeker. */
  initialOrder?: OrderDetail | null;
  /** Sunucu erişimi reddettiyse ya da sipariş yoksa gösterilecek metin. */
  initialError?: string | null;
}

export default function OrderDetailView({
  orderNumber,
  initialOrder = null,
  initialError = null,
}: OrderDetailViewProps) {
  const [order, setOrder] = useState<OrderDetail | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/detail`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Sipariş detayı alınamadı");
        return;
      }
      setOrder(await res.json());
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  /**
   * Sunucu zaten bir cevap ürettiyse (veri ya da hata) mount'taki isteği
   * atla: aynı sorguyu hidrasyondan hemen sonra tekrarlamak dolu ekranı bir
   * an spinner'a çevirirdi.
   */
  const skipInitialFetch = useRef(Boolean(initialOrder || initialError));

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  const copyTracking = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedTracking(true);
    window.setTimeout(() => setCopiedTracking(false), 2000);
  }, []);

  if (loading) {
    return (
      <AccountCard>
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 size={28} aria-hidden="true" className="acc-tone-accent animate-spin" />
          <span className="sr-only">Sipariş detayı yükleniyor</span>
        </div>
      </AccountCard>
    );
  }

  if (error || !order) {
    return (
      <AccountCard>
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${chipClass("danger")}`}
          >
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <p className="mb-4 text-[13px] text-foreground-tertiary">
            {error || "Sipariş bulunamadı"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className={`${PILL_BASE} ${chipClass("accent")} ${chipHoverClass("accent")}`}
            >
              <RefreshCw size={12} aria-hidden="true" />
              Tekrar Dene
            </button>
            <Link
              href="/hesabim/siparisler"
              className={`${PILL_BASE} border-border bg-glass-bg text-foreground-secondary hover:bg-glass-bg-hover`}
            >
              Siparişlerime Dön
            </Link>
          </div>
        </div>
      </AccountCard>
    );
  }

  const statusUi = orderStatusUi(order.status);
  const StatusIcon = statusUi.icon;
  const { permissions, timeline } = order;
  const closed = order.status === "CANCELLED" || order.status === "REFUNDED";
  const latestReturn = order.requests.returns[0];

  const requestDetail: RequestDetail = {
    cancellationStatus: order.requests.cancellation?.status,
    cancellationAdminNote: order.requests.cancellation?.adminNote ?? undefined,
    returnStatus: latestReturn?.status,
    returnRequestType: latestReturn?.requestType,
    returnAdminNote: latestReturn?.adminNote ?? undefined,
    returnAddress: latestReturn?.returnAddress ?? undefined,
    returnInstructions: latestReturn?.returnInstructions ?? undefined,
    returnCode: latestReturn?.returnCode ?? undefined,
    returnImages: latestReturn?.images,
    sendBackCarrier: latestReturn?.sendBackCarrier ?? undefined,
    sendBackTrackingNumber: latestReturn?.sendBackTrackingNumber ?? undefined,
    returnItems: latestReturn?.items,
  };

  const trackingCard =
    permissions.canTrack && order.shipping.trackingNumber ? (
      <OrderTrackingCard
        carrierName={order.shipping.carrierName}
        trackingNumber={order.shipping.trackingNumber}
        trackingUrl={order.shipping.carrier?.trackingUrl ?? null}
        copied={copiedTracking}
        onCopy={copyTracking}
      />
    ) : null;

  /* İade dahil tüm uygun talep tipleri tek "Talep oluştur" panelinden açılır. */
  const requestTypes = permissions.availableRequestTypes;
  const supportActionCount =
    (permissions.canCancel ? 1 : 0) +
    (requestTypes.length > 0 ? 1 : 0) +
    (order.invoice.state !== "hidden" ? 1 : 0) +
    2;
  const stackDesktopSupportActions = Boolean(trackingCard) && supportActionCount === 3;

  /** Talep panelinde seçilebilecek kalemler (F2-67). */
  const requestItemOptions: RequestItemOption[] = order.items.map((item) => ({
    id: item.id,
    name: item.product?.name ?? "Ürün",
    quantity: item.quantity,
    image: item.product?.thumbnail ?? item.product?.images?.[0] ?? null,
    variantLabel: item.variantInfo?.value ?? null,
  }));

  return (
    <>
      {/* Breadcrumb yalnızca masaüstünde; mobilde kabuk geri oku + başlık
          basıyor (`00-KARARLAR` madde 5).

          Şeridi düzenleyen `flex` artık `<nav>`da değil `<ol>`de: `nav` sınıfı
          `hide-on-mobile` taşıyor ve o kural `display:block` dayattığı için
          ikonlar alt alta düşüyordu. Liste ayrı bir eleman olunca kural
          `nav`ın blok olmasıyla yetiniyor, ızgara bozulmuyor. */}
      <nav aria-label="Sayfa yolu" className="hide-on-mobile mb-3">
        <ol className="flex items-center gap-1.5 text-[12px] text-foreground-muted">
          <li className="flex items-center">
            <Link
              href="/"
              aria-label="Ana sayfa"
              className="flex items-center transition-colors hover:text-foreground"
            >
              <Home size={13} aria-hidden="true" />
            </Link>
          </li>
          <li aria-hidden="true" className="flex items-center">
            <ChevronRight size={12} />
          </li>
          <li className="flex items-center">
            <Link
              href="/hesabim/siparisler"
              className="transition-colors hover:text-foreground"
            >
              Siparişlerim
            </Link>
          </li>
          <li aria-hidden="true" className="flex items-center">
            <ChevronRight size={12} />
          </li>
          <li className="flex items-center">
            <span aria-current="page" className="text-foreground-secondary">
              Sipariş Detayı
            </span>
          </li>
        </ol>
      </nav>

      <AccountCard>
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0">
              <p className="break-all font-mono text-[14px] tabular-nums text-foreground">
                #{order.orderNumber}
              </p>
              <p className="mt-0.5 text-[12px] text-foreground-muted">
                {formatOrderDate(order.timestamps.createdAt, { weekday: true, time: true })}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${statusUi.chipClass}`}
            >
              <StatusIcon size={12} aria-hidden="true" />
              {order.statusLabel}
            </span>
          </div>

          <div className="space-y-2">
            {/* Bölüm başlıkları `h2`: kabuk `h1` basıyor, seviye atlanmıyor. */}
            <h2 className="account-subsection-label">
              Ürünler ({order.items.length})
            </h2>
            {order.items.map((item, index) => (
              <OrderItemCard
                key={item.id}
                item={item}
                desktopOrderAction={
                  index === 0
                    ? !permissions.canCancel && permissions.disabledReason
                        ? (
                            <div
                              role="status"
                              className={`hide-on-mobile inline-flex min-h-[36px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-center text-[11px] leading-snug ${chipClass("warning")}`}
                            >
                              <AlertCircle size={12} aria-hidden="true" className="shrink-0" />
                              <span className="min-w-0">{permissions.disabledReason}</span>
                            </div>
                          )
                        : undefined
                    : undefined
                }
              />
            ))}
          </div>

          {/* Kapanmış siparişte çizelge gösterilmiyor: durum bloğu zaten
              sürecin bittiğini söylüyor, yarım dolu çubuk çelişki yaratır. */}
          {!closed && (
            <div className="rounded-xl border border-border bg-glass-bg p-4">
              <OrderTimeline steps={timeline} />
            </div>
          )}

          {permissions.disabledReason && (
            <div className={`show-on-mobile rounded-xl p-3 ${chipClass("warning")}`}>
              <p className="flex items-start gap-2 text-[12px]">
                <AlertCircle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="min-w-0">{permissions.disabledReason}</span>
              </p>
            </div>
          )}

          <RequestStatusCards detail={requestDetail} />

          <div
            className={`grid gap-3 ${
              trackingCard ? "lg:grid-cols-2" : ""
            }`}
          >
            {/* Takip kartı mobil ve masaüstünde yalnız bu ortak gridde çizilir. */}
            {trackingCard}

            {/* Talep ve tüm belge bağlantıları tek destek kartında. Mobilde 44px,
                masaüstünde 40px olan aksiyonlar takip butonuyla aynı dili taşır. */}
            <div className="account-surface flex h-full flex-col items-stretch gap-3 rounded-xl border border-border p-3">
              {requestTypes.length > 0 && (
                <p className="text-center text-[12px] leading-relaxed text-foreground-tertiary lg:text-left">
                  Siparişinizle ilgili başka bir konu mu var?
                </p>
              )}

              <div
                className={`account-inset grid gap-2 rounded-lg p-2 ${
                  stackDesktopSupportActions ? "" : "lg:grid-cols-2"
                }`}
              >
                {permissions.canCancel && (
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    className="account-btn inline-flex h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-[color:var(--acc-danger-border)] bg-background px-3 text-[11px] font-medium text-[color:var(--acc-danger-fg)] transition-colors hover:bg-[color:var(--acc-danger-bg)] lg:h-[40px]"
                  >
                    <XCircle size={12} aria-hidden="true" />
                    Siparişi iptal et
                  </button>
                )}
                {requestTypes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRequestOpen(true)}
                    className="account-btn flex h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-[11px] font-medium transition-colors hover:border-border-hover hover:bg-glass-bg-hover lg:h-[40px]"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-foreground-secondary">
                      <MessageSquarePlus
                        size={12}
                        aria-hidden="true"
                        className="shrink-0 text-foreground-muted"
                      />
                      <span className="truncate">Talep oluştur</span>
                    </span>
                    <ChevronRight
                      size={12}
                      aria-hidden="true"
                      className="shrink-0 text-foreground-muted"
                    />
                  </button>
                )}
                <OrderDocumentLinks order={order} />
              </div>
            </div>
          </div>

          <OrderPaymentSummary order={order} />

          <OrderAddressBlock
            shipping={order.addresses.shipping}
            billing={order.addresses.billing}
          />

          {order.customerNote && (
            <div className="rounded-xl border border-border bg-glass-bg p-3">
              <p className="mb-1 text-[12px] text-foreground-muted">Sipariş Notu</p>
              <p className="text-[13px] italic text-foreground-secondary">
                &quot;{order.customerNote}&quot;
              </p>
            </div>
          )}
        </div>
      </AccountCard>

      <CancelRequestSheet
        orderNumber={cancelOpen ? order.orderNumber : null}
        onClose={() => setCancelOpen(false)}
        onSuccess={() => void load()}
      />
      <RequestSheet
        orderNumber={requestOpen ? order.orderNumber : null}
        availableTypes={requestTypes}
        availableReturnReasons={permissions.availableReturnReasons}
        orderItems={requestItemOptions}
        /* Teknik servis kısayolu ürün müşteriye ulaşmadan anlamsız (M-13). */
        delivered={order.status === "DELIVERED"}
        onClose={() => setRequestOpen(false)}
        onSuccess={() => void load()}
      />
    </>
  );
}
