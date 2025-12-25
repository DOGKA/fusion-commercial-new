import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// DELETE - Üründen rozet kaldır
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; badgeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Rozet atamasını sil
    await prisma.productBadge.delete({
      where: {
        productId_badgeId: {
          productId: params.id,
          badgeId: params.badgeId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing badge from product:", error);
    
    // Eğer atama bulunamazsa
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Rozet ataması bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Rozet kaldırılamadı", details: error?.message },
      { status: 500 }
    );
  }
}
