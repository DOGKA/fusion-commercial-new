import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Son 7 günün siparişlerini al
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Düşük stoklu ürünleri al
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
        isActive: true,
      },
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    // Bildirimleri oluştur
    const notifications = [];

    // Sipariş bildirimleri
    for (const order of recentOrders) {
      const customerName = order.user?.name || order.user?.email?.split("@")[0] || "Misafir";
      
      let title = "";
      let type: "order" | "payment" = "order";
      
      if (order.status === "PENDING") {
        title = `Yeni sipariş: #${order.orderNumber}`;
      } else if (order.paymentStatus === "PAID") {
        title = `Ödeme alındı: #${order.orderNumber}`;
        type = "payment";
      } else if (order.status === "PROCESSING") {
        title = `Sipariş hazırlanıyor: #${order.orderNumber}`;
      } else {
        continue; // Diğer durumları atlat
      }

      notifications.push({
        id: `order-${order.id}`,
        type,
        title,
        subTitle: `${customerName} - ₺${order.total.toFixed(2)}`,
        link: `/orders/${order.id}`,
        createdAt: order.createdAt.toISOString(),
        read: false,
      });
    }

    // Stok uyarı bildirimleri
    for (const product of lowStockProducts) {
      notifications.push({
        id: `stock-${product.id}`,
        type: "stock" as const,
        title: `Düşük stok uyarısı`,
        subTitle: `${product.name} - ${product.stock} adet kaldı`,
        link: `/products/${product.id}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Tarihe göre sırala
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
      unreadCount: notifications.length,
    });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json(
      { error: "Bildirimler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

