import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm markaları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const includeProductCount = searchParams.get("includeProductCount") === "true";

    const whereClause = includeInactive ? {} : { isActive: true };

    const brands = await (prisma as any).brand.findMany({
      where: whereClause,
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      ...(includeProductCount && {
        include: {
          _count: {
            select: {
              products: true,
              bundles: true,
            },
          },
        },
      }),
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Markalar getirilemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni marka oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validasyon
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Marka adı zorunludur" },
        { status: 400 }
      );
    }

    // Slug oluştur
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Slug benzersizlik kontrolü
    const existingBrand = await (prisma as any).brand.findFirst({
      where: {
        OR: [
          { slug },
          { name: body.name.trim() },
        ],
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Bu marka adı veya slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const brand = await (prisma as any).brand.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        website: body.website || null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Marka oluşturulamadı" },
      { status: 500 }
    );
  }
}
