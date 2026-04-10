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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;

    const item = await prisma.compareCategory.findUnique({
      where: { id },
      include: {
        specGroups: { orderBy: { order: "asc" }, include: { specs: { orderBy: { order: "asc" } } } },
        products: { orderBy: { order: "asc" }, include: { specValues: true } },
      },
    });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[COMPARE CATEGORY] Get error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    const body = await request.json();
    const { specGroups, products, ...categoryData } = body;

    const item = await prisma.compareCategory.update({ where: { id }, data: categoryData });

    if (specGroups) {
      await prisma.compareSpecGroup.deleteMany({ where: { categoryId: id } });
      for (let gi = 0; gi < specGroups.length; gi++) {
        const g = specGroups[gi];
        await prisma.compareSpecGroup.create({
          data: {
            categoryId: id, name: g.name, order: gi,
            specs: g.specs ? { create: g.specs.map((s: any, si: number) => ({ label: s.label, unit: s.unit || null, order: si })) } : undefined,
          },
        });
      }
    }

    revalidateTag("compare");
    const updated = await prisma.compareCategory.findUnique({
      where: { id },
      include: { specGroups: { orderBy: { order: "asc" }, include: { specs: { orderBy: { order: "asc" } } } }, products: { include: { specValues: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COMPARE CATEGORY] Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;

    await prisma.compareCategory.delete({ where: { id } });
    revalidateTag("compare");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMPARE CATEGORY] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
