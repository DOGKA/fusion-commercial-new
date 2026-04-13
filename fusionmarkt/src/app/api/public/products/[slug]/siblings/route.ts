import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const resolvedParams = await context.params;
    const slug = resolvedParams.slug;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        categoryId: true,
        createdAt: true,
      },
    });

    if (!product || !product.categoryId) {
      return NextResponse.json({ prev: null, next: null });
    }

    const [prevProduct, nextProduct] = await Promise.all([
      prisma.product.findFirst({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          createdAt: { gt: product.createdAt },
          id: { not: product.id },
        },
        orderBy: { createdAt: "asc" },
        select: { slug: true, name: true, thumbnail: true },
      }),
      prisma.product.findFirst({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          createdAt: { lt: product.createdAt },
          id: { not: product.id },
        },
        orderBy: { createdAt: "desc" },
        select: { slug: true, name: true, thumbnail: true },
      }),
    ]);

    return NextResponse.json({
      prev: prevProduct || null,
      next: nextProduct || null,
    });
  } catch (error) {
    console.error("Error fetching sibling products:", error);
    return NextResponse.json({ prev: null, next: null });
  }
}
