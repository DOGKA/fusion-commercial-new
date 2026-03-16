import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * GET /api/categories
 * Returns all categories with product counts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";
    const includeFeatures = searchParams.get("includeFeatures") === "true";

    const categories = await prisma.category.findMany({
      where: includeAll ? {} : { isActive: true },
      include: {
        _count: {
      select: {
            products: true,
          },
        },
        categoryFeatures: includeFeatures ? {
          orderBy: { sortOrder: 'asc' },
          select: {
            featureId: true,
            sortOrder: true,
            isRequired: true,
            isDefault: true,
          },
        } : false,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("❌ [CATEGORIES API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, slug, description, image, icon, parentId, isActive = true, order = 0, themeColor } = body;

    if (!name) {
      return NextResponse.json({ error: "Kategori adı gerekli" }, { status: 400 });
    }

    // Slug oluştur
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/İ/g, 'i').replace(/Ş/g, 's').replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'u').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Slug uniqueness check
    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        image: image || null,
        icon: icon || null,
        parentId: parentId || null,
        themeColor: themeColor || null,
        isActive,
        order,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("❌ [CATEGORIES API] Create error:", error);
    return NextResponse.json({ error: "Kategori oluşturulamadı" }, { status: 500 });
  }
}
