"use client";

/**
 * Tek seçimlik segment kontrolü — yalnızca FORM GİRDİSİ olarak kullanılır
 * (Ev/İş/Diğer, Her ikisi/Teslimat/Fatura, Bireysel/Kurumsal).
 *
 * Liste sekmeleri artık `AccountTabBar` (plan 07 §K-1); burada kalmasının nedeni
 * plan 07 §K-2: sekme görünümü kullanıcıya "sayfa içeriği değişecek" der, oysa
 * burada değişen şey kaydedilecek değerdir. Ekran okuyucuda `tab` yerine `radio`
 * duyurulması doğru olan.
 *
 * `role="radiogroup"` + gezici tabindex kullanıyor: klavyede grup tek durak,
 * içinde ok tuşlarıyla dolaşılıyor. Aynı desen `components/review/StarRating`
 * içinde de var, oradaki davranışla tutarlı kalması bilinçli.
 */

import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Etiketin yanında gösterilen sayaç. Liste sayaçları `AccountTabBar`'da. */
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** Ekran okuyucu için grup adı, ör. "Adres kullanım tipi" */
  ariaLabel: string;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 p-1 bg-glass-bg border border-border rounded-xl",
        className
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(index, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(index, -1);
              }
            }}
            className={cn(
              // Masaüstü tabanı 40px; mobildeki 44px hedefi account.css'in
              // hesap alanı kuralından geliyor, burada sabitlenmiyor (plan 07 §K-4).
              "flex-1 min-w-0 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 rounded-lg text-[12px] font-medium transition-colors",
              active
                ? "acc-chip-accent"
                : "border border-transparent text-foreground-muted hover:text-foreground hover:bg-glass-bg-hover"
            )}
          >
            {Icon && <Icon size={13} className="shrink-0" aria-hidden="true" />}
            <span className="truncate">{option.label}</span>
            {option.count !== undefined && (
              <span className="shrink-0 text-[11px] tabular-nums opacity-80">
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
