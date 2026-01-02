/**
 * Review Reminder Email API
 * POST /api/email/review-reminder - Send review reminder email
 * 
 * Called manually or via cron job to remind users to review products
 * 7 days after delivery
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendReviewReminderEmail } from "@/lib/email";

// API Key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Optional: API key authentication for cron jobs
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Option 1: Send to specific order
    if (body.orderId) {
      const result = await sendReminderForOrder(body.orderId);
      return NextResponse.json(result);
    }

    // Option 2: Send to all eligible orders (cron job)
    if (body.sendAll) {
      const results = await sendPendingReminders();
      return NextResponse.json({
        success: true,
        sent: results.sent,
        failed: results.failed,
        skipped: results.skipped,
      });
    }

    return NextResponse.json(
      { error: "orderId veya sendAll parametresi gerekli" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ [REVIEW REMINDER EMAIL] Error:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500 }
    );
  }
}

/**
 * Send reminder for a specific order
 */
async function sendReminderForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
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
  });

  if (!order) {
    return { success: false, error: "Sipariş bulunamadı" };
  }

  if (order.status !== "DELIVERED") {
    return { success: false, error: "Sipariş henüz teslim edilmedi" };
  }

  if (!order.user?.email) {
    return { success: false, error: "Kullanıcı e-postası bulunamadı" };
  }

  // Check if reminder already sent
  if (order.reviewReminderSent) {
    return { success: false, error: "Hatırlatma zaten gönderildi" };
  }

  // Get products that haven't been reviewed yet
  const reviewedProductIds = await prisma.review.findMany({
    where: {
      userId: order.userId,
      productId: { in: order.items.map(item => item.productId) },
    },
    select: { productId: true },
  });

  const reviewedIds = new Set(reviewedProductIds.map(r => r.productId));
  const productsToReview = order.items
    .filter(item => !reviewedIds.has(item.productId))
    .map(item => ({
      id: item.product.id,
      name: item.product.name,
      thumbnail: item.product.thumbnail || undefined,
      slug: item.product.slug,
    }));

  if (productsToReview.length === 0) {
    return { success: false, error: "Tüm ürünler zaten değerlendirilmiş" };
  }

  // Send email
  const result = await sendReviewReminderEmail(order.user.email, {
    name: order.user.name || undefined,
    orderNumber: order.orderNumber,
    orderId: order.id,
    userId: order.userId,
    deliveryDate: order.deliveredAt || order.updatedAt,
    products: productsToReview,
  });

  if (result.success) {
    // Mark reminder as sent
    await prisma.order.update({
      where: { id: orderId },
      data: { reviewReminderSent: true },
    });
  }

  return result;
}

/**
 * Send reminders for all eligible orders
 * Eligibility: Delivered 7+ days ago, reminder not sent, has unreviewd products
 */
async function sendPendingReminders() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find all eligible orders
  const orders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      reviewReminderSent: false,
      deliveredAt: { lte: sevenDaysAgo },
      user: { email: { not: null } },
    },
    include: {
      user: { select: { email: true, name: true } },
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
    take: 50, // Process in batches
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const order of orders) {
    if (!order.user?.email) {
      skipped++;
      continue;
    }

    // Check for unreviewed products
    const reviewedProductIds = await prisma.review.findMany({
      where: {
        userId: order.userId,
        productId: { in: order.items.map(item => item.productId) },
      },
      select: { productId: true },
    });

    const reviewedIds = new Set(reviewedProductIds.map(r => r.productId));
    const productsToReview = order.items
      .filter(item => !reviewedIds.has(item.productId))
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        thumbnail: item.product.thumbnail || undefined,
        slug: item.product.slug,
      }));

    if (productsToReview.length === 0) {
      // All products already reviewed, mark as sent
      await prisma.order.update({
        where: { id: order.id },
        data: { reviewReminderSent: true },
      });
      skipped++;
      continue;
    }

    // Send email
    const result = await sendReviewReminderEmail(order.user.email, {
      name: order.user.name || undefined,
      orderNumber: order.orderNumber,
      orderId: order.id,
      userId: order.userId,
      deliveryDate: order.deliveredAt || order.updatedAt,
      products: productsToReview,
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { reviewReminderSent: true },
      });
      sent++;
    } else {
      failed++;
    }

    // Rate limit: wait 100ms between emails
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`📧 Review Reminders: ${sent} sent, ${failed} failed, ${skipped} skipped`);

  return { sent, failed, skipped };
}

