import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek rozet getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const badge = await prisma.badge.findUnique({
      where: { id: params.id },
      include: {
        productBadges: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
        _count: {
          select: {
            productBadges: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { error: "Rozet bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error: any) {
    console.error("Error fetching badge:", error);
    return NextResponse.json(
      { error: "Rozet getirilemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Rozet güncelle
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
    
    // Slug değişiyorsa benzersizlik kontrolü
    if (body.slug) {
      const existingBadge = await prisma.badge.findFirst({
        where: {
          slug: body.slug,
          NOT: { id: params.id },
        },
      });

      if (existingBadge) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 409 }
        );
      }
    }

    // Sadece gönderilen alanları güncelle
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.label !== undefined) updateData.label = body.label;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.bgColor !== undefined) updateData.bgColor = body.bgColor;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.autoApply !== undefined) updateData.autoApply = body.autoApply;
    if (body.autoApplyRule !== undefined) updateData.autoApplyRule = body.autoApplyRule;

    const badge = await prisma.badge.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            productBadges: true,
          },
        },
      },
    });

    return NextResponse.json(badge);
  } catch (error: any) {
    console.error("Error updating badge:", error);
    return NextResponse.json(
      { error: "Rozet güncellenemedi", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Rozet sil
export async function DELETE(
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

    // Rozeti sil (Cascade ile ProductBadge kayıtları da silinir)
    await prisma.badge.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting badge:", error);
    
    // Eğer rozet bulunamazsa
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Rozet bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Rozet silinemedi", details: error?.message },
      { status: 500 }
    );
  }
}
