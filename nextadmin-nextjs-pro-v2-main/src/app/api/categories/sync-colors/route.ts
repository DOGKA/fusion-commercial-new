import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * POST /api/categories/sync-colors
 * Banner renklerini kategorilere senkronize eder
 * SHOP_CATEGORY_* banner'larının gradientFrom değerlerini ilgili kategorilerin themeColor'una yazar
 */

// Banner placement -> Kategori slug eşleştirmesi
const BANNER_PLACEMENT_TO_CATEGORY: Record<string, string> = {
  "SHOP_CATEGORY_ENDUSTRIYEL_ELDIVENLER": "endustriyel-eldivenler",
  "SHOP_CATEGORY_TELESKOPIK_MERDIVENLER": "teleskopik-merdivenler",
  "SHOP_CATEGORY_TASINABILIR_GUC_KAYNAKLARI": "tasinabilir-guc-kaynaklari",
  "SHOP_CATEGORY_GUNES_PANELLERI": "gunes-panelleri",
};

export async function POST(request: NextRequest) {
  try {
    const results: { category: string; color: string; source: string }[] = [];

    // 1. Tüm SHOP_CATEGORY_* banner'larını çek
    const banners = await prisma.banner.findMany({
      where: {
        placement: {
          in: [
            "SHOP_CATEGORY_ENDUSTRIYEL_ELDIVENLER",
            "SHOP_CATEGORY_TELESKOPIK_MERDIVENLER",
            "SHOP_CATEGORY_TASINABILIR_GUC_KAYNAKLARI",
            "SHOP_CATEGORY_GUNES_PANELLERI",
          ] as any[],
        },
        isActive: true,
      },
      select: {
        placement: true,
        gradientFrom: true,
      },
    });

    // 2. Banner'lardan renkleri al ve kategorilere yaz
    for (const banner of banners) {
      const categorySlug = BANNER_PLACEMENT_TO_CATEGORY[banner.placement as string];
      if (!categorySlug || !banner.gradientFrom) continue;

      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (category) {
        await prisma.category.update({
          where: { id: category.id },
          data: { themeColor: banner.gradientFrom },
        });

        results.push({
          category: category.name,
          color: banner.gradientFrom,
          source: "banner",
        });
      }
    }

    // 3. Banner'ı olmayan kategorilere varsayılan renkler ata
    const DEFAULT_COLORS: Record<string, string> = {
      "endustriyel-eldivenler": "#00ff6e",
      "teleskopik-merdivenler": "#3b82f6",
      "tasinabilir-guc-kaynaklari": "#8b5cf6",
      "gunes-panelleri": "#f59e0b",
      "genel": "#ec4899",
    };

    const categoriesWithoutColor = await prisma.category.findMany({
      where: { themeColor: null },
    });

    for (const category of categoriesWithoutColor) {
      const color = DEFAULT_COLORS[category.slug] || "#8b5cf6";
      
      await prisma.category.update({
        where: { id: category.id },
        data: { themeColor: color },
      });

      results.push({
        category: category.name,
        color: color,
        source: "default",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} kategori rengi güncellendi`,
      results,
    });

  } catch (error: any) {
    console.error("❌ [SYNC COLORS] Error:", error);
    return NextResponse.json(
      { error: "Renkler senkronize edilemedi", details: error.message },
      { status: 500 }
    );
  }
}

