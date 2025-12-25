import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Kullanıcının mystery box durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const fingerprint = request.headers.get("x-fingerprint") || "";
    
    if (!fingerprint) {
      return NextResponse.json(
        { error: "Fingerprint gerekli" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Aktif claim'i bul - ya fingerprint ile ya userId ile
    // (Aynı cihazdan login olsa bile engelle)
    const existingClaim = await prisma.mysteryBoxClaim.findFirst({
      where: {
        expiresAt: { gt: now }, // Henüz süresi dolmamış
        OR: [
          { fingerprint: fingerprint },
          ...(session?.user?.id ? [{ userId: session.user.id }] : []),
        ],
      },
      orderBy: { claimedAt: "desc" },
    });

    if (existingClaim) {
      // Kutu zaten açılmış, kupon bilgilerini döndür
      const coupon = await prisma.coupon.findUnique({
        where: { id: existingClaim.couponId },
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
          minOrderAmount: true,
          endDate: true,
        },
      });

      return NextResponse.json({
        canOpen: false,
        hasClaim: true,
        claim: {
          couponCode: existingClaim.couponCode,
          claimedAt: existingClaim.claimedAt,
          expiresAt: existingClaim.expiresAt,
          timeRemaining: Math.max(0, existingClaim.expiresAt.getTime() - now.getTime()),
        },
        coupon: coupon ? {
          code: coupon.code,
          discountType: coupon.discountType === "PERCENTAGE" ? "percentage" : "fixed",
          discountValue: Number(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        } : null,
      });
    }

    // Kutu açılmamış, açabilir
    return NextResponse.json({
      canOpen: true,
      hasClaim: false,
      claim: null,
      coupon: null,
    });
  } catch (error) {
    console.error("Error checking mystery box status:", error);
    return NextResponse.json(
      { error: "Durum kontrol edilemedi" },
      { status: 500 }
    );
  }
}
