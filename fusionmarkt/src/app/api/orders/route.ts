/**
 * Orders API
 * POST /api/orders - Create new order
 * GET /api/orders - Get user orders (authenticated)
 * 
 * Rate Limited: 10 orders per minute per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma, Prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { 
  sendOrderPendingPaymentEmail,
  sendAdminNewOrderNotification,
} from "@/lib/email";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { generateContractsHTML } from "@/lib/contracts";
import { isValidEmail } from "@/lib/utils";
import { invoiceTypeFromCheckout } from "@/lib/address-validation";
import {
  countCouponUsage,
  countUserCouponUsage,
  isPerUserLimitReached,
  isUsageLimitReached,
  perUserLimitMessage,
} from "@/lib/coupon-usage";
import { getUserOrders } from "@/lib/user-orders";
import {
  claimedTotalIsTooLow,
  computeOrderPricing,
  PRICE_MISMATCH_MESSAGE,
} from "@/lib/order-pricing";
import { reserveOrderNumber } from "@/lib/order-number";

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

type AddressInput = {
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
  billingAddress: AddressInput,
  shippingAddress?: AddressInput,
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

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Rate Limiting (Prevent order spam)
    // ─────────────────────────────────────────────────────────────────────────
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`order:${clientIP}`, RATE_LIMITS.order);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: "Çok fazla sipariş denemesi. Lütfen biraz bekleyin.",
          retryAfter: rateLimit.resetIn 
        },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Invalid JSON in request body:", e);
      return NextResponse.json({ error: "Geçersiz istek verisi" }, { status: 400 });
    }

    const {
      items,
      billingAddress,
      shippingAddress,
      // shippingMethod is received but not used directly - stored in order
      paymentMethod,
      couponCode,
      couponId: directCouponId,
      totals,
      discount: directDiscount,
      total: directTotal,
      otpVerified, // OTP ile doğrulanmış e-posta
      contracts, // Sözleşme onayları
      newsletter, // Legacy newsletter field
    } = body;

    // Sözleşme onay bilgilerini hazırla
    const contractsAccepted = {
      termsAndConditions: contracts?.termsAndConditions || false,
      distanceSalesContract: contracts?.distanceSalesContract || false,
      newsletter: contracts?.newsletter || newsletter || false,
      acceptedAt: new Date().toISOString(),
    };

    // İstemcinin iddiası — yalnızca karşılaştırma için okunuyor, kaydedilmiyor.
    const claimedDiscount = totals?.discount ?? directDiscount ?? 0;
    const claimedTotal = totals?.grandTotal ?? directTotal ?? null;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TUTAR SUNUCUDA HESAPLANIYOR
    //
    // Buraya kadar gövdeden gelen `subtotal`/`shippingCost`/`total` olduğu gibi
    // kaydediliyordu; isteği düzenleyen biri sepeti 1 ₺'ye sipariş edebiliyordu.
    // Artık her kalemin fiyatı veritabanından okunuyor. İstemcinin toplamı
    // yalnızca **daha düşükse** istek durduruluyor: bu ya kurcalama ya da sayfa
    // açıldıktan sonra gelen zam demek, ikisinde de müşteriden gördüğünden
    // fazlasını tahsil etmemek gerekiyor.
    // ─────────────────────────────────────────────────────────────────────────
    const pricingResult = await computeOrderPricing({
      items,
      couponId: directCouponId || null,
      claimedDiscount,
    });

    if (!pricingResult.ok) {
      return NextResponse.json(
        { error: pricingResult.error, code: pricingResult.code },
        { status: 400 }
      );
    }

    const {
      subtotal: orderSubtotal,
      shipping: orderShipping,
      discount: orderDiscount,
      total: orderTotal,
      lines: pricedLines,
    } = pricingResult.pricing;

    if (claimedTotal !== null && claimedTotalIsTooLow(claimedTotal, orderTotal)) {
      console.warn(
        `[FİYAT UYUŞMAZLIĞI] sipariş reddedildi — istemci: ${claimedTotal}, sunucu: ${orderTotal}`
      );
      return NextResponse.json(
        { error: PRICE_MISMATCH_MESSAGE, code: "PRICE_MISMATCH" },
        { status: 409 }
      );
    }

    if (!billingAddress) {
      return NextResponse.json({ error: "Fatura adresi gerekli" }, { status: 400 });
    }
    
    // Validate billing address has minimum required fields
    if (!billingAddress.firstName || !billingAddress.email) {
      return NextResponse.json({ error: "Fatura adresi eksik bilgi içeriyor" }, { status: 400 });
    }
    
    // Validate email format
    if (!isValidEmail(billingAddress.email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin" }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sözleşme Onayı Kontrolü (ZORUNLU)
    // ─────────────────────────────────────────────────────────────────────────
    if (!contracts?.termsAndConditions || !contracts?.distanceSalesContract) {
      return NextResponse.json(
        { 
          error: "Sipariş oluşturabilmek için Kullanıcı Sözleşmesi ve Mesafeli Satış Sözleşmesi'ni onaylamanız gerekmektedir.",
          code: "CONTRACTS_NOT_ACCEPTED"
        },
        { status: 400 }
      );
    }

    let userId = session?.user?.id;
    let guestAccountCreated = false;
    
    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: billingAddress.email.toLowerCase().trim() },
        select: { id: true, name: true },
      });
      
      if (existingUser) {
        if (otpVerified) {
          userId = existingUser.id;
        } else {
          return NextResponse.json(
            { 
              error: "Bu e-posta adresi kayıtlı bir hesaba ait. Lütfen giriş yaparak devam edin.",
              code: "EMAIL_REGISTERED",
              userName: existingUser.name 
            },
            { status: 409 }
          );
        }
      }
      
      if (!userId) {
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
        
        userId = newUser.id;
        guestAccountCreated = true;
      }
    }

    // Generate order number
    const orderNumber = await reserveOrderNumber();
    
    // Handle billing address - use existing if ID provided, else create new only if saveToAddresses is true
    let billingAddressId: string;
    
    if (billingAddress.id) {
      // Kayıtlı adres seçilmiş - mevcut adresi kullan
      billingAddressId = billingAddress.id;
    } else if (billingAddress.saveToAddresses && userId) {
      // Yeni adres ve "Kayıtlı adreslerime ekle" seçilmiş - yeni adres oluştur
      //
      // Kurumsal fatura bilgisi de kaydediliyor: aksi halde kullanıcı her
      // siparişte firma adı / vergi no / vergi dairesini yeniden yazıyordu.
      // TCKN bilinçli olarak kaydedilmiyor (bkz. Address modeli notu).
      const savedInvoiceType = invoiceTypeFromCheckout(billingAddress.invoiceType);
      const isCorporate = savedInvoiceType === "CORPORATE";
      const createdBillingAddress = await prisma.address.create({
        data: {
          userId,
          title: billingAddress.title || "Sipariş Adresi",
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          phone: billingAddress.phone || "",
          city: billingAddress.city,
          district: billingAddress.district || "",
          postalCode: billingAddress.postalCode || "",
          addressLine1: billingAddress.addressLine1,
          address: billingAddress.addressLine1,
          country: billingAddress.country || "Türkiye",
          type: "BILLING",
          invoiceType: savedInvoiceType,
          company: isCorporate ? billingAddress.companyName || null : null,
          taxNumber: isCorporate ? billingAddress.taxNumber || null : null,
          taxOffice: isCorporate ? billingAddress.taxOffice || null : null,
          isDefault: false,
        },
      });
      billingAddressId = createdBillingAddress.id;
    } else {
      // Guest veya kaydetme seçilmemiş - geçici adres ID'si (sipariş bilgilerinde saklanacak)
      // Adresi order tablosunda JSON olarak saklayacağız
      billingAddressId = "temp";
    }

    // Handle shipping address
    let shippingAddressId = billingAddressId;
    if (shippingAddress && shippingAddress.id) {
      shippingAddressId = shippingAddress.id;
    } else if (shippingAddress && shippingAddress.firstName && shippingAddress.saveToAddresses && userId !== "guest") {
      const createdShippingAddress = await prisma.address.create({
        data: {
          userId,
          title: "Teslimat Adresi",
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone || "",
          city: shippingAddress.city,
          district: shippingAddress.district || "",
          postalCode: shippingAddress.postalCode || "",
          addressLine1: shippingAddress.addressLine1,
          address: shippingAddress.addressLine1,
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
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon) {
        couponId = coupon.id;
      }
    }

    // Generate contract HTML with user's data
    const contractDate = new Date();
    const buyerInfo = {
      fullName: `${billingAddress.firstName} ${billingAddress.lastName}`,
      tcKimlikNo: billingAddress.tcKimlikNo,
      address: `${billingAddress.addressLine1}${billingAddress.addressLine2 ? ", " + billingAddress.addressLine2 : ""}, ${billingAddress.district || ""}, ${billingAddress.city}`,
      phone: billingAddress.phone || "",
      email: billingAddress.email,
    };
    
    // Fetch product and bundle names from database for contract generation
    const productIds = items.filter((item: { isBundle?: boolean }) => !item.isBundle).map((item: { productId: string }) => item.productId);
    const bundleIds = items.filter((item: { isBundle?: boolean; bundleId?: string }) => item.isBundle && item.bundleId).map((item: { bundleId?: string }) => item.bundleId!);
    
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
    
    const productNameMap = new Map(products.map(p => [p.id, p.name || "Ürün"]));
    const bundleNameMap = new Map(bundles.map(b => [b.id, b.name || "Paket"]));
    
    const orderItems = items.map((item: { productId: string; name?: string; title?: string; variant?: { value?: string }; price: number; quantity: number; isBundle?: boolean; bundleId?: string }) => ({
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
    
    // Generate full HTML contracts
    const contractsHTML = generateContractsHTML(
      buyerInfo,
      orderItems,
      orderTotalsForContract,
      orderNumber,
      contractDate
    );

    const addressSnapshot = buildAddressSnapshot(billingAddress, shippingAddress);

    // Generate contract access token for secure contract viewing
    const contractAccessToken = randomBytes(32).toString("hex");

    // Initial status history with contract acceptance and full HTML
    const initialStatusHistory = [
      {
        status: "PENDING",
        date: new Date().toISOString(),
        note: "Sipariş oluşturuldu",
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
          // Store full HTML of contracts
          termsAndConditionsHTML: contractsHTML.termsAndConditions,
          distanceSalesContractHTML: contractsHTML.distanceSalesContract,
        },
        note: "Sözleşmeler elektronik ortamda onaylandı",
      },
    ];

    const isBankTransfer = paymentMethod !== "credit_card" && paymentMethod !== "card_sipay";

    // ─────────────────────────────────────────────────────────────────────────
    // ATOMIC TRANSACTION: stock check + decrement + order create + coupon update
    // ─────────────────────────────────────────────────────────────────────────
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Stock validation & decrement (bank transfer only - card orders reserve later)
      if (isBankTransfer) {
        for (const item of items) {
          if (item.isBundle) continue;
          if (item.variant?.id) {
            const updated = await tx.productVariant.updateMany({
              where: { id: item.variant.id, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.count === 0) {
              const variant = await tx.productVariant.findUnique({ where: { id: item.variant.id }, select: { stock: true } });
              throw new Error(`STOCK_INSUFFICIENT:${item.productId}:Stok yetersiz (mevcut: ${variant?.stock ?? 0}, istenen: ${item.quantity})`);
            }
          } else {
            const updated = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.count === 0) {
              const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true, name: true } });
              throw new Error(`STOCK_INSUFFICIENT:${item.productId}:"${product?.name}" stok yetersiz (mevcut: ${product?.stock ?? 0}, istenen: ${item.quantity})`);
            }
          }
        }
      }

      // 2. Kupon kontrolü
      //
      // SAYAÇ ARTIRILMIYOR: kupon kullanımı artık `Coupon.usageCount`
      // kolonundan değil siparişlerden hesaplanıyor (`@repo/db`
      // `coupon-usage.ts`). Aşağıda oluşturulan siparişin kendisi kayıt
      // olduğu için ayrıca bir şey yazmak gerekmiyor — ve kolon başarısız
      // ödemelerde geri alınmadığı için yanlış sayıyordu.
      const finalCouponId = directCouponId || couponId;
      if (finalCouponId && couponCode) {
        const couponRecord = await tx.coupon.findUnique({ where: { id: finalCouponId }, select: { isActive: true, usageLimit: true, perUserLimit: true } });

        // Kişisel kullanım hakkı — bağlayıcı kontrol burada.
        //
        // Diğer geçersizlik hallerinden (pasif kupon, dolan genel limit) farklı
        // olarak sipariş REDDEDİLİYOR: aşağıdaki dal indirimi yine uygulayıp
        // sadece uyarı basıyor. Kişisel hak için bu davranış kuralı işlevsiz
        // bırakırdı — kullanıcı indirimi almaya devam ederdi.
        if (couponRecord && userId) {
          const used = await countUserCouponUsage(tx, userId, finalCouponId);
          if (isPerUserLimitReached(couponRecord.perUserLimit, used)) {
            throw new Error(`COUPON_PER_USER_LIMIT:${couponRecord.perUserLimit}`);
          }
        }

        // Mevcut davranış korunuyor: kupon sipariş anında geçersizse indirim
        // yine uygulanıyor, yalnızca log düşülüyor. Bunu değiştirmek ödeme
        // akışının davranışını değiştirmek olur, ayrı bir iş.
        const totalUsed = couponRecord?.usageLimit != null
          ? await countCouponUsage(tx, finalCouponId)
          : 0;
        const stillValid =
          couponRecord?.isActive &&
          !isUsageLimitReached(couponRecord.usageLimit, totalUsed);
        if (!stillValid) {
          console.warn(`Coupon ${couponCode} invalid at order time, proceeding without discount`);
        }
      }

      // 3. Create order with items
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: isBankTransfer ? "BANK_TRANSFER" : "CREDIT_CARD",
          subtotal: orderSubtotal,
          shippingCost: orderShipping,
          discount: orderDiscount,
          tax: totals?.taxIncluded || 0,
          total: orderTotal,
          couponId: finalCouponId,
          couponCode: couponCode || null,
          billingAddressId: billingAddressId !== "temp" ? billingAddressId : null,
          shippingAddressId: shippingAddressId !== "temp" ? shippingAddressId : null,
          customerNote: billingAddress?.orderNotes || null,
          contractAccessToken,
          statusHistory: initialStatusHistory,
          items: {
            // Kalem fiyatları da sunucudan: `pricedLines` sırası `items` ile
            // birebir aynı (bkz. `lib/order-pricing.ts`). İstemcinin gönderdiği
            // `item.price` hiç kullanılmıyor.
            create: items.map((item: {
              productId: string;
              variant?: { id: string };
              quantity: number;
              isBundle?: boolean;
              bundleId?: string;
              bundleItemVariants?: Record<string, { variantId: string; variantName: string; variantValue: string; productName: string }>;
            }, index: number) => {
              let variantInfo = null;
              if (item.variant || item.bundleItemVariants) {
                variantInfo = JSON.stringify({
                  variant: item.variant || null,
                  bundleItemVariants: item.bundleItemVariants || null,
                });
              }
              const line = pricedLines[index];
              return {
                productId: item.productId,
                bundleId: item.isBundle ? item.bundleId : null,
                price: line.unitPrice,
                quantity: line.quantity,
                subtotal: line.lineTotal,
                variantInfo,
              };
            }),
          },
        },
      });

      return createdOrder;
    });

    // ═══════════════════════════════════════════════════════════════════════
    // EMAIL NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    const customerEmail = billingAddress.email;
    const customerName = `${billingAddress.firstName} ${billingAddress.lastName}`;
    const customerPhone = billingAddress.phone;

    // Send emails only for bank transfer orders.
    // Credit card orders get notifications after payment success (callback).
    // (already determined above from order.paymentMethod)
    
    if (isBankTransfer) {
      // Customer pending payment email
      if (customerEmail) {
        sendOrderPendingPaymentEmail(customerEmail, order.orderNumber, customerName, orderTotal)
          .catch(err => console.error("Customer email error:", err));
        console.log(`📧 Customer pending-payment email queued: ${customerEmail}`);
      }

      // Admin notification (bank transfer order created)
      sendAdminNewOrderNotification({
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customerName,
        customerEmail: customerEmail || "Belirtilmedi",
        customerPhone: customerPhone || "",
        total: orderTotal,
        itemCount: items.length,
        paymentMethod: "BANK_TRANSFER",
        shippingCity: shippingAddress?.city || billingAddress?.city || "",
        items: items.map((item: { productId: string; name?: string; title?: string; quantity: number; price: number; isBundle?: boolean; bundleId?: string }) => ({
          name: item.isBundle && item.bundleId 
            ? bundleNameMap.get(item.bundleId) || item.name || "Paket"
            : productNameMap.get(item.productId) || item.name || item.title || "Ürün",
          quantity: item.quantity,
          price: item.price,
        })),
      }).catch(err => console.error("Admin notification error:", err));
      console.log(`📧 Admin notification queued for bank transfer order: ${order.orderNumber}`);
    } else {
      console.log(`⏳ Credit card order created, notifications deferred: ${order.orderNumber}`);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      guestAccountCreated: guestAccountCreated || false,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Create order error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.startsWith("STOCK_INSUFFICIENT:")) {
      const parts = errorMessage.split(":");
      return NextResponse.json(
        { error: parts[2] || "Stok yetersiz", code: "STOCK_INSUFFICIENT", productId: parts[1] },
        { status: 422 }
      );
    }

    if (errorMessage.startsWith("COUPON_PER_USER_LIMIT:")) {
      const perUserLimit = Number(errorMessage.split(":")[1]) || 1;
      return NextResponse.json(
        {
          error: `${perUserLimitMessage(perUserLimit)} Kuponu kaldırıp siparişinizi tamamlayabilirsiniz.`,
          code: "COUPON_PER_USER_LIMIT",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Sipariş oluşturulamadı" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders?status=&q=&page=&limit=&from=&to=
 *
 * Liste sorgusu `lib/user-orders.ts`'te — sayfanın SSR'ı da onu kullanıyor
 * (F2-45). Bu handler yalnızca oturum + query parse + HTTP sarmalaması.
 *
 * ⚠️ `statusHistory` ARTIK DÖNMÜYOR. Geri eklemeyin.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;

    return NextResponse.json(
      await getUserOrders(session.user.id, {
        status: params.get("status"),
        q: params.get("q"),
        page: parseInt(params.get("page") || "1", 10) || 1,
        limit: parseInt(params.get("limit") || "10", 10) || 10,
        from: params.get("from"),
        to: params.get("to"),
      })
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Siparişler alınamadı" },
      { status: 500 }
    );
  }
}
