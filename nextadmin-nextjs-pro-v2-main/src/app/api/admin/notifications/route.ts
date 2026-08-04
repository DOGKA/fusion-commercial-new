import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { getAdminNotificationFeed } from "@/lib/admin-notifications";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 30);
    return NextResponse.json(
      await getAdminNotificationFeed(auth.session!.user.id, requestedLimit),
    );
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json(
      { error: "Bildirimler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
