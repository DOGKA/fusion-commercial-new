import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

// GET - Ürün istatistikleri
export async function GET() {
  try {
    const [totalProducts, activeProducts, outOfStock, lowStock, featuredCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      prisma.product.count({ where: { isFeatured: true } }),
    ]);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      featuredCount,
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return NextResponse.json(
      { error: "İstatistikler getirilemedi" },
      { status: 500 }
    );
  }
}
