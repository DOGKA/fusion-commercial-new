import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const item = await prisma.homepageVideoBanner.findFirst({
      where: { isActive: true },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ item: null });
  }
}
