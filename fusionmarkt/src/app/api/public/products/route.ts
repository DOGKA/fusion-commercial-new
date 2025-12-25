import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { selectProductPublic } from "@/server/dto";

/**
 * GET /api/public/products
 * Public endpoint for frontend consumption
 * Returns only active products
 * 
 * Query params:
 * - categoryId: Filter by category (optional)
 * - featured: Only featured products (optional)
 * - limit: Max results (optional)
 * - offset: Pagination offset (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured") === "true";
    const bestseller = searchParams.get("bestseller") === "true";
    const inStock = searchParams.get("inStock") === "true";
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Build where clause
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (featured) where.isFeatured = true;
    if (inStock) where.stock = { gt: 0 };

    // Variant select with nested options - cast to any to bypass TS issues with generated client
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

    // Fetch products with variants included
    const products = await (prisma.product as any).findMany({
      where,
      select: {
        ...selectProductPublic,
        variants: variantSelect,
      },
      orderBy: bestseller 
        ? [{ createdAt: 'desc' }]
        : [
        { isFeatured: 'desc' },
        { isNew: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Varyantları sırala (08, 09, 10, 11 veya S, M, L, XL)
    const sortVariants = (variants: any[]) => {
      if (!variants || variants.length === 0) return variants;
      const sizeOrder: Record<string, number> = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
      return [...variants].sort((a, b) => {
        const aVal = a.value || '';
        const bVal = b.value || '';
        if (sizeOrder[aVal] && sizeOrder[bVal]) return sizeOrder[aVal] - sizeOrder[bVal];
        const aNum = parseInt(aVal.replace(/^0+/, ''), 10);
        const bNum = parseInt(bVal.replace(/^0+/, ''), 10);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return aVal.localeCompare(bVal);
      });
    };

    const sortedProducts = products.map((p: any) => ({
      ...p,
      variants: sortVariants(p.variants),
    }));

    return NextResponse.json({
      products: sortedProducts,
      total,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error("❌ [PUBLIC API] Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
