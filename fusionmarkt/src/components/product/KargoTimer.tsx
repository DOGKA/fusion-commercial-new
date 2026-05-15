"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

// iOS-style Squircle border-radius
const SQUIRCLE = {
  sm: '10px',
  md: '14px',
};

// Timer pulse animation - CSS injection
const pulseAnimationStyle = `
  @keyframes timerPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .timer-pulse {
    animation: timerPulse 1.5s ease-in-out infinite;
  }
  .timer-text-checkout {
    font-size: 13px !important;
  }
  @media (max-width: 768px) {
    .timer-text-checkout {
      font-size: 10px !important;
    }
  }
`;

// Hydration-safe mounted state
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

const TIMEZONE = "Europe/Istanbul";

interface KargoTimerProps {
  /** "siparis" = Ürün sayfası, "odeme" = Checkout sayfası */
  variant?: "siparis" | "odeme";
  /** Stokta mı? */
  inStock?: boolean;
  /** Ücretsiz kargo mı? (checkout sayfasında renk değişimi için) */
  isFreeShipping?: boolean;
  /** Özel class */
  className?: string;
}

interface TimerConfig {
  enabled: boolean;
  weekdayCutoff: { hour: number; minute: number };
  saturdayEnabled: boolean;
  saturdayCutoff: { hour: number; minute: number };
  /** YYYY-MM-DD listesi (Türkiye/Istanbul tarihleri) */
  holidays: string[];
}

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  dayText: string;
  /** Ürün sayfasındaki banner için: bar gece yarısına mı (cut-off geçmiş) yoksa cut-off'a mı sayıyor */
  isToCutoff: boolean;
}

const DEFAULT_CONFIG: TimerConfig = {
  enabled: true,
  weekdayCutoff: { hour: 14, minute: 0 },
  saturdayEnabled: false,
  saturdayCutoff: { hour: 13, minute: 0 },
  holidays: [],
};

// ─────────────────────────────────────────────────────────────────────────
// Saat dilimi yardımcıları — kullanıcının cihazı nerede olursa olsun
// hesaplamayı Türkiye saatine (Europe/Istanbul) sabitlemek için.
// ─────────────────────────────────────────────────────────────────────────

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0=Pazar, 1=Pzt, ..., 6=Cumartesi
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const hour = parseInt(parts.hour, 10);
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: hour === 24 ? 0 : hour, // bazı runtime'larda 24 dönebiliyor
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
    weekday: WEEKDAY_MAP[parts.weekday] ?? 0,
  };
}

/** Verilen TZ'deki "wall clock" tarih/saatini temsil eden UTC Date — dakika hesapları için yeterli. */
function zonedDateTimeAsUtcDate(year: number, month: number, day: number, hour: number, minute: number, second = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toIsoDate(year: number, month: number, day: number): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${year}-${pad(month)}-${pad(day)}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Sevkiyat günü bulma + zamanlama
// ─────────────────────────────────────────────────────────────────────────

interface ShipResult {
  /** Kargonun çıkacağı gerçek tarih (ISO YYYY-MM-DD, Istanbul) */
  shipIso: string;
  /** Bugün (Istanbul) ile arasındaki gün farkı: 0 = bugün, 1 = yarın, 2+ = ileri */
  dayDiff: number;
  /** İlgili candidate günün haftası: 0=Pazar..6=Cumartesi */
  shipWeekday: number;
}

function findShipDate(now: Date, config: TimerConfig): ShipResult {
  const today = getZonedParts(now, TIMEZONE);
  const todayIso = toIsoDate(today.year, today.month, today.day);

  // Adaylar Istanbul'da gün gün ilerletilir. UTC tabanlı bir cursor kullanmak
  // gün eklemede DST/saat dilimi bağımsız çalışır (TR'de DST yok ama yine de güvenli).
  const cursor = new Date(Date.UTC(today.year, today.month - 1, today.day));

  for (let i = 0; i < 60; i++) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    const iso = toIsoDate(y, m, d);
    // Bu candidate tarihinin haftası — UTC gün üzerinden hesaplanır,
    // tarih kısmı Istanbul tarihiyle aynı olduğu için sonucu doğrudur.
    const weekday = cursor.getUTCDay();
    const isHoliday = config.holidays.includes(iso);
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;
    const isOpen = !isHoliday && !isSunday && !(isSaturday && !config.saturdayEnabled);

    if (isOpen) {
      if (iso === todayIso) {
        // Bugün — cut-off'a göre karar ver
        const cutoff = isSaturday ? config.saturdayCutoff : config.weekdayCutoff;
        const nowMin = today.hour * 60 + today.minute + today.second / 60;
        const cutoffMin = cutoff.hour * 60 + cutoff.minute;
        if (nowMin < cutoffMin) {
          return { shipIso: iso, dayDiff: 0, shipWeekday: weekday };
        }
        // cut-off geçti — bugünü atla, bir sonraki günü dene
      } else {
        // Bugün değil, ileride bir gün — direkt döndür
        const diffDays = i;
        return { shipIso: iso, dayDiff: diffDays, shipWeekday: weekday };
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Beklenmedik durum (60 gün boyunca açık gün yok) — bugünü döndür
  return { shipIso: todayIso, dayDiff: 0, shipWeekday: today.weekday };
}

const WEEKDAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function formatDayText(diff: number, weekday: number): string {
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  return WEEKDAY_NAMES_TR[weekday] ?? "";
}

/**
 * Sayaç hedefini bulur:
 * - Eğer bugün kargo varsa (dayDiff === 0): hedef = bugünün cut-off saati (Istanbul)
 * - Eğer cut-off geçti veya bugün kapalı: hedef = bir sonraki Istanbul gece yarısı
 *
 * "Hedef tarihi UTC Date olarak döndürmek" için: Istanbul'daki hedef wall-time'ı
 * UTC tabanlı bir Date olarak temsil edip aynı şekilde "şu an"ı da Istanbul wall-time
 * olarak alıyoruz; iki UTC Date'in farkı = gerçek dakika farkı.
 */
function getTargetTime(now: Date, config: TimerConfig, ship: ShipResult): { target: Date; nowAsZoned: Date; isToCutoff: boolean } {
  const today = getZonedParts(now, TIMEZONE);
  const nowAsZoned = zonedDateTimeAsUtcDate(today.year, today.month, today.day, today.hour, today.minute, today.second);

  if (ship.dayDiff === 0) {
    // Bugünün cut-off saati (Saturday/weekday)
    const cutoff = today.weekday === 6 ? config.saturdayCutoff : config.weekdayCutoff;
    const target = zonedDateTimeAsUtcDate(today.year, today.month, today.day, cutoff.hour, cutoff.minute, 0);
    return { target, nowAsZoned, isToCutoff: true };
  }

  // Yarın 00:00 (Istanbul)
  const tomorrow = new Date(Date.UTC(today.year, today.month - 1, today.day));
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const target = zonedDateTimeAsUtcDate(
    tomorrow.getUTCFullYear(),
    tomorrow.getUTCMonth() + 1,
    tomorrow.getUTCDate(),
    0,
    0,
    0,
  );
  return { target, nowAsZoned, isToCutoff: false };
}

function calculateTimer(now: Date, config: TimerConfig): TimerState | null {
  if (!config.enabled) return null;

  const ship = findShipDate(now, config);
  const { target, nowAsZoned, isToCutoff } = getTargetTime(now, config, ship);

  let diff = target.getTime() - nowAsZoned.getTime();
  if (diff < 0) diff = 0;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const dayText = formatDayText(ship.dayDiff, ship.shipWeekday);

  return { hours, minutes, seconds, dayText, isToCutoff };
}

/**
 * Kargo Timer Component
 *
 * Çalışma mantığı:
 * - Sayım & progress bar mevcut davranışla aynı: cut-off öncesi cut-off'a kadar,
 *   cut-off sonrası gece yarısına kadar geri sayım.
 * - Asıl kargo günü, admin panelden tanımlanan tatiller (ShippingHoliday) ve
 *   çalışma günü ayarları (Cumartesi açık/kapalı) dikkate alınarak hesaplanır;
 *   tatil günleri atlanarak ilk uygun açık gün döndürülür.
 * - Saat dilimi: Europe/Istanbul'a sabitlenmiştir (yurtdışından bakan müşteri de
 *   Türkiye saatine göre doğru bilgi görür).
 */
export function KargoTimer(props: KargoTimerProps) {
  const { variant = "siparis", inStock = true, className = "" } = props;
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [timer, setTimer] = useState<TimerState | null>(null);
  const mounted = useHydrated();

  // Config fetch
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    fetch("/api/public/kargo-timer-config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (
          data &&
          typeof data.enabled === "boolean" &&
          data.weekdayCutoff &&
          Array.isArray(data.holidays)
        ) {
          setConfig({
            enabled: data.enabled,
            weekdayCutoff: {
              hour: Number(data.weekdayCutoff.hour) || 14,
              minute: Number(data.weekdayCutoff.minute) || 0,
            },
            saturdayEnabled: Boolean(data.saturdayEnabled),
            saturdayCutoff: {
              hour: Number(data.saturdayCutoff?.hour ?? 13),
              minute: Number(data.saturdayCutoff?.minute ?? 0),
            },
            holidays: data.holidays.filter((s: unknown) => typeof s === "string"),
          });
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_CONFIG);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Timer tick
  useEffect(() => {
    if (!mounted || !config) return;

    const initial = calculateTimer(new Date(), config);
    queueMicrotask(() => setTimer(initial));

    const interval = setInterval(() => {
      setTimer(calculateTimer(new Date(), config));
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, config]);

  if (!mounted || !config || !timer) {
    return null;
  }

  // Master toggle kapalı
  if (!config.enabled) return null;

  // Stokta değilse — bilgi artık AddToCartButton (Yakında stoklarda) üzerinde gösteriliyor.
  if (!inStock) {
    return null;
  }

  const isCheckout = variant === "odeme";

  // dayText'i banner ve metin için biçimlendir
  const dayLabel = timer.dayText;
  const dayLabelForBanner = dayLabel === "Bugün" ? "Bugün" : `${dayLabel} Sabah`;
  const dayLabelForCheckout = dayLabel === "Bugün" ? "bugün" : dayLabel === "Yarın" ? "yarın sabah" : `${dayLabel.toLowerCase()} sabah`;

  // Checkout sayfasında compact versiyon
  if (isCheckout) {
    return (
      <>
        <style>{pulseAnimationStyle}</style>
        <p
          className={`${className} timer-text-checkout`}
          style={{
            fontWeight: 600,
            color: 'var(--foreground-muted)',
            lineHeight: '1.3',
            margin: 0,
            wordWrap: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          <span className="timer-pulse" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--foreground)' }}>
            {timer.hours}s {timer.minutes}d {timer.seconds}sn
          </span>
          {" "}içinde ödeme yap,{" "}
          <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{dayLabelForCheckout}</span> kargoda!
        </p>
      </>
    );
  }

  // Progress bar yüzdesi:
  // - cut-off'a sayıyorsa: 0..(cut-off saati × 3600) referansı (bar dolu başlar, küçülür)
  // - gece yarısına sayıyorsa: 0..(24h) referansı
  const totalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  const maxSeconds = timer.isToCutoff
    ? Math.max(1, (config.weekdayCutoff.hour * 3600 + config.weekdayCutoff.minute * 60))
    : 24 * 3600;
  const progressPercent = Math.min(100, (totalSeconds / maxSeconds) * 100);

  // Ürün sayfasında minimal, kurumsal banner - compact version
  return (
    <>
      <style>{pulseAnimationStyle}</style>
      <div
        className={className}
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--glass-bg)',
          border: '1px solid var(--border)',
          borderRadius: SQUIRCLE.md,
        }}
      >
        {/* Header + Timer inline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>⚡</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--foreground)',
              letterSpacing: '0.02em',
            }}>
              HIZLI TESLİMAT
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="timer-pulse"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10B981',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
            </span>
            <span style={{ color: 'var(--foreground-muted)' }}>•</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#10B981',
            }}>
              {dayLabelForBanner} Kargoda
            </span>
          </div>
        </div>

        {/* Progress Bar - compact */}
        <div style={{
          width: '100%',
          height: '3px',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: '#10B981',
            borderRadius: '2px',
            transition: 'width 1s linear',
          }} />
        </div>
      </div>
    </>
  );
}

export default KargoTimer;
