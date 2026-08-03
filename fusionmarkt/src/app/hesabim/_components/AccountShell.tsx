"use client";

import { usePathname } from "next/navigation";
import {
  accountPageTitle,
  accountParentHref,
  accountParentTitle,
} from "../_lib/account-nav.helpers";
import type { ServerAccountUser } from "../_lib/server-user";
import AccountSidebar from "./AccountSidebar";
import AccountMobileTopBar from "./AccountMobileTopBar";
import { AccountToaster } from "./shared";

/**
 * Oturumlu hesap kabuğu: sidebar + h1 + içerik ızgarası + toast host.
 *
 * layout.tsx içinde yaşadığı için sayfa geçişlerinde REMOUNT OLMAZ — açılır
 * grubun durumu ve scroll pozisyonu korunur.
 *
 * Kabuk hiç `fetch` yapmaz ve hiçbir zamanlayıcı kurmaz (plan 01 §2.4, §5.11).
 */
export default function AccountShell({
  children,
  serverUser,
}: {
  children: React.ReactNode;
  /** Sunucuda çözülen kullanıcı; istemci oturumu çözene kadar kullanılır. */
  serverUser: ServerAccountUser | null;
}) {
  const pathname = usePathname();
  const isRoot = pathname === "/hesabim";
  const title = accountPageTitle(pathname);
  const backHref = accountParentHref(pathname);
  const backLabel = accountParentTitle(pathname);

  return (
    <div className="account-page">
      {/* Dekoratif arka plan — light temada account.css gizliyor. */}
      <div
        aria-hidden="true"
        className="account-page-bg fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="account-page-container relative z-10 max-w-[1280px] mx-auto px-8">
        <div className="account-page-layout flex gap-6">
          <AccountSidebar activeHref={pathname} serverUser={serverUser} />

          <div className="account-content-area flex-1 min-w-0">
            {!isRoot && <AccountMobileTopBar backLabel={backLabel} backHref={backHref} />}
            <h1 className="account-page-title">{title}</h1>
            {children}
          </div>
        </div>
      </div>

      <AccountToaster />
    </div>
  );
}
