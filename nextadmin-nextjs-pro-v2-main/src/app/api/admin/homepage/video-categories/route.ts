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

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }

  return { authorized: true };
}

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const items = await prisma.homepageVideoCategory.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Video category GET error:", error);
    return NextResponse.json({ error: "Kategoriler alınamadı" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const order = await prisma.homepageVideoCategory.count();
    const item = await prisma.homepageVideoCategory.create({
      data: { name: "Yeni Kategori", order },
    });

    revalidateTag("homepage");
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Video category POST error:", error);
    return NextResponse.json({ error: "Kategori oluşturulamadı" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.some((item) => !item.id || !String(item.name || "").trim())) {
      return NextResponse.json({ error: "Kategori adı boş bırakılamaz" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item, index) =>
        prisma.homepageVideoCategory.update({
          where: { id: item.id },
          data: {
            name: String(item.name).trim(),
            order: Number.isInteger(item.order) ? item.order : index,
          },
        })
      )
    );

    revalidateTag("homepage");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video category PUT error:", error);
    return NextResponse.json({ error: "Kategoriler güncellenemedi" }, { status: 500 });
  }
}
