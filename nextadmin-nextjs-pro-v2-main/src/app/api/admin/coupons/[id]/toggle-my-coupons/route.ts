import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * PATCH - Kupon kodunu müşterilerin "Kuponlarım" sayfasında duyur / duyurmayı bırak.
 *
 * Bu bayrak kuponun KİMİN KULLANABİLECEĞİNİ değiştirmiyor: kapalıyken de kupon
 * geçerli, onu kodu bilenler kullanıyor. Tek işi kodu tüm üyelere göstermek.
 *
 * `isActive` bilinçli olarak ellenmiyor: "duyur" ile "aktif" ayrı kararlar,
 * pasif bir kuponu duyurmak onu yayına almamalı (listeleme ucu `isActive` de
 * arıyor).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { showInMyCoupons } = body;

    if (typeof showInMyCoupons !== "boolean") {
      return NextResponse.json(
        { error: "showInMyCoupons alanı true/false olmalıdır" },
        { status: 400 }
      );
    }

    const existingCoupon = await prisma.coupon.findUnique({ where: { id } });

    if (!existingCoupon) {
      return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { showInMyCoupons },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error toggling coupon listing:", error);
    return NextResponse.json(
      { error: "Kupon güncellenemedi" },
      { status: 500 }
    );
  }
}
