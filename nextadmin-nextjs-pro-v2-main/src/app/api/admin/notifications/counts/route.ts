import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

/**
 * GET /api/admin/notifications/counts
 * Returns badge counts for sidebar navigation
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parallel queries for better performance
    const [
      pendingOrders,
      pendingCancellations,
      pendingReturns,
      unreadContacts,
      pendingServiceForms,
      pendingReviews,
    ] = await Promise.all([
      // New orders (PENDING or PROCESSING with PAID payment)
      prisma.order.count({
        where: {
          OR: [
            { status: "PENDING" },
            { 
              status: "PROCESSING",
              paymentStatus: "PAID"
            }
          ]
        }
      }),
      
      // Pending cancellation requests
      prisma.cancellationRequest.count({
        where: {
          status: "PENDING_ADMIN_APPROVAL"
        }
      }),
      
      // Aksiyon bekleyen iade talepleri.
      //
      // İki aşamalı akışta admin'in eli iki noktada gerekiyor: yeni talep
      // (onay bekliyor) ve teslim alınmış koli (inceleme + para iadesi bekliyor).
      // APPROVED bilinçli olarak sayılmıyor — orada top müşteride, kargoya
      // vermesini bekliyoruz. RECEIVED sayılmazsa incelemede bekleyen iade
      // rozette hiç görünmez ve 14 günlük yasal ödeme süresi sessizce geçer.
      prisma.returnRequest.count({
        where: {
          status: { in: ["PENDING_ADMIN_APPROVAL", "RECEIVED"] }
        }
      }),
      
      // Unread contact messages
      prisma.contactMessage.count({
        where: {
          status: "UNREAD"
        }
      }),

      // Pending service form messages
      (prisma as any).serviceFormMessage
        ? (prisma as any).serviceFormMessage.count({ where: { status: "PENDING" } })
        : Promise.resolve(0),

      // Onay bekleyen yorumlar
      prisma.review.count({
        where: {
          isApproved: false
        }
      }),
    ]);

    return NextResponse.json({
      orders: pendingOrders,
      cancellations: pendingCancellations,
      returns: pendingReturns,
      contacts: unreadContacts,
      serviceForms: pendingServiceForms,
      reviews: pendingReviews,
      total: pendingOrders + pendingCancellations + pendingReturns + unreadContacts + pendingServiceForms + pendingReviews,
    });
  } catch (error) {
    console.error("Badge counts API Error:", error);
    return NextResponse.json(
      { error: "Badge sayıları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
