import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";

// Bundle listesi için Prisma include tipi
const bundleListInclude = {
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
    where: {
      isPrimary: true,
    },
    take: 1,
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
          stock: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
} satisfies Prisma.BundleInclude;

// GET - Public bundle listesi (frontend için)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");

    const whereClause: Prisma.BundleWhereInput = {
      isActive: true,
    };

    if (categoryId) {
      whereClause.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    } else if (categorySlug) {
      whereClause.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    const bundles = await prisma.bundle.findMany({
      where: whereClause,
      include: bundleListInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Bundle'ları frontend formatına dönüştür
    const transformedBundles = bundles.map((bundle) => {
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

      // Ana kategori
      const primaryCategory = bundle.categories[0]?.category || null;
      
      const bundlePrice = Number(bundle.price);

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
        // Bundle items - paket içeriği için
        items: bundle.items.map((item) => ({
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
        // ProductCardView uyumluluğu için
        isBundle: true,
        category: primaryCategory,
        // Kazanç hesaplama
        savings: totalValue - bundlePrice,
        savingsPercent: totalValue > 0 
          ? Math.round(((totalValue - bundlePrice) / totalValue) * 100) 
          : 0,
      };
    });

    return NextResponse.json({ bundles: transformedBundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { error: "Paket ürünler getirilemedi" },
      { status: 500 }
    );
  }
}
