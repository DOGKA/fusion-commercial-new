/**
 * Single Order API
 * GET /api/orders/[orderNumber] - Get order by order number
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    // Check authorization (if user is logged in, must be owner)
    const session = await getServerSession(authOptions);
    if (order.userId && order.userId !== "guest" && session?.user?.id !== order.userId) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 403 });
    }

    // Get order items with product info
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,  // Product modelinde 'name' kullanılıyor
            slug: true,
            images: true,
          }
        }
        // NOT: OrderItem'da variant ilişkisi yok, variantInfo string olarak saklanıyor
      }
    });

    // Get addresses
    const billingAddr = order.billingAddressId 
      ? await prisma.address.findUnique({ where: { id: order.billingAddressId } })
      : null;
    const shippingAddr = order.shippingAddressId 
      ? await prisma.address.findUnique({ where: { id: order.shippingAddressId } })
      : null;

    // Format response with real product data
    const response = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toISOString(),
      status: order.status === "DELIVERED" ? "success" : 
              order.status === "CANCELLED" ? "failed" : "pending",
      paymentStatus: order.paymentStatus === "PAID" ? "paid" : 
                     order.paymentStatus === "FAILED" ? "failed" : "pending",
      paymentMethod: order.paymentMethod === "CREDIT_CARD" ? "credit_card" : "bank_transfer",
      items: orderItems.map((item) => {
        // Get first image from product images array
        let productImage = null;
        if (item.product?.images) {
          try {
            const images = typeof item.product.images === 'string' 
              ? JSON.parse(item.product.images) 
              : item.product.images;
            if (Array.isArray(images) && images.length > 0) {
              productImage = images[0];
            }
          } catch {
            productImage = null;
          }
        }

        // Parse variant info from JSON string
        let variantData = null;
        if (item.variantInfo) {
          try {
            variantData = JSON.parse(item.variantInfo);
          } catch {
            variantData = null;
          }
        }

        return {
          id: item.id,
          productId: item.productId,
          title: item.product?.name || "Ürün",
          slug: item.product?.slug || "",
          price: Number(item.price),
          quantity: item.quantity,
          image: productImage,
          variant: variantData,
        };
      }),
      totals: {
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        discount: Number(order.discount),
        grandTotal: Number(order.total),
      },
      couponCode: order.couponCode || null,
      billingAddress: billingAddr ? {
        firstName: billingAddr.firstName || "",
        lastName: billingAddr.lastName || "",
        email: "",
        phone: billingAddr.phone || "",
        addressLine1: billingAddr.addressLine1 || "",
        city: billingAddr.city || "",
        district: billingAddr.district || "",
        postalCode: billingAddr.postalCode || "",
      } : null,
      shippingAddress: shippingAddr ? {
        firstName: shippingAddr.firstName || "",
        lastName: shippingAddr.lastName || "",
        addressLine1: shippingAddr.addressLine1 || "",
        city: shippingAddr.city || "",
        district: shippingAddr.district || "",
      } : null,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Sipariş bilgisi alınamadı" },
      { status: 500 }
    );
  }
}
