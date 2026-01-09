import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";

// Bundle için Prisma include tipi
const bundleInclude = {
  categories: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          price: true,
          comparePrice: true,
          stock: true,
          brand: true,
          shortDescription: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  bundleBadges: {
    include: {
      badge: {
        select: {
          id: true,
          name: true,
          color: true,
          textColor: true,
          icon: true,
          isSystem: true,
        },
      },
    },
    orderBy: {
      position: "asc" as const,
    },
  },
};

// GET - Tek bundle detayı (frontend için)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const bundle = await prisma.bundle.findFirst({
      where: { 
        slug,
        isActive: true,
      },
      include: bundleInclude,
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Paket ürün bulunamadı" },
        { status: 404 }
      );
    }

    // Stok hesaplama
    const minStock = bundle.items.length > 0
      ? Math.min(
          ...bundle.items.map((item) =>
            Math.floor((item.product?.stock || 0) / item.quantity)
          )
        )
      : 0;

    // Ürünlerin toplam değeri
    const totalValue = bundle.items.reduce((sum, item) => {
      return sum + (Number(item.product?.price || 0) * item.quantity);
    }, 0);

    // Kategorileri düzenle
    const categories = bundle.categories.map((bc) => ({
      id: bc.category.id,
      name: bc.category.name,
      slug: bc.category.slug,
      isPrimary: bc.isPrimary,
    }));

    // Ana kategori (breadcrumb için)
    const primaryCategory = categories.find((c) => c.isPrimary) || categories[0] || null;

    // Variant ID'lerini topla
    const variantIds = bundle.items
      .map((item: { variantId?: string | null }) => item.variantId)
      .filter((id): id is string => !!id);
    
    // Variant bilgilerini çek
    const variantMap = new Map<string, { id: string; name: string | null; type: string | null; value: string | null; colorCode: string | null }>();
    if (variantIds.length > 0) {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, name: true, type: true, value: true, colorCode: true },
      });
      for (const v of variants) {
        variantMap.set(v.id, v);
      }
    }

    // Bundle items'ı düzenle
    const items = bundle.items.map((item: { id: string; quantity: number; variantId?: string | null; product?: { id: string; name: string; slug: string; thumbnail: string | null; price: unknown; comparePrice?: unknown; stock: number; brand?: string | null; shortDescription?: string | null } | null }) => {
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      return {
        id: item.id,
        quantity: item.quantity,
        variantId: item.variantId || null,
        variant: variant ? {
          id: variant.id,
          name: variant.type || variant.name || 'Varyasyon',
          value: variant.value || '',
          colorCode: variant.colorCode || null,
        } : null,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              thumbnail: item.product.thumbnail,
              price: Number(item.product.price),
              comparePrice: item.product.comparePrice
                ? Number(item.product.comparePrice)
                : null,
              stock: item.product.stock,
              brand: item.product.brand,
              shortDescription: item.product.shortDescription,
            }
          : null,
      };
    });

    // Galeri görselleri (bundle görselleri + ürün görselleri)
    const images: string[] = [];
    if (bundle.thumbnail) images.push(bundle.thumbnail);
    if (bundle.images && bundle.images.length > 0) {
      images.push(...bundle.images);
    }
    // Ürün thumbnaillerini de ekle (alternatif görsel olarak)
    for (const item of items) {
      if (item.product?.thumbnail && !images.includes(item.product.thumbnail)) {
        images.push(item.product.thumbnail);
      }
    }

    const bundlePrice = Number(bundle.price);

    return NextResponse.json({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      shortDescription: bundle.shortDescription,
      price: bundlePrice,
      comparePrice: bundle.comparePrice ? Number(bundle.comparePrice) : totalValue,
      pricingType: bundle.pricingType,
      thumbnail: bundle.thumbnail,
      images,
      videoUrl: bundle.videoUrl,
      brand: bundle.brand,
      sku: bundle.sku,
      isActive: bundle.isActive,
      isFeatured: bundle.isFeatured,
      metaTitle: bundle.metaTitle,
      metaDescription: bundle.metaDescription,
      metaKeywords: bundle.metaKeywords,
      
      // Hesaplanan değerler
      stock: minStock,
      totalValue,
      savings: totalValue - bundlePrice,
      savingsPercent: totalValue > 0 
        ? Math.round(((totalValue - bundlePrice) / totalValue) * 100) 
        : 0,
      
      // İlişkiler
      categories,
      category: primaryCategory, // Ana kategori (breadcrumb için)
      items,
      itemCount: items.length,
      
      // Bundle olduğunu belirt
      isBundle: true,
      
      // Rozetler
      badges: (bundle as { bundleBadges?: { badge: { id: string; name: string; color: string; textColor: string | null; icon: string | null; isSystem: boolean } }[] }).bundleBadges?.map((bb) => bb.badge) || [],
      
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Paket ürün getirilemedi" },
      { status: 500 }
    );
  }
}
