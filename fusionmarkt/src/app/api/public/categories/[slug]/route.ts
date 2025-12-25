import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/categories/[slug]
 * Kategori detayı ve ürünlerini getirir
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

    // Sıralama
    let orderBy: any = { createdAt: "desc" }; // newest
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
    const products = await prisma.product.findMany({
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
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(totalProducts / limit);

    // themeColor yeni eklenen alan - runtime'da mevcut
    const categoryWithTheme = category as typeof category & { themeColor?: string | null };
    
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
