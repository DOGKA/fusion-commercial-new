/**
 * Admin Orders API - Single Order Operations
 * GET /api/admin/orders/[id] - Get order details
 * PUT /api/admin/orders/[id] - Update order (full update)
 * PATCH /api/admin/orders/[id] - Partial update (status, payment, etc.)
 * DELETE /api/admin/orders/[id] - Cancel/Delete order
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { 
  sendOrderStatusEmail, 
  sendPaymentConfirmedEmail 
} from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔒 Yetkilendirme kontrolü helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  
  return { authorized: true, session };
}

// Order status Türkçe karşılıkları
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

/**
 * GET /api/admin/orders/[id]
 * Get detailed order information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                images: true,
                sku: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("❌ [ORDERS API] Get error:", error);
    return NextResponse.json(
      { error: "Sipariş bilgisi alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/orders/[id]
 * Full order update
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if order exists
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    const {
      status,
      paymentStatus,
      trackingNumber,
      carrierName,
      adminNote,
      invoiceUrl,
    } = body;

    // Prepare update data
    const updateData: any = {};

    // Status update with timestamp
    if (status && status !== existing.status) {
      updateData.status = status;
      
      // Set appropriate timestamp based on status
      const now = new Date();
      switch (status) {
        case "PROCESSING":
          updateData.preparingAt = now;
          updateData.confirmedAt = now;
          break;
        case "SHIPPED":
          updateData.shippedAt = now;
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

      // Add to status history
      const history = Array.isArray(existing.statusHistory) ? [...existing.statusHistory] : [];
      history.push({
        status,
        date: now.toISOString(),
        previousStatus: existing.status,
        note: body.statusNote || null,
      });
      updateData.statusHistory = history;
    }

    // Payment status update
    if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      
      if (paymentStatus === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    // Other fields
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (carrierName !== undefined) updateData.carrierName = carrierName;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (invoiceUrl !== undefined) {
      updateData.invoiceUrl = invoiceUrl;
      updateData.invoiceUploadedAt = invoiceUrl ? new Date() : null;
    }

    // Handle stock restoration for cancellation/refund
    if (status === "CANCELLED" || status === "REFUNDED") {
      if (existing.status !== "CANCELLED" && existing.status !== "REFUNDED") {
        // Restore stock for each item
        for (const item of existing.items) {
          const variantInfo = item.variantInfo ? JSON.parse(item.variantInfo) : null;
          
          if (variantInfo?.id) {
            // Restore variant stock
            await prisma.productVariant.update({
              where: { id: variantInfo.id },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            // Restore main product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        console.log(`✅ Stock restored for order ${existing.orderNumber}`);
      }
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Order updated: ${order.orderNumber} -> ${status || 'fields updated'}`);

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      order,
      message: `Sipariş başarıyla güncellendi`,
    });
  } catch (error) {
    console.error("❌ [ORDERS API] Update error:", error);
    return NextResponse.json(
      { error: "Sipariş güncellenemedi" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Quick status update (from table dropdown)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if order exists
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    const now = new Date();

    // Handle status change
    if (body.status && body.status !== existing.status) {
      updateData.status = body.status;

      // Set timestamp
      switch (body.status) {
        case "PROCESSING":
          updateData.preparingAt = now;
          if (!existing.confirmedAt) updateData.confirmedAt = now;
          break;
        case "SHIPPED":
          updateData.shippedAt = now;
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
      const history = Array.isArray(existing.statusHistory) ? [...existing.statusHistory] : [];
      history.push({
        status: body.status,
        date: now.toISOString(),
        previousStatus: existing.status,
      });
      updateData.statusHistory = history;

      // Handle stock restoration
      if (body.status === "CANCELLED" || body.status === "REFUNDED") {
        if (existing.status !== "CANCELLED" && existing.status !== "REFUNDED") {
          for (const item of existing.items) {
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
          console.log(`✅ Stock restored for order ${existing.orderNumber}`);
        }
      }
    }

    // Handle payment status change
    if (body.paymentStatus && body.paymentStatus !== existing.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
      
      if (body.paymentStatus === "PAID" && !existing.paidAt) {
        updateData.paidAt = now;
      }
    }

    // Handle tracking number
    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }

    // Handle carrier name
    if (body.carrierName !== undefined) {
      updateData.carrierName = body.carrierName;
    }

    // Handle admin note
    if (body.adminNote !== undefined) {
      updateData.adminNote = body.adminNote;
    }

    // Update order with user info for email
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        billingAddress: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`✅ Order patched: ${order.orderNumber}`);

    // Send email notification if status changed
    if (body.status && body.status !== existing.status) {
      const customerEmail = order.user?.email || (order.billingAddress as any)?.email;
      const customerName = order.user?.name || 
        (order.billingAddress ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}` : undefined);
      
      if (customerEmail) {
        // Send status update email (async, don't wait)
        sendOrderStatusEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          status: body.status,
          customerName,
          trackingNumber: order.trackingNumber || undefined,
          carrierName: order.carrierName || undefined,
        }).catch(err => console.error("Email send error:", err));
        
        console.log(`📧 Status email queued for ${customerEmail}`);
      }
    }

    // Send payment confirmed email
    if (body.paymentStatus === "PAID" && existing.paymentStatus !== "PAID") {
      const customerEmail = order.user?.email || (order.billingAddress as any)?.email;
      const customerName = order.user?.name || 
        (order.billingAddress ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}` : undefined);
      
      if (customerEmail) {
        sendPaymentConfirmedEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          customerName,
          total: Number(order.total),
        }).catch(err => console.error("Email send error:", err));
        
        console.log(`📧 Payment confirmed email queued for ${customerEmail}`);
      }
    }

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      order,
      statusLabel: STATUS_LABELS[order.status] || order.status,
      paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus,
    });
  } catch (error) {
    console.error("❌ [ORDERS API] Patch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: "Sipariş güncellenemedi", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Delete order (admin only, usually for test orders)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Restore stock before deletion if not already cancelled/refunded
    if (existing.status !== "CANCELLED" && existing.status !== "REFUNDED") {
      for (const item of existing.items) {
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
      console.log(`✅ Stock restored before deletion for order ${existing.orderNumber}`);
    }

    // Delete order (items will cascade)
    await prisma.order.delete({
      where: { id },
    });

    console.log(`✅ Order deleted: ${existing.orderNumber}`);

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      message: `Sipariş ${existing.orderNumber} silindi`,
    });
  } catch (error) {
    console.error("❌ [ORDERS API] Delete error:", error);
    return NextResponse.json(
      { error: "Sipariş silinemedi" },
      { status: 500 }
    );
  }
}
