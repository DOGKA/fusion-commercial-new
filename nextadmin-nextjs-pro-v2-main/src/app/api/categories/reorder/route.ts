import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateFrontend } from "@/lib/revalidate-frontend";

/**
 * PUT /api/categories/reorder
 *
 * Birden fazla kategorinin sırasını tek istekte günceller. Tek tek PUT atmak
 * yerine bunun olmasının sebebi tazeleme: kategori menüsü kök layout'ta
 * durduğu için her güncelleme sitedeki tüm sayfaların önbelleğini düşürüyor.
 * Toplu uçta bu bedel bir kez ödeniyor.
 *
 * Body: { items: [{ id: string, order: number }] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items dizisi gerekli" }, { status: 400 });
    }

    const gecerli = items.filter(
      (item: any) => typeof item?.id === "string" && Number.isInteger(item?.order)
    );

    if (gecerli.length !== items.length) {
      return NextResponse.json(
        { error: "Her öğe geçerli bir id ve tam sayı order içermeli" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      gecerli.map((item: { id: string; order: number }) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    await revalidateFrontend({ tags: ["categories"] });

    return NextResponse.json({ success: true, updated: gecerli.length });
  } catch (error: any) {
    console.error("❌ [CATEGORIES API] Reorder error:", error);
    return NextResponse.json({ error: "Sıralama güncellenemedi" }, { status: 500 });
  }
}
