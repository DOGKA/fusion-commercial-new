import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import GuestFavoritesView from "./_components/GuestFavoritesView";

/**
 * `/favori` — oturum durumuna göre dallanır.
 *
 * Neden iki ekran var: favori eklemek için giriş zorunlu değil, misafirin
 * listesi `localStorage`'da duruyor. Hesap kabuğu (`/hesabim/*`) ise oturum
 * istiyor, yani misafire gösterilemez. Bu yüzden `/favori` kaldırılmadı.
 *
 * Oturumlu kullanıcı buradan `/hesabim/favorilerim`e gönderiliyor: orası
 * veritabanındaki listeyi sunucuda çekiyor, fiyat/stok taze geliyor ve
 * kullanıcı hesap kabuğunun içinde kalıyor. Header ve MobileMenu'deki kalp
 * ikonu hâlâ `/favori`ye işaret ediyor — yönlendirmenin burada olmasının
 * sebebi tam olarak bu: o iki dosya "dokunulmaz" listesinde ve link
 * değiştirmeden aynı sonuç elde ediliyor.
 */
export default async function FavoriPage() {
  const session = await getAuthSession();
  if (session?.user?.id) {
    redirect("/hesabim/favorilerim");
  }

  return <GuestFavoritesView />;
}
