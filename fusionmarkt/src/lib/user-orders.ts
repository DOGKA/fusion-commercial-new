/**
 * Sipariş listesi sorgusu — tek kaynak.
 *
 * Hem `GET /api/orders` hem de siparişler sayfasının / panonun sunucu tarafı
 * ilk render'ı (F2-45) bunu kullanıyor.
 *
 * ⚠️ `statusHistory` DÖNMÜYOR. O alan sipariş başına iki tam sözleşme HTML'i
 * taşıyordu (~25 KB) ve liste ekranı hiç kullanmıyordu.
 */

import { prisma, Prisma } from "@repo/db";
import { blocksNewReturnRequest, isOpenRequestStatus } from "@/lib/orders";
import type {
  Order,
  OrderAddress,
  OrdersResponse,
} from "@/app/hesabim/_lib/types";

export const ORDERS_DEFAULT_LIMIT = 10;
export const ORDERS_MAX_LIMIT = 50;

export interface GetUserOrdersOptions {
  status?: string | null;
  q?: string | null;
  page?: number;
  limit?: number;
  from?: string | null;
  to?: string | null;
}

/**
 * Liste filtre çipleri → Prisma koşulu.
 *
 * `ongoing`/`cancelled`/`returned` ham `OrderStatus` DEĞİL: iptal edilmiş bir
 * sipariş hâlâ `PROCESSING` durumunda olabilir (talep admin onayı bekliyorsa),
 * bu yüzden talep varlığı da koşula giriyor.
 */
function buildStatusFilter(status: string | null | undefined): Prisma.OrderWhereInput {
  switch (status) {
    case null:
    case undefined:
    case "":
    case "all":
      return {};
    case "ongoing":
      return { status: { in: ["PENDING", "PROCESSING", "SHIPPED"] } };
    case "delivered":
      return { status: "DELIVERED" };
    case "cancelled":
      return { OR: [{ status: "CANCELLED" }, { cancellationRequest: { isNot: null } }] };
    case "returned":
      return { OR: [{ status: "REFUNDED" }, { returnRequests: { some: {} } }] };
    default:
      return ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(
        status
      )
        ? { status: status as Prisma.EnumOrderStatusFilter["equals"] }
        : {};
  }
}

const iso = (value: Date | null | undefined): string | null =>
  value ? value.toISOString() : null;

function addressToDto(address: {
  id: string;
  title: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string;
  city: string;
  district: string | null;
  address: string | null;
  addressLine1: string | null;
  postalCode: string | null;
} | null): OrderAddress | null {
  if (!address) return null;
  return {
    id: address.id,
    title: address.title ?? undefined,
    firstName: address.firstName ?? undefined,
    lastName: address.lastName ?? undefined,
    fullName: address.fullName ?? undefined,
    phone: address.phone,
    city: address.city,
    district: address.district ?? undefined,
    address: address.address ?? undefined,
    addressLine1: address.addressLine1 ?? undefined,
    postalCode: address.postalCode ?? undefined,
  };
}

export async function getUserOrders(
  userId: string,
  options: GetUserOrdersOptions = {}
): Promise<OrdersResponse> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(
    ORDERS_MAX_LIMIT,
    Math.max(1, options.limit ?? ORDERS_DEFAULT_LIMIT)
  );
  const q = options.q?.trim() || "";

  const dateFilter: Prisma.DateTimeFilter = {};
  if (options.from && !Number.isNaN(Date.parse(options.from))) {
    dateFilter.gte = new Date(options.from);
  }
  if (options.to && !Number.isNaN(Date.parse(options.to))) {
    dateFilter.lte = new Date(options.to);
  }

  const where: Prisma.OrderWhereInput = {
    userId,
    ...buildStatusFilter(options.status),
    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { items: { some: { product: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                images: true,
                brand: true,
                isActive: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        cancellationRequest: { select: { status: true } },
        returnRequests: { select: { status: true, requestType: true } },
      },
    }),
  ]);

  const formattedOrders: Order[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,

    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    couponCode: order.couponCode,

    trackingNumber: order.trackingNumber,
    carrierName: order.carrierName,

    invoiceUrl: order.invoiceUrl,
    invoiceUploadedAt: iso(order.invoiceUploadedAt),

    createdAt: order.createdAt.toISOString(),
    paidAt: iso(order.paidAt),
    confirmedAt: iso(order.confirmedAt),
    preparingAt: iso(order.preparingAt),
    shippedAt: iso(order.shippedAt),
    deliveredAt: iso(order.deliveredAt),
    cancelledAt: iso(order.cancelledAt),
    refundedAt: iso(order.refundedAt),

    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      variantInfo: item.variantInfo ? JSON.parse(item.variantInfo) : null,
      product: item.product,
    })),

    shippingAddress: addressToDto(order.shippingAddress),
    billingAddress: addressToDto(order.billingAddress),

    customerNote: order.customerNote,

    hasCancellationRequest: order.cancellationRequest !== null,
    cancellationStatus: order.cancellationRequest?.status ?? null,
    returnRequestCount: order.returnRequests.length,
    // ⚠️ İsim tarihsel: alan "bekleyen" değil **açık** talebi anlatıyor.
    hasPendingReturnRequest: order.returnRequests.some((r) =>
      isOpenRequestStatus(r.status)
    ),
    // Ret kesin olduğu için liste ekranının da bilmesi gerekiyor: bilmezse
    // akordiyonda "İade talebi oluştur" butonu çizilir ve istek sunucuda
    // reddedilir. Buton hiç görünmemeli.
    hasRejectedReturnRequest: order.returnRequests.some(blocksNewReturnRequest),
  }));

  return {
    orders: formattedOrders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: page * limit < total,
    },
  };
}
