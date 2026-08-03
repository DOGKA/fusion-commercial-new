"use client";

/**
 * Hesap alanının TEK sekme dili (plan 07 §K-1).
 *
 * İki mod, tek DOM iskeleti:
 *  - URL modu  → `href` verilir, `<Link>` + `aria-current="page"` basılır.
 *  - Durum modu → `value`/`onChange` verilir, `role="tablist"` + gezici tabindex.
 *
 * İki modun ayrı bileşen olmaması bilinçli: adresler/favoriler durum tutuyor,
 * değerlendirmeler URL tutuyor; ikisi ayrı bileşene bölünseydi görünüm zamanla
 * yeniden ayrışırdı — kullanıcının ilk şikâyeti tam olarak buydu.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface AccountTabBarItem {
  /** URL sekmesi ise verilir. */
  href?: string;
  /** Durum sekmesi ise verilir. */
  value?: string;
  label: string;
  /** undefined → rozet yok. 0 → "0" gösterilir (sekme sayacı gizlenmez). */
  count?: number;
  /** Sayaç yükleniyor → rozet yerine shimmer */
  countLoading?: boolean;
}

interface AccountTabBarProps {
  items: AccountTabBarItem[];
  /** Erişilebilirlik etiketi, örn. "Değerlendirme sekmeleri" */
  ariaLabel: string;
  /** Durum modunda aktif değer */
  value?: string;
  /** Durum modunda değişim; verilirse bileşen tablist olarak render eder */
  onChange?: (value: string) => void;
}

function TabBadge({ count, countLoading }: Pick<AccountTabBarItem, "count" | "countLoading">) {
  if (countLoading) {
    return (
      <span className="account-skeleton account-tabbar__badge-shimmer" aria-hidden="true" />
    );
  }
  if (count === undefined) return null;
  return <span className="account-tabbar__badge">{count}</span>;
}

export default function AccountTabBar({
  items,
  ariaLabel,
  value,
  onChange,
}: AccountTabBarProps) {
  const pathname = usePathname();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (onChange) {
    const move = (from: number, delta: number) => {
      const next = (from + delta + items.length) % items.length;
      const target = items[next].value;
      if (target === undefined) return;
      onChange(target);
      refs.current[next]?.focus();
    };

    const focusEdge = (index: number) => {
      const target = items[index].value;
      if (target === undefined) return;
      onChange(target);
      refs.current[index]?.focus();
    };

    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="account-tabbar account-tabbar--order-filter"
      >
        {items.map((item, index) => {
          const active = item.value === value;
          return (
            <button
              key={item.value ?? item.label}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => item.value !== undefined && onChange(item.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  move(index, 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  move(index, -1);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  focusEdge(0);
                } else if (e.key === "End") {
                  e.preventDefault();
                  focusEdge(items.length - 1);
                }
              }}
              className="account-tabbar__item"
            >
              <span>{item.label}</span>
              <TabBadge count={item.count} countLoading={item.countLoading} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="account-tabbar account-tabbar--order-filter" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href ?? "#"}
            aria-current={active ? "page" : undefined}
            className={cn("account-tabbar__item", active && "is-active")}
          >
            <span>{item.label}</span>
            <TabBadge count={item.count} countLoading={item.countLoading} />
          </Link>
        );
      })}
    </nav>
  );
}
