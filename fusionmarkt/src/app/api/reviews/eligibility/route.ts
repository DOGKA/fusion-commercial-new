import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Kullanıcının bir ürüne/pakete yorum yapıp yapamayacağını kontrol eder
// Kural: Üye olmalı VE ürünü içeren teslim edilmiş (DELIVERED) bir siparişi olmalı
// Query: ?productId=... veya ?bundleId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const bundleId = searchParams.get("bundleId");

    if (!productId && !bundleId) {
      return NextResponse.json(
        { error: "productId veya bundleId zorunludur" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        canReview: false,
        reason: "NOT_LOGGED_IN",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({
        canReview: false,
        reason: "NOT_LOGGED_IN",
      });
    }

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        ...(productId ? { productId } : { bundleId }),
        order: {
          userId: user.id,
          status: "DELIVERED",
        },
      },
      select: { id: true },
    });

    if (!hasPurchased) {
      return NextResponse.json({
        canReview: false,
        reason: "NOT_PURCHASED",
      });
    }

    return NextResponse.json({
      canReview: true,
      reason: null,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Yorum uygunluğu kontrol edilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
