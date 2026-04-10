import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const category = await prisma.compareCategory.findUnique({
      where: { slug },
      include: {
        specGroups: {
          orderBy: { order: "asc" },
          include: { specs: { orderBy: { order: "asc" } } },
        },
        products: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            specValues: true,
            product: {
              select: { name: true, price: true, comparePrice: true, thumbnail: true, slug: true, images: true },
            },
          },
        },
      },
    });

    if (!category || !category.isActive) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[PUBLIC COMPARE] Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
