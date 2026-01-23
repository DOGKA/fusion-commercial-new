/**
 * Admin Return Request API - Single Request Operations
 * GET /api/admin/return-requests/[id] - Get request details
 * PATCH /api/admin/return-requests/[id] - Approve/Reject request
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { createRefund, IYZICO_ENABLED } from "@/lib/iyzico";
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

// Reason labels
const REASON_LABELS: Record<string, string> = {
  DAMAGED: "Ürün Hasarlı Geldi",
  WRONG_PRODUCT: "Ürün Yanlış Gönderildi",
  SPECS_MISMATCH: "Teknik Özellikler Siparişimle Uyuşmamaktadır",
};

/**
 * GET /api/admin/return-requests/[id]
 * Get return request details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const returnRequest = await prisma.returnRequest.findUnique({
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

    if (!returnRequest) {
      return NextResponse.json(
        { error: "İade talebi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...returnRequest,
      reasonLabel: REASON_LABELS[returnRequest.reason] || returnRequest.reason,
    });
  } catch (error) {
    console.error("❌ [RETURN REQUEST] GET error:", error);
    return NextResponse.json(
      { error: "İade talebi alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/return-requests/[id]
 * Approve or Reject a return request
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminNote, returnAddress, returnInstructions } = body; // action: "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Geçersiz işlem. 'approve' veya 'reject' olmalı." },
        { status: 400 }
      );
    }

    // Validate return address for approval
    if (action === "approve" && !returnAddress?.trim()) {
      return NextResponse.json(
        { error: "İade adresi zorunludur" },
        { status: 400 }
      );
    }

    // Get the return request with order and user
    const returnRequest = await prisma.returnRequest.findUnique({
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

    if (!returnRequest) {
      return NextResponse.json(
        { error: "İade talebi bulunamadı" },
        { status: 404 }
      );
    }

    if (returnRequest.status !== "PENDING_ADMIN_APPROVAL") {
      return NextResponse.json(
        { error: "Bu talep zaten işlenmiş" },
        { status: 400 }
      );
    }

    const order = returnRequest.order;
    const now = new Date();
    let iyzicoResult: any = null;

    if (action === "approve") {
      // Process return approval
      
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
          // Use Refund API (for returns, payment is already settled)
          if (orderData.iyzicoPaymentTransactions && Array.isArray(orderData.iyzicoPaymentTransactions)) {
            console.log(`💸 iyzico Refund başlatılıyor: ${order.orderNumber}`);
            for (const tx of orderData.iyzicoPaymentTransactions) {
              const refundPrice = normalizeRefundPrice(tx.paidPrice ?? tx.price, orderTotal);
              if (!refundPrice) continue;
              
              iyzicoResult = await createRefund({
                conversationId: orderData.iyzicoConversationId || order.orderNumber,
                paymentTransactionId: tx.paymentTransactionId,
                price: refundPrice.toFixed(2),
                ip: clientIp,
              });
              
              if (iyzicoResult.status === "success") {
                console.log(`✅ iyzico Refund başarılı: ${tx.paymentTransactionId}`);
              } else {
                console.error(`❌ iyzico Refund başarısız: ${iyzicoResult.errorMessage}`);
              }
            }
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
          status: "REFUNDED",
          date: now.toISOString(),
          previousStatus: order.status,
          note: `Admin tarafından iade talebi onaylandı${adminNote ? `: ${adminNote}` : ''}`,
        },
      ];
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: isCardPayment ? "REFUNDED" : order.paymentStatus,
          refundedAt: now,
          statusHistory: updatedHistory,
        },
      });

      // 4. Update return request with address and instructions
      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          returnAddress: returnAddress?.trim(),
          returnInstructions: returnInstructions?.trim() || null,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(`✅ Return request approved for order ${order.orderNumber}`);

      // 5. Send approval email
      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/return-approved`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              total: `₺${Number(order.total).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
              returnAddress: returnAddress?.trim(),
              returnInstructions: returnInstructions?.trim(),
              adminNote,
            }),
          });
          console.log(`📧 Return approved email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("orders");
      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "İade talebi onaylandı",
        iyzicoResult: iyzicoResult ? {
          status: iyzicoResult.status,
          errorMessage: iyzicoResult.errorMessage,
        } : null,
      });
    } else {
      // Reject the request
      await prisma.returnRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote,
          reviewedBy: auth.userId,
          reviewedAt: now,
        },
      });

      console.log(`❌ Return request rejected for order ${order.orderNumber}`);

      // Send rejection email
      if (order.user?.email) {
        try {
          const emailApiUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com";
          await fetch(`${emailApiUrl}/api/email/return-rejected`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.user.email,
              orderNumber: order.orderNumber,
              name: order.user.name,
              reason: adminNote,
            }),
          });
          console.log(`📧 Return rejected email sent to ${order.user.email}`);
        } catch (emailError) {
          console.error(`❌ Email send error:`, emailError);
        }
      }

      revalidateTag("return-requests");

      return NextResponse.json({
        success: true,
        message: "İade talebi reddedildi",
      });
    }
  } catch (error) {
    console.error("❌ [RETURN REQUEST] PATCH error:", error);
    return NextResponse.json(
      { error: "İade talebi işlenemedi" },
      { status: 500 }
    );
  }
}
