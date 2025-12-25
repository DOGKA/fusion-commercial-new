import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Mystery box kuponlarını getir (maksimum 4)
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        inMysteryBox: true,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        endDate: true,
        usageLimit: true,
        usageCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4, // Maksimum 4 kupon
    });

    // Kuponları frontend formatına dönüştür
    const formattedCoupons = coupons.map((coupon, index) => {
      // Conditions oluştur - sadece min tutar ve açıklama
      const conditions: { type: string; value: string; label: string }[] = [];
      
      // Minimum tutar varsa ekle
      if (coupon.minOrderAmount && Number(coupon.minOrderAmount) > 0) {
        conditions.push({
          type: "min_cart",
          value: String(coupon.minOrderAmount),
          label: `Min. ${Number(coupon.minOrderAmount).toLocaleString("tr-TR")} ₺ alışveriş`
        });
      }
      
      // Description varsa ve kısıtlama içeriyorsa ekle (min tutar hariç)
      if (coupon.description && coupon.description.trim()) {
        // Sadece açıklama varsa ve min tutar bilgisi içermiyorsa göster
        const desc = coupon.description.toLowerCase();
        if (!desc.includes("minimum") && !desc.includes("min.") && !desc.includes("₺")) {
          conditions.push({
            type: "description",
            value: coupon.description,
            label: coupon.description
          });
        }
      }

      return {
        id: coupon.id,
        name: coupon.discountType === "PERCENTAGE" 
          ? `%${Number(coupon.discountValue)} İndirim`
          : `${Number(coupon.discountValue).toLocaleString("tr-TR")} ₺ İndirim`,
        title: coupon.description || "Özel Kampanya",
        description: coupon.minOrderAmount 
          ? `Minimum ${Number(coupon.minOrderAmount).toLocaleString("tr-TR")} ₺ sepet tutarında geçerlidir.`
          : "Tüm siparişlerde geçerlidir.",
        discountType: coupon.discountType === "PERCENTAGE" ? "percentage" : "fixed",
        discountValue: Number(coupon.discountValue),
        badges: [
          { text: index === 0 ? "Sınırlı" : index === 1 ? "Premium" : index === 2 ? "Özel" : "Fırsat", variant: index === 0 ? "danger" : index === 1 ? "secondary" : index === 2 ? "success" : "primary" as const }
        ],
        expiresAt: coupon.endDate ? new Date(coupon.endDate).toISOString() : null,
        conditions,
        code: coupon.code,
        isClaimed: false,
      };
    });

    return NextResponse.json(formattedCoupons);
  } catch (error) {
    console.error("Error fetching mystery box coupons:", error);
    return NextResponse.json([], { status: 200 }); // Hata durumunda boş dizi dön
  }
}
