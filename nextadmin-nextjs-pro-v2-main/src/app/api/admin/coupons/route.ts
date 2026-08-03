import { NextResponse } from "next/server";
import { prisma, countCouponUsageMany } from "@repo/db";

// GET - Tüm kuponları getir
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    // `usageCount` kolonu ARTIK YAZILMIYOR (bkz. @repo/db coupon-usage.ts):
    // başarısız ödemelerde geri alınmadığı için yanlış sayıyordu. Gerçek sayı
    // siparişlerden hesaplanıp yanıtta kolonun üzerine yazılıyor; böylece admin
    // ekranları müşteriye uygulanan limitle aynı sayıyı gösteriyor.
    const usageByCoupon = await countCouponUsageMany(
      prisma,
      coupons.map((c) => c.id)
    );

    return NextResponse.json(
      coupons.map((c) => ({ ...c, usageCount: usageByCoupon.get(c.id) ?? 0 }))
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Kuponlar alınamadı" },
      { status: 500 }
    );
  }
}

// POST - Yeni kupon oluştur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
      // Yeni alanlar
      allowedCategories,
      excludedCategories,
      allowedProducts,
      excludedProducts,
      excludeSaleItems,
      freeShipping,
      showInMyCoupons,
    } = body;

    // Validasyon
    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "Kupon kodu zorunludur" },
        { status: 400 }
      );
    }

    if (!discountValue || discountValue <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir indirim miktarı giriniz" },
        { status: 400 }
      );
    }

    // Kupon kodu benzersiz mi kontrol et
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Bu kupon kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Kupon oluştur
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType: discountType === "percentage" ? "PERCENTAGE" : "FIXED",
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        // Kategori ve ürün kısıtlamaları
        allowedCategories: allowedCategories || [],
        excludedCategories: excludedCategories || [],
        allowedProducts: allowedProducts || [],
        excludedProducts: excludedProducts || [],
        excludeSaleItems: excludeSaleItems || false,
        freeShipping: freeShipping || false,
        // Varsayılan false: kupon açıkça işaretlenmedikçe kodu müşterilerin
        // "Kuponlarım" sayfasında duyurulmaz (kupon yine geçerlidir).
        showInMyCoupons: showInMyCoupons || false,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Kupon oluşturulamadı" },
      { status: 500 }
    );
  }
}
