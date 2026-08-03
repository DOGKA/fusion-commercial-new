/**
 * Hesabım Layout — SEO metadata + ortak kabuk
 *
 * Kabuk BURADA, page.tsx'lerin içinde değil. Böylece alt sayfalar arasında
 * geçişte sidebar remount olmaz; açılır grubun durumu ve scroll pozisyonu
 * korunur (plan 01 §2.1).
 *
 * Oturum SUNUCUDA çözülüyor (F2-45). Eskiden kabuk `useSession()` yanıtlayana
 * kadar iskelet basıyordu; oturumu olan kullanıcı her hesap sayfası açılışında
 * önce iskelet görüyordu. Artık kim olduğu ilk HTML'de belli.
 */

import { Suspense } from "react";

/**
 * Hesap CSS'i BURADA import ediliyor, globals.css'te değil: ~58 KB'lık bu iki
 * dosya oradayken ana sayfa dahil her rotanın render-blocking CSS'ine giriyordu.
 * Sıra korunmalı — account.css mobil override'ları ezmek için mobile
 * kurallarından SONRA gelmek zorunda.
 */
import "@/styles/account-mobile.css";
import "@/styles/account.css";

import { staticPageMetadata } from "@/lib/seo";
import { getServerAccountUser } from "./_lib/server-user";
import AccountShellGate from "./_components/AccountShellGate";
import { AccountSkeleton } from "./_components/shared";

export const metadata = staticPageMetadata.account;

/**
 * Oturum çerezi okunduğu için bu alt ağaç zaten dinamik; açıkça yazmak
 * ileride birinin yanlışlıkla önbelleğe almasını engelliyor.
 *
 * Kapsam YALNIZCA `/hesabim/*`. Aynı satır kök layout'a konsaydı mağazanın
 * tamamı dinamikleşir, ana sayfanın ve ürün sayfalarının ISR'ı ölürdü.
 */
export const dynamic = "force-dynamic";

export default async function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverUser = await getServerAccountUser();

  return (
    <Suspense
      fallback={
        <div className="account-page">
          <div className="max-w-[1280px] mx-auto px-8">
            <AccountSkeleton variant="shell" />
          </div>
        </div>
      }
    >
      <AccountShellGate serverUser={serverUser}>{children}</AccountShellGate>
    </Suspense>
  );
}
