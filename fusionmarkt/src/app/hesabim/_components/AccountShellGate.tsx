"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { ServerAccountUser } from "../_lib/server-user";
import AccountShell from "./AccountShell";
import AccountAuthRequired from "./AccountAuthRequired";

/**
 * Kimin kabuk göreceğine karar verir.
 *
 * Auth guard bilinçli olarak client tarafında; `middleware.ts` eklenmiyor.
 * Sebep: NextAuth özel cookie adı (`shop-session-token`) kullanıyor, bu yüzden
 * `withAuth` doğrudan çalışmıyor ve elle yazılan bir global middleware admin
 * oturumunu da etkileyebilir. Veri sızıntısı riski yok: tüm hesap verisi
 * oturumu kendisi zorunlu kılan API'lerden geliyor, sayfalar noIndex ve
 * robots.ts /hesabim/ altını disallow ediyor (plan 01 §2.3).
 *
 * F2-45'ten beri kararın ilk adımı SUNUCUDA veriliyor: layout oturumu çözüp
 * sonucu `serverUser` olarak geçiyor, böylece "henüz bilmiyorum" durumu ve onu
 * kapatan iskelet ortadan kalkıyor. Yönlendirme ve giriş sonrası dönüş burada
 * kaldı, çünkü ikisi de yolu ve arama parametrelerini gerektiriyor — layout'un
 * ikisine de erişimi yok.
 */
export default function AccountShellGate({
  children,
  serverUser,
}: {
  children: React.ReactNode;
  /**
   * Sunucunun ilk HTML'i üretirken gördüğü kullanıcı. İstemci `useSession()`'ı
   * çözene kadar tek doğru kaynak budur.
   */
  serverUser: ServerAccountUser | null;
}) {
  const { isAuthenticated: clientAuthenticated, isLoading: sessionResolving } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * İstemci oturumu çözülene kadar sunucunun cevabı geçerli. Çözüldükten sonra
   * istemci öne geçiyor — yoksa sayfadayken yapılan giriş/çıkış fark edilmez,
   * çünkü `serverUser` ilk render'da donmuş durumda.
   */
  const isAuthenticated = sessionResolving ? serverUser !== null : clientAuthenticated;

  const isRoot = pathname === "/hesabim";
  const wasAuthenticated = useRef(isAuthenticated);

  // Oturumsuz alt route → /hesabim'e ?next= ile taşı.
  useEffect(() => {
    if (isAuthenticated || isRoot) return;
    const search = searchParams.toString();
    const target = search ? `${pathname}?${search}` : pathname;
    router.replace(`/hesabim?next=${encodeURIComponent(target)}`);
  }, [isAuthenticated, isRoot, pathname, router, searchParams]);

  // Giriş tamamlandığında ?next= hedefine dön — AuthPanels'a dokunmadan.
  useEffect(() => {
    if (wasAuthenticated.current === isAuthenticated) return;
    wasAuthenticated.current = isAuthenticated;
    if (!isAuthenticated) return;

    const next = searchParams.get("next");
    // Open redirect kapalı: yalnızca kendi hesap alanımıza dönülür.
    if (next && next.startsWith("/hesabim")) {
      router.replace(next);
    }
  }, [isAuthenticated, router, searchParams]);

  // Oturumsuz kök: giriş/kayıt panelleri kabuk olmadan, bugünkü haliyle.
  if (!isAuthenticated) {
    return isRoot ? <>{children}</> : <AccountAuthRequired />;
  }

  return <AccountShell serverUser={serverUser}>{children}</AccountShell>;
}
