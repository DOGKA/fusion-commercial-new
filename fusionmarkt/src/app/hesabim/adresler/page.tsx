import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";
import { getUserAddresses } from "@/lib/user-addresses";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard, AccountSkeleton } from "../_components/shared";
import AddressesView from "./_components/AddressesView";

export const metadata = staticPageMetadata.accountAddresses;

/**
 * Adresler sunucuda çekiliyor (F2-45): liste ilk HTML'de hazır geliyor.
 * Yazma (ekle/düzenle/sil) istemcide kalıyor; kayıttan sonra hook `reload` eder.
 *
 * Sorgu `Suspense` arkasında: `/hesabim` dinamik olduğu için menüden gelen
 * tıklama önbelleğe düşmüyor, veri beklenirken sayfa kabuğu hemen görünsün.
 */
export default function AdreslerPage() {
  return (
    <AccountCard>
      <Suspense fallback={<AccountSkeleton variant="form" />}>
        <AddressesSection />
      </Suspense>
    </AccountCard>
  );
}

async function AddressesSection() {
  const user = await getServerAccountUser();
  const initialAddresses = user?.id ? await getUserAddresses(user.id) : null;

  return (
    <AddressesView
      initialAddresses={initialAddresses}
      // Yeni adreste alıcı adı hesap adıyla hazır gelsin; kullanıcı
      // değiştirebiliyor (hediye gönderimi, iş yeri teslimatı).
      defaultFullName={user?.name ?? ""}
    />
  );
}
