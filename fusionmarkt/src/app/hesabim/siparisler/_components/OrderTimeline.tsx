"use client";

/**
 * Sipariş çizelgesi — TEK bileşen, iki yerleşim (plan 07 M-15).
 *
 * Eskiden iki bileşen vardı: liste akordiyonunda yatay `OrderTimeline`, detay
 * sayfasında dikey `OrderVerticalTimeline`. Aynı sipariş iki sayfada iki farklı
 * çizelgeyle görününce kullanıcı "burası karışık" dedi; dikey bileşen buraya
 * katıldı ve silindi.
 *
 * Adımları KENDİSİ HESAPLAMAZ: `_lib/timeline.ts → buildOrderTimeline()`
 * çıktısını basar. Liste ekranı da detay ucu da aynı fonksiyonu çağırıyor.
 *
 * YERLEŞİM AYRIMI YALNIZCA CSS: `<1024px` dikey, `≥1024px` yatay. `matchMedia`
 * ya da `window.innerWidth` ile karar vermek sunucunun bastığı HTML'i
 * istemcinin ilk render'ından ayırıp hidrasyon uyuşmazlığı üretirdi
 * (`OrderCard` başlığındaki gerekçenin aynısı). Dolum oranı da bu yüzden
 * `--acc-fill` değişkenine yazılıyor: satır içi stil medya sorgusu tanımıyor,
 * değişkeni dikeyde yüksekliğe yatayda genişliğe bağlamak CSS'in işi.
 *
 * ADIM AKSİYONLARI iki yerleşimde iki yere düşüyor. Dikeyde adımın bandına
 * sığıyor; yatayda adım sütunu bir butonu taşıyamayacak kadar dar olduğu için
 * çizelgenin altındaki aksiyon şeridine iniyor ve ilgili adım vurgulanıyor.
 * Aksiyon düğümü DOM'a iki kez giriyor (biri gizli) — `OrderCard`'daki
 * mobil/masaüstü ikilemesiyle aynı bilinçli bedel.
 */

import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { formatDate } from "../../_lib/format";
import type {
  OrderTimelineStep,
  TimelineState,
  TimelineStepKey,
} from "../_lib/detail-types";
import { chipClass } from "./order-status-ui";

const STATE_LABELS: Record<TimelineState, string> = {
  approved: "tamamlandı",
  inprogress: "şu anki adım",
  future: "henüz gerçekleşmedi",
};

interface OrderTimelineProps {
  steps: OrderTimelineStep[];
  /** Adıma bağlı aksiyonlar (iptal butonu, kargo takip kartı vb.). */
  actions?: Partial<Record<TimelineStepKey, ReactNode>>;
}

export default function OrderTimeline({ steps, actions }: OrderTimelineProps) {
  const actionSteps = steps.filter((step) => actions?.[step.key]);

  return (
    <div className="order-flow">
      <ol className="flex flex-col lg:flex-row lg:items-stretch">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const action = actions?.[step.key];
          const approved = step.state === "approved";
          const inprogress = step.state === "inprogress";

          return (
            <li
              key={step.key}
              aria-current={inprogress ? "step" : undefined}
              className={`flex min-w-0 gap-3 lg:flex-col lg:gap-0 ${
                isLast ? "lg:flex-none" : "lg:flex-1"
              }`}
            >
              {/* Nokta + adımlar arası çizgi. Dikeyde sütun, yatayda satır. */}
              <div className="flex flex-col items-center lg:w-full lg:flex-row">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    approved
                      ? chipClass("success")
                      : inprogress
                        ? "border-[color:var(--acc-accent-border)] bg-background"
                        : "border-border bg-glass-bg"
                  }`}
                >
                  {approved ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        inprogress
                          ? "bg-[color:var(--acc-accent-fg)]"
                          : "bg-foreground-disabled"
                      }`}
                    />
                  )}
                </span>

                {!isLast && (
                  /* Kılıf her zaman tam boyda; içindeki dolgu `lineFill` kadar.
                     Böylece adımlar arası mesafe dolum oranından bağımsız. */
                  <span
                    style={{ "--acc-fill": `${step.lineFill}%` } as CSSProperties}
                    className="relative my-1 w-0.5 flex-1 rounded-full bg-border lg:mx-2 lg:my-0 lg:h-0.5 lg:w-auto lg:flex-1 lg:self-center"
                  >
                    {step.lineFill > 0 && (
                      <span className="absolute left-0 top-0 h-[var(--acc-fill)] w-full rounded-full bg-[color:var(--acc-accent-border)] lg:h-full lg:w-[var(--acc-fill)]" />
                    )}
                  </span>
                )}
              </div>

              <div
                className={`min-w-0 flex-1 lg:flex-none lg:pr-3 lg:pt-2 ${
                  isLast ? "pb-0" : "pb-4"
                } lg:pb-0`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 lg:flex-col lg:items-start lg:gap-0">
                  <span
                    className={`text-[13px] ${
                      approved || inprogress
                        ? "font-medium text-foreground"
                        : "text-foreground-muted"
                    } ${action ? "lg:text-[color:var(--acc-accent-fg)]" : ""}`}
                  >
                    {step.label}
                    {/* Adım adı M-14'ten sonra geçmiş zamanda SABİT ("Teslim
                        edildi"), gerçekleşip gerçekleşmediğini görsel olarak
                        ikon/renk/tarih anlatıyor. Bu üçü de ekran okuyucuya
                        geçmiyor (✓ `aria-hidden`, renk zaten okunmaz), yani
                        teslim edilmemiş siparişte "Teslim edildi" diye
                        okunuyordu. Durumu metinle de söylüyoruz. */}
                    <span className="sr-only"> — {STATE_LABELS[step.state]}</span>
                  </span>
                  {/* Gerçekleşmemiş adımda tarih YOK — tahmini tarih üretilmiyor. */}
                  {step.date && (
                    <span className="text-[11px] tabular-nums text-foreground-muted">
                      {formatDate(step.date)}
                    </span>
                  )}
                </div>

                {step.hint && (
                  <p className="mt-0.5 truncate text-[11px] text-foreground-tertiary">
                    {step.hint}
                  </p>
                )}

              </div>
            </li>
          );
        })}
      </ol>

      {actionSteps.length > 0 && (
        <div className="order-flow-actions mt-3 flex flex-col items-stretch gap-3 border-t border-border pt-3 lg:mt-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-6 lg:gap-y-3">
          {actionSteps.map((step) => (
            <div
              key={step.key}
              className={`order-flow-action min-w-0 max-w-full ${
                step.key === "preparing" ? "lg:hidden" : ""
              }`}
            >
              <p className="mb-1.5 hidden text-[11px] text-[color:var(--acc-accent-fg)] lg:block">
                {step.label}
              </p>
              {actions?.[step.key]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
