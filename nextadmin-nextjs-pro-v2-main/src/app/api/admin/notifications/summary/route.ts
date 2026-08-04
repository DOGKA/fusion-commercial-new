import { requireAdminApi } from "@/lib/admin-api-auth";
import {
  getActionCounts,
  getAdminNotificationFeed,
} from "@/lib/admin-notifications";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const [counts, feed] = await Promise.all([
      getActionCounts(),
      getAdminNotificationFeed(auth.session!.user.id, 100),
    ]);
    return NextResponse.json({
      ...counts,
      unreadCount: feed.unreadCount,
      notifications: feed.notifications,
    });
  } catch (error) {
    console.error("Notification summary error:", error);
    return NextResponse.json({ error: "Özet alınamadı" }, { status: 500 });
  }
}
