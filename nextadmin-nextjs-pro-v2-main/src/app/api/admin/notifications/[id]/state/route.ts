import { requireAdminApi } from "@/lib/admin-api-auth";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

const db = prisma as any;
const ACTIONS = new Set([
  "read",
  "unread",
  "dismiss",
  "remind",
  "presented",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const { id } = await params;
    const body = await request.json();
    if (!ACTIONS.has(body.action)) {
      return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }

    const notification = await db.adminNotification.findUnique({
      where: { id },
      select: { id: true, dedupeKey: true },
    });
    if (!notification) {
      return NextResponse.json({ error: "Bildirim bulunamadı" }, { status: 404 });
    }

    const now = new Date();
    const minutes = Math.min(
      Math.max(Number(body.minutes) || 60, 5),
      7 * 24 * 60,
    );
    const data =
      body.action === "read"
        ? { readAt: now, remindAt: null }
        : body.action === "unread"
          ? { readAt: null, dismissedAt: null }
          : body.action === "dismiss"
            ? { dismissedAt: now, remindAt: null }
            : body.action === "presented"
              ? { presentedAt: now }
              : {
                  remindAt: new Date(now.getTime() + minutes * 60_000),
                  presentedAt: null,
                };

    await db.adminNotificationState.upsert({
      where: { notificationId_userId: { notificationId: id, userId: auth.session!.user.id } },
      update: data,
      create: {
        notificationId: id,
        userId: auth.session!.user.id,
        ...data,
      },
    });

    if (body.action === "dismiss") {
      await db.adminDismissedNotification.upsert({
        where: {
          userId_notifId: {
            userId: auth.session!.user.id,
            notifId: notification.dedupeKey,
          },
        },
        update: {},
        create: {
          userId: auth.session!.user.id,
          notifId: notification.dedupeKey,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification state error:", error);
    return NextResponse.json({ error: "Bildirim güncellenemedi" }, { status: 500 });
  }
}
