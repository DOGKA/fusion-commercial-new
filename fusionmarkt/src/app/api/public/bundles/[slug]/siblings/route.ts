import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

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

    const bundle = await prisma.bundle.findUnique({
      where: { slug },
      select: {
        id: true,
        createdAt: true,
        categories: {
          where: { isPrimary: true },
          select: { categoryId: true },
          take: 1,
        },
      },
    });

    if (!bundle) {
      return NextResponse.json({ prev: null, next: null });
    }

    const primaryCategoryId = bundle.categories[0]?.categoryId;
    if (!primaryCategoryId) {
      return NextResponse.json({ prev: null, next: null });
    }

    const [prevBundle, nextBundle] = await Promise.all([
      prisma.bundle.findFirst({
        where: {
          isActive: true,
          createdAt: { gt: bundle.createdAt },
          id: { not: bundle.id },
          categories: { some: { categoryId: primaryCategoryId } },
        },
        orderBy: { createdAt: "asc" },
        select: { slug: true, name: true, thumbnail: true },
      }),
      prisma.bundle.findFirst({
        where: {
          isActive: true,
          createdAt: { lt: bundle.createdAt },
          id: { not: bundle.id },
          categories: { some: { categoryId: primaryCategoryId } },
        },
        orderBy: { createdAt: "desc" },
        select: { slug: true, name: true, thumbnail: true },
      }),
    ]);

    return NextResponse.json({
      prev: prevBundle || null,
      next: nextBundle || null,
    });
  } catch (error) {
    console.error("Error fetching sibling bundles:", error);
    return NextResponse.json({ prev: null, next: null });
  }
}
