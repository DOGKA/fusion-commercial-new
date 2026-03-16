/**
 * Admin Cancellation Requests API
 * GET /api/admin/cancellation-requests - List all cancellation requests
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// 🔒 Authorization check helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  
  return { authorized: true, session };
}

// Status labels
const STATUS_LABELS: Record<string, string> = {
  PENDING_ADMIN_APPROVAL: "Beklemede",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

/**
 * GET /api/admin/cancellation-requests
 * List all cancellation requests with filters
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 Auth check
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Get total count
    const total = await prisma.cancellationRequest.count({ where });

    // Get requests with related data
    const requests = await prisma.cancellationRequest.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            total: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Format response
    const formattedRequests = requests.map((req) => ({
      ...req,
      statusLabel: STATUS_LABELS[req.status] || req.status,
      order: {
        ...req.order,
        total: Number(req.order.total),
      },
    }));

    return NextResponse.json({
      requests: formattedRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: await prisma.cancellationRequest.count({ where: { status: "PENDING_ADMIN_APPROVAL" } }),
        approved: await prisma.cancellationRequest.count({ where: { status: "APPROVED" } }),
        rejected: await prisma.cancellationRequest.count({ where: { status: "REJECTED" } }),
      },
    });
  } catch (error) {
    console.error("❌ [CANCELLATION REQUESTS] List error:", error);
    return NextResponse.json(
      { error: "İptal talepleri alınamadı" },
      { status: 500 }
    );
  }
}
