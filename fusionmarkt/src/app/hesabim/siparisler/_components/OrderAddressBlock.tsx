"use client";

/**
 * Adres bilgileri (plan 03 Faz 3.8).
 *
 * İki bağlayıcı karar burada uygulanıyor (`00-KARARLAR` madde 5):
 *  1. **Fatura adresi varsayılan KAPALI akordiyon** — vakaların çoğunda
 *     teslimat adresiyle birebir aynı; ikisini yan yana açık göstermek ekranı
 *     iki kez aynı bilgiyle dolduruyor.
 *  2. **Telefon maskeli** (`0555*****67`). Adres bloğu sipariş paylaşımında
 *     ekran görüntüsü alınan bir yer; tam numarayı basmaya gerek yok.
 */

import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { OrderDetailAddress } from "../_lib/detail-types";
import OrderAddressDetails from "./OrderAddressDetails";

interface OrderAddressBlockProps {
  shipping: OrderDetailAddress | null;
  billing: OrderDetailAddress | null;
}

export default function OrderAddressBlock({
  shipping,
  billing,
}: OrderAddressBlockProps) {
  const [billingOpen, setBillingOpen] = useState(false);

  if (!shipping && !billing) return null;

  return (
    <div className="space-y-2">
      <h2 className="account-subsection-label">
        Adres Bilgileri
      </h2>

      {shipping && (
        <div className="rounded-xl border border-border bg-glass-bg p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] text-foreground-secondary">
            <MapPin size={12} aria-hidden="true" className="shrink-0" />
            Teslimat Adresi
          </p>
          <OrderAddressDetails address={shipping} />
        </div>
      )}

      {billing && (
        <div className="overflow-hidden rounded-xl border border-border bg-glass-bg">
          <button
            type="button"
            onClick={() => setBillingOpen((prev) => !prev)}
            aria-expanded={billingOpen}
            aria-controls="order-billing-address"
            className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 text-left"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-foreground-secondary">
              <FileText size={12} aria-hidden="true" className="shrink-0" />
              Fatura Adresi
            </span>
            {billingOpen ? (
              <ChevronUp size={14} aria-hidden="true" className="shrink-0 text-foreground-muted" />
            ) : (
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="shrink-0 text-foreground-muted"
              />
            )}
          </button>
          {/* Kap her zaman DOM'da: `aria-controls` var olmayan bir kimliği
              işaret etmesin. */}
          <div
            id="order-billing-address"
            className={billingOpen ? "border-t border-border px-3 py-3" : "hidden"}
          >
            {billingOpen && <OrderAddressDetails address={billing} />}
          </div>
        </div>
      )}
    </div>
  );
}
