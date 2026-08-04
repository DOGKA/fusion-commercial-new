import { requireAdminApi } from "@/lib/admin-api-auth";
import { materializeAdminNotifications } from "@/lib/admin-notifications";
import { prisma } from "@repo/db";
import { NextResponse } from "next/server";

const db = prisma as any;

export async function POST() {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    await materializeAdminNotifications();
    const notifications = await db.adminNotification.findMany({
      where: { active: true },
      select: { id: true },
    });
    const now = new Date();
    await db.adminNotificationState.createMany({
      data: notifications.map(({ id }: { id: string }) => ({
        notificationId: id,
        userId: auth.session!.user.id,
        readAt: now,
        updatedAt: now,
      })),
      skipDuplicates: true,
    });
    await db.adminNotificationState.updateMany({
      where: {
        userId: auth.session!.user.id,
        notificationId: { in: notifications.map(({ id }: { id: string }) => id) },
      },
      data: { readAt: now },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Read all notifications error:", error);
    return NextResponse.json({ error: "Bildirimler güncellenemedi" }, { status: 500 });
  }
}
