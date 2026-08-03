import { staticPageMetadata } from "@/lib/seo";
import { getWishlistItems } from "@/lib/wishlist";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard } from "../_components/shared";
import AccountFavoritesView from "./_components/AccountFavoritesView";

/**
 * Oturumlu kullanıcının favori adresi burası; `/favori` sunucuda buraya
 * yönlendiriyor (Header'daki kalp ikonu hâlâ `/favori`ye gidiyor ama o dosya
 * dokunulmaz). `/favori` yalnızca misafir yüzeyi olarak duruyor, çünkü favori
 * eklemek giriş gerektirmiyor ve hesap kabuğu oturum istiyor.
 *
 * F2-45: oturumlu kullanıcı için liste sunucuda çekiliyor. Context merge
 * bitene kadar bu liste ilk boyamada gösterilir; yazma hâlâ context'e bağlı.
 *
 * Tip: `FavoriteItem` client context'ten import edilmiyor — sunucu sayfası
 * client modülüne bağlanmasın diye DTO → görünüm prop'u eşlemesi burada
 * düz nesne olarak yapılıyor.
 */
export const metadata = staticPageMetadata.accountFavorites;

export default async function FavorilerimPage() {
  const user = await getServerAccountUser();
  const initialItems = user?.id
    ? (await getWishlistItems(user.id)).map((item) => ({
        id: item.id,
        productId: item.productId,
        bundleId: item.bundleId ?? undefined,
        isBundle: item.isBundle,
        slug: item.slug,
        title: item.title,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image ?? undefined,
        variant: item.variant ?? undefined,
        addedAt: new Date(item.addedAt).getTime(),
        stock: item.stock,
        isActive: item.isActive,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount,
        priceAtAdd: item.priceAtAdd,
      }))
    : null;

  return (
    <AccountCard>
      <AccountFavoritesView initialItems={initialItems} />
    </AccountCard>
  );
}
