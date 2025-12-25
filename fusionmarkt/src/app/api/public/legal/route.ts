import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Aktif legal sayfaları getir (public)
export async function GET() {
  try {
    const legalPages = await prisma.legalPage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        showOnCheckout: true,
        requireAcceptance: true,
      },
    });

    return NextResponse.json(legalPages);
  } catch (error) {
    console.error("Legal pages fetch error:", error);
    return NextResponse.json(
      { error: "Legal sayfaları yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

