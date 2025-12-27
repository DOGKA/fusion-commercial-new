/**
 * iyzico 3D Secure Callback
 * 
 * POST /api/payment/callback
 * 
 * Bu endpoint:
 * 1. iyzico 3D doğrulama sonrası çağrılır
 * 2. Ödemeyi tamamlar
 * 3. Siparişi oluşturur/günceller
 * 4. Kullanıcıyı sonuç sayfasına yönlendirir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { threedsPayment } from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  try {
    // iyzico form-urlencoded data gönderir
    const formData = await request.formData();
    
    const status = formData.get("status") as string;
    const paymentId = formData.get("paymentId") as string;
    const conversationId = formData.get("conversationId") as string;
    const conversationData = formData.get("conversationData") as string;
    const mdStatus = formData.get("mdStatus") as string;

    console.log("🔔 iyzico Callback:", {
      status,
      paymentId,
      conversationId,
      mdStatus,
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";

    // 3D doğrulama başarısız
    if (status !== "success" || !paymentId) {
      console.error("❌ 3D Verification Failed:", { status, mdStatus });
      
      // Hata mesajını belirle
      let errorMessage = "3D doğrulama başarısız";
      if (mdStatus === "0") {
        errorMessage = "3D Secure doğrulaması yapılamadı";
      } else if (mdStatus === "2") {
        errorMessage = "Kart sahibi veya bankası sisteme kayıtlı değil";
      } else if (mdStatus === "3") {
        errorMessage = "Kartın bankası sisteme kayıtlı değil";
      } else if (mdStatus === "4") {
        errorMessage = "Doğrulama denemesi, kart sahibi sisteme daha sonra kaydolmayı seçmiş";
      } else if (mdStatus === "5") {
        errorMessage = "Doğrulama yapılamıyor";
      } else if (mdStatus === "6") {
        errorMessage = "3D Secure hatası";
      } else if (mdStatus === "7") {
        errorMessage = "Sistem hatası";
      } else if (mdStatus === "8") {
        errorMessage = "Bilinmeyen kart no";
      }

      // Başarısız sayfasına yönlendir
      return NextResponse.redirect(
        `${baseUrl}/checkout/result?status=failed&error=${encodeURIComponent(errorMessage)}&orderNumber=${conversationId}`,
        { status: 303 }
      );
    }

    // 3D doğrulama başarılı - Ödemeyi tamamla
    const paymentResult = await threedsPayment({
      locale: "tr",
      conversationId,
      paymentId,
      conversationData,
    });

    if (paymentResult.status === "success") {
      console.log("✅ Payment Successful:", {
        paymentId: paymentResult.paymentId,
        price: paymentResult.price,
        paidPrice: paymentResult.paidPrice,
      });

      // Siparişi güncelle - ödeme başarılı
      try {
        // iyzico item transactions'ı kaydet (iade için gerekli)
        const iyzicoPaymentTransactions = paymentResult.itemTransactions?.map(item => ({
          itemId: item.itemId,
          paymentTransactionId: item.paymentTransactionId,
          price: item.price,
          paidPrice: item.paidPrice,
        })) || [];

        await prisma.order.update({
          where: { orderNumber: conversationId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
            paidAt: new Date(),
            // iyzico bilgilerini kaydet
            iyzicoPaymentId: paymentResult.paymentId,
            iyzicoConversationId: conversationId,
            iyzicoPaymentTransactions: iyzicoPaymentTransactions,
            statusHistory: {
              push: {
                status: "PROCESSING",
                date: new Date().toISOString(),
                note: `Ödeme onaylandı. iyzico Payment ID: ${paymentResult.paymentId}`,
              },
            },
          },
        });
        console.log("✅ Order updated:", conversationId);
      } catch (orderError) {
        console.error("⚠️ Order update failed (may not exist yet):", orderError);
        // Sipariş henüz oluşturulmamış olabilir - sorun değil
      }

      // Başarılı sayfasına yönlendir
      return NextResponse.redirect(
        `${baseUrl}/order-confirmation?orderNumber=${conversationId}&paymentId=${paymentResult.paymentId}`,
        { status: 303 }
      );
    } else {
      console.error("❌ Payment Failed:", paymentResult);

      // Hata mesajını Türkçeleştir
      let errorMessage = paymentResult.errorMessage || "Ödeme işlemi başarısız";
      
      if (paymentResult.errorCode === "10051") {
        errorMessage = "Yetersiz bakiye";
      } else if (paymentResult.errorCode === "10005") {
        errorMessage = "İşlem onaylanmadı";
      } else if (paymentResult.errorCode === "10012") {
        errorMessage = "Geçersiz işlem";
      } else if (paymentResult.errorCode === "10041") {
        errorMessage = "Kayıp kart";
      } else if (paymentResult.errorCode === "10043") {
        errorMessage = "Çalıntı kart";
      } else if (paymentResult.errorCode === "10054") {
        errorMessage = "Kartın süresi dolmuş";
      } else if (paymentResult.errorCode === "10057") {
        errorMessage = "Kart sahibi bu işlemi yapamaz";
      } else if (paymentResult.errorCode === "10058") {
        errorMessage = "Terminal bu işlemi yapamaz";
      } else if (paymentResult.errorCode === "10034") {
        errorMessage = "Dolandırıcılık şüphesi";
      }

      // Siparişi güncelle - ödeme başarısız
      try {
        await prisma.order.update({
          where: { orderNumber: conversationId },
          data: {
            paymentStatus: "FAILED",
            statusHistory: {
              push: {
                status: "PAYMENT_FAILED",
                date: new Date().toISOString(),
                note: `Ödeme başarısız: ${errorMessage}`,
              },
            },
          },
        });
      } catch (orderError) {
        console.error("⚠️ Order update failed:", orderError);
      }

      // Başarısız sayfasına yönlendir
      return NextResponse.redirect(
        `${baseUrl}/checkout/result?status=failed&error=${encodeURIComponent(errorMessage)}&orderNumber=${conversationId}`,
        { status: 303 }
      );
    }

  } catch (error) {
    console.error("❌ Callback Error:", error);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";
    return NextResponse.redirect(
      `${baseUrl}/checkout/result?status=failed&error=${encodeURIComponent("Beklenmeyen bir hata oluştu")}`,
      { status: 303 }
    );
  }
}

// iyzico GET request da yapabilir
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";
  return NextResponse.redirect(`${baseUrl}/checkout`, { status: 303 });
}

