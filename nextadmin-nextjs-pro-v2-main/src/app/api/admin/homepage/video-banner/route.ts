import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
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

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const items = await prisma.homepageVideoBanner.findMany();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("❌ [HOMEPAGE VIDEO BANNER API] List error:", error);
    return NextResponse.json({ error: "Failed to fetch video banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const item = await prisma.homepageVideoBanner.create({ data: { ...body } });

    revalidateTag("homepage");

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("❌ [HOMEPAGE VIDEO BANNER API] Create error:", error);
    return NextResponse.json({ error: "Failed to create video banner" }, { status: 500 });
  }
}
