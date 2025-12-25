import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Mystery box kupon açma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { fingerprint, couponId } = body;

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Fingerprint gerekli" },
        { status: 400 }
      );
    }

    if (!couponId) {
      return NextResponse.json(
        { error: "Kupon ID gerekli" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Önce mevcut claim var mı kontrol et (fingerprint veya userId ile)
    const existingClaim = await prisma.mysteryBoxClaim.findFirst({
      where: {
        expiresAt: { gt: now },
        OR: [
          { fingerprint: fingerprint },
          ...(session?.user?.id ? [{ userId: session.user.id }] : []),
        ],
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { 
          error: "24 saat içinde zaten bir kutu açtınız",
          existingClaim: {
            couponCode: existingClaim.couponCode,
            expiresAt: existingClaim.expiresAt,
          }
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Kuponu kontrol et
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        isActive: true,
        inMysteryBox: true,
      },
    });

    if (!coupon || !coupon.isActive || !coupon.inMysteryBox) {
      return NextResponse.json(
        { error: "Geçersiz kupon" },
        { status: 400 }
      );
    }

    // IP ve User Agent al
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                      request.headers.get("x-real-ip") || 
                      null;
    const userAgent = request.headers.get("user-agent") || null;

    // 24 saat sonrası için expiry hesapla
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Claim oluştur
    const claim = await prisma.mysteryBoxClaim.create({
      data: {
        userId: session?.user?.id || null,
        fingerprint: fingerprint,
        couponId: coupon.id,
        couponCode: coupon.code,
        claimedAt: now,
        expiresAt: expiresAt,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        couponCode: claim.couponCode,
        claimedAt: claim.claimedAt,
        expiresAt: claim.expiresAt,
      },
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType === "PERCENTAGE" ? "percentage" : "fixed",
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      },
    });
  } catch (error) {
    console.error("Error claiming mystery box:", error);
    return NextResponse.json(
      { error: "Kutu açılamadı" },
      { status: 500 }
    );
  }
}
