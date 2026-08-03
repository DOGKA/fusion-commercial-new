"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateShort, formatPrice } from "../_lib/format";
import type { UserType } from "../_lib/types";
import type { AccountRecentOrder, AccountSummary } from "../_lib/useAccountSummary";

interface DashboardPaneProps {
  user: UserType;
  summary: AccountSummary | null;
  loading: boolean;
}

/**
 * Masaüstü pano (/hesabim).
 *
 * page.tsx'ten taşındı. İki davranış değişikliği var, ikisi de plan gereği:
 * (1) `setActiveTab` prop'ları gerçek `<Link>`lere döndü — orta tık ve yeni
 *     sekmede açma artık çalışıyor.
 * (2) Son siparişler listesindeki `overflow-y-auto` iç scroll'u kaldırıldı;
 *     sabit yükseklik gittiği için o konteyner çift scroll üretiyordu
 *     (plan 01 §6.2/3).
 */
export default function DashboardPane({
  user,
  summary,
  loading,
}: DashboardPaneProps) {
  const recentOrders = summary?.recentOrders ?? [];

  /**
   * Ton, sabit Tailwind sınıfı değil `.acc-chip-*` yardımcısı: aynı anlamın
   * light ve dark temada AYRI hex'e çözülmesi gerekiyor, `text-amber-400`
   * beyaz zemin üstünde 2.4:1'de kalıyordu (plan 07 §2.2).
   */
  const statusConfig: Record<string, { label: string; tone: string }> = {
    PENDING: { label: "Onay Bekliyor", tone: "acc-tone-warning" },
    PROCESSING: { label: "Hazırlanıyor", tone: "acc-tone-info" },
    SHIPPED: { label: "Kargoda", tone: "acc-tone-progress" },
    DELIVERED: { label: "Teslim Edildi", tone: "acc-tone-success" },
    CANCELLED: { label: "İptal Edildi", tone: "acc-tone-danger" },
    REFUNDED: { label: "İade Edildi", tone: "acc-tone-neutral" },
  };

  const stats: { label: string; value: number | undefined; href: string | null }[] = [
    { label: "Siparişler", value: summary?.orders, href: "/hesabim/siparisler" },
    { label: "Adresler", value: summary?.addresses, href: "/hesabim/adresler" },
    { label: "Beğendiklerim", value: summary?.favorites, href: "/hesabim/favorilerim" },
    { label: "Sepet", value: summary?.cartItems, href: null },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="pb-5 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            {/* Uzun ad selamlama satırını kırmasın; ikinci satır zaten açıklama. */}
            <span className="text-[18px] font-medium text-foreground block mb-1 truncate">
              Merhaba, {user.name || "Kullanıcı"} 👋
            </span>
            <p className="text-[15px] text-foreground-muted">
              Hesap panonuzdan siparişlerinizi, adreslerinizi ve hesap ayarlarınızı yönetebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {stats.map((stat) => {
          const body = (
            <>
              <div className="text-[24px] font-semibold text-foreground mb-1 tabular-nums">
                {loading ? (
                  <span
                    className="account-skeleton inline-block w-6 h-6 rounded"
                    aria-hidden="true"
                  />
                ) : (
                  (stat.value ?? 0)
                )}
              </div>
              <div className="text-[13px] text-foreground-muted uppercase tracking-wide">
                {stat.label}
              </div>
            </>
          );

          const base =
            "account-surface block p-5 text-center";

          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(
                base,
                "account-surface-interactive cursor-pointer"
              )}
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={base}>
              {body}
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-foreground-tertiary">
            Son Siparişler
          </span>
          {recentOrders.length > 0 && (
            <Link
              href="/hesabim/siparisler"
              className="account-inline-link acc-tone-accent text-[12px] transition-colors hover:text-foreground"
            >
              Tümünü Gör →
            </Link>
          )}
        </div>

        {loading ? (
          <div
            role="status"
            aria-label="Son siparişler yükleniyor"
            className="flex items-center justify-center py-10"
          >
            <Loader2
              size={24}
              aria-hidden="true"
              className="animate-spin text-foreground-muted"
            />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: AccountRecentOrder) => {
              const config = statusConfig[order.status] || statusConfig.PENDING;
              const thumbnails = (order.items ?? [])
                .map((item) => item.product?.thumbnail || item.product?.images?.[0] || null)
                .filter((src): src is string => !!src);
              const extraCount =
                (order.items?.length ?? 0) - Math.min(thumbnails.length, 4);

              return (
                <Link
                  key={order.id}
                  href={`/hesabim/siparisler/${encodeURIComponent(order.orderNumber)}`}
                  className="account-surface account-surface-interactive grid min-h-[88px] w-full grid-cols-[minmax(320px,2.25fr)_minmax(110px,0.65fr)_minmax(150px,0.85fr)_minmax(120px,0.55fr)] items-center gap-5 px-6 py-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {thumbnails.length > 0 ? (
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        {thumbnails.slice(0, 4).map((src, index) => (
                          <div
                            key={index}
                            className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-background"
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background-secondary text-[12px] font-medium text-foreground-tertiary">
                            +{extraCount}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background-secondary">
                        <Package size={18} aria-hidden="true" className={config.tone} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold tabular-nums text-foreground">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-[12px] text-foreground-muted">
                        {order.items?.length || 0} ürün
                      </p>
                    </div>
                  </div>

                  <p className="whitespace-nowrap text-[13px] tabular-nums text-foreground-secondary">
                    {formatDateShort(order.createdAt)}
                  </p>

                  <div className={cn("flex min-w-0 items-center gap-2 text-[13px]", config.tone)}>
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-current" aria-hidden="true" />
                    <span className="truncate">{config.label}</span>
                  </div>

                  <p className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-foreground">
                    {formatPrice(order.grandTotal ?? order.total ?? 0)}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="account-inset flex items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
            <div>
              <p className="text-[15px] text-foreground-muted mb-5">
                Henüz siparişiniz yok
              </p>
              <Link
                href="/magaza"
                className="account-btn account-empty-state__cta"
              >
                Alışverişe Başla
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
