import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") return { authorized: false, error: "Yetkiniz yok", status: 403 };
  return { authorized: true, session };
}

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const items = await prisma.compareCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        specGroups: {
          orderBy: { order: "asc" },
          include: { specs: { orderBy: { order: "asc" } } },
        },
        products: {
          orderBy: { order: "asc" },
          include: { specValues: true, product: { select: { name: true, price: true, comparePrice: true, thumbnail: true, slug: true, images: true } } },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[COMPARE CATEGORIES] List error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { specGroups, products, ...categoryData } = body;

    const item = await prisma.compareCategory.create({
      data: {
        ...categoryData,
        specGroups: specGroups ? {
          create: specGroups.map((g: any, gi: number) => ({
            name: g.name,
            order: gi,
            specs: g.specs ? {
              create: g.specs.map((s: any, si: number) => ({ label: s.label, unit: s.unit || null, order: si })),
            } : undefined,
          })),
        } : undefined,
      },
      include: { specGroups: { include: { specs: true } }, products: true },
    });

    revalidateTag("compare");
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[COMPARE CATEGORIES] Create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
