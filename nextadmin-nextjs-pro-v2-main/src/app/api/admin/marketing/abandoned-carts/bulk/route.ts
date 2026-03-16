/**
 * Admin Bulk Send Abandoned Cart Reminders
 * POST /api/admin/marketing/abandoned-carts/bulk - Send reminders to all eligible carts
 * 
 * Cart model includes: lastReminderSentAt, reminderCount (added to schema)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export const dynamic = "force-dynamic";

// Abandoned cart threshold - 7 days
const ABANDONED_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    // 🔒 Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - ABANDONED_DAYS);

    // Get all eligible carts (not sent yet or sent more than 3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Use any to bypass TypeScript cache issues with new Prisma fields
    const eligibleCarts = await prisma.cart.findMany({
      where: {
        updatedAt: { lt: thresholdDate },
        items: { some: {} },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lt: threeDaysAgo } },
        ],
        // Max 3 reminders per cart
        reminderCount: { lt: 3 },
        user: {
          email: { not: null },
          orders: {
            none: {
              createdAt: { gte: thresholdDate },
            },
          },
        },
      } as any,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      take: 50, // Limit to 50 per batch to avoid timeout
    });

    if (eligibleCarts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Gönderilecek hatırlatma bulunamadı",
        sent: 0,
        failed: 0,
      });
    }

    const emailApiUrl = process.env.FRONTEND_URL || "http://localhost:3003";
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const cart of eligibleCarts) {
      const cartData = cart as any;
      if (!cartData.user.email) {
        failed++;
        continue;
      }

      try {
        // Calculate total
        const total = cartData.items.reduce((sum: number, item: any) => {
          return sum + Number(item.product.price) * item.quantity;
        }, 0);

        // Send email
        const emailResponse = await fetch(`${emailApiUrl}/api/email/cart-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: cartData.user.email,
            name: cartData.user.name,
            items: cartData.items.map((item: any) => ({
              name: item.product.name,
              price: Number(item.product.price),
              quantity: item.quantity,
            })),
            total,
          }),
        });

        if (emailResponse.ok) {
          // Update cart
          await prisma.cart.update({
            where: { id: cart.id },
            data: {
              lastReminderSentAt: new Date(),
              reminderCount: { increment: 1 },
            } as any,
          });
          sent++;
        } else {
          failed++;
          errors.push(`${cartData.user.email}: E-posta gönderilemedi`);
        }
      } catch (error) {
        failed++;
        errors.push(`${cartData.user.email}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `${sent} hatırlatma gönderildi`,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ [BULK REMINDER API] Error:", error);
    return NextResponse.json(
      { error: "Toplu hatırlatma gönderilemedi" },
      { status: 500 }
    );
  }
}
