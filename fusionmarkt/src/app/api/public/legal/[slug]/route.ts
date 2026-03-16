import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Tek legal sayfa getir (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const legalPage = await prisma.legalPage.findFirst({
      where: { 
        slug,
        isActive: true 
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        showOnCheckout: true,
        requireAcceptance: true,
        updatedAt: true,
      },
    });

    if (!legalPage) {
      return NextResponse.json(
        { error: "Legal sayfa bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(legalPage);
  } catch (error) {
    console.error("Legal page fetch error:", error);
    return NextResponse.json(
      { error: "Legal sayfa yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

