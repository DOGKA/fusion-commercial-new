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
import { 
  sendOrderConfirmationEmail, 
  sendAdminNewOrderNotification 
} from "@/lib/email";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { generateContractsHTML } from "@/lib/contracts";
import { isValidEmail } from "@/lib/utils";

type AddressSnapshot = {
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
};

function buildAddressSnapshot(
  billingAddress: DraftPayload["billingAddress"],
  shippingAddress?: DraftPayload["shippingAddress"],
) {
  const billingSnapshot: AddressSnapshot = {
    fullName: `${billingAddress.firstName || ""} ${billingAddress.lastName || ""}`.trim(),
    firstName: billingAddress.firstName,
    lastName: billingAddress.lastName,
    phone: billingAddress.phone,
    city: billingAddress.city,
    district: billingAddress.district,
    postalCode: billingAddress.postalCode,
    addressLine1: billingAddress.addressLine1,
    addressLine2: billingAddress.addressLine2,
    address: billingAddress.addressLine1,
  };

  const shipAddr = shippingAddress || billingAddress;
  const shippingSnapshot: AddressSnapshot = {
    fullName: `${shipAddr.firstName || ""} ${shipAddr.lastName || ""}`.trim(),
    firstName: shipAddr.firstName,
    lastName: shipAddr.lastName,
    phone: shipAddr.phone,
    city: shipAddr.city,
    district: shipAddr.district,
    postalCode: shipAddr.postalCode,
    addressLine1: shipAddr.addressLine1,
    addressLine2: shipAddr.addressLine2,
    address: shipAddr.addressLine1,
  };

  return {
    billingAddress: billingSnapshot,
    shippingAddress: shippingSnapshot,
    shippingSameAsBilling: !shippingAddress,
  };
}

type DraftPayload = {
  items: Array<{
    productId: string;
    variant?: { id?: string; value?: string };
    quantity: number;
    price: number;
    name?: string;
    title?: string;
    isBundle?: boolean;
    bundleId?: string;
    bundleItemVariants?: Record<string, { variantId: string; variantName: string; variantValue: string; productName: string }>;
  }>;
  billingAddress: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    saveToAddresses?: boolean;
    title?: string;
    country?: string;
    tcKimlikNo?: string;
    orderNotes?: string;
  };
  shippingAddress?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    saveToAddresses?: boolean;
    country?: string;
  };
  paymentMethod: "credit_card";
  couponCode?: string;
  couponId?: string;
  totals?: {
    subtotal?: number;
    shipping?: number;
    discount?: number;
    grandTotal?: number;
    taxIncluded?: number;
  };
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  total?: number;
  contracts?: {
    termsAndConditions?: boolean;
    distanceSalesContract?: boolean;
    newsletter?: boolean;
  };
  newsletter?: boolean;
};

async function createOrderFromDraft(
  orderNumber: string,
  draft: DraftPayload,
  userId: string | null,
  paymentResult: { paymentId?: string; itemTransactions?: Array<{ itemId: string; paymentTransactionId: string; price: number; paidPrice: number }> }
) {
  const {
    items,
    billingAddress,
    shippingAddress,
    couponCode,
    couponId: directCouponId,
    totals,
    subtotal: directSubtotal,
    shippingCost: directShippingCost,
    discount: directDiscount,
    total: directTotal,
    contracts,
    newsletter,
  } = draft;

  if (!items || items.length === 0) {
    throw new Error("Sepet boş");
  }
  if (!billingAddress || !billingAddress.firstName || !billingAddress.email) {
    throw new Error("Fatura adresi eksik");
  }
  if (!isValidEmail(billingAddress.email)) {
    throw new Error("Geçerli bir e-posta adresi girin");
  }
  
  // Sözleşme Onayı Kontrolü (ZORUNLU)
  if (!contracts?.termsAndConditions || !contracts?.distanceSalesContract) {
    throw new Error("Sipariş oluşturabilmek için Kullanıcı Sözleşmesi ve Mesafeli Satış Sözleşmesi'ni onaylamanız gerekmektedir.");
  }

  const orderSubtotal = totals?.subtotal ?? directSubtotal ?? 0;
  const orderShipping = totals?.shipping ?? directShippingCost ?? 0;
  const orderDiscount = totals?.discount ?? directDiscount ?? 0;
  const orderTotal = totals?.grandTotal ?? directTotal ?? (orderSubtotal + orderShipping - orderDiscount);

  let finalUserId = userId;
  if (!finalUserId) {
    const existingUser = await prisma.user.findUnique({
      where: { email: billingAddress.email.toLowerCase().trim() },
      select: { id: true, name: true },
    });
    if (existingUser) {
      finalUserId = existingUser.id;
    } else {
      const tempPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      const newUser = await prisma.user.create({
        data: {
          email: billingAddress.email.toLowerCase().trim(),
          name: `${billingAddress.firstName} ${billingAddress.lastName}`.trim(),
          password: hashedPassword,
          phone: billingAddress.phone || null,
          role: "CUSTOMER",
        },
      });
      finalUserId = newUser.id;
    }
  }

  // Handle billing address
  let billingAddressId: string;
  if (billingAddress.id) {
    billingAddressId = billingAddress.id;
  } else if (billingAddress.saveToAddresses && finalUserId) {
    const createdBillingAddress = await prisma.address.create({
      data: {
        userId: finalUserId,
        title: billingAddress.title || "Sipariş Adresi",
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        phone: billingAddress.phone || "",
        city: billingAddress.city || "",
        district: billingAddress.district || "",
        postalCode: billingAddress.postalCode || "",
        addressLine1: billingAddress.addressLine1 || "",
        address: billingAddress.addressLine1 || "",
        country: billingAddress.country || "Türkiye",
        type: "BILLING",
        isDefault: false,
      },
    });
    billingAddressId = createdBillingAddress.id;
  } else {
    billingAddressId = "temp";
  }

  // Handle shipping address
  let shippingAddressId = billingAddressId;
  if (shippingAddress && shippingAddress.id) {
    shippingAddressId = shippingAddress.id;
  } else if (shippingAddress && shippingAddress.firstName && shippingAddress.saveToAddresses && finalUserId) {
    const createdShippingAddress = await prisma.address.create({
      data: {
        userId: finalUserId,
        title: "Teslimat Adresi",
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName || "",
        phone: shippingAddress.phone || "",
        city: shippingAddress.city || "",
        district: shippingAddress.district || "",
        postalCode: shippingAddress.postalCode || "",
        addressLine1: shippingAddress.addressLine1 || "",
        address: shippingAddress.addressLine1 || "",
        country: shippingAddress.country || "Türkiye",
        type: "SHIPPING",
        isDefault: false,
      },
    });
    shippingAddressId = createdShippingAddress.id;
  }

  // Find coupon if provided
  let couponId = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon) {
      couponId = coupon.id;
    }
  }

  // Generate contract HTML with user's data
  const contractDate = new Date();
  const buyerInfo = {
    fullName: `${billingAddress.firstName} ${billingAddress.lastName}`.trim(),
    tcKimlikNo: billingAddress.tcKimlikNo,
    address: `${billingAddress.addressLine1 || ""}${billingAddress.addressLine2 ? ", " + billingAddress.addressLine2 : ""}, ${billingAddress.district || ""}, ${billingAddress.city || ""}`,
    phone: billingAddress.phone || "",
    email: billingAddress.email,
  };

  const productIds = items.filter((item) => !item.isBundle).map((item) => item.productId);
  const bundleIds = items.filter((item) => item.isBundle && item.bundleId).map((item) => item.bundleId!);
  
  const [products, bundles] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    }),
    bundleIds.length > 0 ? prisma.bundle.findMany({
      where: { id: { in: bundleIds } },
      select: { id: true, name: true },
    }) : Promise.resolve([]),
  ]);
  
  const productNameMap = new Map(products.map((p) => [p.id, p.name || "Ürün"]));
  const bundleNameMap = new Map(bundles.map((b) => [b.id, b.name || "Paket"]));

  const orderItemsForContract = items.map((item) => ({
    name: item.isBundle && item.bundleId 
      ? bundleNameMap.get(item.bundleId) || item.name || "Paket"
      : productNameMap.get(item.productId) || item.name || item.title || "Ürün",
    variant: item.variant,
    price: item.price,
    quantity: item.quantity,
  }));

  const orderTotalsForContract = {
    subtotal: orderSubtotal,
    shipping: orderShipping,
    discount: orderDiscount,
    grandTotal: orderTotal,
  };

  const contractsHTML = generateContractsHTML(
    buyerInfo,
    orderItemsForContract,
    orderTotalsForContract,
    orderNumber,
    contractDate
  );

  const contractsAccepted = {
    termsAndConditions: contracts?.termsAndConditions || false,
    distanceSalesContract: contracts?.distanceSalesContract || false,
    newsletter: contracts?.newsletter || newsletter || false,
    acceptedAt: contractDate.toISOString(),
  };

  const addressSnapshot = buildAddressSnapshot(billingAddress, shippingAddress);

  const initialStatusHistory = [
    {
      status: "PENDING",
      date: new Date().toISOString(),
      note: "Sipariş oluşturuldu (ödeme onaylandı)",
    },
    {
      type: "ADDRESS_SNAPSHOT",
      date: contractDate.toISOString(),
      addresses: addressSnapshot,
      note: "Sipariş adresleri kaydedildi",
    },
    {
      type: "CONTRACT_ACCEPTANCE",
      date: contractDate.toISOString(),
      contracts: {
        ...contractsAccepted,
        termsAndConditionsHTML: contractsHTML.termsAndConditions,
        distanceSalesContractHTML: contractsHTML.distanceSalesContract,
      },
      note: "Sözleşmeler elektronik ortamda onaylandı",
    },
    {
      status: "PROCESSING",
      date: new Date().toISOString(),
      note: `Ödeme onaylandı. iyzico Payment ID: ${paymentResult.paymentId || "-"}`,
    },
  ];

  const iyzicoPaymentTransactions = paymentResult.itemTransactions?.map((item) => ({
    itemId: item.itemId,
    paymentTransactionId: item.paymentTransactionId,
    price: item.price,
    paidPrice: item.paidPrice,
  })) || [];

  // Generate contract access token for secure contract viewing
  const contractAccessToken = randomBytes(32).toString("hex");

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: finalUserId!,
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "CREDIT_CARD",
      subtotal: orderSubtotal,
      shippingCost: orderShipping,
      discount: orderDiscount,
      tax: totals?.taxIncluded || 0,
      total: orderTotal,
      couponId: directCouponId || couponId,
      couponCode: couponCode || null,
      billingAddressId: billingAddressId !== "temp" ? billingAddressId : null,
      shippingAddressId: shippingAddressId !== "temp" ? shippingAddressId : null,
      customerNote: billingAddress.orderNotes || null,
      contractAccessToken, // Token for secure contract access
      paidAt: new Date(),
      confirmedAt: new Date(), // Ödeme onaylandı
      preparingAt: new Date(), // Hazırlanıyor durumuna geçti
      iyzicoPaymentId: paymentResult.paymentId || null,
      iyzicoConversationId: orderNumber,
      iyzicoPaymentTransactions,
      statusHistory: initialStatusHistory,
      items: {
        create: items.map((item) => {
          let variantInfo = null;
          if (item.variant || item.bundleItemVariants) {
            variantInfo = JSON.stringify({
              variant: item.variant || null,
              bundleItemVariants: item.bundleItemVariants || null,
            });
          }
          return {
            productId: item.productId,
            bundleId: item.isBundle ? item.bundleId : null,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            variantInfo,
          };
        }),
      },
    },
  });

  // Reduce stock for paid order
  for (const item of items) {
    try {
      if (item.variant?.id) {
        await prisma.productVariant.updateMany({
          where: {
            id: item.variant.id,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await prisma.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
      }
    } catch (error) {
      console.error(`Failed to reduce stock for product ${item.productId}:`, error);
    }
  }

  // Send customer + admin notifications
  const customerEmail = billingAddress.email;
  const customerName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();
  const shipAddr = shippingAddress || billingAddress;

  if (customerEmail) {
    sendOrderConfirmationEmail(customerEmail, {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName,
      customerEmail,
      items: items.map((item) => ({
        name: item.name || item.title || "Ürün",
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: orderSubtotal,
      shipping: orderShipping,
      discount: orderDiscount,
      total: orderTotal,
      shippingAddress: {
        fullName: `${shipAddr?.firstName || ""} ${shipAddr?.lastName || ""}`.trim(),
        address: shipAddr?.addressLine1 || "",
        city: shipAddr?.city || "",
        district: shipAddr?.district || "",
        postalCode: shipAddr?.postalCode || "",
        phone: shipAddr?.phone || billingAddress.phone || "",
      },
      billingAddress: {
        fullName: `${billingAddress.firstName} ${billingAddress.lastName}`.trim(),
        address: billingAddress.addressLine1 || "",
        city: billingAddress.city || "",
        district: billingAddress.district || "",
        postalCode: billingAddress.postalCode || "",
        phone: billingAddress.phone || "",
      },
      paymentMethod: "CREDIT_CARD",
      contractAccessToken, // Token for secure contract access
    }).catch(err => console.error("Customer email error:", err));
  }

  sendAdminNewOrderNotification({
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customerName,
    customerEmail: customerEmail || "Belirtilmedi",
    customerPhone: billingAddress.phone || "",
    total: orderTotal,
    itemCount: items.length,
    paymentMethod: "CREDIT_CARD",
    shippingCity: shipAddr?.city || "",
    items: items.map((item) => ({
      name: item.isBundle && item.bundleId 
        ? bundleNameMap.get(item.bundleId) || item.name || "Paket"
        : productNameMap.get(item.productId) || item.name || item.title || "Ürün",
      quantity: item.quantity,
      price: item.price,
    })),
  }).catch(err => console.error("Admin notification error:", err));

  return order;
}

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
    const draft = await prisma.paymentDraft.findUnique({
      where: { order_number: conversationId },
    });

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

      if (draft) {
        try {
          await prisma.paymentDraft.delete({ where: { order_number: conversationId } });
        } catch (deleteError) {
          console.error("⚠️ Failed to delete payment draft:", deleteError);
        }
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

      // Siparişi oluştur/güncelle - ödeme başarılı
      try {
        if (draft) {
          await createOrderFromDraft(
            conversationId,
            draft.payload as DraftPayload,
            draft.user_id || null,
            {
              paymentId: paymentResult.paymentId,
              itemTransactions: paymentResult.itemTransactions,
            }
          );
          try {
            await prisma.paymentDraft.delete({ where: { order_number: conversationId } });
          } catch (deleteError) {
            console.error("⚠️ Failed to delete payment draft:", deleteError);
          }
          console.log("✅ Order created from draft:", conversationId);
        } else {
          const existingOrder = await prisma.order.findUnique({
            where: { orderNumber: conversationId },
            select: { paymentStatus: true },
          });

          if (existingOrder && existingOrder.paymentStatus !== "PAID") {
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
          }
        }
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
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com";
  return NextResponse.redirect(`${baseUrl}/checkout`, { status: 303 });
}

