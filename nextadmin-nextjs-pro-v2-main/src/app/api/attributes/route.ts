import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm attributes'ları getir
export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      include: {
        values: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { productAttributes: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { error: "Özellikler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni attribute oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Slug oluştur
    const slug = data.slug || data.name
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

    const attribute = await prisma.attribute.create({
      data: {
        name: data.name,
        slug,
        type: data.type || "SELECT",
        displayType: data.displayType || "DROPDOWN",
        showInFilters: data.showInFilters ?? true,
        showInProductPage: data.showInProductPage ?? true,
        order: data.order || 0,
        isActive: data.isActive ?? true,
        values: data.values ? {
          create: data.values.map((val: any, index: number) => ({
            name: val.name,
            slug: val.slug || val.name
              .toLowerCase()
              .replace(/ğ/g, "g")
              .replace(/ü/g, "u")
              .replace(/ş/g, "s")
              .replace(/ı/g, "i")
              .replace(/ö/g, "o")
              .replace(/ç/g, "c")
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, ""),
            value: val.value,
            color: val.color,
            image: val.image,
            order: val.order ?? index,
            isActive: val.isActive ?? true,
          })),
        } : undefined,
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json(attribute, { status: 201 });
  } catch (error: any) {
    console.error("Error creating attribute:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu isim veya slug zaten kullanımda" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Özellik oluşturulurken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
