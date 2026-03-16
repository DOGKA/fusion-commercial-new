import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { selectCategoryPublic } from "@/server/dto";

/**
 * GET /api/public/categories
 * Public endpoint for frontend consumption
 * Returns only active categories with product counts
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: selectCategoryPublic,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    // Add product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        productCount: await prisma.product.count({
          where: { 
            categoryId: cat.id,
            isActive: true 
          },
        }),
      }))
    );

    return NextResponse.json(categoriesWithCounts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("❌ [PUBLIC API] Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
