/**
 * Installment Info API
 * POST /api/payment/installments
 * 
 * Kart BIN numarasına göre taksit seçeneklerini döner
 */

import { NextRequest, NextResponse } from "next/server";
import { getInstallmentInfo } from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  console.log("📊 Installments API called");
  
  try {
    const body = await request.json();
    const { binNumber, price } = body;

    // Gövde olduğu gibi loglanmıyor: bu uç herkese açık, dolayısıyla gelen
    // değerin gerçekten 6 haneye kısaltılmış olduğuna güvenilemez. İzleme için
    // gereken alanları `getInstallmentInfo` kendisi basıyor.

    // Validate BIN number (first 6 digits of card)
    if (!binNumber || binNumber.replace(/\s/g, "").length < 6) {
      return NextResponse.json(
        { error: "Geçersiz kart numarası" },
        { status: 400 }
      );
    }

    // Validate price
    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Geçersiz tutar" },
        { status: 400 }
      );
    }

    // Get installment info from iyzico
    console.log("📊 Calling getInstallmentInfo...");
    const result = await getInstallmentInfo({
      binNumber: binNumber.replace(/\s/g, ""),
      price: parseFloat(price).toFixed(2),
    });
    console.log("📊 getInstallmentInfo result:", result.status);

    if (result.status !== "success") {
      console.error("❌ Installment info error:", result.errorMessage);
      return NextResponse.json(
        { 
          error: result.errorMessage || "Taksit bilgisi alınamadı",
          code: result.errorCode 
        },
        { status: 400 }
      );
    }

    // Format response
    const installmentDetails = result.installmentDetails?.[0];
    
    if (!installmentDetails) {
      return NextResponse.json({
        cardType: "UNKNOWN",
        cardAssociation: "UNKNOWN",
        cardFamily: "UNKNOWN",
        bankName: "Bilinmiyor",
        installments: [
          { count: 1, installmentPrice: price, totalPrice: price }
        ]
      });
    }

    return NextResponse.json({
      cardType: installmentDetails.cardType || "UNKNOWN",
      cardAssociation: installmentDetails.cardAssociation || "UNKNOWN",
      cardFamily: installmentDetails.cardFamilyName || "UNKNOWN",
      bankName: installmentDetails.bankName || "Bilinmiyor",
      force3ds: installmentDetails.force3ds === 1,
      commercial: (installmentDetails as unknown as Record<string, unknown>).commercial === 1,
      installments: (installmentDetails.installmentPrices || []).map((inst) => ({
        count: inst.installmentNumber,
        installmentPrice: inst.installmentPrice,
        totalPrice: inst.totalPrice,
      })),
    });

  } catch (error) {
    console.error("❌ Installment API Error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { 
        error: "Taksit bilgisi alınırken bir hata oluştu",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

