"use client";

import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ACCOUNT_NAV } from "../_lib/account-nav";
import type { AccountSummary } from "../_lib/useAccountSummary";
import AccountUserCard from "./AccountUserCard";

interface AccountMobileMenuProps {
  summary: AccountSummary | null;
  loading: boolean;
}

/**
 * /hesabim'in mobil görünümü: kullanıcı kartı + sayaç çipleri + dikey menü.
 *
 * Mobilde açılır grup YOK — "Kullanıcı bilgilerim" grubunun alt öğeleri düz
 * listelenir. Accordion, tek dokunuşla ulaşılacak sayfayı iki dokunuşa çıkarır.
 */
export default function AccountMobileMenu({
  summary,
  loading,
}: AccountMobileMenuProps) {
  const { user, logout } = useAuth();

  const chips = [
    { label: "Sipariş", value: summary?.orders },
    { label: "Adres", value: summary?.addresses },
    { label: "Beğeni", value: summary?.favorites },
    { label: "Sepet", value: summary?.cartItems },
  ];

  return (
    <div>
      <AccountUserCard
        name={user?.name}
        email={user?.email}
        image={user?.image}
        variant="mobile"
      />

      <div className="account-stat-chips">
        {chips.map((chip) => (
          <div key={chip.label} className="account-stat-chip">
            <span className="account-stat-chip__value tabular-nums">
              {loading ? (
                <span
                  className="account-skeleton inline-block w-5 h-5 rounded"
                  aria-hidden="true"
                />
              ) : (
                (chip.value ?? 0)
              )}
            </span>
            <span className="account-stat-chip__label">{chip.label}</span>
          </div>
        ))}
      </div>

      <ul className="account-menu-list">
        {ACCOUNT_NAV.map((group) => (
          <li key={group.id}>
            {(group.heading ?? group.toggleLabel) && (
              <div className="account-menu-list__heading">
                {group.heading ?? group.toggleLabel}
              </div>
            )}
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="account-menu-row">
                    <span className="account-menu-row__icon" aria-hidden="true">
                      <item.icon size={18} />
                    </span>
                    <span className="account-menu-row__label truncate">
                      {item.label}
                    </span>
                    {item.dotColor && (
                      <span
                        aria-hidden="true"
                        className="account-sidebar-dot"
                        style={{ background: item.dotColor, marginLeft: 0 }}
                      />
                    )}
                    <ChevronRight
                      size={16}
                      className="account-menu-row__chevron"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => void logout()}
            className="account-menu-row account-menu-row--danger"
          >
            <span className="account-menu-row__icon" aria-hidden="true">
              <LogOut size={18} />
            </span>
            <span className="account-menu-row__label">Çıkış Yap</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
