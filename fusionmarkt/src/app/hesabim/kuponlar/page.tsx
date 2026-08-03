import { staticPageMetadata } from "@/lib/seo";
import { getUserCoupons } from "@/lib/user-coupons";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard } from "../_components/shared";
import CouponsView from "./_components/CouponsView";

export const metadata = staticPageMetadata.accountCoupons;

/**
 * Kuponlar sunucuda çekiliyor (F2-45): liste ilk HTML'de hazır geliyor, istemci
 * mount olunca aynı isteği tekrar atmıyor.
 *
 * Oturum yoksa veri de çekilmiyor — o durumda kabuk zaten `AccountShellGate`
 * tarafından giriş ekranına çevriliyor, boşuna sorgu atmanın anlamı yok.
 */
export default async function KuponlarPage() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getUserCoupons(user.id) : null;

  return (
    <AccountCard>
      <CouponsView initialData={initialData} />
    </AccountCard>
  );
}
