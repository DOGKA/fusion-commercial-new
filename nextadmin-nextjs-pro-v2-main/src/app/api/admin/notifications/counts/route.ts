import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { getActionCounts } from "@/lib/admin-notifications";

/**
 * GET /api/admin/notifications/counts
 * Returns badge counts for sidebar navigation
 */
export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.response) return auth.response;
    return NextResponse.json(await getActionCounts());
  } catch (error) {
    console.error("Badge counts API Error:", error);
    return NextResponse.json(
      { error: "Badge sayıları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
