import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Ürünün rozetlerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productBadges = await prisma.productBadge.findMany({
      where: { productId: params.id },
      include: {
        badge: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(productBadges);
  } catch (error: any) {
    console.error("Error fetching product badges:", error);
    return NextResponse.json(
      { error: "Ürün rozetleri getirilemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Ürüne rozet ata
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!body.badgeId) {
      return NextResponse.json(
        { error: "badgeId zorunludur" },
        { status: 400 }
      );
    }

    // Ürün var mı kontrol et
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    // Rozet var mı kontrol et
    const badge = await prisma.badge.findUnique({
      where: { id: body.badgeId },
    });

    if (!badge) {
      return NextResponse.json(
        { error: "Rozet bulunamadı" },
        { status: 404 }
      );
    }

    // Zaten atanmış mı kontrol et
    const existingAssignment = await prisma.productBadge.findUnique({
      where: {
        productId_badgeId: {
          productId: params.id,
          badgeId: body.badgeId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Bu rozet zaten ürüne atanmış" },
        { status: 409 }
      );
    }

    // Position belirle (en son sıra)
    const maxPosition = await prisma.productBadge.findFirst({
      where: { productId: params.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const position = body.position ?? (maxPosition ? maxPosition.position + 1 : 0);

    // Rozet ata
    const productBadge = await prisma.productBadge.create({
      data: {
        productId: params.id,
        badgeId: body.badgeId,
        position,
      },
      include: {
        badge: true,
      },
    });

    return NextResponse.json(productBadge, { status: 201 });
  } catch (error: any) {
    console.error("Error assigning badge to product:", error);
    return NextResponse.json(
      { error: "Rozet atanamadı", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Rozet sırasını güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // badges array bekleniyor: [{ badgeId, position }, ...]
    if (!Array.isArray(body.badges)) {
      return NextResponse.json(
        { error: "badges array zorunludur" },
        { status: 400 }
      );
    }

    // Transaction ile tüm pozisyonları güncelle
    await prisma.$transaction(
      body.badges.map((item: { badgeId: string; position: number }) =>
        prisma.productBadge.update({
          where: {
            productId_badgeId: {
              productId: params.id,
              badgeId: item.badgeId,
            },
          },
          data: {
            position: item.position,
          },
        })
      )
    );

    // Güncellenmiş listeyi getir
    const updatedBadges = await prisma.productBadge.findMany({
      where: { productId: params.id },
      include: {
        badge: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(updatedBadges);
  } catch (error: any) {
    console.error("Error reordering badges:", error);
    return NextResponse.json(
      { error: "Rozet sıralaması güncellenemedi", details: error?.message },
      { status: 500 }
    );
  }
}
