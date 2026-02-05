import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/prisma";

// ============================================
// TYPE DEFINITIONS
// ============================================
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

/**
 * GET /api/public/categories/[slug]
 * Kategori detayı ve ürünlerini getirir
 * Bundle kategorisi için bundle'ları getirir
 * 
 * Query params:
 * - page: Sayfa numarası (default: 1)
 * - limit: Sayfa başına ürün (default: 12)
 * - sort: Sıralama (newest, price_asc, price_desc, name_asc)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest";

    // Kategoriyi bul
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

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    // themeColor yeni eklenen alan - runtime'da mevcut
    const categoryWithTheme = category as typeof category & { themeColor?: string | null };

    // ═══════════════════════════════════════════════════════════════════════════
    // BUNDLE KATEGORİSİ KONTROLÜ - Bundle'ları getir
    // ═══════════════════════════════════════════════════════════════════════════
    const isBundleCategory = slug.includes('bundle') || slug.includes('paket');
    
    if (isBundleCategory) {
      // Bundle sıralaması
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

      // Bu kategorideki bundle'ları say
      const totalBundles = await prisma.bundle.count({
        where: {
          isActive: true,
          categories: {
            some: {
              categoryId: category.id,
            },
          },
        },
      });

      // Bundle'ları getir
      const bundlesRaw = await prisma.bundle.findMany({
        where: {
          isActive: true,
          categories: {
            some: {
              categoryId: category.id,
            },
          },
        },
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

      // Bundle ID'leri için badge'leri Prisma ile al
      const bundleIds = bundlesRaw.map(b => b.id);
      const bundleBadgesRaw = bundleIds.length > 0 
        ? await prisma.bundleBadge.findMany({
            where: { bundleId: { in: bundleIds } },
            include: { badge: true },
            orderBy: { position: "asc" },
          })
        : [];

      // Badge'leri bundle ID'ye göre grupla
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
          }
        });
        badgesByBundleId.set(bb.bundleId, existing);
      }

      // Bundle'ları badge'lerle birleştir
      const bundles: BundleWithRelations[] = bundlesRaw.map(b => ({
        ...b,
        bundleBadges: badgesByBundleId.get(b.id) || [],
      }));

      // Bundle'ları ürün formatına dönüştür (ProductCard ile uyumlu)
      const products = bundles.map((bundle: BundleWithRelations) => {
        // Stok hesapla: bundle içindeki ürünlerin minimum stoku
        let minStock = Infinity;
        for (const item of bundle.items) {
          if (item.product) {
            const productStock = item.product.variants && item.product.variants.length > 0
              ? item.product.variants.reduce((sum: number, v: BundleVariant) => sum + v.stock, 0)
              : item.product.stock;
            const effectiveStock = Math.floor(productStock / item.quantity);
            if (effectiveStock < minStock) {
              minStock = effectiveStock;
            }
          }
        }
        if (!isFinite(minStock)) minStock = 0;

        const totalValue = bundle.items.reduce((sum: number, item: BundleItem) => {
          return sum + (Number(item.product?.price || 0) * item.quantity);
        }, 0);
        const bundlePrice = Number(bundle.price);
        const savings = totalValue - bundlePrice;
        const savingsPercent = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

        // Bundle rating hesapla
        const bundleReviews = bundle.reviews || [];
        const bundleRatingCount = bundleReviews.length;
        const bundleRatingAverage = bundleRatingCount > 0
          ? bundleReviews.reduce((sum: number, r: BundleReview) => sum + r.rating, 0) / bundleRatingCount
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
          itemCount: bundle.items.length,
          totalValue,
          savings,
          savingsPercent,
          items: bundle.items.map((item: BundleItem) => ({
            id: item.id,
            quantity: item.quantity,
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              thumbnail: item.product.thumbnail,
              price: Number(item.product.price),
            } : null,
          })),
          createdAt: bundle.createdAt,
          // ProductCard uyumluluğu için ek alanlar
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          variants: [],
          productBadges: [],
          technicalSpecs: [],
          productFeatureValues: [],
          // Bundle badges
          badges: bundle.bundleBadges?.map((bb: BundleBadgeRelation) => ({
            id: bb.badge.id,
            name: bb.badge.label,
            color: bb.badge.bgColor || "#22C55E",
            textColor: bb.badge.color || "#FFFFFF",
            icon: bb.badge.icon || null,
          })) || [],
          // Rating
          ratingAverage: bundleRatingAverage,
          ratingCount: bundleRatingCount,
        };
      });

      const totalPages = Math.ceil(totalBundles / limit);

      return NextResponse.json({
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
        isBundle: true,
        pagination: {
          page,
          limit,
          totalProducts: totalBundles,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NORMAL ÜRÜN KATEGORİSİ
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Sıralama
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" }; // newest
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
        orderBy = { createdAt: "desc" }; // TODO: Gerçek satış verisi ile değiştir
        break;
    }

    // Toplam ürün sayısı
    const totalProducts = await prisma.product.count({
      where: {
        categoryId: category.id,
        isActive: true,
      },
    });

    // Ürünleri getir (teknik özellikler dahil)
    const productsRaw = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isActive: true,
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
      skip: (page - 1) * limit,
      take: limit,
    });

    // Rating hesapla ve products'a ekle
    const products = productsRaw.map(p => {
      const reviews = p.reviews || [];
      const ratingCount = reviews.length;
      const ratingAverage = ratingCount > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount 
        : 0;
      
      // reviews array'ini response'dan kaldır
      const { reviews: _, ...productWithoutReviews } = p;
      
      return {
        ...productWithoutReviews,
        ratingAverage,
        ratingCount,
      };
    });

    const totalPages = Math.ceil(totalProducts / limit);
    
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Kategori yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
