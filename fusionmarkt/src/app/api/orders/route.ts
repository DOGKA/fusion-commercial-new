/**
 * Orders API
 * POST /api/orders - Create new order
 * GET /api/orders - Get user orders (authenticated)
 * 
 * Rate Limited: 10 orders per minute per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
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

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `FM-${year}-${random}`;
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
      subtotal: directSubtotal,
      shippingCost: directShippingCost,
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

    // Handle both frontend formats (totals object or direct values)
    const orderSubtotal = totals?.subtotal ?? directSubtotal ?? 0;
    const orderShipping = totals?.shipping ?? directShippingCost ?? 0;
    const orderDiscount = totals?.discount ?? directDiscount ?? 0;
    const orderTotal = totals?.grandTotal ?? directTotal ?? (orderSubtotal + orderShipping - orderDiscount);

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
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
    const orderNumber = generateOrderNumber();

    // Determine payment status
    const paymentStatus = "PENDING" as const;
    const orderStatus = "PENDING" as const;
    
    // Handle billing address - use existing if ID provided, else create new only if saveToAddresses is true
    let billingAddressId: string;
    
    if (billingAddress.id) {
      // Kayıtlı adres seçilmiş - mevcut adresi kullan
      billingAddressId = billingAddress.id;
    } else if (billingAddress.saveToAddresses && userId) {
      // Yeni adres ve "Kayıtlı adreslerime ekle" seçilmiş - yeni adres oluştur
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
    const order = await prisma.$transaction(async (tx: any) => {
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

      // 2. Coupon usage increment (race-condition safe)
      const finalCouponId = directCouponId || couponId;
      if (finalCouponId && couponCode) {
        const couponRecord = await tx.coupon.findUnique({ where: { id: finalCouponId }, select: { isActive: true, usageLimit: true, usageCount: true } });
        if (couponRecord && couponRecord.isActive && (couponRecord.usageLimit === null || couponRecord.usageCount < couponRecord.usageLimit)) {
          await tx.coupon.update({ where: { id: finalCouponId }, data: { usageCount: { increment: 1 } } });
        } else {
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
            create: items.map((item: {
              productId: string;
              variant?: { id: string };
              price: number;
              quantity: number;
              isBundle?: boolean;
              bundleId?: string;
              bundleItemVariants?: Record<string, { variantId: string; variantName: string; variantValue: string; productName: string }>;
            }) => {
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

  } catch (error: any) {
    console.error("Create order error:", error);
    
    const errorMessage = error?.message || "";
    if (errorMessage.startsWith("STOCK_INSUFFICIENT:")) {
      const parts = errorMessage.split(":");
      return NextResponse.json(
        { error: parts[2] || "Stok yetersiz", code: "STOCK_INSUFFICIENT", productId: parts[1] },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Sipariş oluşturulamadı" },
      { status: 500 }
    );
  }
}

// GET - Get user orders with full details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // Format orders for frontend
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      
      // Totals
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
      tax: Number(order.tax),
      total: Number(order.total),
      
      // Tracking
      trackingNumber: order.trackingNumber,
      carrierName: order.carrierName,
      
      // Invoice
      invoiceUrl: order.invoiceUrl,
      invoiceUploadedAt: order.invoiceUploadedAt,
      
      // Dates
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      
      // Items
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        variantInfo: item.variantInfo ? JSON.parse(item.variantInfo) : null,
        product: item.product,
      })),
      
      // Addresses
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      
      // Notes
      customerNote: order.customerNote,
      
      // Status History (includes contract acceptance)
      statusHistory: order.statusHistory,
    }));

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Siparişler alınamadı" },
      { status: 500 }
    );
  }
}
