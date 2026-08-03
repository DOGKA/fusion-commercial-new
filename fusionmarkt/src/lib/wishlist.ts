/**
 * Favori (wishlist) veri katmanı — üç uç da buradan besleniyor.
 *
 * Favoriler bugüne kadar yalnızca `localStorage`'da tutuluyordu: cihaz
 * değişince kayboluyor ve listedeki fiyat, ürün favoriye eklendiği andaki
 * fiyat olarak donuyordu. Bu modül `Wishlist` / `WishlistItem` tablolarını
 * (şemada vardı, hiçbir API kullanmıyordu) devreye alır ve fiyat/stok
 * bilgisini her istekte üründen taze okur.
 */

import { prisma, type Prisma } from "@repo/db";

export interface WishlistItemDTO {
  /** WishlistItem kaydının kimliği */
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  /** Güncel satış fiyatı (varyant seçiliyse varyantın fiyatı) */
  price: number;
  /** Üstü çizili liste fiyatı */
  originalPrice: number | null;
  image: string | null;
  stock: number;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  ratingAverage: number | null;
  ratingCount: number;
  variant: { id: string; name: string; type: string; value: string } | null;
  /** ISO tarih — "yeni eklenenler" sıralaması bunu kullanır */
  addedAt: string;
  /** Favoriye eklendiği andaki fiyat; eski/taşınan kayıtlarda null */
  priceAtAdd: number | null;
}

const ITEM_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      comparePrice: true,
      stock: true,
      isActive: true,
      brand: true,
      images: true,
      categoryId: true,
      category: { select: { name: true } },
    },
  },
  variant: {
    select: {
      id: true,
      name: true,
      type: true,
      value: true,
      price: true,
      salePrice: true,
      stock: true,
      isActive: true,
      image: true,
    },
  },
} satisfies Prisma.WishlistItemInclude;

type ItemWithRelations = Prisma.WishlistItemGetPayload<{ include: typeof ITEM_INCLUDE }>;

const num = (value: Prisma.Decimal | null) => (value == null ? null : Number(value));

function toDto(
  item: ItemWithRelations,
  ratings: Map<string, { average: number; count: number }>
): WishlistItemDTO {
  const { product, variant } = item;

  // Fiyat kuralı ürün sayfası ve `checkout/validate` ile aynı:
  // variant.salePrice → variant.price → product.price.
  const price =
    variant != null
      ? (num(variant.salePrice) ?? num(variant.price) ?? Number(product.price))
      : Number(product.price);

  const rating = ratings.get(product.id);

  return {
    id: item.id,
    productId: product.id,
    slug: product.slug,
    title: product.name,
    brand: product.brand ?? "",
    price,
    originalPrice: num(product.comparePrice),
    image: variant?.image || product.images[0] || null,
    // Varyantlı favoride stok varyantın stoğu; ürün stoğu yanıltıcı olurdu.
    stock: variant != null ? variant.stock : product.stock,
    isActive: product.isActive && (variant == null || variant.isActive),
    categoryId: product.categoryId,
    categoryName: product.category.name,
    ratingAverage: rating ? rating.average : null,
    ratingCount: rating ? rating.count : 0,
    variant:
      variant != null
        ? {
            id: variant.id,
            name: variant.name ?? "",
            type: variant.type ?? "",
            value: variant.value ?? "",
          }
        : null,
    addedAt: item.createdAt.toISOString(),
    priceAtAdd: num(item.priceAtAdd),
  };
}

/**
 * Puan ortalamaları tek `groupBy` ile çekiliyor; kalem başına sorgu atmak
 * favori sayısı kadar gidiş-dönüş üretirdi. Yalnızca onaylı yorumlar sayılır.
 */
async function fetchRatings(productIds: string[]) {
  const map = new Map<string, { average: number; count: number }>();
  if (productIds.length === 0) return map;

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });

  for (const row of grouped) {
    // `Review.productId` şemada nullable (yorum bundle'a da ait olabiliyor);
    // filtre zaten ürün kimliklerini verdiği için null gelmiyor ama tip
    // güvencesi için kontrol ediliyor.
    if (row.productId == null) continue;
    map.set(row.productId, {
      average: row._avg.rating ?? 0,
      count: row._count._all,
    });
  }
  return map;
}

/** Kullanıcının favori listesini (yoksa boş dizi) taze ürün verisiyle döndürür. */
export async function getWishlistItems(userId: string): Promise<WishlistItemDTO[]> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: {
      items: {
        include: ITEM_INCLUDE,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wishlist) return [];

  const ratings = await fetchRatings(wishlist.items.map((i) => i.productId));
  return wishlist.items.map((item) => toDto(item, ratings));
}

/** Liste kaydını yoksa oluşturur, kimliğini döndürür. */
export async function ensureWishlist(userId: string): Promise<string> {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  return wishlist.id;
}
