/**
 * Admin bildirim tabloları üretime uygulandıktan sonra çalıştırılır.
 *
 * Materializer idempotency'sini ve admin bazlı durum izolasyonunu doğrular.
 * Geçici kayıtlar `finally` içinde temizlenir; kaynak sipariş/form kayıtlarına
 * dokunmaz.
 */
import { config } from "dotenv";

config({
  path: new URL(
    "../nextadmin-nextjs-pro-v2-main/.env.local",
    import.meta.url,
  ).pathname,
});

const { prisma } = await import("@repo/db");
const { materializeAdminNotifications, getAdminNotificationFeed } = await import(
  "../nextadmin-nextjs-pro-v2-main/src/lib/admin-notifications.ts"
);

const db = prisma as any;
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const dedupeKey = `verify-admin-notification-${suffix}`;
let notificationId: string | null = null;
let legacyId: string | null = null;

function check(label: string, condition: boolean) {
  if (!condition) throw new Error(`Başarısız: ${label}`);
  console.log(`✓ ${label}`);
}

try {
  const tables = await prisma.$queryRaw<
    { notifications: string | null; states: string | null }[]
  >`
    SELECT
      to_regclass('public.admin_notifications')::text AS notifications,
      to_regclass('public.admin_notification_states')::text AS states
  `;
  check(
    "bildirim tabloları mevcut",
    Boolean(tables[0]?.notifications && tables[0]?.states),
  );

  await materializeAdminNotifications();
  const firstCount = await db.adminNotification.count();
  await materializeAdminNotifications();
  const secondCount = await db.adminNotification.count();
  check("materializer idempotent", firstCount === secondCount);

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
    take: 2,
  });
  check("en az bir admin hesabı mevcut", admins.length > 0);

  const notification = await db.adminNotification.create({
    data: {
      dedupeKey,
      type: "contact",
      title: "Doğrulama bildirimi",
      subTitle: "Geçici kayıt",
      href: "/contact",
      sourceId: suffix,
      active: true,
      createdAt: new Date(),
    },
  });
  notificationId = notification.id;

  await db.adminNotificationState.create({
    data: {
      notificationId,
      userId: admins[0].id,
      readAt: new Date(),
    },
  });
  const firstAdminState = await db.adminNotificationState.count({
    where: { notificationId, userId: admins[0].id, readAt: { not: null } },
  });
  check("okundu durumu admin bazlı kaydediliyor", firstAdminState === 1);

  if (admins[1]) {
    const secondAdminState = await db.adminNotificationState.count({
      where: { notificationId, userId: admins[1].id },
    });
    check("bir adminin durumu diğerine sızmıyor", secondAdminState === 0);
  }

  const remindAt = new Date(Date.now() + 60 * 60_000);
  await db.adminNotificationState.update({
    where: {
      notificationId_userId: {
        notificationId,
        userId: admins[0].id,
      },
    },
    data: { readAt: null, remindAt, presentedAt: null },
  });
  const snoozedFeed = await getAdminNotificationFeed(admins[0].id, 100, false);
  check(
    "ertelenen bildirim süresi dolmadan gizleniyor",
    !snoozedFeed.notifications.some(
      (item: { id: string }) => item.id === notificationId,
    ),
  );

  legacyId = `legacy-${suffix}`;
  await db.adminDismissedNotification.create({
    data: { userId: admins[0].id, notifId: legacyId },
  });
  const legacyNotification = await db.adminNotification.create({
    data: {
      dedupeKey: legacyId,
      type: "service",
      title: "Eski kapatma doğrulaması",
      subTitle: "Geçici kayıt",
      href: "/service-forms",
      active: true,
      createdAt: new Date(),
    },
  });
  const legacyFeed = await getAdminNotificationFeed(admins[0].id, 100, false);
  check(
    "eski kapatma kayıtları yeniden gösterilmiyor",
    !legacyFeed.notifications.some(
      (item: { id: string }) => item.id === legacyNotification.id,
    ),
  );
} finally {
  if (notificationId) {
    await db.adminNotification.deleteMany({ where: { id: notificationId } });
  }
  if (legacyId) {
    await db.adminNotification.deleteMany({ where: { dedupeKey: legacyId } });
    await db.adminDismissedNotification.deleteMany({
      where: { notifId: legacyId },
    });
  }
  await prisma.$disconnect();
}
