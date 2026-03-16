import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET - Tek kupon getir
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Kupon bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Kupon alınamadı" },
      { status: 500 }
    );
  }
}

// PUT - Kupon güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    } = body;

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

    // Kupon kodu değiştiyse, benzersiz mi kontrol et
    if (code && code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicateCoupon && duplicateCoupon.id !== id) {
        return NextResponse.json(
          { error: "Bu kupon kodu zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Kupon güncelle
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        description: description !== undefined ? description : undefined,
        discountType: discountType ? (discountType === "percentage" ? "PERCENTAGE" : "FIXED") : undefined,
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? (minOrderAmount ? parseFloat(minOrderAmount) : null) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? parseFloat(maxDiscount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : undefined,
        perUserLimit: perUserLimit !== undefined ? (perUserLimit ? parseInt(perUserLimit) : 1) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        // Kategori ve ürün kısıtlamaları
        allowedCategories: allowedCategories !== undefined ? allowedCategories : undefined,
        excludedCategories: excludedCategories !== undefined ? excludedCategories : undefined,
        allowedProducts: allowedProducts !== undefined ? allowedProducts : undefined,
        excludedProducts: excludedProducts !== undefined ? excludedProducts : undefined,
        excludeSaleItems: excludeSaleItems !== undefined ? excludeSaleItems : undefined,
        freeShipping: freeShipping !== undefined ? freeShipping : undefined,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Kupon güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kupon sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Kupon sil
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Kupon silinemedi" },
      { status: 500 }
    );
  }
}
