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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    const body = await request.json();
    const { specValues, ...productData } = body;

    await prisma.compareProduct.update({ where: { id }, data: productData });

    if (specValues) {
      await prisma.compareProductSpec.deleteMany({ where: { compareProductId: id } });
      await prisma.compareProductSpec.createMany({
        data: specValues.map((sv: any) => ({ compareProductId: id, specId: sv.specId, value: sv.value })),
      });
    }

    revalidateTag("compare");
    const updated = await prisma.compareProduct.findUnique({
      where: { id },
      include: { specValues: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COMPARE PRODUCT] Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;

    await prisma.compareProduct.delete({ where: { id } });
    revalidateTag("compare");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMPARE PRODUCT] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
