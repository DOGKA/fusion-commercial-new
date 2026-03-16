import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * GET /api/categories/[id]
 * Get a single category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("❌ [CATEGORY API] Get error:", error);
    return NextResponse.json({ error: "Kategori getirilemedi" }, { status: 500 });
  }
}

/**
 * PUT /api/categories/[id]
 * Update a category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, slug, description, image, icon, parentId, isActive, order, themeColor } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId }),
        ...(themeColor !== undefined && { themeColor }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("❌ [CATEGORY API] Update error:", error);
    return NextResponse.json({ error: "Kategori güncellenemedi" }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category (moves products to uncategorized or deletes if empty)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    if (category._count.products > 0) {
      // Find or create "Genel" category
      let defaultCat = await prisma.category.findFirst({
        where: { slug: "genel" },
      });

      if (!defaultCat) {
        defaultCat = await prisma.category.create({
          data: {
            name: "Genel",
            slug: "genel",
            isActive: true,
            order: 999,
          },
        });
      }

      // Move products to default category
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: defaultCat.id },
      });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Kategori silindi" });
  } catch (error: any) {
    console.error("❌ [CATEGORY API] Delete error:", error);
    return NextResponse.json({ error: "Kategori silinemedi" }, { status: 500 });
  }
}
