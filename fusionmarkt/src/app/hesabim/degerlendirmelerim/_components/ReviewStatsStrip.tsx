"use client";

/**
 * İstatistik şeridi.
 *
 * REFERANSTAN İKİ SAPMA, ikisi de bilinçli:
 *  1. Referansın "n kez faydalı bulundu" kartı YOK — `Review`'da böyle bir alan
 *     ve oy veren kullanıcıyı tutacak tablo yok, uydurulamaz (sicil F2-20).
 *  2. Referans şeridi mobilde yatay kaydırıyor ve 2. kart kesik duruyor. Bunun
 *     yerine sarmalayan grid kullanıldı: iç kaydırma konteyneri kurmamak
 *     plan 04 §10/1.19'un tek kalan yükümlülüğü, ayrıca kesik kart kullanıcıya
 *     "devamı var mı?" diye sordurmuyor.
 *
 * Sayısı 0 olan kart GİZLENİR (`00-KARARLAR:216-227`): "0 onay bekleyen" yazmak
 * bilgi değil gürültü.
 */

import { Star, Clock, PackageCheck, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MyReviewStats } from "../_lib/types";

interface ReviewStatsStripProps {
  stats: MyReviewStats;
}

interface Card {
  key: string;
  icon: LucideIcon;
  tone: string;
  value: string;
  label: string;
}

export default function ReviewStatsStrip({ stats }: ReviewStatsStripProps) {
  const cards: Card[] = [];

  if (stats.total > 0) {
    cards.push({
      key: "total",
      icon: MessageSquare,
      tone: "acc-tone-accent",
      value: String(stats.total),
      label: "değerlendirme yaptın",
    });
  }

  if (stats.average !== null) {
    cards.push({
      key: "average",
      icon: Star,
      tone: "acc-tone-warning",
      // Tek ondalık, Türkçe ayraçla: "4,3".
      value: stats.average.toFixed(1).replace(".", ","),
      label: "verdiğin ortalama puan",
    });
  }

  if (stats.pendingApproval > 0) {
    cards.push({
      key: "pendingApproval",
      icon: Clock,
      tone: "acc-tone-warning",
      value: String(stats.pendingApproval),
      // "Onay bekleyen değerlendirmen" ile "değerlendirmeni beklediğimiz ürün"
      // FARKLI şeyler; metinler kasıtlı olarak birbirine benzemiyor.
      label: "değerlendirmen onay bekliyor",
    });
  }

  if (stats.awaitingReview > 0) {
    cards.push({
      key: "awaitingReview",
      icon: PackageCheck,
      tone: "acc-tone-info",
      value: String(stats.awaitingReview),
      label: "ürün değerlendirmeni bekliyor",
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="mb-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="account-surface flex min-w-0 items-start gap-2.5 p-2.5 sm:block sm:p-3"
          >
            <Icon size={16} className={`mt-0.5 shrink-0 sm:mb-2 sm:mt-0 ${card.tone}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[18px] font-semibold leading-none text-foreground tabular-nums sm:text-[20px]">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-foreground-muted">
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
