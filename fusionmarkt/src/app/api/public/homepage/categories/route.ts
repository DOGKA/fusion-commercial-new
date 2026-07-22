import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyLiveShowcasePrices } from "@/server/showcase-live-prices";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.homepageCategorySection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        products: {
          orderBy: { order: "asc" },
        },
      },
    });
    // Vitrin fiyatlarını güncel ürün/bundle fiyatlarıyla değiştir
    await applyLiveShowcasePrices(items);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
