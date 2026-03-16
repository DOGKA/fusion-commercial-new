"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Truck } from "lucide-react";

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

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  dayText: string; // "bugün", "Yarın Sabah", "Pazartesi Sabah"
}

/**
 * Kargo Timer Component
 * 
 * Çalışma mantığı:
 * - Hafta içi (Pazartesi-Cuma): 16:00'a kadar sipariş = bugün kargoda
 * - Cumartesi: 13:00'a kadar sipariş = bugün kargoda
 * - Pazar: Yarın Sabah (Pazartesi) kargoda
 * - Hafta içi 16:00 sonrası: Yarın Sabah kargoda
 * - Cuma 16:00 sonrası: Yarın Sabah kargoda (Cumartesi)
 * - Cumartesi 13:00 sonrası: Pazartesi Sabah kargoda
 */
export function KargoTimer(props: KargoTimerProps) {
  const { variant = "siparis", inStock = true, className = "" } = props;
  const [timer, setTimer] = useState<TimerState | null>(null);
  const mounted = useHydrated();

  useEffect(() => {
    if (!mounted) return;
    
    function calculateTimer(): TimerState {
      const now = new Date();
      const currentDay = now.getDay(); // 0=Pazar, 1=Pzt, ..., 6=Cumartesi
      
      let targetTime: Date;
      let dayText = "bugün";

      // PAZAR günü (0) - Tüm gün gece yarısına kadar say
      if (currentDay === 0) {
        const mondayMidnight = new Date();
        mondayMidnight.setDate(mondayMidnight.getDate() + 1);
        mondayMidnight.setHours(0, 0, 0, 0);
        targetTime = mondayMidnight;
        dayText = "Yarın Sabah";
      }
      // CUMARTESİ günü (6)
      else if (currentDay === 6) {
        const saturdayCutoff = new Date();
        saturdayCutoff.setHours(13, 0, 0, 0);
        
        if (now < saturdayCutoff) {
          targetTime = saturdayCutoff;
          dayText = "bugün";
        } else {
          // Cumartesi 13:00'dan sonra - gece yarısına kadar
          const sundayMidnight = new Date();
          sundayMidnight.setDate(sundayMidnight.getDate() + 1);
          sundayMidnight.setHours(0, 0, 0, 0);
          targetTime = sundayMidnight;
          dayText = "Pazartesi Sabah";
        }
      }
      // HAFTA İÇİ (Pazartesi-Cuma: 1-5)
      else {
        const today16 = new Date();
        today16.setHours(16, 0, 0, 0);
        
        if (now < today16) {
          targetTime = today16;
          dayText = "bugün";
        } else {
          // 16:00 geçti - gece yarısına kadar say
          const tomorrowMidnight = new Date();
          tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
          tomorrowMidnight.setHours(0, 0, 0, 0);
          targetTime = tomorrowMidnight;
          
          // Cuma 16:00 geçti ise "Yarın Sabah" (Cumartesi)
          dayText = "Yarın Sabah";
        }
      }

      const diff = targetTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, dayText };
    }

    // İlk hesaplama
    const initialTimer = calculateTimer();
    queueMicrotask(() => setTimer(initialTimer));

    // Her saniye güncelle
    const interval = setInterval(() => {
      setTimer(calculateTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  // SSR için bekle
  if (!mounted || !timer) {
    return null;
  }

  // Stokta değilse
  if (!inStock) {
    return (
      <div 
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          backgroundColor: 'var(--glass-bg)',
          border: '1px solid var(--border)',
          borderRadius: SQUIRCLE.md,
        }}
      >
        <Truck size={14} style={{ color: 'var(--foreground-muted)' }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--foreground-muted)' }}>
          Yakında stoklarda
        </span>
      </div>
    );
  }

  const isCheckout = variant === "odeme";

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
          <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{timer.dayText}</span> kargoda!
        </p>
      </>
    );
  }

  // Progress bar yüzdesi hesapla (gece yarısından 16:00'a kadar)
  const totalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  const maxSeconds = 16 * 3600; // 16 saat maksimum
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
              {timer.dayText === 'bugün' ? 'Bugün' : timer.dayText} Kargoda
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

