/**
 * Admin Orders Bulk API
 * POST /api/admin/orders/bulk - Bulk update orders
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// Valid status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * POST /api/admin/orders/bulk
 * Bulk update multiple orders at once
 * 
 * Body:
 * {
 *   orderIds: string[],
 *   action: "updateStatus" | "updatePaymentStatus" | "delete",
 *   status?: OrderStatus,
 *   paymentStatus?: PaymentStatus,
 *   trackingNumber?: string,
 *   carrierName?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }
    
    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    const body = await request.json();
    const { orderIds, action, status, paymentStatus, trackingNumber, carrierName } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Sipariş ID'leri gerekli" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "İşlem türü belirtilmeli" },
        { status: 400 }
      );
    }

    const results: { success: string[]; failed: { id: string; reason: string }[] } = {
      success: [],
      failed: [],
    };

    const now = new Date();

    // Fetch all orders at once
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { items: true },
    });

    // Create a map for quick lookup
    const orderMap = new Map(orders.map(o => [o.id, o]));

    for (const orderId of orderIds) {
      const order = orderMap.get(orderId);

      if (!order) {
        results.failed.push({ id: orderId, reason: "Sipariş bulunamadı" });
        continue;
      }

      try {
        switch (action) {
          case "updateStatus": {
            if (!status) {
              results.failed.push({ id: orderId, reason: "Durum belirtilmedi" });
              continue;
            }

            // Check valid transition
            const validTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
            if (!validTransitions.includes(status) && status !== order.status) {
              results.failed.push({
                id: orderId,
                reason: `${order.status} -> ${status} geçişi geçersiz`,
              });
              continue;
            }

            const updateData: any = { status };

            // Set timestamp
            switch (status) {
              case "PROCESSING":
                updateData.preparingAt = now;
                if (!order.confirmedAt) updateData.confirmedAt = now;
                break;
              case "SHIPPED":
                updateData.shippedAt = now;
                if (trackingNumber) updateData.trackingNumber = trackingNumber;
                if (carrierName) updateData.carrierName = carrierName;
                break;
              case "DELIVERED":
                updateData.deliveredAt = now;
                break;
              case "CANCELLED":
                updateData.cancelledAt = now;
                break;
              case "REFUNDED":
                updateData.refundedAt = now;
                break;
            }

            // Add to history
            const history = (order.statusHistory as any[]) || [];
            history.push({
              status,
              date: now.toISOString(),
              previousStatus: order.status,
              bulk: true,
            });
            updateData.statusHistory = history;

            // Handle stock restoration
            if (status === "CANCELLED" || status === "REFUNDED") {
              if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
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
              }
            }

            await prisma.order.update({
              where: { id: orderId },
              data: updateData,
            });

            results.success.push(orderId);
            break;
          }

          case "updatePaymentStatus": {
            if (!paymentStatus) {
              results.failed.push({ id: orderId, reason: "Ödeme durumu belirtilmedi" });
              continue;
            }

            const updateData: any = { paymentStatus };
            
            if (paymentStatus === "PAID" && !order.paidAt) {
              updateData.paidAt = now;
            }

            await prisma.order.update({
              where: { id: orderId },
              data: updateData,
            });

            results.success.push(orderId);
            break;
          }

          case "delete": {
            // Restore stock before deletion
            if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
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
            }

            await prisma.order.delete({
              where: { id: orderId },
            });

            results.success.push(orderId);
            break;
          }

          default:
            results.failed.push({ id: orderId, reason: "Geçersiz işlem türü" });
        }
      } catch (err: any) {
        results.failed.push({ id: orderId, reason: err.message || "Bilinmeyen hata" });
      }
    }

    console.log(`✅ Bulk order operation: ${action}, success: ${results.success.length}, failed: ${results.failed.length}`);

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      action,
      total: orderIds.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results,
    });
  } catch (error) {
    console.error("❌ [ORDERS BULK API] Error:", error);
    return NextResponse.json(
      { error: "Toplu işlem başarısız" },
      { status: 500 }
    );
  }
}
