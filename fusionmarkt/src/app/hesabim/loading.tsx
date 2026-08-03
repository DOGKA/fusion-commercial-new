import { AccountSkeleton } from "./_components/shared";

/**
 * Tüm /hesabim/* route'ları için varsayılan yükleniyor ekranı.
 *
 * Veri client'tan geldiği için bu ekran veri beklerken değil, route'un client
 * chunk'ı indirilirken görünür — yavaş bağlantıda boş ekran olmasını engeller.
 */
export default function HesabimLoading() {
  return <AccountSkeleton variant="page" />;
}
