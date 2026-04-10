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

    const items = await prisma.homepageCategorySection.findMany({
      orderBy: { order: "asc" },
      include: {
        products: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("❌ [HOMEPAGE CATEGORIES API] List error:", error);
    return NextResponse.json({ error: "Failed to fetch category sections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { products, ...sectionData } = body;

    const item = await prisma.homepageCategorySection.create({
      data: {
        ...sectionData,
        ...(products?.length && {
          products: {
            create: products,
          },
        }),
      },
      include: {
        products: {
          orderBy: { order: "asc" },
        },
      },
    });

    revalidateTag("homepage");

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("❌ [HOMEPAGE CATEGORIES API] Create error:", error);
    return NextResponse.json({ error: "Failed to create category section" }, { status: 500 });
  }
}
