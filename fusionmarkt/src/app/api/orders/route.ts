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
  sendAdminNewOrderNotification 
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

    // Check if guest is using a registered email
    let userId = session?.user?.id;
    
    if (!userId) {
      // Guest checkout - check if email is already registered
      const existingUser = await prisma.user.findUnique({
        where: { email: billingAddress.email.toLowerCase().trim() },
        select: { id: true, name: true },
      });
      
      if (existingUser) {
        // Email is registered - user must login
        return NextResponse.json(
          { 
            error: "Bu e-posta adresi kayıtlı bir hesaba ait. Lütfen giriş yaparak devam edin.",
            code: "EMAIL_REGISTERED",
            userName: existingUser.name 
          },
          { status: 409 } // Conflict
        );
      }
      
      // Create a new user account for guest
      const tempPassword = Math.random().toString(36).slice(-12); // Temporary password
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
      
      // TODO: Send welcome email with password reset link
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
    
    // Fetch product names from database for contract generation
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productNameMap = new Map(products.map(p => [p.id, p.name || "Ürün"]));
    
    const orderItems = items.map((item: { productId: string; name?: string; title?: string; variant?: { value?: string }; price: number; quantity: number }) => ({
      name: productNameMap.get(item.productId) || item.name || item.title || "Ürün",
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

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: orderStatus,
        paymentStatus,
        paymentMethod: paymentMethod === "credit_card" || paymentMethod === "card_sipay" ? "CREDIT_CARD" : "BANK_TRANSFER",
        subtotal: orderSubtotal,
        shippingCost: orderShipping,
        discount: orderDiscount,
        tax: totals?.taxIncluded || 0,
        total: orderTotal,
        couponId: directCouponId || couponId,
        couponCode: couponCode || null,
        billingAddressId: billingAddressId !== "temp" ? billingAddressId : null,
        shippingAddressId: shippingAddressId !== "temp" ? shippingAddressId : null,
        customerNote: billingAddress?.orderNotes || null,
        contractAccessToken, // Token for secure contract access
        statusHistory: initialStatusHistory, // Sözleşme onaylarını dahil et
        // Create order items
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
            // variantInfo: normal varyant + bundle içi varyantlar
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

    const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";

    // Reduce stock only for bank transfer orders (stock reserved on payment pending)
    if (isBankTransfer) {
      for (const item of items) {
        try {
          // Check if variant exists
          if (item.variant?.id) {
            // Update variant stock
            await prisma.productVariant.updateMany({
              where: {
                id: item.variant.id,
                stock: { gte: item.quantity }, // Only update if stock is sufficient
              },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          } else {
            // Update main product stock
            await prisma.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity }, // Only update if stock is sufficient
              },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }
        } catch (error) {
          console.error(`Failed to reduce stock for product ${item.productId}:`, error);
          // Continue with other items even if one fails
        }
      }
    } else {
      console.log(`⏳ Credit card order created, stock not reserved: ${order.orderNumber}`);
    }

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
        items: items.map((item: { name?: string; title?: string; quantity: number; price: number }) => ({
          name: item.name || item.title || "Ürün",
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
    }, { status: 201 });

  } catch (error) {
    console.error("Create order error:", error);
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
