"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useAccountSummary } from "../_lib/useAccountSummary";
import type { AccountSummaryFetched, UserType } from "../_lib/types";
import type { ServerAccountUser } from "../_lib/server-user";
import DashboardPane from "./DashboardPane";
import AccountMobileMenu from "./AccountMobileMenu";
import { AccountCard } from "./shared";

/**
 * Giriş/kayıt panelleri ayrı chunk'ta: 800 satırlık bu bileşen yalnızca
 * OTURUMSUZ dalda görünüyor, statik import edildiğinde ise oturumu olan
 * kullanıcı da her hesap sayfası açılışında indiriyordu.
 *
 * SSR kapatılmadı — oturumsuz kullanıcı formu ilk HTML'de görmeye devam ediyor.
 */
const AuthPanels = dynamic(() => import("./AuthPanels"));

/**
 * Oturumlu kök içeriği.
 *
 * Ayrı bir bileşen olmasının sebebi `useAccountSummary`: hook'lar koşullu
 * çağrılamadığı için, oturumsuz kullanıcıda da çalışıp /api/orders'a boşuna
 * 401 isteği atardı. Auth kontrolü bileşen sınırına taşınarak bu önlendi.
 *
 * Masaüstü/mobil dallanması CSS ile (`.hide-on-mobile` / `.show-on-mobile`):
 * `window.innerWidth` okumak ilk boyamada `mounted` guard'ı gerektirir, o da
 * mobilde bir kare boş ekran demektir. İki ağaç da DOM'da ama veri tek yerden
 * geliyor — `useAccountSummary` burada bir kez çağrılıp prop olarak iniyor.
 */
function AccountHome({
  user,
  initialSummary,
}: {
  user: UserType;
  initialSummary?: AccountSummaryFetched | null;
}) {
  const { data, loading } = useAccountSummary(initialSummary);

  return (
    <>
      <div className="hide-on-mobile">
        <AccountCard>
          <DashboardPane user={user} summary={data} loading={loading} />
        </AccountCard>
      </div>
      <div className="show-on-mobile">
        <AccountMobileMenu summary={data} loading={loading} />
      </div>
    </>
  );
}

/**
 * /hesabim kökü. Oturumsuzken giriş/kayıt panelleri (kabuk kapalı — kararı
 * AccountShellGate veriyor), oturumluyken pano / mobil menü.
 *
 * `serverUser` olmadan oturumlu kullanıcı ilk boyamada GİRİŞ FORMU görürdü:
 * `useAuth()` istemcide çözülene kadar `isAuthenticated` false dönüyor.
 */
export default function AccountEntryView({
  serverUser,
  initialSummary,
}: {
  serverUser: ServerAccountUser | null;
  /** Sunucuda çekilen pano sayaçları + son siparişler (F2-45). */
  initialSummary?: AccountSummaryFetched | null;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  /**
   * Sunucunun cevabı YALNIZCA istemci oturumu çözerken geçerli. Çözüldükten
   * sonra istemci öne geçiyor; yoksa başka sekmede çıkış yapan kullanıcıya
   * `serverUser` donmuş kaldığı için panosu göstermeye devam ederdik.
   */
  const shownUser = isLoading ? serverUser : isAuthenticated ? user : null;

  if (!shownUser) {
    return <AuthPanels />;
  }

  return <AccountHome user={shownUser} initialSummary={initialSummary} />;
}
