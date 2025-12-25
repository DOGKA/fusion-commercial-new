import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

// GET - Tüm legal sayfaları getir
export async function GET() {
  try {
    const legalPages = await prisma.legalPage.findMany({
      orderBy: { sortOrder: "asc" },
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

// POST - Yeni legal sayfa oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const legalPage = await prisma.legalPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content,
        isActive: body.isActive ?? true,
        showOnCheckout: body.showOnCheckout ?? false,
        requireAcceptance: body.requireAcceptance ?? false,
        sortOrder: body.sortOrder ?? 0,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
    });

    return NextResponse.json(legalPage, { status: 201 });
  } catch (error) {
    console.error("Legal page create error:", error);
    return NextResponse.json(
      { error: "Legal sayfa oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

