/**
 * Admin Abandoned Carts API
 * GET /api/admin/marketing/abandoned-carts - Get abandoned carts (7+ days inactive)
 * POST /api/admin/marketing/abandoned-carts - Send reminder to specific cart (with optional coupon)
 * 
 * Cart model includes: lastReminderSentAt, reminderCount (added to schema)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export const dynamic = "force-dynamic";

// Abandoned cart threshold - 7 days (sepet bu kadar gün güncellenmezse terkedilmiş sayılır)
const ABANDONED_DAYS = 7;

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const filter = searchParams.get("filter") || "all"; // all, not_sent, sent

    // Calculate threshold date (7 days ago)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - ABANDONED_DAYS);

    // Build where clause - use any to bypass TS cache issues
    const baseWhere: any = {
      updatedAt: { lt: thresholdDate },
      items: { some: {} },
      user: {
        orders: {
          none: {
            createdAt: { gte: thresholdDate },
          },
        },
      },
    };

    // Apply reminder filter
    if (filter === "not_sent") {
      baseWhere.lastReminderSentAt = null;
    } else if (filter === "sent") {
      baseWhere.lastReminderSentAt = { not: null };
    }

    // Fetch abandoned carts with items and user info
    const [carts, totalCount] = await Promise.all([
      prisma.cart.findMany({
        where: baseWhere,
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
                  price: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cart.count({ where: baseWhere }),
    ]);

    // Calculate stats
    const statsBaseWhere: any = {
      updatedAt: { lt: thresholdDate },
      items: { some: {} },
    };

    const [
      totalAbandonedCarts,
      totalRemindersSent,
      totalNotSent,
    ] = await Promise.all([
      prisma.cart.count({ where: statsBaseWhere }),
      prisma.cart.count({
        where: { ...statsBaseWhere, lastReminderSentAt: { not: null } } as any,
      }),
      prisma.cart.count({
        where: { ...statsBaseWhere, lastReminderSentAt: null } as any,
      }),
    ]);

    // Transform data
    const abandonedCarts = carts.map((cart: any) => {
      const total = cart.items.reduce((sum: number, item: any) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);

      return {
        id: cart.id,
        userId: cart.userId,
        customerName: cart.user.name || "İsimsiz Müşteri",
        email: cart.user.email || "",
        items: cart.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: Number(item.product.price),
          quantity: item.quantity,
          thumbnail: item.product.thumbnail,
        })),
        total,
        abandonedAt: cart.updatedAt,
        lastReminderSentAt: cart.lastReminderSentAt,
        reminderCount: cart.reminderCount || 0,
        reminderSent: !!cart.lastReminderSentAt,
      };
    });

    // Calculate total potential loss
    const totalPotentialLoss = abandonedCarts.reduce((sum: number, cart: any) => sum + cart.total, 0);

    return NextResponse.json({
      carts: abandonedCarts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalAbandonedCarts,
        totalRemindersSent,
        totalNotSent,
        totalPotentialLoss,
        thresholdDays: ABANDONED_DAYS,
      },
    });
  } catch (error) {
    console.error("❌ [ABANDONED CARTS API] Error:", error);
    return NextResponse.json(
      { error: "Terk edilmiş sepetler alınamadı" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { cartId, couponId } = body;

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID gerekli" }, { status: 400 });
    }

    // Get cart with user and items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
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
    });

    if (!cart) {
      return NextResponse.json({ error: "Sepet bulunamadı" }, { status: 404 });
    }

    if (!cart.user.email) {
      return NextResponse.json({ error: "Kullanıcının e-posta adresi yok" }, { status: 400 });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Get coupon if provided
    let couponData = undefined;
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (coupon && coupon.isActive) {
        couponData = {
          code: coupon.code,
          discountType: coupon.discountType as "PERCENTAGE" | "FIXED",
          discountValue: Number(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
          expiryDate: coupon.endDate 
            ? new Date(coupon.endDate).toLocaleDateString("tr-TR")
            : undefined,
        };
      }
    }

    // Send reminder email
    const emailApiUrl = process.env.FRONTEND_URL || "http://localhost:3003";
    
    const emailResponse = await fetch(`${emailApiUrl}/api/email/cart-reminder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: cart.user.email,
        name: cart.user.name,
        items: cart.items.map((item) => ({
          name: item.product.name,
          price: Number(item.product.price),
          quantity: item.quantity,
        })),
        total,
        coupon: couponData,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      console.error("❌ Email send error:", errorData);
      return NextResponse.json(
        { error: "E-posta gönderilemedi" },
        { status: 500 }
      );
    }

    // Update cart reminder tracking
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        lastReminderSentAt: new Date(),
        reminderCount: { increment: 1 },
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: couponData 
        ? `Hatırlatma e-postası kupon (${couponData.code}) ile gönderildi`
        : "Hatırlatma e-postası gönderildi",
      email: cart.user.email,
      couponApplied: !!couponData,
    });
  } catch (error) {
    console.error("❌ [ABANDONED CARTS API] Send reminder error:", error);
    return NextResponse.json(
      { error: "Hatırlatma gönderilemedi" },
      { status: 500 }
    );
  }
}
