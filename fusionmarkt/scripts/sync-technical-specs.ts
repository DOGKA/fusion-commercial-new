/**
 * Teknik Özellikleri Senkronize Et
 * 
 * Bu script sadece teknik özellikleri günceller.
 * Mevcut doğru özelliklere dokunmaz, sadece yanlış ve eksikleri düzeltir.
 * 
 * Çalıştırma:
 * cd fusionmarkt
 * npx tsx scripts/sync-technical-specs.ts
 */

import { prisma } from "@repo/db";

// Ürün verileri
const PRODUCT_DATA: Record<string, {
  keywords: string[];
  technicalSpecs: Array<{ label: string; value: string; group: string; order: number }>;
}> = {
  p800: {
    keywords: ["p800", "512wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "512Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "800W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "1600W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "300W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Hayır", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Evet", group: "Özellikler", order: 7 },
    ],
  },
  singo1000: {
    keywords: ["singo1000", "singo-1000", "1008wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "1008Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "1000W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "2000W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "200W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Evet", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Hayır", group: "Özellikler", order: 7 },
    ],
  },
  p1800: {
    keywords: ["p1800", "1024wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "1024Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "1800W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "3600W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "500W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Hayır", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Evet", group: "Özellikler", order: 7 },
    ],
  },
  singo2000pro: {
    keywords: ["singo2000", "singo-2000", "1920wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "1920Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "2000W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "4000W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "500W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Evet", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Hayır", group: "Özellikler", order: 7 },
    ],
  },
  p3200: {
    keywords: ["p3200", "2048wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "2048Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "3200W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "6400W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "500W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Hayır", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Evet", group: "Özellikler", order: 7 },
    ],
  },
  sh4000: {
    keywords: ["sh4000", "lifepo4", "5120wh"],
    technicalSpecs: [
      { label: "Kapasite", value: "5120Wh", group: "Genel", order: 1 },
      { label: "Çıkış Gücü", value: "4000W", group: "Güç", order: 2 },
      { label: "Max. Çıkış Gücü", value: "8000W", group: "Güç", order: 3 },
      { label: "Max. Solar Şarj Gücü", value: "3000W", group: "Şarj", order: 4 },
      { label: "AC Çıkış (220V)", value: "Evet", group: "Özellikler", order: 5 },
      { label: "Kablosuz Şarj", value: "Hayır", group: "Özellikler", order: 6 },
      { label: "Dahili Fener", value: "Hayır", group: "Özellikler", order: 7 },
    ],
  },
};

async function syncTechnicalSpecs() {
  console.log("🚀 Teknik Özellikler Senkronizasyonu Başlıyor...\n");

  // Kategoriyi bul
  const category = await prisma.category.findUnique({
    where: { slug: "tasinabilir-guc-kaynaklari" },
  });

  if (!category) {
    console.error("❌ Kategori bulunamadı: tasinabilir-guc-kaynaklari");
    return;
  }

  console.log(`✅ Kategori: ${category.name}\n`);

  // Kategorideki tüm ürünleri al
  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
  });

  console.log(`📦 ${products.length} ürün bulundu\n`);

  let totalUpdated = 0;
  let totalAdded = 0;
  let totalCorrect = 0;

  for (const product of products) {
    const slugLower = product.slug.toLowerCase();
    
    // Bu ürün için eşleşen data bul
    let matchedProductKey: string | null = null;
    for (const [key, data] of Object.entries(PRODUCT_DATA)) {
      const hasMatch = data.keywords.some(keyword => 
        slugLower.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matchedProductKey = key;
        break;
      }
    }

    if (!matchedProductKey) {
      console.log(`  ⚠️ Eşleşme bulunamadı: ${product.name} (${product.slug})`);
      continue;
    }

    const productData = PRODUCT_DATA[matchedProductKey];
    console.log(`  📦 ${product.name} → ${matchedProductKey}`);

    for (const spec of productData.technicalSpecs) {
      // Mevcut spec'i kontrol et
      const existingSpec = await prisma.technicalSpec.findFirst({
        where: {
          productId: product.id,
          label: spec.label,
        },
      });

      if (existingSpec) {
        // Mevcut değer doğru mu kontrol et
        if (existingSpec.value !== spec.value) {
          // Yanlış - güncelle
          await prisma.technicalSpec.update({
            where: { id: existingSpec.id },
            data: {
              value: spec.value,
              group: spec.group,
              order: spec.order,
            },
          });
          console.log(`    🔄 Düzeltildi: ${spec.label} = ${existingSpec.value} → ${spec.value}`);
          totalUpdated++;
        } else {
          console.log(`    ✓ Doğru: ${spec.label} = ${spec.value}`);
          totalCorrect++;
        }
      } else {
        // Eksik - oluştur
        await prisma.technicalSpec.create({
          data: {
            productId: product.id,
            label: spec.label,
            value: spec.value,
            group: spec.group,
            order: spec.order,
          },
        });
        console.log(`    ➕ Eklendi: ${spec.label} = ${spec.value}`);
        totalAdded++;
      }
    }
    console.log("");
  }

  console.log("\n════════════════════════════════════════");
  console.log("✅ Teknik Özellikler Senkronizasyonu Tamamlandı!");
  console.log(`   • Doğru: ${totalCorrect}`);
  console.log(`   • Düzeltildi: ${totalUpdated}`);
  console.log(`   • Eklendi: ${totalAdded}`);
  console.log("════════════════════════════════════════\n");
}

async function main() {
  try {
    await syncTechnicalSpecs();
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

