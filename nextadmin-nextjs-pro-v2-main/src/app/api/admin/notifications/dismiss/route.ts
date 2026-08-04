/**
 * Admin Notification Dismiss API
 * POST /api/admin/notifications/dismiss - Dismiss a notification
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdminApi } from "@/lib/admin-api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;

    const { notifId } = await request.json();
    if (!notifId) {
      return NextResponse.json({ error: "notifId gerekli" }, { status: 400 });
    }

    await (prisma as any).adminDismissedNotification.upsert({
      where: {
        userId_notifId: {
          userId: auth.session!.user.id,
          notifId,
        },
      },
      update: {},
      create: {
        userId: auth.session!.user.id,
        notifId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dismiss notification error:", error);
    return NextResponse.json({ error: "Bildirim kapatılamadı" }, { status: 500 });
  }
}
