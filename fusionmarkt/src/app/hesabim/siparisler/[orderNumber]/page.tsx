import type { Metadata } from "next";
import { getOrderDetail } from "@/lib/order-detail";
import { getAuthSession } from "@/lib/auth";
import OrderDetailView from "./_components/OrderDetailView";

/**
 * Sipariş detayı — `noindex`.
 *
 * Kişiye özel bir sayfa; `robots.ts` `/hesabim/` altını zaten disallow ediyor
 * ama sayfa düzeyinde de işaretliyoruz (plan 01 §2.3).
 */
export const metadata: Metadata = {
  title: "Sipariş Detayı",
  robots: { index: false, follow: false },
};

/**
 * Detay SUNUCUDA çekiliyor (F2-45): sipariş ilk HTML'de hazır geliyor, istemci
 * mount olunca aynı isteği tekrarlamıyor.
 *
 * Oturumu okumak için `getServerAccountUser()` değil doğrudan `getAuthSession()`
 * kullanılıyor: yetki kararı `role` alanına da bakıyor (admin başkasının
 * siparişini görebiliyor) ve o alan hesap kullanıcı köprüsünün taşıdığı
 * görüntüleme verisinin parçası değil.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);

  const session = await getAuthSession();
  if (!session?.user?.id) {
    // Kabuk oturumsuz kullanıcıyı zaten giriş ekranına taşıyor; burada veri
    // çekmenin anlamı yok.
    return <OrderDetailView orderNumber={orderNumber} />;
  }

  const result = await getOrderDetail(orderNumber, {
    userId: session.user.id,
    role: (session.user as { role?: string }).role,
  });

  return (
    <OrderDetailView
      orderNumber={orderNumber}
      initialOrder={result.ok ? result.data : null}
      initialError={result.ok ? null : result.error}
    />
  );
}
