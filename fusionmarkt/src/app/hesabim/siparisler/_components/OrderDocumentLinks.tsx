"use client";

/**
 * Belge satırları: fatura, sözleşmeler, iade koşulları (plan 03 Faz 3.9).
 *
 * Sözleşmeler için YENİ bir görüntüleyici yazılmadı: `/sozlesmeler/[orderNumber]`
 * sayfası zaten var ve sipariş anında kaydedilmiş sözleşme HTML'ini basıyor.
 * Burada ikinci bir HTML render'ı açmak, aynı içeriği iki yerde tutmak olurdu.
 *
 * Fatura satırının üç durumu `lib/orders.ts`'teki `invoiceRowState` ile
 * belirleniyor ve sunucudan geliyor:
 *  - `active`  → indirilebilir
 *  - `pending` → teslim edildi ama fatura henüz yüklenmedi (pasif satır)
 *  - `hidden`  → henüz teslim edilmedi, satır hiç görünmez
 */

import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Clock,
  ScrollText,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import type { OrderDetail } from "../_lib/detail-types";

interface OrderDocumentLinksProps {
  order: OrderDetail;
}

/**
 * Takip kartındaki "Takip et" ile aynı aksiyon ölçüsü: mobilde 44px,
 * masaüstünde 40px, 11px yazı ve `rounded-lg`.
 */
const ROW_CLASS =
  "account-btn flex h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-[11px] font-medium transition-colors hover:border-border-hover hover:bg-glass-bg-hover lg:h-[40px]";

/** Bekleyen fatura açıklaması dar ekranda kırılabildiği için tek esnek satırdır. */
const PENDING_ROW_CLASS =
  "flex min-h-[44px] w-full flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg border border-border bg-background px-3 py-2 text-[11px] font-medium lg:min-h-[40px]";

/** Sol taraftaki etiket; uzun metinde satırı büyütmek yerine kırpılır. */
const LABEL_CLASS = "flex min-w-0 flex-1 items-center gap-1.5 text-[11px]";

export default function OrderDocumentLinks({ order }: OrderDocumentLinksProps) {
  const invoiceState = order.invoice.state;

  return (
    <div className="contents">
      {invoiceState !== "hidden" &&
        (invoiceState === "active" && order.invoice.url ? (
          <a
            href={order.invoice.url}
            target="_blank"
            rel="noopener noreferrer"
            className={ROW_CLASS}
          >
            <span className={`${LABEL_CLASS} text-foreground-secondary`}>
              <FileText size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
              <span className="truncate">Fatura bilgisi</span>
            </span>
            <span className="acc-tone-accent flex shrink-0 items-center gap-1 text-[11px]">
              İndir
              <ExternalLink size={11} aria-hidden="true" />
            </span>
          </a>
        ) : (
          <div className={`${PENDING_ROW_CLASS} cursor-default`}>
            <span className={`${LABEL_CLASS} text-foreground-tertiary`}>
              <FileText size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
              <span className="truncate">Fatura bilgisi</span>
            </span>
            <span className="acc-tone-warning flex w-full items-center gap-1.5 text-[11px] sm:w-auto">
              <Clock size={11} aria-hidden="true" className="shrink-0" />
              <span className="min-w-0">Hazır olduğunda indirebilirsiniz</span>
            </span>
          </div>
        ))}

      <Link href={`/sozlesmeler/${order.orderNumber}`} className={ROW_CLASS}>
        <span className={`${LABEL_CLASS} text-foreground-secondary`}>
          <ScrollText size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
          <span className="truncate">Sözleşmeler</span>
        </span>
        <ChevronRight size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
      </Link>

      <Link href="/iade-politikasi" className={ROW_CLASS}>
        <span className={`${LABEL_CLASS} text-foreground-secondary`}>
          <RotateCcw size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
          <span className="truncate">İade koşulları</span>
        </span>
        <ChevronRight size={12} aria-hidden="true" className="shrink-0 text-foreground-muted" />
      </Link>
    </div>
  );
}
