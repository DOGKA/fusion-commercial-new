/**
 * Admin Notification Dismiss API
 * POST /api/admin/notifications/dismiss - Dismiss a notification
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notifId } = await request.json();
    if (!notifId) {
      return NextResponse.json({ error: "notifId gerekli" }, { status: 400 });
    }

    await (prisma as any).adminDismissedNotification.upsert({
      where: {
        userId_notifId: {
          userId: session.user.id,
          notifId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        notifId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dismiss notification error:", error);
    return NextResponse.json({ error: "Bildirim kapatılamadı" }, { status: 500 });
  }
}
