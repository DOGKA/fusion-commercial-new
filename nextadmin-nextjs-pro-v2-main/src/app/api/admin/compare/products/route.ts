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

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { specValues, ...productData } = body;

    const item = await prisma.compareProduct.create({
      data: {
        ...productData,
        specValues: specValues ? { create: specValues.map((sv: any) => ({ specId: sv.specId, value: sv.value })) } : undefined,
      },
      include: { specValues: true },
    });

    revalidateTag("compare");
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[COMPARE PRODUCTS] Create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
