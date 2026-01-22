/**
 * Admin Cancellation Request API - Single Request Operations
 * GET /api/admin/cancellation-requests/[id] - Get request details
 * PATCH /api/admin/cancellation-requests/[id] - Approve/Reject request
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { createCancel, createRefund, IYZICO_ENABLED } from "@/lib/iyzico";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔒 Authorization check helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  
  return { authorized: true, session, userId: (session.user as any).id };
}

// Helper: Normalize IP
function normalizeIyzicoIp(rawIp?: string | null): string {
  const candidate = (rawIp || "").split(",")[0]?.trim();
  if (!candidate) {
    return process.env.IYZICO_IP_OVERRIDE || "127.0.0.1";
  }
  if (candidate.startsWith("::ffff:")) {
    return candidate.replace("::ffff:", "");
  }
  if (candidate.includes(":")) {
    return process.env.IYZICO_IP_OVERRIDE || "127.0.0.1";
  }
  return candidate;
}

// Helper: Normalize price
function normalizeRefundPrice(rawPrice: unknown, orderTotal?: number): number | null {
  let value: number;
  if (typeof rawPrice === "string") {
    const normalized = rawPrice.replace(",", ".").trim();
    value = Number(normalized);
  } else if (typeof rawPrice === "number") {
    value = rawPrice;
  } else {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  if (typeof orderTotal === "number" && Number.isFinite(orderTotal) && orderTotal > 0) {
    if (value > orderTotal * 10) {
      value = value / 100;
    }
  }

  return Math.round(value * 100) / 100;
}

/**
 * GET /api/admin/cancellation-requests/[id]
 * Get cancellation request details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const cancellationRequest = await prisma.cancellationRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
            },
            shippingAddress: true,
            billingAddress: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!cancellationRequest) {
      return NextResponse.json(
        { error: "İptal talebi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(cancellationRequest);
  } catch (error) {
    console.error("❌ [CANCELLATION REQUEST] GET error:", error);
    return NextResponse.json(
      { error: "İptal talebi alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/cancellation-requests/[id]
 * Approve or Reject a cancellation request
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminNote } = body; // action: "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Geçersiz işlem. 'approve' veya 'reject' olmalı." },
        { status: 400 }
      );
    }

    // Get the cancellation request with order and user
    const cancellationRequest = await prisma.cancellationRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!cancellationRequest) {
      return NextResponse.json(
        { error: "İptal talebi bulunamadı" },
        { status: 404 }
      );
    }

    if (cancellationRequest.status !== "PENDING_ADMIN_APPROVAL") {
      return NextResponse.json(
        { error: "Bu talep zaten işlenmiş" },
        { status: 400 }
      );
    }

    const order = cancellationRequest.order;
    const now = new Date();
    let iyzicoResult: any = null;

    if (action === "approve") {
      // Process cancellation
      
      // 1. Restore stock
      for (const item of order.items) {
        const variantInfo = item.variantInfo ? JSON.parse(item.variantInfo) : null;
        
        if (variantInfo?.id) {
          await prisma.productVariant.update({
            where: { id: variantInfo.id },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      console.log(`✅ Stock restored for order ${order.orderNumber}`);

      // 2. Process iyzico refund if applicable
      const orderData = order as any; // Cast for iyzico fields
      const isCardPayment = order.paymentMethod === "CREDIT_CARD" || order.paymentMethod === "iyzico";
      
      if (isCardPayment && IYZICO_ENABLED && orderData.iyzicoPaymentId) {
        const clientIp = normalizeIyzicoIp(
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip")
        );
        const orderTotal = Number(order.total);

        try {
          // Try Cancel first (same day)
          console.log(`🚫 iyzico Cancel başlatılıyor: ${order.orderNumber}`);
          iyzicoResult = await createCancel({
            conversationId: orderData.iyzicoConversationId || order.orderNumber,
            paymentId: orderData.iyzicoPaymentId,
            ip: clientIp,
          });

          if (iyzicoResult.status !== "success") {
            // Cancel failed, try Refund
            console.log(`🔄 Cancel başarısız, Refund deneniyor...`);
            if (orderData.iyzicoPaymentTransactions && Array.isArray(orderData.iyzicoPaymentTransactions)) {
              for (const tx of orderData.iyzicoPaymentTransactions) {
                const refundPrice = normalizeRefundPrice(tx.paidPrice ?? tx.price, orderTotal);
                if (!refundPrice) continue;
                
                const refundResult = await createRefund({
                  conversationId: orderData.iyzicoConversationId || order.orderNumber,
                  paymentTransactionId: tx.paymentTransactionId,
                  price: refundPrice.toFixed(2),
                  ip: clientIp,
                });
                
                if (refundResult.status === "success") {
                  console.log(`✅ iyzico Refund başarılı: ${tx.paymentTransactionId}`);
                  iyzicoResult = refundResult;
                }
              }
            }
          } else {
            console.log(`✅ iyzico Cancel başarılı: ${order.orderNumber}`);
          }
        } catch (iyzicoError) {
          console.error(`❌ iyzico işlem hatası:`, iyzicoError);
        }
      }

      // 3. Update order status - fetch fresh order to get statusHistory
      const freshOrder = await prisma.order.findUnique({
        where: { id: order.id },
        select: { statusHistory: true },
      });
      
      const existingHistory = Array.isArray(freshOrder?.statusHistory) ? freshOrder.statusHistory : [];
      const updatedHistory = [
        ...existingHistory,
        {
          status: "CANCELLED",
          date: now.toISOString(),
          previousStatus: order.status,
          note: `Admin tarafından iptal talebi onaylandı${adminNote ? `: ${adminNote}` : ''}`,
        },
      ];
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: isCardPayment ? "REFUNDED" : order.paymentStatus,
          cancelledAt: now,
          statusHistory: updatedHistory,
        },
      });

      // 4. Update cancellation request
      await prisma.cancellationRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(`✅ Cancellation request approved for order ${order.orderNumber}`);

      // 5. Send approval email
      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/cancellation-approved`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              total: `₺${Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
              paymentMethod: isCardPayment ? "card" : "bank",
              adminNote,
            }),
          });
          console.log(`📧 Cancellation approved email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("orders");
      revalidateTag("cancellation-requests");

      return NextResponse.json({
        success: true,
        message: "İptal talebi onaylandı",
        iyzicoResult: iyzicoResult ? {
          status: iyzicoResult.status,
          errorMessage: iyzicoResult.errorMessage,
        } : null,
      });
    } else {
      // Reject the request
      await prisma.cancellationRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(`❌ Cancellation request rejected for order ${order.orderNumber}`);

      // Send rejection email
      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/cancellation-rejected`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              reason: adminNote,
            }),
          });
          console.log(`📧 Cancellation rejected email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("cancellation-requests");

      return NextResponse.json({
        success: true,
        message: "İptal talebi reddedildi",
      });
    }
  } catch (error) {
    console.error("❌ [CANCELLATION REQUEST] PATCH error:", error);
    return NextResponse.json(
      { error: "İptal talebi işlenemedi" },
      { status: 500 }
    );
  }
}
