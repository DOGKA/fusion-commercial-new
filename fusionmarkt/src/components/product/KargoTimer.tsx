"use client";

import { useState, useEffect } from "react";
import { Truck } from "lucide-react";

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
export function KargoTimer({ 
  variant = "siparis", 
  inStock = true,
  isFreeShipping = false,
  className = "" 
}: KargoTimerProps) {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
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
    setTimer(calculateTimer());

    // Her saniye güncelle
    const interval = setInterval(() => {
      setTimer(calculateTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // SSR için bekle
  if (!mounted || !timer) {
    return null;
  }

  // Stokta değilse
  if (!inStock) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-dark-2 ${className}`}>
        <Truck size={14} className="text-gray-500" />
        <span className="text-xs font-medium text-gray-500">
          Yakında stoklarda
        </span>
      </div>
    );
  }

  const actionText = variant === "odeme" ? "ödeme yap" : "sipariş ver";
  const isCheckout = variant === "odeme";
  
  // Her iki sayfada da beyaz
  const textColorClass = "text-white";
  const iconColorClass = "text-white";

  return (
    <div 
      className={`
        inline-flex items-center gap-2
        ${className}
      `}
    >
      <style jsx>{`
        @keyframes truck-move {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }
        .truck-animated {
          animation: truck-move 1s ease-in-out infinite;
        }
      `}</style>
      {/* Checkout sayfasında ikon gösterme */}
      {!isCheckout && (
        <Truck 
          size={14} 
          className={`${iconColorClass} flex-shrink-0 truck-animated`}
          style={{
            animation: 'truck-move 1s ease-in-out infinite'
          }}
        />
      )}
      <span className={`text-xs font-semibold ${textColorClass}`}>
        <span className="tabular-nums">
          {timer.hours}s {timer.minutes}d {timer.seconds}sn
        </span>
        {" "}içinde {actionText},{" "}
        <span className="font-bold">{timer.dayText}</span> kargoda!
      </span>
    </div>
  );
}

export default KargoTimer;
