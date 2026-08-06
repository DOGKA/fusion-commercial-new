/**
 * Kategori + ürün listesi sorgusu.
 *
 * Eskiden bu mantık yalnızca `/api/public/categories/[slug]` içindeydi ve
 * kategori sayfası veriyi tarayıcıda çekiyordu. Sonuç: sunucudan gelen HTML'de
 * tek bir ürün adı bile yoktu, arama motorları ve LLM tarayıcıları kategori
 * sayfasını boş görüyordu.
 *
 * Sorgu buraya alındı ki hem API ucu hem de kategori sayfasının sunucu
 * bileşeni aynı cevabı üretsin; iki yerde iki farklı liste oluşma ihtimali yok.
 */

import { prisma, Prisma } from "@/lib/prisma";
import { BESTSELLER_FALLBACK_ORDER, getBestsellerProductIds } from "@/lib/bestsellers";

interface BundleVariant {
  id: string;
  stock: number;
}

interface BundleProductItem {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number | Prisma.Decimal;
  stock: number;
  variants?: BundleVariant[];
}

interface BundleItem {
  id: string;
  quantity: number;
  product: BundleProductItem | null;
}

interface BundleBadgeRelation {
  badge: {
    id: string;
    label: string;
    bgColor: string | null;
    color: string | null;
    icon: string | null;
  };
}

interface BundleReview {
  rating: number;
}

interface BundleWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnail: string | null;
  price: number | Prisma.Decimal;
  comparePrice: number | Prisma.Decimal | null;
  brand: string | null;
  createdAt: Date;
  items: BundleItem[];
  bundleBadges?: BundleBadgeRelation[];
  reviews?: BundleReview[];
}

export interface CategoryQueryOptions {
  page?: number;
  limit?: number;
  /** "newest" | "price_asc" | "price_desc" | "name_asc" | "bestseller" */
  sort?: string;
}

export type CategoryProductsResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: 404; error: string };

/**
 * Kategoriyi ve o kategorideki ürünleri (paket kategorisinde paketleri) döner.
 *
 * Dönen `data` doğrudan JSON'a çevrilebilir; API ucu bunu `NextResponse.json`
 * ile, sayfa ise prop olarak istemciye geçiriyor.
 */
export async function getCategoryWithProducts(
  slug: string,
  { page = 1, limit = 12, sort: sortRaw = "newest" }: CategoryQueryOptions = {}
): Promise<CategoryProductsResult> {
  // sort parametresi "newest:1" gibi gelebilir, sadece ilk kısmı al
  const sort = sortRaw.includes(":") ? sortRaw.split(":")[0] : sortRaw;

  const isBundleCategory = slug.includes("bundle") || slug.includes("paket");

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Bundle kategorisi için kategori bulunamasa da devam et
  if (!category && !isBundleCategory) {
    return { ok: false, status: 404, error: "Kategori bulunamadı" };
  }

  // themeColor yeni eklenen alan - runtime'da mevcut
  const categoryWithTheme = category as (typeof category & { themeColor?: string | null }) | null;

  if (isBundleCategory) {
    let bundleOrderBy: Prisma.BundleOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        bundleOrderBy = { price: "asc" };
        break;
      case "price_desc":
        bundleOrderBy = { price: "desc" };
        break;
      case "name_asc":
        bundleOrderBy = { name: "asc" };
        break;
    }

    // Kategori varsa kategoriye göre filtrele, yoksa tüm aktif bundle'ları getir
    const bundleWhere: Prisma.BundleWhereInput = {
      isActive: true,
      ...(category
        ? {
            categories: {
              some: {
                categoryId: category.id,
              },
            },
          }
        : {}),
    };

    const totalBundles = await prisma.bundle.count({ where: bundleWhere });

    const bundlesRaw = await prisma.bundle.findMany({
      where: bundleWhere,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                stock: true,
                variants: {
                  where: { isActive: true },
                  select: { id: true, stock: true },
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        // Bundle yorumları - rating hesabı için
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy: bundleOrderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const bundleIds = bundlesRaw.map((b) => b.id);
    const bundleBadgesRaw =
      bundleIds.length > 0
        ? await prisma.bundleBadge.findMany({
            where: { bundleId: { in: bundleIds } },
            include: { badge: true },
            orderBy: { position: "asc" },
          })
        : [];

    const badgesByBundleId = new Map<string, BundleBadgeRelation[]>();
    for (const bb of bundleBadgesRaw) {
      const existing = badgesByBundleId.get(bb.bundleId) || [];
      existing.push({
        badge: {
          id: bb.badge.id,
          label: bb.badge.label,
          bgColor: bb.badge.bgColor,
          color: bb.badge.color,
          icon: bb.badge.icon,
        },
      });
      badgesByBundleId.set(bb.bundleId, existing);
    }

    const bundles: BundleWithRelations[] = bundlesRaw.map((b) => ({
      ...b,
      bundleBadges: badgesByBundleId.get(b.id) || [],
    }));

    // Bundle'ları ürün formatına dönüştür (ProductCard ile uyumlu)
    const products = bundles.map((bundle: BundleWithRelations) => {
      const bundleItems = bundle.items || [];

      // Stok: bundle içindeki ürünlerin minimum stoku
      let minStock = Infinity;
      for (const item of bundleItems) {
        if (item.product) {
          const productStock =
            item.product.variants && item.product.variants.length > 0
              ? item.product.variants.reduce((sum: number, v: BundleVariant) => sum + v.stock, 0)
              : item.product.stock;
          const effectiveStock = Math.floor(productStock / item.quantity);
          if (effectiveStock < minStock) {
            minStock = effectiveStock;
          }
        }
      }
      if (!isFinite(minStock)) minStock = 0;

      const totalValue = bundleItems.reduce((sum: number, item: BundleItem) => {
        return sum + Number(item.product?.price || 0) * item.quantity;
      }, 0);
      const bundlePrice = Number(bundle.price);
      const savings = totalValue - bundlePrice;
      const savingsPercent = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

      const bundleReviews = bundle.reviews || [];
      const bundleRatingCount = bundleReviews.length;
      const bundleRatingAverage =
        bundleRatingCount > 0
          ? bundleReviews.reduce((sum: number, r: BundleReview) => sum + r.rating, 0) /
            bundleRatingCount
          : 0;

      return {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        shortDescription: bundle.shortDescription,
        thumbnail: bundle.thumbnail,
        price: bundlePrice,
        compareAtPrice: Number(bundle.comparePrice) || totalValue,
        stock: minStock,
        brand: bundle.brand || "Bundle / Paket",
        isBundle: true,
        itemCount: bundleItems.length,
        totalValue,
        savings,
        savingsPercent,
        items: bundleItems.map((item: BundleItem) => ({
          id: item.id,
          quantity: item.quantity,
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
        createdAt: bundle.createdAt,
        // ProductCard uyumluluğu için ek alanlar
        category: category
          ? {
              id: category.id,
              name: category.name,
              slug: category.slug,
            }
          : {
              id: "bundle-category",
              name: "Bundle / Paket Ürünler",
              slug,
            },
        variants: [],
        productBadges: [],
        technicalSpecs: [],
        productFeatureValues: [],
        badges:
          bundle.bundleBadges?.map((bb: BundleBadgeRelation) => ({
            id: bb.badge.id,
            name: bb.badge.label,
            color: bb.badge.bgColor || "#22C55E",
            textColor: bb.badge.color || "#FFFFFF",
            icon: bb.badge.icon || null,
          })) || [],
        ratingAverage: bundleRatingAverage,
        ratingCount: bundleRatingCount,
      };
    });

    const totalPages = Math.ceil(totalBundles / limit);

    return {
      ok: true,
      data: {
        success: true,
        category: categoryWithTheme
          ? {
              id: categoryWithTheme.id,
              name: categoryWithTheme.name,
              slug: categoryWithTheme.slug,
              description: categoryWithTheme.description,
              image: categoryWithTheme.image,
              icon: categoryWithTheme.icon,
              themeColor: categoryWithTheme.themeColor ?? null,
              parent: categoryWithTheme.parent,
            }
          : {
              id: "bundle-category",
              name: "Bundle / Paket Ürünler",
              slug,
              description: "Özel paket ürünlerimiz ile tasarruf edin",
              image: null,
              icon: null,
              themeColor: "#10B981",
              parent: null,
            },
        products,
        isBundle: true,
        pagination: {
          page,
          limit,
          totalProducts: totalBundles,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  // ─── Normal ürün kategorisi ───────────────────────────────────────────────

  // Bu noktada category kesinlikle var (bundle değilse ve null ise zaten döndük)
  if (!category || !categoryWithTheme) {
    return { ok: false, status: 404, error: "Kategori bulunamadı" };
  }

  let orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] = {
    createdAt: "desc",
  }; // newest
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "bestseller":
      // Satış varsa sıra aşağıda kimlik listesiyle kuruluyor; bu yedek
      // sıralama satış olmadığında (bugünkü durum) devreye giriyor.
      orderBy = BESTSELLER_FALLBACK_ORDER;
      break;
  }

  /**
   * "Çok satanlar" sayfalaması.
   *
   * Sıra veritabanında kurulamıyor (bkz. `lib/bestsellers.ts`), bu yüzden önce
   * tam sıralı kimlik listesi çıkarılıyor: önce satılanlar satış adedine göre,
   * arkasına hiç satılmamışlar yedek sırayla. Sayfalama bu liste üzerinden
   * dilimleniyor — aksi hâlde 2. sayfada sıra bozulurdu.
   */
  let orderedIds: string[] | null = null;
  if (sort === "bestseller") {
    const rankedIds = await getBestsellerProductIds({ categoryId: category.id });
    if (rankedIds.length > 0) {
      const rest = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true,
          id: { notIn: rankedIds },
        },
        orderBy: BESTSELLER_FALLBACK_ORDER,
        select: { id: true },
      });
      orderedIds = [...rankedIds, ...rest.map((row) => row.id)];
    }
  }

  const pageIds = orderedIds ? orderedIds.slice((page - 1) * limit, page * limit) : null;

  const totalProducts = await prisma.product.count({
    where: {
      categoryId: category.id,
      isActive: true,
    },
  });

  const productsUnordered = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
      ...(pageIds ? { id: { in: pageIds } } : {}),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      productBadges: {
        include: {
          badge: true,
        },
        orderBy: { position: "asc" },
      },
      // Teknik özellikler - filtreleme için gerekli
      technicalSpecs: {
        orderBy: { order: "asc" },
      },
      productFeatureValues: {
        include: {
          feature: {
            select: {
              id: true,
              name: true,
              slug: true,
              unit: true,
            },
          },
        },
        orderBy: { displayOrder: "asc" },
      },
      // Review istatistikleri için
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
    orderBy,
    // Kimlik listesi varsa sayfalama zaten orada yapıldı.
    ...(pageIds ? {} : { skip: (page - 1) * limit, take: limit }),
  });

  // `id: { in: [...] }` sorgusu sırayı korumaz; istenen sıraya geri diziyoruz.
  const productsRaw = pageIds
    ? pageIds
        .map((id) => productsUnordered.find((product) => product.id === id))
        .filter((product): product is (typeof productsUnordered)[number] => Boolean(product))
    : productsUnordered;

  const products = productsRaw.map((p) => {
    const { reviews: rawReviews, ...productWithoutReviews } = p;
    const reviews = rawReviews || [];
    const ratingCount = reviews.length;
    const ratingAverage =
      ratingCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;

    return {
      ...productWithoutReviews,
      ratingAverage,
      ratingCount,
    };
  });

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    ok: true,
    data: {
      success: true,
      category: {
        id: categoryWithTheme.id,
        name: categoryWithTheme.name,
        slug: categoryWithTheme.slug,
        description: categoryWithTheme.description,
        image: categoryWithTheme.image,
        icon: categoryWithTheme.icon,
        themeColor: categoryWithTheme.themeColor ?? null,
        parent: categoryWithTheme.parent,
      },
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  };
}
