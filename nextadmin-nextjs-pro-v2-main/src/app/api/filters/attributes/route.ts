import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

// GET - Tüm Attribute'ları getir (filtre oluşturmak için)
export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      where: {
        isActive: true,
        showInFilters: true,
      },
      include: {
        values: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { error: "Özellikler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

