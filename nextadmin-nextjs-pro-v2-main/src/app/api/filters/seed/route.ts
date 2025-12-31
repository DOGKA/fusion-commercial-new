import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

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
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Beden",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "INLINE",
    isCollapsible: true,
    options: [
      { name: "S", value: "S" },
      { name: "M", value: "M" },
      { name: "L", value: "L" },
      { name: "XL", value: "XL" },
      { name: "08 (S)", value: "08" },
      { name: "09 (M)", value: "09" },
      { name: "10 (L)", value: "10" },
      { name: "11 (XL)", value: "11" },
    ],
  },
  {
    name: "Kesilme Direnci (EN388)",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "CUSTOM",
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
    sourceType: "CUSTOM",
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
    name: "Dokunmatik Ekran Desteği",
    categorySlug: "endustriyel-eldivenler",
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
    name: "Kullanım Tipi",
    categorySlug: "endustriyel-eldivenler",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Tek Kullanımlık", value: "single" },
      { name: "Çok Kullanımlık", value: "reusable" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAŞINABİLİR GÜÇ KAYNAKLARI FİLTRELERİ
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Kapasite (Wh)",
    categorySlug: "tasinabilir-guc-kaynaklari",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "500 Wh ve altı", value: "0-500" },
      { name: "500 - 1000 Wh", value: "500-1000" },
      { name: "1000 - 1500 Wh", value: "1000-1500" },
      { name: "1500 - 2000 Wh", value: "1500-2000" },
      { name: "2000 Wh ve üzeri", value: "2000+" },
    ],
  },
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
  {
    name: "Dahili Powerbank",
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

  // ═══════════════════════════════════════════════════════════════════════════
  // GÜNEŞ PANELLERİ FİLTRELERİ
  // SP100 (100W), SP200 (200W), SP400 (400W)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Güç (Watt)",
    categorySlug: "gunes-panelleri",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "100W", value: "100" },
      { name: "200W", value: "200" },
      { name: "400W", value: "400" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TELESKOPİK MERDİVENLER FİLTRELERİ
  // Stokta: 1600ET ve TS1600ET (3.8m, 13 basamak, Taktik)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: "Maksimum Uzunluk (m)",
    categorySlug: "teleskopik-merdivenler",
    sourceType: "CUSTOM",
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
    sourceType: "CUSTOM",
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
    name: "Yalıtkan",
    categorySlug: "teleskopik-merdivenler",
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
    name: "Merdiven Tipi",
    categorySlug: "teleskopik-merdivenler",
    sourceType: "CUSTOM",
    filterType: "CHECKBOX",
    displayStyle: "LIST",
    isCollapsible: true,
    options: [
      { name: "Teleskopik", value: "telescopic" },
      { name: "Çok Fonksiyonlu", value: "multifunction" },
    ],
  },
];

// POST - Varsayılan filtreleri veritabanına ekle
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const filterData of DEFAULT_FILTERS) {
      // Kategoriyi bul
      const category = await prisma.category.findUnique({
        where: { slug: filterData.categorySlug },
      });

      if (!category) {
        console.warn(`Kategori bulunamadı: ${filterData.categorySlug}`);
        skippedCount++;
        continue;
      }

      // Aynı isimde ve kategoride filtre var mı kontrol et
      const existingFilter = await prisma.filter.findFirst({
        where: {
          name: filterData.name,
          categoryId: category.id,
        } as any,
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
          } as any,
        });
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
        } as any,
      });

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${createdCount} filtre oluşturuldu, ${updatedCount} güncellendi, ${skippedCount} atlandı`,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
    });
  } catch (error: any) {
    console.error("Error seeding filters:", error);
    return NextResponse.json(
      { error: "Filtreler oluşturulurken hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}

// GET - Varsayılan filtre listesini göster
export async function GET() {
  return NextResponse.json({
    info: "Bu endpoint varsayılan filtreleri veritabanına ekler",
    method: "POST ile çağırın",
    filterCount: DEFAULT_FILTERS.length,
    categories: [...new Set(DEFAULT_FILTERS.map(f => f.categorySlug))],
    filters: DEFAULT_FILTERS.map(f => ({
      name: f.name,
      category: f.categorySlug,
      type: f.filterType,
      optionsCount: f.options.length,
    })),
  });
}
