"use client";

import { usePathname } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ServerAccountUser } from "../_lib/server-user";
import { ACCOUNT_NAV } from "../_lib/account-nav";
import AccountSidebarGroup from "./AccountSidebarGroup";
import AccountUserCard from "./AccountUserCard";

interface AccountSidebarProps {
  /** Kabuktan gelen aktif href; verilmezse usePathname kullanılır */
  activeHref?: string;
  /**
   * Sunucuda çözülen kullanıcı (F2-45). İlk boyamada `useAuth()` henüz boş
   * olduğu için kart adı/e-postayı buradan alıyor; olmasaydı oturumlu
   * kullanıcı bir kare boş kullanıcı kartı görürdü.
   */
  serverUser?: ServerAccountUser | null;
}

/**
 * Masaüstü menü. Sayaç (badge) BİLİNÇLİ olarak yok: sayaç için /api/orders
 * gerekir, o endpoint tüm siparişleri sözleşme HTML'iyle döndürüyor ve kabuk
 * her sayfada mount olduğu için bu ağır payload her hesap sayfasında çekilirdi
 * (plan 01 §3.5).
 */
export default function AccountSidebar({
  activeHref,
  serverUser,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const active = activeHref ?? pathname;
  const shownUser = user ?? serverUser ?? null;

  return (
    <aside className="account-sidebar-desktop w-[300px] flex-shrink-0">
      <div className="account-sidebar-card account-sidebar-sticky bg-background border border-border rounded-2xl overflow-hidden flex flex-col">
        <AccountUserCard
          name={shownUser?.name}
          email={shownUser?.email}
          image={shownUser?.image}
          variant="sidebar"
        />

        <nav className="flex-1 py-2" aria-label="Hesap menüsü">
          {ACCOUNT_NAV.map((group) => (
            <AccountSidebarGroup
              key={group.id}
              group={group}
              pathname={active}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-border">
          {/* Renkler account.css'te token'a bağlı: sabit red-400/60 light temada
              beyaz üstünde WCAG eşiğinin altında kalıyordu (plan 07 KN-3). */}
          <button
            type="button"
            onClick={() => void logout()}
            className="account-sidebar-logout w-full flex items-center gap-4 px-6 py-3.5 text-left transition-all"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="text-[17px]">Çıkış Yap</span>
          </button>
          <div className="account-sidebar-ssl flex items-center justify-center gap-2 py-3 border-t border-border">
            <Shield size={14} aria-hidden="true" />
            <span className="text-[13px]">256-bit SSL güvenli bağlantı</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
