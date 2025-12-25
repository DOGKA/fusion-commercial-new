import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek sayfa getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: {
        blocks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Sayfa yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Sayfa güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Önce mevcut blokları sil
    if (data.blocks) {
      await prisma.pageBlock.deleteMany({
        where: { pageId: params.id },
      });
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        pageType: data.pageType,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogImage: data.ogImage,
        status: data.status,
        isActive: data.isActive,
        publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
        blocks: data.blocks ? {
          create: data.blocks.map((block: any, index: number) => ({
            blockType: block.blockType || "HTML",
            name: block.name,
            content: block.content,
            settings: block.settings,
            layout: block.layout || "FULL_WIDTH",
            gridColumn: block.gridColumn,
            gridRow: block.gridRow,
            mobileLayout: block.mobileLayout,
            tabletLayout: block.tabletLayout,
            backgroundColor: block.backgroundColor,
            backgroundImage: block.backgroundImage,
            padding: block.padding,
            margin: block.margin,
            borderRadius: block.borderRadius,
            customClass: block.customClass,
            customStyle: block.customStyle,
            animation: block.animation,
            animationDelay: block.animationDelay,
            order: block.order ?? index,
            isActive: block.isActive ?? true,
          })),
        } : undefined,
      },
      include: {
        blocks: true,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Sayfa güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Sayfa sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.page.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Sayfa silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
