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

    // Get order with user info
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    // Check authorization
    // - If no session, allow access (order number in URL is the auth token - for order confirmation page)
    // - If session exists but user doesn't own the order, deny access (unless admin)
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      const isOwner = session.user.id === order.userId;
      const isAdmin = session.user.role === "ADMIN";
      
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 403 });
      }
    }
    // If no session, allow access - order number is the secret token (received via redirect/email)

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

    // Get addresses - first try from Address table, then from statusHistory snapshot
    let billingAddr = order.billingAddressId 
      ? await prisma.address.findUnique({ where: { id: order.billingAddressId } })
      : null;
    let shippingAddr = order.shippingAddressId 
      ? await prisma.address.findUnique({ where: { id: order.shippingAddressId } })
      : null;

    // If no address found in Address table, check statusHistory for snapshot
    if (!billingAddr && order.statusHistory) {
      const statusHistory = order.statusHistory as Array<{
        type?: string;
        addresses?: {
          billingAddress?: {
            fullName?: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
            city?: string;
            district?: string;
            postalCode?: string;
            addressLine1?: string;
            address?: string;
          };
          shippingAddress?: {
            fullName?: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
            city?: string;
            district?: string;
            postalCode?: string;
            addressLine1?: string;
            address?: string;
          };
        };
      }>;
      
      const addressSnapshot = statusHistory.find(entry => entry.type === "ADDRESS_SNAPSHOT");
      if (addressSnapshot?.addresses) {
        const snapshot = addressSnapshot.addresses;
        if (snapshot.billingAddress) {
          billingAddr = {
            id: "snapshot",
            userId: order.userId,
            title: "Sipariş Adresi",
            firstName: snapshot.billingAddress.firstName || "",
            lastName: snapshot.billingAddress.lastName || "",
            phone: snapshot.billingAddress.phone || "",
            city: snapshot.billingAddress.city || "",
            district: snapshot.billingAddress.district || "",
            postalCode: snapshot.billingAddress.postalCode || "",
            addressLine1: snapshot.billingAddress.addressLine1 || snapshot.billingAddress.address || "",
            addressLine2: null,
            address: snapshot.billingAddress.address || snapshot.billingAddress.addressLine1 || "",
            country: "Türkiye",
            type: "BILLING",
            isDefault: false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          } as unknown as typeof billingAddr;
        }
        if (snapshot.shippingAddress && !shippingAddr) {
          shippingAddr = {
            id: "snapshot",
            userId: order.userId,
            title: "Teslimat Adresi",
            firstName: snapshot.shippingAddress.firstName || "",
            lastName: snapshot.shippingAddress.lastName || "",
            phone: snapshot.shippingAddress.phone || "",
            city: snapshot.shippingAddress.city || "",
            district: snapshot.shippingAddress.district || "",
            postalCode: snapshot.shippingAddress.postalCode || "",
            addressLine1: snapshot.shippingAddress.addressLine1 || snapshot.shippingAddress.address || "",
            addressLine2: null,
            address: snapshot.shippingAddress.address || snapshot.shippingAddress.addressLine1 || "",
            country: "Türkiye",
            type: "SHIPPING",
            isDefault: false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          } as unknown as typeof shippingAddr;
        }
      }
    }

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
        email: order.user?.email || "",
        phone: billingAddr.phone || order.user?.phone || "",
        addressLine1: billingAddr.addressLine1 || "",
        city: billingAddr.city || "",
        district: billingAddr.district || "",
        postalCode: billingAddr.postalCode || "",
      } : order.user ? {
        // No saved address, use user info
        firstName: order.user.name?.split(" ")[0] || "",
        lastName: order.user.name?.split(" ").slice(1).join(" ") || "",
        email: order.user.email || "",
        phone: order.user.phone || "",
        addressLine1: "",
        city: "",
        district: "",
        postalCode: "",
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
