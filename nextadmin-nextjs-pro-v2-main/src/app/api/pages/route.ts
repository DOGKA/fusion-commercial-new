import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm sayfaları getir
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        blocks: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { blocks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Sayfalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni sayfa oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Slug oluştur
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        pageType: data.pageType || "CUSTOM",
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords || [],
        ogImage: data.ogImage,
        status: data.status || "DRAFT",
        isActive: data.isActive ?? true,
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

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    console.error("Error creating page:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten kullanımda" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Sayfa oluşturulurken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
