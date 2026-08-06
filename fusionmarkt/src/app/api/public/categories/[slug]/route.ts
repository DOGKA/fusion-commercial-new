import { NextRequest, NextResponse } from "next/server";
import { getCategoryWithProducts } from "@/lib/category-products";

/**
 * GET /api/public/categories/[slug]
 * Kategori detayı ve ürünlerini getirir
 * Bundle kategorisi için bundle'ları getirir
 *
 * Query params:
 * - page: Sayfa numarası (default: 1)
 * - limit: Sayfa başına ürün (default: 12)
 * - sort: Sıralama (newest, price_asc, price_desc, name_asc, bestseller)
 *
 * Sorgunun kendisi `lib/category-products.ts` içinde: kategori sayfası da aynı
 * veriyi sunucuda kullanıyor, iki yerde iki farklı liste oluşmasın.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const result = await getCategoryWithProducts(slug, {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      sort: searchParams.get("sort") || "newest",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching category:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Kategori yüklenirken hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
