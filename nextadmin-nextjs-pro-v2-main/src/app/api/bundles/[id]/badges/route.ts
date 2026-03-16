import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Bundle'ın rozetlerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bundleBadges = await (prisma as any).bundleBadge.findMany({
      where: { bundleId: id },
      include: {
        badge: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(bundleBadges);
  } catch (error: any) {
    console.error("Error fetching bundle badges:", error);
    return NextResponse.json(
      { error: "Paket rozetleri getirilemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Bundle'a rozet ata
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Bundle var mı kontrol et
    const bundle = await prisma.bundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Paket bulunamadı" },
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
    const existingAssignment = await (prisma as any).bundleBadge.findUnique({
      where: {
        bundleId_badgeId: {
          bundleId: id,
          badgeId: body.badgeId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Bu rozet zaten pakete atanmış" },
        { status: 409 }
      );
    }

    // Position belirle (en son sıra)
    const maxPosition = await (prisma as any).bundleBadge.findFirst({
      where: { bundleId: id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const position = body.position ?? (maxPosition ? maxPosition.position + 1 : 0);

    // Rozet ata
    const bundleBadge = await (prisma as any).bundleBadge.create({
      data: {
        bundleId: id,
        badgeId: body.badgeId,
        position,
      },
      include: {
        badge: true,
      },
    });

    return NextResponse.json(bundleBadge, { status: 201 });
  } catch (error: any) {
    console.error("Error assigning badge to bundle:", error);
    return NextResponse.json(
      { error: "Rozet atanamadı", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Rozet sırasını güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        (prisma as any).bundleBadge.update({
          where: {
            bundleId_badgeId: {
              bundleId: id,
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
    const updatedBadges = await (prisma as any).bundleBadge.findMany({
      where: { bundleId: id },
      include: {
        badge: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(updatedBadges);
  } catch (error: any) {
    console.error("Error reordering bundle badges:", error);
    return NextResponse.json(
      { error: "Rozet sıralaması güncellenemedi", details: error?.message },
      { status: 500 }
    );
  }
}

