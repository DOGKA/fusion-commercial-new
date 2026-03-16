import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tüm rozetleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    
    const badges = await (prisma.badge as any).findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            productBadges: true,
            bundleBadges: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Toplam count'u hesapla
    const transformedBadges = badges.map((badge: any) => ({
      ...badge,
      _count: {
        productBadges: (badge._count?.productBadges || 0) + (badge._count?.bundleBadges || 0),
        products: badge._count?.productBadges || 0,
        bundles: badge._count?.bundleBadges || 0,
      }
    }));

    return NextResponse.json(transformedBadges);
  } catch (error: any) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Rozetler getirilemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Yeni rozet oluştur
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
    if (!body.label || !body.slug) {
      return NextResponse.json(
        { error: "Label ve slug zorunludur" },
        { status: 400 }
      );
    }

    // Slug benzersizliği kontrolü
    const existingBadge = await prisma.badge.findUnique({
      where: { slug: body.slug },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 409 }
      );
    }

    const badge = await prisma.badge.create({
      data: {
        label: body.label,
        slug: body.slug,
        color: body.color || "#FFFFFF",
        bgColor: body.bgColor || "#22C55E",
        icon: body.icon || null,
        priority: body.priority || 0,
        isActive: body.isActive ?? true,
        autoApply: body.autoApply ?? false,
        autoApplyRule: body.autoApplyRule || null,
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error: any) {
    console.error("Error creating badge:", error);
    return NextResponse.json(
      { error: "Rozet oluşturulamadı", details: error?.message },
      { status: 500 }
    );
  }
}
