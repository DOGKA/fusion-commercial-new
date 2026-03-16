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
      
      // Pending return requests
      prisma.returnRequest.count({
        where: {
          status: "PENDING_ADMIN_APPROVAL"
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
    ]);

    return NextResponse.json({
      orders: pendingOrders,
      cancellations: pendingCancellations,
      returns: pendingReturns,
      contacts: unreadContacts,
      serviceForms: pendingServiceForms,
      total: pendingOrders + pendingCancellations + pendingReturns + unreadContacts + pendingServiceForms,
    });
  } catch (error) {
    console.error("Badge counts API Error:", error);
    return NextResponse.json(
      { error: "Badge sayıları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
