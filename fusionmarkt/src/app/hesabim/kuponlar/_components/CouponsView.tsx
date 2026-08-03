"use client";

/**
 * Kuponlarım — tek liste.
 *
 * Referanstaki üç sekme (`Kuponlarım` / `Senin için seçtiklerimiz` / `Tümü`) tek
 * listeye indirildi: kişiye özel kupon atama ve öneri altyapısı olmadığı için
 * üç sekme de aynı kaynağı gösterirdi.
 */

import { useState } from "react";
import { TicketPercent, Ticket } from "lucide-react";
import {
  AccountEmptyState,
  AccountErrorState,
  AccountSkeleton,
} from "../../_components/shared";
import { useCoupons } from "../_lib/useCoupons";
import type { UserCoupon, UserCouponsResponse } from "../_lib/types";
import CouponTicketCard from "./CouponTicketCard";
import CouponDetailsSheet from "./CouponDetailsSheet";
import CouponCheckSheet from "./CouponCheckSheet";

export default function CouponsView({
  initialData,
}: {
  /** Sunucuda çekilen liste (F2-45); yoksa istemci kendisi çeker. */
  initialData?: UserCouponsResponse | null;
}) {
  const { data, loading, error, reload } = useCoupons(initialData);
  const [detailsFor, setDetailsFor] = useState<UserCoupon | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);

  // Panel liste boşken de gerekiyor: listede görünmeyen bir kuponun kodu
  // elinde olan kullanıcı tam olarak o ekranda kalıyor.
  const checkButton = (
    <button
      type="button"
      onClick={() => setCheckOpen(true)}
      className="account-btn inline-flex shrink-0 items-center justify-center gap-1.5 min-h-[40px] px-3 bg-glass-bg border border-border text-foreground rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-border)]"
    >
      <Ticket size={13} aria-hidden="true" />
      Kupon kodum var
    </button>
  );

  const sheets = (
    <>
      <CouponDetailsSheet coupon={detailsFor} onClose={() => setDetailsFor(null)} />
      <CouponCheckSheet
        open={checkOpen}
        onClose={() => setCheckOpen(false)}
        onShowDetails={setDetailsFor}
      />
    </>
  );

  if (loading) return <AccountSkeleton variant="orderRow" count={3} />;
  if (error) return <AccountErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  if (data.coupons.length === 0) {
    return (
      <div>
        <AccountEmptyState
          icon={TicketPercent}
          title="Şu anda kullanabileceğin kupon yok"
          description="Yeni kuponlar burada listelenir. Elinde bir kod varsa aşağıdan sorgulayabilirsin."
          action={{ label: "Kampanyalara göz at", href: "/magaza" }}
        />
        <div className="mt-3 flex justify-center">{checkButton}</div>
        {sheets}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-[12px] text-foreground-muted">
          Kodu kopyalayıp ödeme adımındaki kupon alanına yazabilirsin.
        </p>
        {checkButton}
      </div>

      <div className="space-y-3">
        {data.coupons.map((coupon) => (
          <CouponTicketCard
            key={coupon.id}
            coupon={coupon}
            onShowDetails={setDetailsFor}
          />
        ))}
      </div>

      {sheets}
    </div>
  );
}
