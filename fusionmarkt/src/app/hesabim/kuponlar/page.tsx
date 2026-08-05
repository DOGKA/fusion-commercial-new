import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";
import { getUserCoupons } from "@/lib/user-coupons";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard, AccountSkeleton } from "../_components/shared";
import CouponsView from "./_components/CouponsView";

export const metadata = staticPageMetadata.accountCoupons;

/**
 * Kuponlar sunucuda çekiliyor (F2-45): liste ilk HTML'de hazır geliyor, istemci
 * mount olunca aynı isteği tekrar atmıyor.
 *
 * Oturum yoksa veri de çekilmiyor — o durumda kabuk zaten `AccountShellGate`
 * tarafından giriş ekranına çevriliyor, boşuna sorgu atmanın anlamı yok.
 *
 * Sorgu `Suspense` arkasında: menüden gelen tıklamada kabuk beklemeden çizilsin.
 */
export default function KuponlarPage() {
  return (
    <AccountCard>
      <Suspense fallback={<AccountSkeleton variant="card" count={3} />}>
        <CouponsSection />
      </Suspense>
    </AccountCard>
  );
}

async function CouponsSection() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getUserCoupons(user.id) : null;

  return <CouponsView initialData={initialData} />;
}
