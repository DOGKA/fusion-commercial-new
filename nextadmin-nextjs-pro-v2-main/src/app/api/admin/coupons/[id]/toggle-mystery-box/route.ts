import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const MAX_MYSTERY_BOX_COUPONS = 4;

// PATCH - Toggle mystery box
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { inMysteryBox } = body;

    // Kupon var mı kontrol et
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Kupon bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer kutuya eklemek istiyorsa, mevcut kutu sayısını kontrol et
    if (inMysteryBox) {
      const currentMysteryBoxCount = await prisma.coupon.count({
        where: { inMysteryBox: true },
      });

      if (currentMysteryBoxCount >= MAX_MYSTERY_BOX_COUPONS) {
        return NextResponse.json(
          { error: `Kutuya en fazla ${MAX_MYSTERY_BOX_COUPONS} kupon gönderilebilir` },
          { status: 400 }
        );
      }
    }

    // Kupon güncelle
    // Kutuya gönderiliyorsa: inMysteryBox = true, isActive = true
    // Kutudan çıkarılıyorsa: inMysteryBox = false, isActive = false
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        inMysteryBox,
        isActive: inMysteryBox ? true : false,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error toggling mystery box:", error);
    return NextResponse.json(
      { error: "Kupon güncellenemedi" },
      { status: 500 }
    );
  }
}
