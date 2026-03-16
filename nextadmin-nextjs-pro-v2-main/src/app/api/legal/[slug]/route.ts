import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

// GET - Tek legal sayfa getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const legalPage = await prisma.legalPage.findUnique({
      where: { slug },
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

// PUT - Legal sayfa güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const legalPage = await prisma.legalPage.update({
      where: { slug },
      data: {
        title: body.title,
        content: body.content,
        isActive: body.isActive,
        showOnCheckout: body.showOnCheckout,
        requireAcceptance: body.requireAcceptance,
        sortOrder: body.sortOrder,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
    });

    return NextResponse.json(legalPage);
  } catch (error) {
    console.error("Legal page update error:", error);
    return NextResponse.json(
      { error: "Legal sayfa güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Legal sayfa sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await prisma.legalPage.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Legal page delete error:", error);
    return NextResponse.json(
      { error: "Legal sayfa silinirken hata oluştu" },
      { status: 500 }
    );
  }
}

