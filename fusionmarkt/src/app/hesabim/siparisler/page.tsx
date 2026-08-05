import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";
import { getUserOrders } from "@/lib/user-orders";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard, AccountSkeleton } from "../_components/shared";
import OrdersView from "./_components/OrdersView";

export const metadata = staticPageMetadata.accountOrders;

/**
 * İlk sayfa sunucuda çekiliyor (F2-45): varsayılan filtreyle (tümü, arama yok)
 * 10 kayıt HTML'de hazır geliyor. Filtre/arama/sonsuz kaydırma istemcide kalıyor.
 *
 * Sorgu `Suspense` arkasında: sipariş listesi hesap alanının en ağır
 * sorgularından biri, kabuk onu beklemeden çizilsin.
 */
export default function SiparislerPage() {
  return (
    <AccountCard>
      <Suspense fallback={<AccountSkeleton variant="orderRow" count={4} />}>
        <OrdersSection />
      </Suspense>
    </AccountCard>
  );
}

async function OrdersSection() {
  const user = await getServerAccountUser();
  const initialData = user?.id
    ? await getUserOrders(user.id, { page: 1, limit: 10, status: "all" })
    : null;

  return <OrdersView initialData={initialData} />;
}
