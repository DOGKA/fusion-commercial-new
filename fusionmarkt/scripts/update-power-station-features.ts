/**
 * Taşınabilir Güç Kaynakları - Teknik Özellik Güncelleme Script'i
 * 
 * Bu script:
 * 1. "max-solar-sarj" feature definition oluşturur (yoksa)
 * 2. "Taşınabilir Güç Kaynakları" kategorisine bağlar
 * 3. Ürünlere doğru feature değerlerini atar
 * 
 * Çalıştırma:
 * cd fusionmarkt
 * npx tsx scripts/update-power-station-features.ts
 */

import { prisma } from "@repo/db";

// Ürün verileri - Kullanıcının verdiği bilgiler ve datasheet'ler
// NOT: Ürün slug'ları veritabanındaki gerçek slug'larla eşleşmeli
// Eşleşme için: slug içinde bu keyword'ler aranıyor
const PRODUCT_FEATURES: Record<string, {
  keywords: string[];
  features: Record<string, number | string>;
}> = {
  // P800 - 512Wh
  p800: {
    keywords: ["p800", "512wh"],
    features: {
      "cikis-gucu": 800,           // Sürekli çıkış gücü
      "max-cikis-gucu": 1600,      // Tepe gücü
      "max-solar-sarj": 300,       // Max solar şarj gücü
      "ac-cikis": "true",          // AC 220V çıkış var
      "kablosuz-sarj": "false",    // Kablosuz şarj yok
      "dahili-fener": "true",      // Dahili fener var
      "dahili-powerbank": "false", // Dahili powerbank yok
    },
  },
  // Singo1000 - 1000Wh
  singo1000: {
    keywords: ["singo1000", "singo-1000"],
    features: {
      "cikis-gucu": 1000,
      "max-cikis-gucu": 2000,
      "max-solar-sarj": 200,
      "ac-cikis": "true",
      "kablosuz-sarj": "true",     // Kablosuz şarj VAR
      "dahili-fener": "false",
      "dahili-powerbank": "false",
    },
  },
  // P1800 - 1024Wh
  p1800: {
    keywords: ["p1800", "1024wh"],
    features: {
      "cikis-gucu": 1800,
      "max-cikis-gucu": 3600,
      "max-solar-sarj": 500,
      "ac-cikis": "true",
      "kablosuz-sarj": "false",
      "dahili-fener": "true",      // Dahili fener VAR
      "dahili-powerbank": "false",
    },
  },
  // Singo2000Pro - 1920Wh
  singo2000pro: {
    keywords: ["singo2000", "singo-2000", "1920wh"],
    features: {
      "cikis-gucu": 2000,
      "max-cikis-gucu": 4000,
      "max-solar-sarj": 500,
      "ac-cikis": "true",
      "kablosuz-sarj": "true",     // Kablosuz şarj VAR
      "dahili-fener": "false",
      "dahili-powerbank": "false",
    },
  },
  // P3200 - 2048Wh
  p3200: {
    keywords: ["p3200", "2048wh"],
    features: {
      "cikis-gucu": 3200,
      "max-cikis-gucu": 6400,
      "max-solar-sarj": 500,       // Kullanıcı 500W dedi
      "ac-cikis": "true",
      "kablosuz-sarj": "false",
      "dahili-fener": "true",      // Dahili fener VAR
      "dahili-powerbank": "true",  // Dahili powerbank VAR
    },
  },
  // SH4000 - 5120Wh
  sh4000: {
    keywords: ["sh4000", "5120wh"],
    features: {
      "cikis-gucu": 4000,
      "max-cikis-gucu": 8000,
      "max-solar-sarj": 3000,
      "ac-cikis": "true",
      "kablosuz-sarj": "false",
      "dahili-fener": "false",
      "dahili-powerbank": "false",
    },
  },
};

// Feature definitions - oluşturulacak özellikler
const FEATURE_DEFINITIONS = [
  { name: "Çıkış Gücü", slug: "cikis-gucu", inputType: "NUMBER" as const, unit: "W", description: "Sürekli çıkış gücü (Watt)" },
  { name: "Max. Çıkış Gücü", slug: "max-cikis-gucu", inputType: "NUMBER" as const, unit: "W", description: "Tepe/surge çıkış gücü (Watt)" },
  { name: "Max. Solar Şarj", slug: "max-solar-sarj", inputType: "NUMBER" as const, unit: "W", description: "Maksimum solar şarj giriş gücü (Watt)" },
  { name: "AC Çıkış (220V)", slug: "ac-cikis", inputType: "SELECT" as const, unit: null, description: "AC 220V çıkış desteği", presetValues: ["true", "false"] },
  { name: "Kablosuz Şarj", slug: "kablosuz-sarj", inputType: "SELECT" as const, unit: null, description: "Kablosuz şarj desteği", presetValues: ["true", "false"] },
  { name: "Dahili Fener", slug: "dahili-fener", inputType: "SELECT" as const, unit: null, description: "Dahili LED fener", presetValues: ["true", "false"] },
  { name: "Dahili Powerbank", slug: "dahili-powerbank", inputType: "SELECT" as const, unit: null, description: "Dahili powerbank/jumpstarter özelliği", presetValues: ["true", "false"] },
];

async function main() {
  console.log("🚀 Taşınabilir Güç Kaynakları Feature Güncelleme Başlıyor...\n");

  // 1. Kategoriyi bul
  const category = await prisma.category.findUnique({
    where: { slug: "tasinabilir-guc-kaynaklari" },
  });

  if (!category) {
    console.error("❌ Kategori bulunamadı: tasinabilir-guc-kaynaklari");
    process.exit(1);
  }
  console.log(`✅ Kategori bulundu: ${category.name} (${category.id})\n`);

  // 2. Feature definitions oluştur veya güncelle
  console.log("📝 Feature Definitions oluşturuluyor...");
  for (const def of FEATURE_DEFINITIONS) {
    let feature = await prisma.featureDefinition.findUnique({
      where: { slug: def.slug },
    });

    if (!feature) {
      feature = await prisma.featureDefinition.create({
        data: {
          name: def.name,
          slug: def.slug,
          inputType: def.inputType,
          unit: def.unit,
          description: def.description,
          isActive: true,
        },
      });
      console.log(`  ✅ Oluşturuldu: ${def.name} (${def.slug})`);

      // SELECT tipi için preset values ekle
      if (def.inputType === "SELECT" && def.presetValues) {
        for (let i = 0; i < def.presetValues.length; i++) {
          await prisma.featurePresetValue.create({
            data: {
              featureId: feature.id,
              value: def.presetValues[i],
              order: i,
            },
          });
        }
      }
    } else {
      console.log(`  ℹ️ Zaten var: ${def.name} (${def.slug})`);
    }

    // Kategoriye bağla (yoksa)
    const categoryFeature = await prisma.categoryFeature.findUnique({
      where: {
        categoryId_featureId: {
          categoryId: category.id,
          featureId: feature.id,
        },
      },
    });

    if (!categoryFeature) {
      await prisma.categoryFeature.create({
        data: {
          categoryId: category.id,
          featureId: feature.id,
          sortOrder: FEATURE_DEFINITIONS.indexOf(def),
          isRequired: false,
          isDefault: true,
        },
      });
      console.log(`    → Kategoriye bağlandı: ${def.name}`);
    }
  }
  console.log("");

  // 3. Tüm ürünleri al ve feature değerlerini güncelle
  console.log("🔄 Ürün Feature Değerleri güncelleniyor...\n");

  // Kategorideki tüm ürünleri al
  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
  });

  console.log(`  📋 ${products.length} ürün bulundu\n`);

  for (const product of products) {
    const slugLower = product.slug.toLowerCase();
    
    // Bu ürün için eşleşen feature seti bul
    let matchedProductKey: string | null = null;
    for (const [key, data] of Object.entries(PRODUCT_FEATURES)) {
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

    const featureData = PRODUCT_FEATURES[matchedProductKey];
    console.log(`  📦 ${product.name} → ${matchedProductKey}`);

    for (const [featureSlug, value] of Object.entries(featureData.features)) {
      const featureDef = await prisma.featureDefinition.findUnique({
        where: { slug: featureSlug },
      });

      if (!featureDef) {
        console.log(`    ⚠️ Feature bulunamadı: ${featureSlug}`);
        continue;
      }

      // Mevcut değeri kontrol et
      const existingValue = await prisma.productFeatureValue.findUnique({
        where: {
          productId_featureId: {
            productId: product.id,
            featureId: featureDef.id,
          },
        },
      });

      const valueData = featureDef.inputType === "NUMBER"
        ? { valueNumber: value as number, valueText: null }
        : { valueText: value as string, valueNumber: null };

      if (existingValue) {
        // Güncelle
        await prisma.productFeatureValue.update({
          where: { id: existingValue.id },
          data: valueData,
        });
        console.log(`    ✅ Güncellendi: ${featureSlug} = ${value}`);
      } else {
        // Oluştur
        await prisma.productFeatureValue.create({
          data: {
            productId: product.id,
            featureId: featureDef.id,
            ...valueData,
          },
        });
        console.log(`    ➕ Eklendi: ${featureSlug} = ${value}`);
      }
    }
    console.log("");
  }

  console.log("✅ Tüm güncellemeler tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

