/**
 * Mağaza (/magaza) için sunucu tarafı veri katmanı.
 *
 * Bu fonksiyonlar, public API route'larının (/api/public/products, /bundles,
 * /categories, /banners, /shipping/calculate) döndürdüğü JSON şekillerinin
 * birebir aynısını üretir. Amaç: /magaza sayfasının veriyi hydration sonrası
 * tarayıcıdan fetch etmek yerine SSR sırasında almasını sağlamak (CLS + LCP).
 *
 * NOT: Sonuçlar JSON round-trip'ten geçirilir; böylece Prisma Decimal/Date
 * değerleri API'nin döndürdüğüyle aynı biçimde (string) serialize edilir ve
 * RSC -> Client Component prop aktarımı sorunsuz çalışır.
 */

import { prisma, Prisma } from "@repo/db";
import { fetchBestsellerProducts } from "@/lib/bestsellers";
import {
  selectProductPublic,
  selectCategoryPublic,
  selectBannerPublic,
  mapBannersToPublicDTO,
} from "@/server/dto";

const DEFAULT_FREE_SHIPPING_LIMIT = 2000;

// API'nin JSON.stringify davranışını birebir taklit et (Decimal -> string vb.)
function jsonSafe<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

// ============================================
// BANNERS (bkz. /api/public/banners)
// ============================================
export async function getStoreBanners(): Promise<unknown[]> {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      select: selectBannerPublic,
      orderBy: { order: "asc" },
    });
    return jsonSafe(mapBannersToPublicDTO(banners));
  } catch {
    return [];
  }
}

// ============================================
// CATEGORIES (bkz. /api/public/categories)
// ============================================
export async function getStoreCategories(): Promise<unknown[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: selectCategoryPublic,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return jsonSafe(categories);
  } catch {
    return [];
  }
}

// ============================================
// PRODUCTS (bkz. /api/public/products)
// ============================================
interface ProductVariantRow {
  id: string;
  value?: string | null;
  [key: string]: unknown;
}

// Varyantları sırala (08, 09, 10, 11 veya S, M, L, XL) - API route ile aynı
function sortVariants(variants: ProductVariantRow[]) {
  if (!variants || variants.length === 0) return variants;
  const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  return [...variants].sort((a, b) => {
    const aVal = a.value || "";
    const bVal = b.value || "";
    if (sizeOrder[aVal] && sizeOrder[bVal]) return sizeOrder[aVal] - sizeOrder[bVal];
    const aNum = parseInt(aVal.replace(/^0+/, ""), 10);
    const bNum = parseInt(bVal.replace(/^0+/, ""), 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return aVal.localeCompare(bVal);
  });
}

export async function getStoreProducts(options: {
  featured?: boolean;
  bestseller?: boolean;
  inStock?: boolean;
  limit?: number;
} = {}): Promise<unknown[]> {
  try {
    const { featured, bestseller, inStock, limit } = options;

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (featured) where.isFeatured = true;
    if (inStock) where.stock = { gt: 0 };

    // API route ile aynı variant select
    const variantSelect = {
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        stock: true,
        image: true,
        isActive: true,
        combinationKey: true,
        name: true,
        type: true,
        value: true,
        colorCode: true,
        variantOptions: {
          select: {
            attribute: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                displayType: true,
              },
            },
            attributeValue: {
              select: {
                id: true,
                name: true,
                value: true,
                color: true,
                image: true,
              },
            },
          },
        },
      },
    };

    const runQuery = (
      productWhere: Prisma.ProductWhereInput,
      orderBy: Prisma.ProductOrderByWithRelationInput[],
      take: number | undefined
    ) =>
      prisma.product.findMany({
        where: productWhere,
        select: {
          ...selectProductPublic,
          variants: variantSelect,
        },
        orderBy,
        take,
      });

    const products = bestseller
      ? await fetchBestsellerProducts({
          // Şerit sabit sayıda kart gösteriyor; sınır verilmemişse makul bir tavan.
          limit: limit ?? 12,
          where,
          query: (productWhere, orderBy, take) => runQuery(productWhere, orderBy, take),
        })
      : await runQuery(
          where,
          [
            { isFeatured: "desc" as const },
            { isNew: "desc" as const },
            { createdAt: "desc" as const },
          ],
          limit
        );

    const sortedProducts = products.map(
      (p: { productType?: string; variants?: ProductVariantRow[]; reviews?: { rating: number }[]; [key: string]: unknown }) => {
        const { reviews: rawReviews, ...productWithoutReviews } = p;
        const reviews = rawReviews || [];
        const ratingCount = reviews.length;
        const ratingAverage =
          ratingCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
            : 0;

        return {
          ...productWithoutReviews,
          // SIMPLE ürünlerde öksüz varyant kayıtları gösterilmesin
          variants: p.productType === "VARIABLE" ? sortVariants(p.variants || []) : [],
          ratingAverage,
          ratingCount,
        };
      }
    );

    return jsonSafe(sortedProducts);
  } catch {
    return [];
  }
}

// ============================================
// BUNDLES (bkz. /api/public/bundles)
// ============================================
export async function getStoreBundles(limit = 100): Promise<unknown[]> {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
          where: { isPrimary: true },
          take: 1,
        },
        items: {
          select: {
            id: true,
            quantity: true,
            variantId: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                stock: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" as const },
        },
        bundleBadges: {
          include: {
            badge: {
              select: {
                id: true,
                label: true,
                color: true,
                bgColor: true,
                icon: true,
                isActive: true,
              },
            },
          },
          orderBy: { position: "asc" as const },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // API route ile aynı transform
    const transformedBundles = bundles.map((bundle) => {
      const minStock =
        bundle.items.length > 0
          ? Math.min(
              ...bundle.items.map((item) =>
                Math.floor((item.product?.stock || 0) / item.quantity)
              )
            )
          : 0;

      const totalValue = bundle.items.reduce((sum, item) => {
        return sum + Number(item.product?.price || 0) * item.quantity;
      }, 0);

      const primaryCategory = bundle.categories[0]?.category || null;
      const bundlePrice = Number(bundle.price);

      const reviews = (bundle as { reviews?: { rating: number }[] }).reviews || [];
      const ratingCount = reviews.length;
      const ratingAverage =
        ratingCount > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
          : 0;

      return {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        shortDescription: bundle.shortDescription,
        price: bundlePrice,
        comparePrice: bundle.comparePrice ? Number(bundle.comparePrice) : totalValue,
        totalValue: totalValue,
        thumbnail: bundle.thumbnail,
        brand: bundle.brand,
        isActive: bundle.isActive,
        isFeatured: bundle.isFeatured,
        stock: minStock,
        itemCount: bundle.items.length,
        items: bundle.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          variantId: item.variantId || null,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                thumbnail: item.product.thumbnail,
                price: Number(item.product.price),
              }
            : null,
        })),
        hasVariants: bundle.items.some((item) => !!item.variantId),
        isBundle: true,
        category: primaryCategory,
        savings: totalValue - bundlePrice,
        savingsPercent:
          totalValue > 0
            ? Math.round(((totalValue - bundlePrice) / totalValue) * 100)
            : 0,
        badges:
          (bundle as {
            bundleBadges?: {
              badge: {
                id: string;
                label: string;
                bgColor: string;
                color: string;
                icon: string | null;
                isActive: boolean;
              };
            }[];
          }).bundleBadges
            ?.map((bb) => ({
              id: bb.badge.id,
              name: bb.badge.label,
              color: bb.badge.bgColor,
              textColor: bb.badge.color,
              icon: bb.badge.icon,
            }))
            .filter((b) => b.name) || [],
        ratingAverage,
        ratingCount,
      };
    });

    return jsonSafe(transformedBundles);
  } catch {
    return [];
  }
}

// ============================================
// FREE SHIPPING THRESHOLD (bkz. /api/public/shipping/calculate)
// ============================================
export async function getFreeShippingThreshold(): Promise<number> {
  try {
    const shippingSettings = await prisma.shippingSettings.findUnique({
      where: { id: "default" },
    });
    return shippingSettings?.freeShippingLimit
      ? Number(shippingSettings.freeShippingLimit)
      : DEFAULT_FREE_SHIPPING_LIMIT;
  } catch {
    return DEFAULT_FREE_SHIPPING_LIMIT;
  }
}
