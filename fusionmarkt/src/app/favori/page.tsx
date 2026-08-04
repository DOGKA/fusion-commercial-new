import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { AccountCard } from "@/app/hesabim/_components/shared";
import AccountFavoritesView from "@/app/hesabim/favorilerim/_components/AccountFavoritesView";

/**
 * `/favori` — oturum durumuna göre dallanır.
 *
 * Favori eklemek için giriş zorunlu değil; misafir listesi `localStorage`'da
 * duruyor. Bu nedenle `/favori` korunur, ancak hesap sayfasıyla aynı içerik
 * bileşenini sidebar ve kullanıcı araçları olmadan gösterir.
 *
 * Oturumlu kullanıcı buradan `/hesabim/favorilerim`e gönderiliyor: orası
 * veritabanındaki listeyi sunucuda çekiyor, fiyat/stok taze geliyor ve kullanıcı
 * hesap kabuğunun içinde kalıyor.
 */
export default async function FavoriPage() {
  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect("/hesabim/favorilerim");
  }

  return (
    <main className="account-page">
      <div className="account-page-container relative z-10 max-w-[1280px] mx-auto px-8">
        <div className="account-content-area min-w-0">
          <h1 className="account-page-title">Beğendiklerim</h1>
          <AccountCard>
            <AccountFavoritesView />
          </AccountCard>
        </div>
      </div>
    </main>
  );
}
