import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get dismissed notification IDs for this user
    let dismissedIds: Set<string> = new Set();
    try {
      const dismissed = await (prisma as any).adminDismissedNotification.findMany({
        where: { userId },
        select: { notifId: true },
      });
      dismissedIds = new Set(dismissed.map((d: any) => d.notifId));
    } catch {
      // Table may not exist yet
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Only get top 3 low stock products (reduce spam)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 5 },
        isActive: true,
      },
      take: 3,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    const notifications = [];

    // Order notifications
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
        continue;
      }

      const notifId = `order-${order.id}`;
      if (dismissedIds.has(notifId)) continue;

      notifications.push({
        id: notifId,
        type,
        title,
        subTitle: `${customerName} - ₺${order.total.toFixed(2)}`,
        link: `/orders/${order.id}`,
        createdAt: order.createdAt.toISOString(),
        read: false,
      });
    }

    // Stock notifications (max 3, not spamming)
    for (const product of lowStockProducts) {
      const notifId = `stock-${product.id}`;
      if (dismissedIds.has(notifId)) continue;

      notifications.push({
        id: notifId,
        type: "stock" as const,
        title: `Düşük stok uyarısı`,
        subTitle: `${product.name} - ${product.stock} adet kaldı`,
        link: `/products/${product.id}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Unread contact messages
    try {
      const unreadContacts = await prisma.contactMessage.findMany({
        where: {
          status: "UNREAD",
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, subject: true, createdAt: true },
      });

      for (const contact of unreadContacts) {
        const notifId = `contact-${contact.id}`;
        if (dismissedIds.has(notifId)) continue;

        notifications.push({
          id: notifId,
          type: "contact" as const,
          title: `Yeni iletişim mesajı`,
          subTitle: `${contact.name} - ${contact.subject || contact.email}`,
          link: `/contact`,
          createdAt: contact.createdAt.toISOString(),
          read: false,
        });
      }
    } catch {
      // ContactMessage table may not exist yet
    }

    // Pending service form messages
    try {
      const pendingServiceForms = await (prisma as any).serviceFormMessage.findMany({
        where: {
          status: "PENDING",
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, platform: true, createdAt: true },
      });

      for (const form of pendingServiceForms) {
        const notifId = `service-${form.id}`;
        if (dismissedIds.has(notifId)) continue;

        notifications.push({
          id: notifId,
          type: "service" as const,
          title: `Yeni servis talebi`,
          subTitle: `${form.name} - ${form.platform}`,
          link: `/service-forms`,
          createdAt: form.createdAt.toISOString(),
          read: false,
        });
      }
    } catch {
      // ServiceFormMessage table may not exist yet
    }

    // Sort by date - latest first
    notifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: notifications.slice(0, 15),
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
