/**
 * Kategorilere themeColor atama scripti
 * Bu script mevcut shop category banner renklerini veritabanındaki kategorilere işler
 * 
 * Kullanım: npx ts-node scripts/update-category-colors.ts
 */

import { prisma } from "../src";

// Banner placement -> Kategori slug eşleştirmesi
const BANNER_PLACEMENT_TO_CATEGORY: Record<string, string> = {
  "SHOP_CATEGORY_ENDUSTRIYEL_ELDIVENLER": "endustriyel-eldivenler",
  "SHOP_CATEGORY_TELESKOPIK_MERDIVENLER": "teleskopik-merdivenler",
  "SHOP_CATEGORY_TASINABILIR_GUC_KAYNAKLARI": "tasinabilir-guc-kaynaklari",
  "SHOP_CATEGORY_GUNES_PANELLERI": "gunes-panelleri",
};

async function updateCategoryColorsFromBanners() {
  console.log("🎨 Banner renklerinden kategori themeColor'ları güncelleniyor...\n");

  try {
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
        id: true,
        name: true,
        placement: true,
        gradientFrom: true,
        gradientTo: true,
      },
    });

    console.log(`📋 ${banners.length} shop category banner bulundu.\n`);

    if (banners.length === 0) {
      console.log("⚠️  Hiç SHOP_CATEGORY banner bulunamadı. Banner'ları admin panelinden oluşturun.");
      console.log("   Varsayılan renkler atanacak...\n");
    }

    // 2. Banner'lardan renkleri al ve kategorilere yaz
    let updatedFromBanner = 0;
    let updatedWithDefault = 0;

    for (const banner of banners) {
      const categorySlug = BANNER_PLACEMENT_TO_CATEGORY[banner.placement as string];
      if (!categorySlug) continue;

      const color = banner.gradientFrom;
      if (!color) {
        console.log(`⚠️  ${banner.name} - gradientFrom rengi yok, atlanıyor.`);
        continue;
      }

      // Kategoriyi bul ve güncelle
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        console.log(`⚠️  Kategori bulunamadı: ${categorySlug}`);
        continue;
      }

      await prisma.category.update({
        where: { id: category.id },
        data: { themeColor: color },
      });

      console.log(`✅ ${category.name} - Banner'dan renk atandı: ${color}`);
      updatedFromBanner++;
    }

    // 3. Banner'ı olmayan kategorilere varsayılan renkler ata
    const categoriesWithoutColor = await prisma.category.findMany({
      where: {
        themeColor: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Varsayılan renk paleti (her kategori için farklı renk)
    const DEFAULT_COLORS: Record<string, string> = {
      "endustriyel-eldivenler": "#00ff6e",  // Yeşil (kullanıcının gösterdiği)
      "teleskopik-merdivenler": "#3b82f6",  // Mavi
      "tasinabilir-guc-kaynaklari": "#8b5cf6", // Mor
      "gunes-panelleri": "#f59e0b",          // Turuncu
      "genel": "#ec4899",                    // Pembe
    };

    for (const category of categoriesWithoutColor) {
      const defaultColor = DEFAULT_COLORS[category.slug] || "#8b5cf6";
      
      await prisma.category.update({
        where: { id: category.id },
        data: { themeColor: defaultColor },
      });

      console.log(`🎨 ${category.name} - Varsayılan renk atandı: ${defaultColor}`);
      updatedWithDefault++;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`🎉 Tamamlandı!`);
    console.log(`   ✅ Banner'dan güncellenen: ${updatedFromBanner}`);
    console.log(`   🎨 Varsayılan atanan: ${updatedWithDefault}`);
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateCategoryColorsFromBanners();

