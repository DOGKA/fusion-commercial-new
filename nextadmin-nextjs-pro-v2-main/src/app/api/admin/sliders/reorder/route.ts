import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { revalidateSliders } from "@/lib/revalidate-frontend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  return { authorized: true, session };
}

/**
 * PUT /api/admin/sliders/reorder
 * Update slider order based on array of IDs (index = new order)
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.slider.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    console.log(`✅ Sliders reordered: ${orderedIds.length} items`);

    revalidateTag("sliders");
    revalidateTag("homepage");
    await revalidateSliders();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [SLIDERS API] Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder sliders" },
      { status: 500 }
    );
  }
}
