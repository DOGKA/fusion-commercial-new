"use client";

/**
 * Sipariş kartı — kapalı başlık + açılan gövde.
 *
 * Yeniden tasarımın özü referanstan geliyor: kartın solunda ürün görselleri
 * ızgarası var. Eski kart yalnızca bir durum ikonu gösteriyordu, yani müşteri
 * listeye bakarak hangi siparişin hangi ürün olduğunu ayırt edemiyordu —
 * sipariş numarası tek ayırt edici işaretti ve kimse numarayı hatırlamıyor.
 *
 * Mobilde sipariş numarası gizli (`hide-on-mobile`): dar ekranda satırın yarısını
 * yiyordu ve okunması gereken bilgi değil.
 *
 * MOBİL / MASAÜSTÜ AYRIMI (plan 03 Faz 3.2, `00-KARARLAR` madde 5):
 * masaüstünde satır akordiyon olarak açılır, mobilde ayrı detay sayfasına
 * gidilir — dar ekranda akordiyon içeriği çok uzun.
 *
 * Ayrım JS'te değil CSS'te (`hide-on-mobile` / `show-on-mobile`, ikisi de tam
 * 1023px kırılımını kullanıyor). `matchMedia` ile render sırasında karar
 * vermek, sunucunun bastığı HTML ile istemcinin ilk render'ını ayrıştırıp
 * hidrasyon uyuşmazlığı üretirdi. Bedeli, başlık içeriğinin iki kez DOM'a
 * girmesi (biri gizli) — bunun için ortak `CardSummary` alt bileşeni var.
 */

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatDateShort, formatPrice } from "../../_lib/format";
import type { Order } from "../../_lib/types";
import {
  isTerminalOrderStatus,
  orderStatusUi,
  paymentStatusUi,
} from "./order-status-ui";
import OrderDetailBody from "./OrderDetailBody";
import type { RequestDetail } from "./RequestStatusCards";

/** Izgarada gösterilen görsel sayısı; kalanı "+N" olarak toplanır. */
const MAX_THUMBNAILS = 3;
const DESKTOP_MAX_THUMBNAILS = 4;

/**
 * Kartın kapalı hâldeki içeriği. Modül seviyesinde duruyor: render içinde
 * tanımlanan bileşen her render'da yeni bir tip olur ve state'ini sıfırlar.
 */
function CardSummary({
  order,
  trailing,
}: {
  order: Order;
  trailing: React.ReactNode;
}) {
  const statusUi = orderStatusUi(order.status);
  const paymentUi = paymentStatusUi(order.paymentStatus);
  const StatusIcon = statusUi.icon;
  /**
   * Kapanmış siparişte ödeme etiketi susturuluyor: "İptal Edildi · İade
   * Edildi" satırı müşteriye iki ayrı olay yaşanmış gibi görünüyordu
   * (plan 07 B-4). Süreci devam eden siparişte ödeme durumu hâlâ ayrı bir
   * bilgi, orada basılmaya devam ediyor.
   */
  const showPaymentLabel =
    order.status !== "PENDING" && !isTerminalOrderStatus(order.status);

  const thumbnails = order.items
    .map((item) => item.product?.thumbnail || item.product?.images?.[0] || null)
    .filter((src): src is string => !!src);
  const extraCount = order.items.length - Math.min(thumbnails.length, MAX_THUMBNAILS);

  return (
    <div className="order-card-header relative flex w-full items-center gap-3 p-4 text-left sm:gap-4">
      {thumbnails.length > 0 ? (
        <div className="order-thumbs flex shrink-0 items-center -space-x-2">
          {thumbnails.slice(0, MAX_THUMBNAILS).map((src, index) => (
            <div
              key={index}
              className="relative h-11 w-11 overflow-hidden rounded-lg border border-border bg-background"
              style={{ zIndex: MAX_THUMBNAILS - index }}
            >
              <Image src={src} alt="" fill sizes="44px" className="object-contain p-0.5" />
            </div>
          ))}
          {extraCount > 0 && (
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background-secondary text-[12px] font-medium text-foreground-tertiary">
              +{extraCount}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`order-status-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${statusUi.chipClass}`}
        >
          <StatusIcon size={18} aria-hidden="true" />
        </div>
      )}

      <div className="order-info min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {/*
            Sipariş numarası rozetten önce geliyor: kullanıcı kartı ararken
            önce numaraya bakıyor, durum ikincil bilgi. Sıra CSS `order` ile
            değil DOM'da veriliyor ki ekran okuyucu da aynı sırayı duyursun.
            Mobilde numara `hide-on-mobile` ile gizli olduğundan rozet zaten
            tek başına kalıyor; değişim yalnız masaüstünde görünür.
          */}
          <span className="order-number-text hide-on-mobile font-mono text-[13px] tabular-nums text-foreground-tertiary">
            #{order.orderNumber}
          </span>
          {/*
            Rozetin iki görünümü var, tek DOM (plan 07 M-11): masaüstünde
            çipli, mobilde zeminsiz/kenarlıksız yalnız ikon + 13px kalın metin.
            Kutunun içinde ikinci bir kutu duruyormuş hissini o veriyordu.
            Ayrımı `.account-status-badge` medya sorgusuyla yapıyor (Agent A,
            `account.css`); buradaki iş ton sınıfını vermek.

            İkon ölçüsü CSS ile büyüyor: `size` yalnızca `width`/`height`
            özniteliği yazıyor, sınıf onu eziyor.
          */}
          <span className={`account-status-badge min-w-0 ${statusUi.chipClass}`}>
            <StatusIcon
              className="h-3.5 w-3.5 shrink-0 lg:h-[11px] lg:w-[11px]"
              aria-hidden="true"
            />
            {statusUi.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-foreground-muted">
          <span className="tabular-nums">{formatDate(order.createdAt)}</span>
          <span aria-hidden="true">•</span>
          <span className="tabular-nums">{order.items.length} ürün</span>
          {showPaymentLabel && (
            <>
              <span aria-hidden="true">•</span>
              <span className={paymentUi.toneClass}>{paymentUi.label}</span>
            </>
          )}
        </div>
      </div>

      <div className="order-total min-w-0 shrink-0 text-right">
        <p className="mb-1 whitespace-nowrap text-[16px] font-semibold tabular-nums text-foreground">
          {formatPrice(order.total)}
        </p>
        {trailing}
      </div>
    </div>
  );
}

function DesktopSummary({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusUi = orderStatusUi(order.status);
  const paymentUi = paymentStatusUi(order.paymentStatus);
  const showPaymentLabel =
    order.status !== "PENDING" && !isTerminalOrderStatus(order.status);
  const thumbnails = order.items
    .map((item) => item.product?.thumbnail || item.product?.images?.[0] || null)
    .filter((src): src is string => !!src);
  const extraCount =
    order.items.length - Math.min(thumbnails.length, DESKTOP_MAX_THUMBNAILS);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={`order-body-${order.id}`}
      aria-label={`${order.orderNumber} numaralı siparişin detayını ${expanded ? "kapat" : "aç"}`}
      className="grid min-h-[88px] w-full grid-cols-[minmax(320px,2.25fr)_minmax(110px,0.65fr)_minmax(150px,0.85fr)_minmax(120px,0.55fr)] items-center gap-5 px-6 py-4 text-left transition-colors hover:bg-glass-bg-hover"
    >
      <div className="flex min-w-0 items-center gap-4">
        {thumbnails.length > 0 ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {thumbnails.slice(0, DESKTOP_MAX_THUMBNAILS).map((src, index) => (
              <div
                key={index}
                className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-background"
              >
                <Image src={src} alt="" fill sizes="48px" className="object-contain p-1" />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background-secondary text-[12px] font-medium text-foreground-tertiary">
                +{extraCount}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background-secondary">
            <statusUi.icon size={20} aria-hidden="true" className={statusUi.toneClass} />
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tabular-nums text-foreground">
            #{order.orderNumber}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] text-foreground-muted">
            <span>{order.items.length} ürün</span>
            {showPaymentLabel && (
              <>
                <span aria-hidden="true">•</span>
                <span className={paymentUi.toneClass}>{paymentUi.label}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="whitespace-nowrap text-[13px] tabular-nums text-foreground-secondary">
        {formatDateShort(order.createdAt)}
      </p>

      <div className={`flex min-w-0 items-center gap-2 text-[13px] ${statusUi.toneClass}`}>
        <span className="h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
        <span className="truncate">{statusUi.label}</span>
      </div>

      <p className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-foreground">
        {formatPrice(order.total)}
      </p>
    </button>
  );
}

interface OrderCardProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  requestDetail: RequestDetail | undefined;
}

export default function OrderCard({
  order,
  expanded,
  onToggle,
  requestDetail,
}: OrderCardProps) {
  return (
    <div
      id={`order-${order.id}`}
      className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-glass-bg lg:transition-colors lg:hover:border-border-hover"
    >
      {/* Mobil: detay sayfasına git */}
      <div className="show-on-mobile overflow-hidden rounded-xl border border-border bg-glass-bg transition-all hover:border-border-hover">
        <Link
          href={`/hesabim/siparisler/${encodeURIComponent(order.orderNumber)}`}
          aria-label={`${order.orderNumber} numaralı siparişin detayı`}
        >
          <CardSummary
            order={order}
            trailing={
              <ChevronRight
                size={16}
                aria-hidden="true"
                className="ml-auto text-foreground-muted"
              />
            }
          />
        </Link>
      </div>

      {/* Masaüstü: referanstaki tablo satırı, mevcut akordiyon davranışı korunur. */}
      <div className="hide-on-mobile">
        <DesktopSummary order={order} expanded={expanded} onToggle={onToggle} />
      </div>

      {/* Kap her zaman DOM'da: `aria-controls` var olmayan bir kimliği işaret
          ederse denetim aracı bağlantıyı kurulmamış sayıyor. Kapalıyken boş ve
          `hidden`, masaüstünde açılınca `hide-on-mobile` devralıyor. */}
      <div
        id={`order-body-${order.id}`}
        className={expanded ? "hide-on-mobile" : "hidden"}
      >
        {expanded && (
          <OrderDetailBody
            order={order}
            requestDetail={requestDetail}
          />
        )}
      </div>
    </div>
  );
}
