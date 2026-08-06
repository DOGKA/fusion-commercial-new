import { prisma } from "@repo/db";

const db = prisma as any;
const MATERIALIZE_LIMIT = 50;
const ACTIONABLE_TYPES = [
  "order",
  "payment",
  "stock",
  "contact",
  "service",
  "review",
  "cancellation",
  "return",
] as const;

type Candidate = {
  dedupeKey: string;
  legacyId: string;
  type: (typeof ACTIONABLE_TYPES)[number];
  title: string;
  subTitle: string;
  href: string;
  sourceId: string;
  createdAt: Date;
};

function customerName(user: { name: string | null; email: string | null }) {
  return user.name || user.email?.split("@")[0] || "Misafir";
}

export async function materializeAdminNotifications() {
  const [
    orders,
    products,
    contacts,
    services,
    reviews,
    cancellations,
    returns,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "PROCESSING", paymentStatus: "PAID" },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: { id: true, name: true, stock: true, updatedAt: true },
      orderBy: { stock: "asc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.contactMessage.findMany({
      where: { status: "UNREAD" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.serviceFormMessage.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        name: true,
        platform: true,
        productModel: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.review.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.cancellationRequest.findMany({
      where: { status: "PENDING_ADMIN_APPROVAL" },
      select: {
        id: true,
        reason: true,
        createdAt: true,
        order: { select: { orderNumber: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
    prisma.returnRequest.findMany({
      where: { status: { in: ["PENDING_ADMIN_APPROVAL", "RECEIVED"] } },
      select: {
        id: true,
        status: true,
        requestType: true,
        createdAt: true,
        order: { select: { orderNumber: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: MATERIALIZE_LIMIT,
    }),
  ]);

  const candidates: Candidate[] = [
    ...orders.map((order) => ({
      dedupeKey: `order-${order.id}`,
      legacyId: `order-${order.id}`,
      type: (order.paymentStatus === "PAID" ? "payment" : "order") as
        | "payment"
        | "order",
      title:
        order.status === "PENDING"
          ? `Yeni sipariş: #${order.orderNumber}`
          : `Ödeme alındı: #${order.orderNumber}`,
      subTitle: `${customerName(order.user)} - ₺${Number(order.total).toFixed(2)}`,
      href: `/orders/${order.id}`,
      sourceId: order.id,
      createdAt: order.createdAt,
    })),
    ...products.map((product) => ({
      dedupeKey: `stock-${product.id}`,
      legacyId: `stock-${product.id}`,
      type: "stock" as const,
      title: "Düşük stok uyarısı",
      subTitle: `${product.name} - ${product.stock} adet kaldı`,
      href: `/products/${product.id}`,
      sourceId: product.id,
      createdAt: product.updatedAt,
    })),
    ...contacts.map((contact) => ({
      dedupeKey: `contact-${contact.id}`,
      legacyId: `contact-${contact.id}`,
      type: "contact" as const,
      title: "Yeni iletişim mesajı",
      subTitle: `${contact.name} - ${contact.subject || contact.email}`,
      href: `/contact?id=${encodeURIComponent(contact.id)}`,
      sourceId: contact.id,
      createdAt: contact.createdAt,
    })),
    ...services.map((service) => ({
      dedupeKey: `service-${service.id}`,
      legacyId: `service-${service.id}`,
      type: "service" as const,
      title: "Yeni servis talebi",
      subTitle: `${service.name}${service.productModel ? ` - ${service.productModel}` : ""} - ${service.platform}`,
      href: `/service-forms?id=${encodeURIComponent(service.id)}`,
      sourceId: service.id,
      createdAt: service.createdAt,
    })),
    ...reviews.map((review) => ({
      dedupeKey: `review-${review.id}`,
      legacyId: `review-${review.id}`,
      type: "review" as const,
      title: "Onay bekleyen yorum",
      subTitle: `${customerName(review.user)} - ${review.rating}/5 - ${review.title || review.comment}`,
      href: `/reviews?id=${encodeURIComponent(review.id)}`,
      sourceId: review.id,
      createdAt: review.createdAt,
    })),
    ...cancellations.map((request) => ({
      dedupeKey: `cancellation-${request.id}`,
      legacyId: `cancellation-${request.id}`,
      type: "cancellation" as const,
      title: `İptal talebi: #${request.order.orderNumber}`,
      subTitle: `${customerName(request.user)}${request.reason ? ` - ${request.reason}` : ""}`,
      href: `/cancellation-requests?id=${encodeURIComponent(request.id)}`,
      sourceId: request.id,
      createdAt: request.createdAt,
    })),
    ...returns.map((request) => ({
      dedupeKey: `return-${request.id}`,
      legacyId: `return-${request.id}`,
      type: "return" as const,
      title:
        request.status === "RECEIVED"
          ? `İade inceleme bekliyor: #${request.order.orderNumber}`
          : `Yeni ${request.requestType === "RETURN" ? "iade" : "talep"}: #${request.order.orderNumber}`,
      subTitle: customerName(request.user),
      href: `/return-requests?id=${encodeURIComponent(request.id)}`,
      sourceId: request.id,
      createdAt: request.createdAt,
    })),
  ];

  await prisma.$transaction(
    candidates.map((candidate) =>
      db.adminNotification.upsert({
        where: { dedupeKey: candidate.dedupeKey },
        update: {
          type: candidate.type,
          title: candidate.title,
          subTitle: candidate.subTitle,
          href: candidate.href,
          sourceId: candidate.sourceId,
          active: true,
        },
        create: {
          dedupeKey: candidate.dedupeKey,
          type: candidate.type,
          title: candidate.title,
          subTitle: candidate.subTitle,
          href: candidate.href,
          sourceId: candidate.sourceId,
          active: true,
          createdAt: candidate.createdAt,
        },
      }),
    ),
  );

  await Promise.all(
    ACTIONABLE_TYPES.map((type) => {
      const activeKeys = candidates
        .filter((candidate) => candidate.type === type)
        .map((candidate) => candidate.dedupeKey);
      return db.adminNotification.updateMany({
        where: {
          type,
          active: true,
          ...(activeKeys.length ? { dedupeKey: { notIn: activeKeys } } : {}),
        },
        data: { active: false },
      });
    }),
  );
}

export async function getAdminNotificationFeed(
  userId: string,
  limit = 30,
  materialize = true,
) {
  if (materialize) await materializeAdminNotifications();
  const now = new Date();
  const [items, legacyDismissals] = await Promise.all([
    db.adminNotification.findMany({
      where: {
        active: true,
        states: {
          none: {
            userId,
            OR: [
              { dismissedAt: { not: null } },
              { remindAt: { gt: now } },
            ],
          },
        },
      },
      include: { states: { where: { userId }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    db.adminDismissedNotification.findMany({
      where: { userId },
      select: { notifId: true },
    }),
  ]);
  const legacy = new Set(
    legacyDismissals.map((item: { notifId: string }) => item.notifId),
  );

  const notifications = items
    .filter((item: any) => !legacy.has(item.dedupeKey))
    .map((item: any) => {
      const state = item.states[0];
      return {
        id: item.id,
        dedupeKey: item.dedupeKey,
        type: item.type,
        title: item.title,
        subTitle: item.subTitle,
        link: item.href,
        createdAt: item.createdAt.toISOString(),
        read: Boolean(state?.readAt),
        readAt: state?.readAt?.toISOString() ?? null,
        presentedAt: state?.presentedAt?.toISOString() ?? null,
      };
    });

  return {
    notifications: notifications.slice(0, Math.min(Math.max(limit, 1), 100)),
    unreadCount: notifications.filter((item: any) => !item.read).length,
  };
}

export async function getActionCounts() {
  const [orders, cancellations, returns, contacts, serviceForms, reviews] =
    await Promise.all([
      prisma.order.count({
        where: {
          OR: [
            { status: "PENDING" },
            { status: "PROCESSING", paymentStatus: "PAID" },
          ],
        },
      }),
      prisma.cancellationRequest.count({
        where: { status: "PENDING_ADMIN_APPROVAL" },
      }),
      prisma.returnRequest.count({
        where: { status: { in: ["PENDING_ADMIN_APPROVAL", "RECEIVED"] } },
      }),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.serviceFormMessage.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { isApproved: false } }),
    ]);
  return {
    orders,
    cancellations,
    returns,
    contacts,
    serviceForms,
    reviews,
    total: orders + cancellations + returns + contacts + serviceForms + reviews,
  };
}
