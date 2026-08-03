"use client";

/**
 * Kargo takip kartı — sipariş detayındaki destek ızgarasında kullanılıyor.
 *
 * Takip numarası 4'erli gruplanıyor (`groupTrackingNumber`): uzun barkodu
 * telefonda okuyup kargo sitesine elle girmek gruplamasız neredeyse imkânsız.
 *
 * Kargo firması logosu yok — `CarrierInfo.logo` alanı tanımlı ama 12 firmanın
 * hiçbirinde dolu değil ve logo bir marka varlığı, uydurulamaz (sicilde F2-58).
 */

import { Truck, Copy, Check, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { groupTrackingNumber } from "@/lib/orders";
import { toneClass } from "./order-status-ui";

interface OrderTrackingCardProps {
  carrierName: string | null;
  trackingNumber: string;
  trackingUrl: string | null;
  copied: boolean;
  onCopy: (trackingNumber: string) => void;
}

function TrackingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3 py-2 first:pt-0 last:pb-0 sm:grid-cols-[108px_minmax(0,1fr)]">
      <dt className="text-[11px] font-medium text-foreground-muted">{label}</dt>
      <dd className="min-w-0 text-[12px] text-foreground-secondary">{children}</dd>
    </div>
  );
}

export default function OrderTrackingCard({
  carrierName,
  trackingNumber,
  trackingUrl,
  copied,
  onCopy,
}: OrderTrackingCardProps) {
  return (
    <div className="account-surface min-w-0 rounded-xl border border-border p-3 lg:h-full">
      <p
        className={`mb-3 flex items-center gap-2 text-[12px] font-medium ${toneClass("progress")}`}
      >
        <Truck size={14} aria-hidden="true" />
        Kargo Takip
      </p>

      <dl className="account-inset divide-y divide-border rounded-lg p-2.5">
        {carrierName && (
          <TrackingRow label="Kargo firması">
            <span className="block truncate">{carrierName}</span>
          </TrackingRow>
        )}

        <TrackingRow label="Takip numarası">
          <div className="flex min-w-0 items-center gap-2">
            <p className="min-w-0 flex-1 break-words font-mono text-[13px] leading-relaxed tabular-nums text-foreground lg:text-[14px]">
              {groupTrackingNumber(trackingNumber)}
            </p>
            <button
              type="button"
              onClick={() => onCopy(trackingNumber)}
              className="account-btn inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground-secondary transition-colors hover:border-border-hover hover:bg-glass-bg-hover lg:h-[40px] lg:w-[40px]"
              aria-label={copied ? "Takip numarası kopyalandı" : "Takip numarasını kopyala"}
              title={copied ? "Kopyalandı" : "Kopyala"}
            >
              {copied ? (
                <Check size={14} aria-hidden="true" className={toneClass("success")} />
              ) : (
                <Copy size={14} aria-hidden="true" className="text-foreground-muted" />
              )}
            </button>
          </div>
        </TrackingRow>

      </dl>

      {trackingUrl ? (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="account-btn mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-[color:var(--acc-progress-border)] bg-background px-3 text-[11px] font-medium text-[color:var(--acc-progress-fg)] transition-colors hover:bg-[color:var(--acc-progress-bg)] lg:min-h-[40px]"
        >
          <ExternalLink size={12} aria-hidden="true" />
          Takip et
        </a>
      ) : (
        <p className="mt-2 text-center text-[11px] text-foreground-muted">
          Kargo firması sitesinden takip edebilirsiniz
        </p>
      )}

    </div>
  );
}
