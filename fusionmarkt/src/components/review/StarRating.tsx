"use client";

/**
 * Erişilebilir yıldız seçimi — roving tabindex.
 *
 * `radiogroup` deseni: gruba tek Tab ile giriliyor, ok tuşlarıyla puan
 * değiştiriliyor. Beş ayrı butonu Tab sırasına sokmak klavye kullanıcısını
 * formun içinde beş kez durdururdu.
 *
 * İki yerde kullanılıyor: değerlendirme formunun puan alanı ve "değerlendirme
 * bekleyenler" kartındaki hızlı puanlama (yıldıza basınca form o puanla açılır).
 * Bu yüzden `ReviewFormSheet` içinde değil, ayrı dosyada.
 */

import { useRef, useState } from "react";
import { Star } from "lucide-react";

/** Yıldıza karşılık gelen sözlü karşılıklar — sayı tek başına belirsiz. */
export const RATING_LABELS: Record<number, string> = {
  1: "Çok kötü",
  2: "Kötü",
  3: "Orta",
  4: "İyi",
  5: "Çok iyi",
};

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: number;
  /** Seçilen puanın sözlü karşılığını yanda göster (form alanı için). */
  showLabel?: boolean;
  /** Ekran okuyucu için grup etiketi; hızlı puanlamada ürün adını içerir. */
  ariaLabel?: string;
  /** `true` → yıldızlar satırı doldurur (bekleyen kartındaki geniş şerit). */
  fill?: boolean;
}

export default function StarRating({
  value,
  onChange,
  disabled = false,
  size = 26,
  showLabel = false,
  ariaLabel = "Puanınız",
  fill = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      move((value || 0) + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      move((value || 2) - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(1);
    } else if (e.key === "End") {
      e.preventDefault();
      move(5);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(0)}
        className={fill ? "flex flex-1 items-center justify-between" : "flex items-center gap-1"}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            ref={(node) => {
              refs.current[star - 1] = node;
            }}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} yıldız — ${RATING_LABELS[star]}`}
            // Roving tabindex: seçili yıldız, hiç seçim yoksa ilki odaklanabilir.
            tabIndex={value === star || (!value && star === 1) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className="flex h-11 min-w-11 items-center justify-center rounded-lg transition-colors hover:bg-glass-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--pill-accent-amber)] disabled:opacity-50"
          >
            <Star
              size={size}
              className={
                star <= shown
                  ? "text-[color:var(--pill-accent-amber)]"
                  : "text-foreground-disabled"
              }
              fill={star <= shown ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      {/* aria-live: ok tuşuyla puan değiştiren kullanıcı sonucu duyabilsin. */}
      {showLabel && (
        <span
          aria-live="polite"
          className="text-[13px] font-medium text-foreground-secondary"
        >
          {value ? RATING_LABELS[value] : ""}
        </span>
      )}
    </div>
  );
}
