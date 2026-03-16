/**
 * iyzico 3D Secure Payment Initialize
 * 
 * POST /api/payment/initialize
 * 
 * Bu endpoint:
 * 1. Kart bilgilerini alır
 * 2. 3D Secure başlatır
 * 3. HTML form içeriği döner (iyzico 3D sayfası için)
 */

import { NextRequest, NextResponse } from "next/server";
import { threedsInitialize, formatIyzicoPrice, IYZICO_ENABLED } from "@/lib/iyzico";
import { prisma } from "@/lib/prisma";
import type { ThreeDSInitializeRequest, BasketItem } from "@/lib/iyzico";

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `FM-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // iyzico aktif mi kontrol et
    if (!IYZICO_ENABLED) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      // Sipariş bilgileri
      orderNumber,
      orderData,
      userId,
      // Kart bilgileri
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      // Müşteri bilgileri
      buyer,
      // Adres bilgileri
      shippingAddress,
      billingAddress,
      // Sepet
      basketItems,
      // Fiyat
      price,
      paidPrice,
      // Taksit
      installment = 1,
    } = body;

    // Validation
    if (!cardNumber || !cvc || !buyer || !basketItems) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!orderNumber && !orderData) {
      return NextResponse.json(
        { error: "Missing order reference" },
        { status: 400 }
      );
    }

    const finalOrderNumber = orderNumber || generateOrderNumber();

    if (orderData) {
      await prisma.paymentDraft.upsert({
        where: { order_number: finalOrderNumber },
        update: {
          payload: orderData,
          user_id: userId || null,
          payment_method: "CREDIT_CARD",
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
        create: {
          order_number: finalOrderNumber,
          payload: orderData,
          user_id: userId || null,
          payment_method: "CREDIT_CARD",
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });
    }

    // IP adresi al
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    // Callback URL (3D doğrulama sonrası dönüş)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";
    const callbackUrl = `${baseUrl}/api/payment/callback`;

    // Basket items formatla
    const formattedBasketItems: BasketItem[] = basketItems.map((item: {
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }) => ({
      id: item.id,
      name: item.name.substring(0, 50), // Max 50 karakter
      category1: item.category || "Genel",
      category2: item.category || "Genel",
      itemType: "PHYSICAL" as const,
      price: formatIyzicoPrice(item.price * item.quantity),
    }));

    // 3D Secure başlat
    const iyzicoRequest: ThreeDSInitializeRequest = {
      locale: "tr",
      conversationId: finalOrderNumber,
      price: formatIyzicoPrice(price),
      paidPrice: formatIyzicoPrice(paidPrice || price),
      currency: "TRY",
      installment: String(installment || 1), // Taksit sayısı
      basketId: finalOrderNumber,
      paymentChannel: "WEB",
      paymentGroup: "PRODUCT",
      callbackUrl,
      paymentCard: {
        cardHolderName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expireMonth: expireMonth.padStart(2, "0"),
        expireYear: expireYear.length === 2 ? `20${expireYear}` : expireYear,
        cvc,
        registerCard: "0",
      },
      buyer: {
        id: buyer.id || `GUEST-${Date.now()}`,
        name: buyer.name,
        surname: buyer.surname,
        gsmNumber: buyer.phone?.replace(/\s/g, "") || "+905000000000",
        email: buyer.email,
        identityNumber: buyer.identityNumber || "11111111111", // TC Kimlik
        registrationAddress: shippingAddress.address,
        ip,
        city: shippingAddress.city,
        country: "Turkey",
        zipCode: shippingAddress.zipCode || "00000",
      },
      shippingAddress: {
        contactName: shippingAddress.contactName || buyer.name + " " + buyer.surname,
        city: shippingAddress.city,
        country: "Turkey",
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode || "00000",
      },
      billingAddress: {
        contactName: billingAddress?.contactName || shippingAddress.contactName || buyer.name + " " + buyer.surname,
        city: billingAddress?.city || shippingAddress.city,
        country: "Turkey",
        address: billingAddress?.address || shippingAddress.address,
        zipCode: billingAddress?.zipCode || shippingAddress.zipCode || "00000",
      },
      basketItems: formattedBasketItems,
    };

    const result = await threedsInitialize(iyzicoRequest);

    if (result.status === "success" && result.threeDSHtmlContent) {
      // Base64 decode HTML content
      const htmlContent = Buffer.from(result.threeDSHtmlContent, "base64").toString("utf-8");
      
      return NextResponse.json({
        success: true,
        htmlContent,
        conversationId: result.conversationId,
        orderNumber: finalOrderNumber,
      });
    } else {
      console.error("❌ iyzico 3DS Initialize Failed:", result);
      
      // Hata mesajını Türkçeleştir
      let errorMessage = result.errorMessage || "Ödeme başlatılamadı";
      
      if (result.errorCode === "12") {
        errorMessage = "Kart numarası geçersiz";
      } else if (result.errorCode === "15") {
        errorMessage = "CVC kodu geçersiz";
      } else if (result.errorCode === "10051") {
        errorMessage = "Yetersiz bakiye";
      } else if (result.errorCode === "10005") {
        errorMessage = "İşlem onaylanmadı";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ Payment Initialize Error:", error);
    return NextResponse.json(
      { error: "Ödeme başlatılırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

