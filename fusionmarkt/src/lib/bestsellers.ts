/**
 * "Çok satanlar" sıralaması — gerçek satış verisi.
 *
 * Önceden bu sıralama üç ayrı yerde `createdAt: "desc"` idi, yani "en çok satan"
 * yazan liste aslında **en yeni ürünleri** gösteriyordu. Üç yer de artık buradan
 * besleniyor: kategori listesi, mağaza şeridi ve ana sayfa şeridi.
 *
 * **Sitede henüz satış yok.** Bu yüzden `getBestsellerProductIds()` bugün boş
 * dizi dönüyor ve çağıran taraf yedek sıralamaya düşüyor: önce stokta olanlar,
 * sonra yeni eklenenler. Yedek sıralamada stok önce geliyor çünkü "çok satan"
 * rafında tükenmiş ürün göstermek kullanıcıyı boşuna tıklatır. İlk satışlar
 * geldiğinde hiçbir yeri değiştirmeye gerek kalmadan gerçek sıralama devreye
 * girer.
 */

import { prisma } from "@repo/db";
import type { Prisma } from "@prisma/client";

/**
 * Yedek sıralama: satış verisi olmadığında ya da satılan ürünler listeyi
 * doldurmadığında kullanılır.
 */
export const BESTSELLER_FALLBACK_ORDER: Prisma.ProductOrderByWithRelationInput[] = [
  { stock: "desc" },
  { createdAt: "desc" },
];

/**
 * Satış adedine göre azalan sırada ürün kimlikleri.
 *
 * Neden `orderBy: { orderItems: { _count } }` kullanılmıyor: Prisma ilişki
 * sayımını **filtreleyemiyor**, dolayısıyla iptal edilmiş ve ödemesi alınmamış
 * siparişler de sayılırdı. Tek bir iptal siparişin sıralamayı bozması, satış
 * hacminin düşük olduğu bu katalogda çok kolay.
 *
 * Sayılan: ödemesi alınmış (`PAID`) ve iptal/iade edilmemiş siparişlerin
 * kalemleri. Adet toplanıyor, sipariş sayısı değil — 1 siparişte 5 adet alınan
 * ürün, 5 ayrı siparişte 1'er adet alınanla aynı ağırlıkta.
 */
export async function getBestsellerProductIds(
  options: { categoryId?: string } = {}
): Promise<string[]> {
  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      // `productId` paket (bundle) kalemlerinde null; onlar ürün sıralamasına girmez.
      productId: { not: null },
      product: {
        isActive: true,
        ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      },
      order: {
        paymentStatus: "PAID",
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
    },
  });

  return sold
    .filter((row) => row.productId !== null && (row._sum.quantity ?? 0) > 0)
    .sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))
    .map((row) => row.productId as string);
}

/**
 * Sayfalamasız "çok satanlar" şeritleri (ana sayfa, mağaza) için hazır liste.
 *
 * Önce gerçekten satılmış ürünler satış sırasıyla, liste dolmazsa arkası yedek
 * sırayla tamamlanır — 6'lık bir şeridin 1 satılmış ürünle boş kalmaması için.
 *
 * `query` geri çağrısı çağıran tarafa ait: her yüzeyin kendi `select` şekli ve
 * ek filtreleri (`inStock` gibi) var, onları buraya taşımak gerekmiyor.
 */
export async function fetchBestsellerProducts<T extends { id: string }>(options: {
  limit: number;
  where: Prisma.ProductWhereInput;
  query: (
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput[],
    take: number
  ) => Promise<T[]>;
}): Promise<T[]> {
  const { limit, where, query } = options;

  const rankedIds = await getBestsellerProductIds();
  const sold = rankedIds.length
    ? (await query({ ...where, id: { in: rankedIds } }, BESTSELLER_FALLBACK_ORDER, limit)).sort(
        (a, b) => rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id)
      )
    : [];

  if (sold.length >= limit) return sold.slice(0, limit);

  const soldIds = sold.map((product) => product.id);
  const fill = await query(
    soldIds.length ? { ...where, id: { notIn: soldIds } } : where,
    BESTSELLER_FALLBACK_ORDER,
    limit - sold.length
  );

  return [...sold, ...fill];
}
