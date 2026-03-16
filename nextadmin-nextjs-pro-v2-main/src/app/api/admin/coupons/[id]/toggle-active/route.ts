import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// PATCH - Toggle aktif/pasif
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

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

    // Eğer kupon mystery box'ta ise aktif/pasif değiştirilemez
    if (existingCoupon.inMysteryBox) {
      return NextResponse.json(
        { error: "Kutudaki kuponların durumu değiştirilemez" },
        { status: 400 }
      );
    }

    // Kupon güncelle
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error toggling coupon active:", error);
    return NextResponse.json(
      { error: "Kupon güncellenemedi" },
      { status: 500 }
    );
  }
}
