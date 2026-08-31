import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.homepageVideo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
