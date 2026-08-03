"use client";

/**
 * "Kupon kodum var" paneli (F2-31).
 *
 * Neden gerekli: `showInMyCoupons` bir duyuru bayrağı, kullanım hakkı değil.
 * Bayrağı kapalı bir kupon da geçerlidir ve listede görünmez — kodu elinde
 * olan kullanıcının onu deneyebileceği tek yer ödeme adımıydı. Burada sepet
 * doldurmadan, kodun çalışıp çalışmadığını görebiliyor.
 *
 * "Hesabıma kaydet" YOK: kişiye özel kupon atama (`UserCoupon`) kapsam dışı.
 * Panel kodu doğruluyor ve koşulları gösteriyor, bir yere eklemiyor.
 */

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import type { UserCoupon } from "../_lib/types";
import CouponTicketCard from "./CouponTicketCard";

interface CouponCheckSheetProps {
  open: boolean;
  onClose: () => void;
  onShowDetails: (coupon: UserCoupon) => void;
}

type CheckResponse =
  | { found: true; coupon: UserCoupon; listed: boolean }
  | { found: false; reason: string };

export default function CouponCheckSheet({
  open,
  onClose,
  onShowDetails,
}: CouponCheckSheetProps) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || checking) return;

    setChecking(true);
    setResult(null);
    try {
      const res = await fetch("/api/user/coupons/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ found: false, reason: body.error || "Kupon kodu kontrol edilemedi." });
        return;
      }
      setResult(body as CheckResponse);
    } catch {
      setResult({ found: false, reason: "Bağlantı kurulamadı. Lütfen tekrar deneyiniz." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Kupon kodum var"
      description="Kodun geçerli olup olmadığını sepet doldurmadan görebilirsin."
      size="md"
      busy={checking}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            className="text-[11px] text-foreground-muted uppercase tracking-wide"
            htmlFor="coupon-code-input"
          >
            Kupon kodu
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="coupon-code-input"
              type="text"
              value={code}
              // Kodlar büyük harf saklanıyor; kullanıcı küçük yazsa da
              // gördüğü metin sunucudaki hâliyle aynı olsun.
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ÖRN. HOSGELDIN10"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby={
                result && !result.found ? "coupon-check-error" : undefined
              }
              aria-invalid={result ? !result.found : undefined}
              className="min-w-0 flex-1 min-h-[44px] lg:min-h-[40px] px-3 bg-glass-bg border border-border rounded-lg text-[13px] text-foreground placeholder:text-foreground-disabled focus:border-[color:var(--acc-accent-border)] tracking-wider"
            />
            <button
              type="submit"
              disabled={checking || !code.trim()}
              className={`account-btn acc-chip-accent inline-flex shrink-0 items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-fg)] ${DISABLED_TONE}`}
            >
              {checking ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <Search size={13} aria-hidden="true" />
              )}
              Sorgula
            </button>
          </div>
        </div>
      </form>

      {result && !result.found && (
        <p
          id="coupon-check-error"
          role="alert"
          className="acc-chip-danger mt-4 block px-3 py-2 rounded-lg text-[12px]"
        >
          {result.reason}
        </p>
      )}

      {result?.found && (
        <div className="mt-4 space-y-3">
          <p className="acc-tone-accent text-[12px]">
            {result.listed
              ? "Bu kupon zaten listende. Kodu kopyalayıp ödeme adımında kullanabilirsin."
              : "Kod geçerli. Kuponlarım listesinde görünmüyor ama kullanabilirsin."}
          </p>

          <CouponTicketCard coupon={result.coupon} onShowDetails={onShowDetails} />

          {result.coupon.minOrderAmount ? (
            <p className="text-[11px] text-foreground-muted">
              Sepet tutarı koşulu ödeme adımında kontrol edilir.
            </p>
          ) : null}
        </div>
      )}
    </Sheet>
  );
}
