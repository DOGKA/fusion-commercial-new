import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";

interface ProductBrand {
  brand: string | null;
}

interface Brand {
  id: string;
  name: string;
}

// GET - Tüm benzersiz markaları getir
export async function GET() {
  try {
    // Ürünlerden benzersiz markaları çek
    const products = await prisma.product.findMany({
      where: {
        brand: {
          not: null,
        },
      },
      select: {
        brand: true,
      },
      distinct: ["brand"],
    });

    // Benzersiz markaları id ve name formatına dönüştür
    const brands: Brand[] = products
      .filter((p: ProductBrand) => p.brand && p.brand.trim() !== "")
      .map((p: ProductBrand, index: number) => ({
        id: String(index + 1),
        name: p.brand as string,
      }))
      .sort((a: Brand, b: Brand) => a.name.localeCompare(b.name, "tr"));

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

