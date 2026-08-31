import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.$executeRaw`
      DELETE FROM "homepage_video_categories"
      WHERE "id" = ${id}
    `;

    revalidateTag("homepage");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video category DELETE error:", error);
    return NextResponse.json({ error: "Kategori silinemedi" }, { status: 500 });
  }
}
