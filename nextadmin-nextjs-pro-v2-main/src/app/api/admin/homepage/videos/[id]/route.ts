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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const item = await prisma.homepageVideo.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Video GET error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const body = await request.json();
    const item = await prisma.homepageVideo.update({
      where: { id },
      data: body,
    });

    revalidateTag("homepage");
    return NextResponse.json(item);
  } catch (error) {
    console.error("Video PUT error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    await prisma.homepageVideo.delete({ where: { id } });

    revalidateTag("homepage");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video DELETE error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}
