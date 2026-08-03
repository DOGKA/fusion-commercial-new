import { getUserOrders } from "@/lib/user-orders";
import { getUserAddresses } from "@/lib/user-addresses";
import { getServerAccountUser } from "./_lib/server-user";
import type { AccountSummaryFetched } from "./_lib/types";
import AccountEntryView from "./_components/AccountEntryView";

/**
 * /hesabim
 *
 * Metadata layout.tsx'ten geliyor (staticPageMetadata.account). Bu URL aynı
 * zamanda NextAuth'un signIn/signOut/error sayfası (auth.ts), yani oturumsuz
 * hâlinin giriş/kayıt olması ZORUNLU — ayrı bir /giris route'u açmak NextAuth
 * ayarını değiştirmek olurdu.
 *
 * Üç durumun ayrımını AccountEntryView ve AccountShellGate yapar.
 *
 * F2-45: oturum + pano sayaçları (sipariş sayısı, adres sayısı, son 3 sipariş)
 * sunucuda çözülüyor. Favori/sepet sayıları istemci context'inden geliyor —
 * misafir localStorage akışını paylaşıyorlar.
 */
export default async function HesabimPage() {
  const serverUser = await getServerAccountUser();

  let initialSummary: AccountSummaryFetched | null = null;
  if (serverUser?.id) {
    const [ordersPage, addresses] = await Promise.all([
      getUserOrders(serverUser.id, { page: 1, limit: 3, status: "all" }),
      getUserAddresses(serverUser.id),
    ]);
    initialSummary = {
      orders: ordersPage.pagination.total,
      addresses: addresses.length,
      recentOrders: ordersPage.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        createdAt: o.createdAt,
        total: o.total,
        items: o.items.map((i) => ({
          id: i.id,
          product: i.product
            ? {
                thumbnail: i.product.thumbnail,
                images: i.product.images,
              }
            : null,
        })),
      })),
    };
  }

  return (
    <AccountEntryView serverUser={serverUser} initialSummary={initialSummary} />
  );
}
