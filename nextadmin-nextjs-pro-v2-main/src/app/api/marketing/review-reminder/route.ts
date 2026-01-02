/**
 * Review Reminder Marketing API
 * GET - List delivered orders for review reminders
 * POST - Send review reminder email
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

// Email gönderme fonksiyonu (frontend API'sine istek atar)
async function sendReviewReminderToOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3003";
    const cronSecret = process.env.CRON_SECRET || "";
    
    const res = await fetch(`${frontendUrl}/api/email/review-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ orderId }),
    });
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error sending review reminder:", error);
    return { success: false, error: "E-posta gönderilemedi" };
  }
}

// GET - List delivered orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // 7 gün önce (ready threshold)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Base where - tüm teslim edilen siparişler
    const baseWhere = {
      status: "DELIVERED" as const,
      deliveredAt: { not: null },
    };

    // Filter specific where
    let filterWhere = {};
    if (filter === "pending") {
      filterWhere = { reviewReminderSent: false };
    } else if (filter === "sent") {
      filterWhere = { reviewReminderSent: true };
    } else if (filter === "ready") {
      filterWhere = { 
        reviewReminderSent: false,
        deliveredAt: { lte: sevenDaysAgo },
      };
    }

    // Fetch orders with items and reviews
    const orders = await prisma.order.findMany({
      where: { ...baseWhere, ...filterWhere },
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
                id: true,
                name: true,
                thumbnail: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { deliveredAt: "desc" },
      take: 200,
    });

    // Check which products have reviews
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const itemsWithReviewStatus = await Promise.all(
          order.items.map(async (item) => {
            const review = await prisma.review.findFirst({
              where: {
                userId: order.userId,
                productId: item.productId,
              },
              select: { id: true },
            });
            return {
              ...item,
              hasReview: !!review,
            };
          })
        );

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          deliveredAt: order.deliveredAt,
          reviewReminderSent: order.reviewReminderSent,
          user: order.user,
          items: itemsWithReviewStatus,
        };
      })
    );

    // Calculate stats
    const allDelivered = await prisma.order.count({
      where: { status: "DELIVERED", deliveredAt: { not: null } },
    });
    const pendingCount = await prisma.order.count({
      where: { ...baseWhere, reviewReminderSent: false },
    });
    const sentCount = await prisma.order.count({
      where: { ...baseWhere, reviewReminderSent: true },
    });
    const readyCount = await prisma.order.count({
      where: { 
        ...baseWhere, 
        reviewReminderSent: false,
        deliveredAt: { lte: sevenDaysAgo },
      },
    });

    // Count orders where all products have reviews
    let reviewedCount = 0;
    for (const order of ordersWithReviewStatus) {
      const allReviewed = order.items.every((item) => item.hasReview);
      if (allReviewed) reviewedCount++;
    }

    return NextResponse.json({
      orders: ordersWithReviewStatus,
      stats: {
        total: allDelivered,
        pending: pendingCount,
        sent: sentCount,
        reviewed: reviewedCount,
        ready: readyCount,
      },
    });
  } catch (error) {
    console.error("Error fetching review reminder data:", error);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}

// POST - Send review reminder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Single order - hemen gönder (7 gün kontrolü yapmadan)
    if (body.orderId) {
      const result = await sendReviewReminderToOrder(body.orderId);
      return NextResponse.json(result);
    }

    // Send all ready (7+ gün geçmiş olanlar)
    if (body.sendAll) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const pendingOrders = await prisma.order.findMany({
        where: {
          status: "DELIVERED",
          reviewReminderSent: false,
          deliveredAt: { lte: sevenDaysAgo },
        },
        select: { id: true },
        take: 50,
      });

      let sent = 0;
      let failed = 0;
      let skipped = 0;

      for (const order of pendingOrders) {
        const result = await sendReviewReminderToOrder(order.id);
        if (result.success) {
          sent++;
        } else if (result.error?.includes("zaten") || result.error?.includes("değerlendirilmiş")) {
          skipped++;
        } else {
          failed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return NextResponse.json({
        success: true,
        sent,
        failed,
        skipped,
      });
    }

    return NextResponse.json({ error: "orderId veya sendAll gerekli" }, { status: 400 });
  } catch (error) {
    console.error("Error sending review reminder:", error);
    return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
  }
}
