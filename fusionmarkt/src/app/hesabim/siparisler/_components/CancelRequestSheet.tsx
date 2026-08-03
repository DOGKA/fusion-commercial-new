"use client";

/**
 * Sipariş iptal talebi.
 *
 * Eski inline modalden `Sheet`'e taşındı: davranış aynı, kazanç odak tuzağı,
 * Escape ile kapatma ve arka plan kaydırma kilidi (hiçbiri eskisinde yoktu).
 *
 * Referansın 6 maddelik iptal nedeni listesi bu dilimde eklendi. Neden ZORUNLU:
 * uç nokta alanı opsiyonel kabul ediyor ama nedensiz iptal talebi admin'e
 * "niye iptal ediyor" sorusunu bırakıyor ve o soru müşteriye tekrar sorulamıyor.
 * "Diğer" seçilirse serbest metin isteniyor.
 */

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import {
  CANCEL_REASON_LABELS,
  CANCEL_REASON_REQUIRING_TEXT,
  type CancelReasonKey,
} from "@/lib/orders";
import { SHEET_SECONDARY, sheetPrimary } from "../_lib/action-classes";
import { chipClass, toneClass } from "./order-status-ui";

interface CancelRequestSheetProps {
  /**
   * Açıksa siparişin numarası, kapalıysa `null`.
   *
   * Tüm `Order` nesnesi yerine yalnızca numara alıyor: sheet'in ihtiyacı bu
   * kadar ve liste ile detay ekranları farklı şekiller döndürüyor
   * (`Order` vs `OrderDetail`). Numaraya indirgemek ikisinden de çağrılabilmesini
   * sağlıyor.
   */
  orderNumber: string | null;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

export default function CancelRequestSheet({
  orderNumber,
  onClose,
  onSuccess,
}: CancelRequestSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState<CancelReasonKey | "">("");
  const [detail, setDetail] = useState("");

  const detailRequired = reason === CANCEL_REASON_REQUIRING_TEXT;

  const close = () => {
    setError(null);
    setSuccess(null);
    setReason("");
    setDetail("");
    onClose();
  };

  const submit = async () => {
    if (!orderNumber) return;
    if (!reason) {
      setError("Lütfen bir iptal nedeni seçiniz");
      return;
    }
    if (detailRequired && !detail.trim()) {
      setError("Lütfen iptal nedeninizi kısaca yazınız");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Serbest metin, etiketin arkasına ekleniyor: uç nokta tek bir `reason`
      // alanı tutuyor, ayrı açıklama kolonu yok.
      const reasonText = detailRequired
        ? `${CANCEL_REASON_LABELS[reason]} — ${detail.trim()}`
        : CANCEL_REASON_LABELS[reason];

      const res = await fetch(`/api/orders/${orderNumber}/cancel-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "İptal talebi oluşturulamadı");
        return;
      }

      setSuccess(data.message || "İptal talebiniz alındı.");
      onSuccess(orderNumber);
      window.setTimeout(close, 2500);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={orderNumber !== null}
      onClose={close}
      title="Sipariş İptali"
      busy={loading}
      footer={
        success ? null : (
          <div className="flex gap-3">
            <button type="button" onClick={close} className={SHEET_SECONDARY}>
              Vazgeç
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !reason}
              className={sheetPrimary("danger")}
            >
              {loading ? (
                <>
                  <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "İptal Talebi Oluştur"
              )}
            </button>
          </div>
        )
      }
    >
      {success ? (
        <div className="py-4 text-center">
          {/* Zemin `-bg`, sınır `-border`: daire eskiden doğrudan `-border`
              rengiyle dolduruluyordu, o değişken artık sınır için koyu
              olduğundan aynı tonun ikonu üstünde kaybolurdu. */}
          <div className="acc-chip-success mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Check size={28} aria-hidden="true" />
          </div>
          <p className="text-[14px] text-foreground">{success}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-glass-bg p-3">
            <p className="mb-1 text-[12px] text-foreground-muted">Sipariş No</p>
            <p className="break-all font-mono text-[14px] tabular-nums text-foreground">
              #{orderNumber}
            </p>
          </div>

          <div className={`rounded-lg p-3 ${chipClass("warning")}`}>
            <p className="text-[13px]">
              <strong>Uyarı:</strong> İptal talebiniz mağaza onayına gönderilecektir. Onay
              sonrası ödemeniz iade edilecektir.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-[13px] text-foreground-secondary">
              İptal nedeni seç <span className={toneClass("danger")}>*</span>
            </legend>
            <div className="space-y-1.5">
              {(Object.keys(CANCEL_REASON_LABELS) as CancelReasonKey[]).map((key) => (
                <label
                  key={key}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-glass-bg px-3 transition-colors hover:border-border-hover has-[:checked]:border-[color:var(--acc-danger-border)] has-[:checked]:bg-[color:var(--acc-danger-bg)]"
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={key}
                    checked={reason === key}
                    onChange={() => setReason(key)}
                    className="h-4 w-4 shrink-0 accent-[color:var(--acc-danger-fg)]"
                  />
                  <span className="text-[13px] text-foreground">
                    {CANCEL_REASON_LABELS[key]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {detailRequired && (
            <div>
              <label
                htmlFor="cancel-detail"
                className="mb-2 block text-[13px] text-foreground-secondary"
              >
                Nedeninizi kısaca yazın <span className={toneClass("danger")}>*</span>
              </label>
              <textarea
                id="cancel-detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Siparişi neden iptal etmek istiyorsunuz?"
                className="w-full resize-none rounded-lg border border-border bg-glass-bg px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground-muted transition-colors focus:border-[color:var(--acc-danger-fg)] focus:outline-none"
              />
            </div>
          )}

          {/*
            Adres ve ödeme yöntemi değişikliği iptal gerektirmiyor olabilir; ama
            ikisi de bugün müşteri tarafından yapılamıyor (F2-12). Yönlendirme
            vermek, "iptal etme, şuradan değiştir" diyip sonra değiştirememekten
            iyi değil — bu yüzden ek yönlendirme koymuyoruz.
          */}

          {error && (
            <div className={`rounded-lg p-3 ${chipClass("danger")}`} role="alert">
              <p className="text-[13px]">{error}</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
