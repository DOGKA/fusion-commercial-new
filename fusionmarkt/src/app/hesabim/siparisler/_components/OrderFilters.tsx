"use client";

/**
 * Sipariş listesi arama + filtre şeridi.
 *
 * `<select>` yerine yatay kaydırmalı çip şeridi (plan 03 §8/2.2): açılır liste
 * mobilde seçenekleri gizliyor ve "hangi filtre açık" bilgisi tek satırda
 * görünmüyordu. Çipler aktif filtreyi her zaman görünür kılıyor.
 *
 * Çipin ölçüsü ve rengi artık `.account-chip` sınıfında (plan 07 §2.2).
 * Buradaki `min-h-[36px]`, mobildeki 44px muafiyeti kalkınca dokunma hedefi
 * ihlali üretiyordu ve sabit emerald tonu light temada AA eşiğini geçmiyordu.
 */

import { Search, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { ORDER_FILTERS, type OrderFilterValue } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";

const MOBILE_FILTER_LABELS: Record<OrderFilterValue, string> = {
  all: "Tümü",
  ongoing: "Devam",
  delivered: "Teslim",
  cancelled: "İptal",
  returned: "İade",
};

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderFilterValue;
  onStatusChange: (value: OrderFilterValue) => void;
  total: number;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function OrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  total,
  onRefresh,
  refreshing,
}: OrderFiltersProps) {
  return (
    <>
      {/* Masaüstü: referanstaki üst sekmeler, sayfa kayarken görünür kalır. */}
      <div className="hide-on-mobile sticky top-[72px] z-20 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur-md">
        <div
          className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Sipariş durumu filtresi"
        >
          {ORDER_FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusChange(filter.value)}
                aria-pressed={active}
                className={cn(
                  "relative min-h-[52px] shrink-0 whitespace-nowrap px-3 text-[12px] font-medium text-foreground-muted transition-colors hover:text-foreground",
                  "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent",
                  active && "text-foreground after:bg-[color:var(--acc-accent-text)]",
                )}
              >
                {filter.label}
              </button>
            );
          })}
          <span className="shrink-0 rounded-full bg-glass-bg-hover px-2 py-0.5 text-[11px] tabular-nums text-foreground-tertiary">
            {total} sipariş
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={`account-icon-btn mr-1 shrink-0 rounded-lg p-2 transition-colors hover:bg-glass-bg-hover ${DISABLED_TONE}`}
          aria-label="Siparişleri yenile"
        >
          {refreshing ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin text-foreground-muted" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" className="text-foreground-muted" />
          )}
        </button>
      </div>

      <div className="show-on-mobile-flex items-center justify-between gap-2 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[15px] font-medium text-foreground">Siparişlerim</span>
          <span className="shrink-0 rounded-full bg-glass-bg-hover px-2 py-0.5 text-[12px] tabular-nums text-foreground-tertiary">
            {total} sipariş
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={`account-icon-btn p-2 rounded-lg hover:bg-glass-bg-hover transition-colors ${DISABLED_TONE}`}
          aria-label="Siparişleri yenile"
        >
          {refreshing ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin text-foreground-muted" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" className="text-foreground-muted" />
          )}
        </button>
      </div>

      <div className="space-y-3 border-b border-border py-3">
        <div className="show-on-mobile">
          <div
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Sipariş durumu filtresi"
          >
            {ORDER_FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onStatusChange(filter.value)}
                  aria-pressed={active}
                  aria-label={filter.label}
                  className={cn(
                    "min-h-[44px] min-w-[56px] flex-1 shrink-0 snap-start whitespace-nowrap border-b-2 border-transparent px-2 text-[12px] font-medium text-foreground-muted transition-colors",
                    "hover:text-foreground",
                    active &&
                      "border-b-[color:var(--acc-accent-text)] text-[color:var(--acc-accent-text)]",
                  )}
                >
                  {MOBILE_FILTER_LABELS[filter.value]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          {/* Görünmeyen ama gerçek etiket; `aria-label` ile İKİSİ BİRDEN
              verilmiyor (plan 07 §4). */}
          <label htmlFor="order-search" className="sr-only">
            Siparişlerde ara
          </label>
          <input
            id="order-search"
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Sipariş no veya ürün ara..."
            className="w-full min-h-[44px] pl-9 pr-9 rounded-lg bg-glass-bg border border-border text-[13px] text-foreground placeholder:text-foreground-muted focus:border-[color:var(--acc-accent-border)] focus:bg-glass-bg-hover transition-all"
          />
          <Search
            size={14}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Aramayı temizle"
              className="account-icon-btn account-icon-btn--field absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-glass-bg-hover transition-colors"
            >
              <XCircle size={14} aria-hidden="true" className="text-foreground-muted" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
