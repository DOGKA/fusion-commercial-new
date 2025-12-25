import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Kupon doğrula
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cartTotal } = body;

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { valid: false, error: "Kupon kodu giriniz" },
        { status: 400 }
      );
    }

    // Kuponu bul
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Geçersiz kupon kodu" },
        { status: 400 }
      );
    }

    // Kupon aktif mi?
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon artık geçerli değil" },
        { status: 400 }
      );
    }

    // Süre kontrolü
    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { valid: false, error: "Bu kuponun süresi dolmuş" },
        { status: 400 }
      );
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon henüz geçerli değil" },
        { status: 400 }
      );
    }

    // Kullanım limiti kontrolü
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon kullanım limitine ulaşmış" },
        { status: 400 }
      );
    }

    // Minimum tutar kontrolü
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    const total = cartTotal || 0;
    
    if (minAmount > 0 && total < minAmount) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Bu kupon minimum ${minAmount.toLocaleString("tr-TR")} ₺ alışverişlerde geçerlidir` 
        },
        { status: 400 }
      );
    }

    // İndirim hesapla
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (total * Number(coupon.discountValue)) / 100;
      // Maksimum indirim kontrolü
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      // FIXED
      discount = Number(coupon.discountValue);
    }

    // İndirim sepet tutarını geçemez
    if (discount > total) {
      discount = total;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        discount: Math.round(discount * 100) / 100, // Hesaplanan indirim
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, error: "Kupon doğrulanamadı" },
      { status: 500 }
    );
  }
}
