/**
 * Cancel Request API
 * POST /api/orders/[orderNumber]/cancel-request - Create cancellation request
 * GET /api/orders/[orderNumber]/cancel-request - Get cancellation request status
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
  isIpBanned,
  banIp,
  BAN_DURATIONS,
  getBanTimeRemaining,
} from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

/**
 * GET - Check cancellation request status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Get order with cancellation request
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
      include: {
        cancellationRequest: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasCancellationRequest: !!order.cancellationRequest,
      cancellationRequest: order.cancellationRequest,
    });
  } catch (error) {
    console.error("❌ [CANCEL REQUEST] GET error:", error);
    return NextResponse.json(
      { error: "İptal talebi durumu alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create cancellation request
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const clientIp = getClientIP(request.headers);
    const { orderNumber } = await params;

    // Check IP ban
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      const timeRemaining = getBanTimeRemaining(banCheck.bannedUntil!);
      return NextResponse.json(
        {
          error: `İşlem geçici olarak kısıtlandı. Lütfen ${timeRemaining} sonra tekrar deneyiniz.`,
          bannedUntil: banCheck.bannedUntil,
        },
        { status: 429 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Rate limit check - User based
    const userRateLimit = checkRateLimit(
      `cancel-request:user:${user.id}`,
      RATE_LIMITS.cancellationRequestUser
    );
    if (!userRateLimit.success) {
      return NextResponse.json(
        {
          error: `Son 1 saat içinde çok fazla iptal talebi oluşturdunuz. Lütfen ${Math.ceil(userRateLimit.resetIn / 60)} dakika sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    // Rate limit check - IP based
    const ipRateLimit = checkRateLimit(
      `cancel-request:ip:${clientIp}`,
      RATE_LIMITS.cancellationRequestIp
    );
    if (!ipRateLimit.success) {
      // Ban IP for abuse
      banIp(clientIp, BAN_DURATIONS.cancellationAbuse, "Çok fazla iptal talebi");
      return NextResponse.json(
        {
          error: "Son 1 saat içinde çok fazla iptal talebi oluşturdunuz. Lütfen 3 saat sonra tekrar deneyiniz.",
        },
        { status: 429 }
      );
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
      include: {
        cancellationRequest: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Check if order already has a cancellation request
    if (order.cancellationRequest) {
      return NextResponse.json(
        { error: "Bu sipariş için zaten bir iptal talebi mevcut" },
        { status: 400 }
      );
    }

    // Check if order status allows cancellation
    // Cannot cancel if already shipped, delivered, cancelled, or refunded
    const nonCancellableStatuses = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
    if (nonCancellableStatuses.includes(order.status)) {
      const statusMessages: Record<string, string> = {
        SHIPPED: "Kargoya verilmiş siparişler iptal edilemez. İade talebi oluşturabilirsiniz.",
        DELIVERED: "Teslim edilmiş siparişler iptal edilemez. İade talebi oluşturabilirsiniz.",
        CANCELLED: "Bu sipariş zaten iptal edilmiş.",
        REFUNDED: "Bu sipariş zaten iade edilmiş.",
      };
      return NextResponse.json(
        { error: statusMessages[order.status] },
        { status: 400 }
      );
    }

    // Parse request body for optional reason
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body or invalid JSON, that's fine
    }

    // Create cancellation request
    const cancellationRequest = await prisma.cancellationRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        requestIp: clientIp,
        reason,
        status: "PENDING_ADMIN_APPROVAL",
      },
    });

    // Log rate limit action
    await prisma.rateLimitLog.create({
      data: {
        ip: clientIp,
        userId: user.id,
        action: "CANCEL_REQUEST",
      },
    });

    console.log(`✅ Cancellation request created for order ${orderNumber}`);

    // Determine response message based on payment method
    const isCardPayment = order.paymentMethod === "CREDIT_CARD" || order.paymentMethod === "iyzico";
    const message = isCardPayment
      ? "İptal talebiniz alındı. Mağaza onayından sonra ödeme iptali/iadesi gerçekleştirilecektir."
      : "İptal talebiniz alındı. Mağaza onayından sonra ödemeniz 3 iş günü içinde gönderim yaptığınız banka hesabınıza iade edilecektir.";

    return NextResponse.json({
      success: true,
      message,
      cancellationRequest: {
        id: cancellationRequest.id,
        status: cancellationRequest.status,
        createdAt: cancellationRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ [CANCEL REQUEST] POST error:", error);
    return NextResponse.json(
      { error: "İptal talebi oluşturulamadı" },
      { status: 500 }
    );
  }
}
