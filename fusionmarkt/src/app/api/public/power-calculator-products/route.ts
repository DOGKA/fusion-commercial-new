import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * GET /api/public/power-calculator-products
 * Fetches product data for power calculator (power stations & solar panels)
 * Returns prices, images, and other essential data
 */
export async function GET() {
  try {
    // Power station slugs
    const powerStationSlugs = [
      '512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
      '1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
      '1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
      '2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
      '5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
    ];

    // Solar panel slugs
    const solarPanelSlugs = [
      'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
      'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
      'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
    ];

    const allSlugs = [...powerStationSlugs, ...solarPanelSlugs];

    const products = await prisma.product.findMany({
      where: {
        slug: { in: allSlugs },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        thumbnail: true,
        brand: true,
      },
    });

    // Create a map for easy lookup
    const productMap: Record<string, {
      id: string;
      name: string;
      slug: string;
      price: number;
      comparePrice: number | null;
      image: string | null;
      brand: string | null;
    }> = {};

    products.forEach((product) => {
      // Extract product ID from slug (p800, p1800, etc.)
      const slugParts = product.slug.split('-');
      const productId = slugParts[slugParts.length - 1].toLowerCase();
      
      productMap[productId] = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price ? Number(product.price) : 0,
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        image: product.images?.[0] || product.thumbnail || null,
        brand: product.brand,
      };
    });

    return NextResponse.json({
      products: productMap,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("❌ [POWER CALCULATOR API] Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", products: {} },
      { status: 500 }
    );
  }
}
