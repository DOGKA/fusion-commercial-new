/**
 * Admin Panel Filtrelerini Seed Et
 * 
 * Çalıştırma:
 * cd nextadmin-nextjs-pro-v2-main
 * npx tsx scripts/seed-filters.ts
 */

import { prisma } from "@repo/db";

interface FilterOption {
  name: string;
  value: string;
}

interface FilterDefinition {
  name: string;
  categorySlug: string;
  sourceType: string;
  filterType: string;
  displayStyle: string;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  options: FilterOption[];
}

const POWER_STATION_FILTERS: FilterDefinition[] = [
  {
    name: "Çıkış Gücü (W)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "500W - 1000W", value: "500-1000" },
      { name: "1000W - 3000W", value: "1000-3000" },
      { name: "3000W - 5000W", value: "3000-5000" },
    ],
  },
  {
    name: "Max. Solar Şarj Gücü (W)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "200W - 300W", value: "200-300" },
      { name: "300W - 500W", value: "300-500" },
      { name: "500W - 1000W", value: "500-1000" },
      { name: "1000W - 4000W", value: "1000-4000" },
    ],
  },
  {
    name: "AC Çıkış (220V)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Evet", value: "yes" },
      { name: "Hayır", value: "no" },
    ],
  },
  {
    name: "Kablosuz Şarj",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Evet", value: "yes" },
      { name: "Hayır", value: "no" },
    ],
  },
  {
    name: "Dahili Fener",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Evet", value: "yes" },
      { name: "Hayır", value: "no" },
    ],
  },
];

async function seedFilters() {
  console.log("🚀 Admin Panel Filtreleri Seed Ediliyor...\n");

  // Kategoriyi bul
  const category = await prisma.category.findUnique({
    where: { slug: "tasinabilir-guc-kaynaklari" },
  });

  if (!category) {
    console.error("❌ Kategori bulunamadı: tasinabilir-guc-kaynaklari");
    return;
  }

  console.log(`✅ Kategori: ${category.name}\n`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const filterData of POWER_STATION_FILTERS) {
    // Mevcut filtreyi kontrol et
    const existingFilter = await prisma.filter.findFirst({
      where: {
        name: filterData.name,
        categoryId: category.id,
      },
    });

    if (existingFilter) {
      // Güncelle
      await prisma.filter.update({
        where: { id: existingFilter.id },
        data: {
          sourceType: filterData.sourceType as any,
          filterType: filterData.filterType as any,
          displayStyle: filterData.displayStyle as any,
          isCollapsible: filterData.isCollapsible ?? true,
          isCollapsed: filterData.isCollapsed ?? false,
          customOptions: filterData.options,
        } as any,
      });
      console.log(`  ✅ Güncellendi: ${filterData.name} (${filterData.options.length} seçenek)`);
      updatedCount++;
      continue;
    }

    // Oluştur
    await prisma.filter.create({
      data: {
        name: filterData.name,
        categoryId: category.id,
        sourceType: filterData.sourceType as any,
        filterType: filterData.filterType as any,
        displayStyle: filterData.displayStyle as any,
        isCollapsible: filterData.isCollapsible ?? true,
        isCollapsed: filterData.isCollapsed ?? false,
        showCount: true,
        allowMultiple: filterData.filterType === "CHECKBOX",
        showHierarchy: "FLAT" as any,
        order: createdCount,
        isActive: true,
        autoPopulate: false,
        selectedTermIds: [],
        customOptions: filterData.options,
      } as any,
    });

    console.log(`  ➕ Oluşturuldu: ${filterData.name} (${filterData.options.length} seçenek)`);
    createdCount++;
  }

  console.log("\n════════════════════════════════════════");
  console.log("✅ Filtre Seed İşlemi Tamamlandı!");
  console.log(`   • Oluşturulan: ${createdCount}`);
  console.log(`   • Güncellenen: ${updatedCount}`);
  console.log(`   • Atlanan: ${skippedCount}`);
  console.log("════════════════════════════════════════\n");
}

async function main() {
  try {
    await seedFilters();
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Kritik Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

