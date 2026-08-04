/**
 * Admin Return Requests API
 * GET /api/admin/return-requests - List all return requests
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { calculateRefund } from "@/lib/return-refund";

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

// Status labels — "Onaylandı" tek başına belirsiz olduğu için akıştaki adımı
// söylüyoruz: APPROVED henüz para çıkmadığı aşama, COMPLETED çıktığı aşama.
const STATUS_LABELS: Record<string, string> = {
  PENDING_ADMIN_APPROVAL: "Beklemede",
  APPROVED: "İnceleme onaylandı · kargo bekleniyor",
  RECEIVED: "Teslim alındı · inceleniyor",
  COMPLETED: "İade edildi",
  REJECTED: "Reddedildi",
};

// Return reason labels
const REASON_LABELS: Record<string, string> = {
  DAMAGED: "Ürün Hasarlı Geldi",
  WRONG_PRODUCT: "Ürün Yanlış Gönderildi",
  SPECS_MISMATCH: "Teknik Özellikler Siparişimle Uyuşmamaktadır",
  CHANGED_MIND: "Fikrini Değiştirdi (Cayma Hakkı)",
  MISSING_ITEM: "Eksik Ürün / Teslim Edilmedi",
  NOT_RECEIVED: "Kargo Ulaşmadı",
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  RETURN: "İade",
  INVOICE_REQUEST: "Fatura Talebi",
  WRONG_INVOICE: "Hatalı Fatura",
  EXTRA_ITEM: "Fazla Ürün",
  OTHER: "Diğer",
};

/**
 * GET /api/admin/return-requests
 * List all return requests with filters
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
    const reason = searchParams.get("reason");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    const id = searchParams.get("id");
    if (id) where.id = id;
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (reason && reason !== "ALL") {
      where.reason = reason;
    }
    const requestType = searchParams.get("requestType");
    if (requestType && requestType !== "ALL") {
      where.requestType = requestType;
    }

    // Arama SUNUCUDA yapılıyor. Eskiden yalnızca istemciye inen ilk sayfa
    // içinde filtreleniyordu; depoya gelen kolinin kodu daha eski bir talebe
    // aitse hiç bulunamıyordu — iade kodunun tek işi bu eşleştirme olduğu için
    // aramanın tüm kayıtları görmesi şart.
    const search = searchParams.get("search")?.trim();
    if (search) {
      const compact = search.replace(/\s+/g, "");
      where.OR = [
        // Kod büyük harf ve tiresiz saklanmıyor; kullanıcı küçük harf yazabilir.
        { returnCode: { contains: compact, mode: "insensitive" } },
        // Reddedilip müşteriye geri gönderilen koli teslim alınmazsa kargo onu
        // bize döndürüyor; o koliyi bulmanın tek yolu bu takip numarası.
        { sendBackTrackingNumber: { contains: compact, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.returnRequest.count({ where });

    // Get requests with related data
    const requests = await prisma.returnRequest.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            subtotal: true,
            discount: true,
            total: true,
            refundedAmount: true,
            createdAt: true,
            deliveredAt: true,
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
        // Kısmi talep rozetini ve iade tutarı önizlemesini çizebilmek için:
        // dolu dizi = kısmi talep.
        items: {
          select: {
            quantity: true,
            orderItem: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                price: true,
                variantInfo: true,
                product: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Format response
    const formattedRequests = requests.map(({ items, ...req }) => {
      /**
       * İade tutarı önizlemesi. Panelde ayrı bir hesap yazmak yerine para
       * iadesini yapan kodun AYNISI çağrılıyor (`calculateRefund`); iki hesabın
       * zamanla sapması, yöneticinin onayladığı tutardan başkasının gitmesi
       * demek olurdu.
       */
      const estimatedRefund =
        items.length > 0
          ? calculateRefund(
              {
                subtotal: Number(req.order.subtotal),
                discount: Number(req.order.discount),
                total: Number(req.order.total),
                refundedAmount: Number(req.order.refundedAmount),
              },
              items.map((entry) => ({
                orderItemId: entry.orderItem.id,
                productId: entry.orderItem.productId,
                quantity: entry.quantity,
                orderedQuantity: entry.orderItem.quantity,
                unitPrice: Number(entry.orderItem.price),
                variantId: null,
              }))
            ).total
          : null;

      return {
        ...req,
        statusLabel: STATUS_LABELS[req.status] || req.status,
        // `reason` iade dışı taleplerde null; etiket de null kalır.
        reasonLabel: req.reason ? REASON_LABELS[req.reason] || req.reason : null,
        requestTypeLabel: REQUEST_TYPE_LABELS[req.requestType] || req.requestType,
        isPartial: items.length > 0,
        estimatedRefund,
        selectedItems: items.map((entry) => ({
          orderItemId: entry.orderItem.id,
          quantity: entry.quantity,
          name: entry.orderItem.product?.name ?? "Ürün",
        })),
        order: {
          ...req.order,
          subtotal: Number(req.order.subtotal),
          discount: Number(req.order.discount),
          total: Number(req.order.total),
          refundedAmount: Number(req.order.refundedAmount),
        },
      };
    });

    return NextResponse.json({
      requests: formattedRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      // Akışın her adımı ayrı sayılıyor: kargo bekleyenle incelenmeyi bekleyen
      // farklı iş kalemleri, tek "onaylandı" sayısı altında saklanmamalı.
      counts: {
        pending: await prisma.returnRequest.count({ where: { status: "PENDING_ADMIN_APPROVAL" } }),
        approved: await prisma.returnRequest.count({ where: { status: "APPROVED" } }),
        received: await prisma.returnRequest.count({ where: { status: "RECEIVED" } }),
        completed: await prisma.returnRequest.count({ where: { status: "COMPLETED" } }),
        rejected: await prisma.returnRequest.count({ where: { status: "REJECTED" } }),
      },
      reasonLabels: REASON_LABELS,
      requestTypeLabels: REQUEST_TYPE_LABELS,
    });
  } catch (error) {
    console.error("❌ [RETURN REQUESTS] List error:", error);
    return NextResponse.json(
      { error: "İade talepleri alınamadı" },
      { status: 500 }
    );
  }
}
