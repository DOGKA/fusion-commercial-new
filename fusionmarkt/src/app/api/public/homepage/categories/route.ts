import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
