import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kategori bazlı varsayılan filtreler
interface FilterDefinition {
  name: string;
  categorySlug: string;
  sourceType: string;
  filterType: string;
  displayStyle: string;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  options: { name: string; value: string }[];
}

const DEFAULT_FILTERS: FilterDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ENDÜSTRİYEL ELDİVENLER FİLTRELERİ
  // Mevcut Ürünler: TG1290 (çok kullanımlık, dokunmatik), TD01, TD05, TD06, TD07
  // (tek kullanımlık nitril), TG5545, TG6240
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Beden",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "INLINE",
    isCollapsible: true,
    // S=08, M=09, L=10, XL=11 eşleştirmesi - her biri ayrı değer
    options: [
      { name: "S / 08", value: "S,08" },
      { name: "M / 09", value: "M,09" },
      { name: "L / 10", value: "L,10" },
      { name: "XL / 11", value: "XL,11" },
    ],
  },
  {
    name: "Kesilme Direnci (EN388)",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Seviye 1", value: "1" },
      { name: "A Seviyesi", value: "A" },
      { name: "C Seviyesi", value: "C" },
      { name: "D Seviyesi", value: "D" },
      { name: "E Seviyesi", value: "E" },
    ],
  },
  {
    name: "Malzeme",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Nitril Kaplama", value: "nitril" },
      { name: "PU Kaplama", value: "pu" },
      { name: "Lateks Kaplama", value: "latex" },
    ],
  },
  {
    name: "Dokunmatik Ekran Uyumlu",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    // Sadece TG1290 ve TG6240 dokunmatik ekran uyumlu
    options: [
      { name: "Evet", value: "true" },
      { name: "Hayır", value: "false" },
    ],
  },
  // NOT: Kullanım Tipi filtresi kaldırıldı - kullanıcı isteği

  // ═══════════════════════════════════════════════════════════════════════════
  // TAŞINABİLİR GÜÇ KAYNAKLARI FİLTRELERİ
  // Mevcut Ürünler:
  // - P800: 512Wh, 1600W çıkış, Dahili Fener VAR
  // - Singo1000: 1008Wh, 1000W çıkış, Kablosuz Şarj VAR, Dahili Fener YOK
  // - P1800: 1024Wh, 3600W çıkış, Dahili Fener VAR
  // - Singo2000Pro: 1920Wh, 4000W çıkış, Kablosuz Şarj VAR, Dahili Fener YOK
  // - P3200: 2048Wh, 3200W(!) çıkış, Dahili Fener VAR, Dahili Powerbank VAR
  // - SH4000: 5120Wh, 8000W çıkış, Dahili Fener YOK
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Kapasite (Wh)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    // 500Wh altı yok - en düşük P800 512Wh
    options: [
      { name: "500 - 1000 Wh", value: "500-1000" },
      { name: "1000 - 1500 Wh", value: "1000-1500" },
      { name: "1500 - 2500 Wh", value: "1500-2500" },
      { name: "2500 Wh ve üzeri", value: "2500+" },
    ],
  },
  {
    name: "Çıkış Gücü (W)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    // Mevcut ürünler: Singo1000 (1000W), P800 (1600W), P3200 (3200W), P1800 (3600W), Singo2000Pro (4000W), SH4000 (4000W)
    options: [
      { name: "1000W - 2000W", value: "1000-2000" },
      { name: "2000W - 3000W", value: "2000-3000" },
      { name: "3000W - 5000W", value: "3000-5000" },
    ],
  },
  {
    name: "AC Çıkış (220V)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Evet", value: "true" },
      { name: "Hayır", value: "false" },
    ],
  },
  {
    name: "Kablosuz Şarj",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    // Sadece Singo1000 ve Singo2000Pro'da var
    options: [
      { name: "Evet", value: "true" },
      { name: "Hayır", value: "false" },
    ],
  },
  {
    name: "Dahili Fener",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    // Sadece P800, P1800, P3200'de var
    // Singo1000, Singo2000Pro, SH4000'de YOK
    options: [
      { name: "Evet", value: "true" },
      { name: "Hayır", value: "false" },
    ],
  },
  {
    name: "Dahili Powerbank",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    // Sadece P3200'de var
    options: [
      { name: "Evet", value: "true" },
      { name: "Hayır", value: "false" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GÜNEŞ PANELLERİ FİLTRELERİ
  // SP100 (100W), SP200 (200W), SP400 (400W)
  // Her ürün sadece kendi watt değerinde görünmeli
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Güç (Watt)",
    categorySlug: "gunes-panelleri",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    // Tam değer eşleşmesi - her ürün sadece kendi watt'ında
    options: [
      { name: "100W", value: "100" },
      { name: "200W", value: "200" },
      { name: "400W", value: "400" },
    ],
  },
  {
    name: "Taşınabilirlik",
    categorySlug: "gunes-panelleri",
    sourceType: "ATTRIBUTE",
    filterType: "RADIO",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Katlanabilir", value: "foldable" },
      { name: "Sabit", value: "fixed" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TELESKOPİK MERDİVENLER FİLTRELERİ
  // Stokta: 1600ET ve TS1600ET (3.8m, 13 basamak, Taktik)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Maksimum Uzunluk (m)",
    categorySlug: "teleskopik-merdivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "2.5m ve altı", value: "0-2.5" },
      { name: "2.5m - 3m", value: "2.5-3" },
      { name: "3m - 3.5m", value: "3-3.5" },
      { name: "3.5m - 4m", value: "3.5-4" },
    ],
  },
  {
    name: "Basamak Sayısı",
    categorySlug: "teleskopik-merdivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "7 Basamak", value: "7" },
      { name: "9 Basamak", value: "9" },
      { name: "11 Basamak", value: "11" },
      { name: "13 Basamak", value: "13" },
    ],
  },
  {
    name: "Merdiven Tipi",
    categorySlug: "teleskopik-merdivenler",
    sourceType: "ATTRIBUTE",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    // Mevcut stoktaki tüm merdivenler teleskopik
    options: [
      { name: "Teleskopik", value: "teleskopik" },
    ],
  },
];

async function seedAllFilters() {
  console.log('🚀 Tüm filtreler ekleniyor/güncelleniyor...\n');

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const filterData of DEFAULT_FILTERS) {
    // Kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { slug: filterData.categorySlug },
    });

    if (!category) {
      console.warn(`❌ Kategori bulunamadı: ${filterData.categorySlug}`);
      skippedCount++;
      continue;
    }

    // Aynı isimde ve kategoride filtre var mı kontrol et
    const existingFilter = await prisma.filter.findFirst({
      where: {
        name: filterData.name,
        categoryId: category.id,
      },
    });

    if (existingFilter) {
      // Mevcut filtreyi güncelle
      await prisma.filter.update({
        where: { id: existingFilter.id },
        data: {
          sourceType: filterData.sourceType as any,
          filterType: filterData.filterType as any,
          displayStyle: filterData.displayStyle as any,
          isCollapsible: filterData.isCollapsible ?? true,
          isCollapsed: filterData.isCollapsed ?? false,
          customOptions: filterData.options,
          isActive: true,
        },
      });
      console.log(`   🔄 Güncellendi: ${filterData.name} (${filterData.categorySlug})`);
      updatedCount++;
      continue;
    }

    // Filtreyi oluştur
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
        minValue: filterData.minValue,
        maxValue: filterData.maxValue,
        step: filterData.step,
        order: createdCount,
        isActive: true,
        autoPopulate: false,
        selectedTermIds: [],
        customOptions: filterData.options,
      },
    });

    console.log(`   ✅ Oluşturuldu: ${filterData.name} (${filterData.categorySlug})`);
    createdCount++;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🎉 İşlem tamamlandı!`);
  console.log(`   ✅ Oluşturulan: ${createdCount}`);
  console.log(`   🔄 Güncellenen: ${updatedCount}`);
  console.log(`   ❌ Atlanan: ${skippedCount}`);
}

// Script'i çalıştır
seedAllFilters()
  .catch((e) => {
    console.error('❌ Kritik Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

