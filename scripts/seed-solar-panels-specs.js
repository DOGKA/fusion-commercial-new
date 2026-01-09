/**
 * Güneş Panelleri - Teknik Özellikler Seed Script
 * SP100, SP200, SP400 için detaylı teknik özellikler
 */

require('dotenv').config({ path: 'packages/db/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ürün slug eşleştirme
const PRODUCT_SLUGS = {
  SP100: 'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
  SP200: 'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
  SP400: 'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
};

// Özellik tanımları - slug -> { name, inputType, unit }
const FEATURE_DEFINITIONS = {
  "panel-gucu": { name: "Panel Gücü", inputType: "NUMBER", unit: "W" },
  "hucre-tipi": { name: "Hücre Tipi", inputType: "SELECT", unit: null },
  "calisma-voltaji": { name: "Çalışma Voltajı", inputType: "NUMBER", unit: "V" },
  "calisma-akimi": { name: "Çalışma Akımı", inputType: "NUMBER", unit: "A" },
  "acik-devre-gerilimi": { name: "Açık Devre Gerilimi", inputType: "NUMBER", unit: "V" },
  "kisa-devre-akimi": { name: "Kısa Devre Akımı", inputType: "NUMBER", unit: "A" },
  "verimlilik": { name: "Dönüşüm Verimliliği", inputType: "TEXT", unit: null },
  "calisma-sicakligi": { name: "Çalışma Sıcaklığı", inputType: "TEXT", unit: null },
  "ip-koruma": { name: "IP Koruma", inputType: "SELECT", unit: null },
  "katlanma-tipi": { name: "Katlanma Tipi", inputType: "SELECT", unit: null },
  "katlanmis-boyutlar": { name: "Katlanmış Boyutlar", inputType: "TEXT", unit: null },
  "acilmis-boyutlar": { name: "Açılmış Boyutlar", inputType: "TEXT", unit: null },
  "agirlik": { name: "Ağırlık", inputType: "NUMBER", unit: "kg" },
  "mc4-voltaj": { name: "MC4 Nominal Voltaj", inputType: "NUMBER", unit: "V" },
  "mc4-akim": { name: "MC4 Nominal Akım", inputType: "NUMBER", unit: "A" },
  "panel-konfigurasyonu": { name: "Panel Konfigürasyonu", inputType: "TEXT", unit: null },
};

// Preset değerler
const PRESET_VALUES = {
  "hucre-tipi": ["Monocrystalline Silicon", "Polycrystalline Silicon", "PERC"],
  "ip-koruma": ["IP65", "IP67", "IP68"],
  "katlanma-tipi": ["2 Fold", "4 Fold", "6 Fold", "Katlanmaz"],
};

// Ürün verileri
const PRODUCT_SPECS = {
  SP100: {
    "panel-gucu": 100,
    "hucre-tipi": "Monocrystalline Silicon",
    "calisma-voltaji": 18,
    "calisma-akimi": 5.6,
    "acik-devre-gerilimi": 21.6,
    "kisa-devre-akimi": 6.16,
    "verimlilik": "21-23%",
    "calisma-sicakligi": "-20~+70°C",
    "ip-koruma": "IP67",
    "katlanma-tipi": "4 Fold",
    "katlanmis-boyutlar": "387×609×30 mm",
    "acilmis-boyutlar": "1250×609×10 mm",
    "agirlik": 5,
    "mc4-voltaj": 18,
    "mc4-akim": 5.6,
    "panel-konfigurasyonu": "25W × 4",
  },
  SP200: {
    "panel-gucu": 200,
    "hucre-tipi": "Monocrystalline Silicon",
    "calisma-voltaji": 24,
    "calisma-akimi": 8.33,
    "acik-devre-gerilimi": 28.8,
    "kisa-devre-akimi": 9.12,
    "verimlilik": "21-23%",
    "calisma-sicakligi": "-20~+70°C",
    "ip-koruma": "IP67",
    "katlanma-tipi": "4 Fold",
    "katlanmis-boyutlar": "610×608×45 mm",
    "acilmis-boyutlar": "2074×608×30 mm",
    "agirlik": 8,
    "mc4-voltaj": 24,
    "mc4-akim": 8.33,
    "panel-konfigurasyonu": "50W × 4",
  },
  SP400: {
    "panel-gucu": 400,
    "hucre-tipi": "Monocrystalline Silicon",
    "calisma-voltaji": 44,
    "calisma-akimi": 10,
    "acik-devre-gerilimi": 52.8,
    "kisa-devre-akimi": 10,
    "verimlilik": "21-23%",
    "calisma-sicakligi": "-20~+70°C",
    "ip-koruma": "IP67",
    "katlanma-tipi": "4 Fold",
    "katlanmis-boyutlar": "725×990×45 mm",
    "acilmis-boyutlar": "2617×990×30 mm",
    "agirlik": 16.3,
    "mc4-voltaj": 44,
    "mc4-akim": 10,
    "panel-konfigurasyonu": "100W × 4",
  },
};

async function main() {
  console.log('🚀 Güneş Panelleri - Teknik Özellikler Seed Başlıyor...\n');

  // 1. Kategori ID'sini al
  const category = await prisma.category.findUnique({
    where: { slug: 'gunes-panelleri' }
  });
  
  if (!category) {
    console.error('❌ Kategori bulunamadı: gunes-panelleri');
    return;
  }
  console.log('✅ Kategori bulundu:', category.id);

  // 2. Ürünleri al
  const products = await prisma.product.findMany({
    where: { slug: { in: Object.values(PRODUCT_SLUGS) } },
    select: { id: true, slug: true, name: true }
  });
  console.log('✅ Ürün sayısı:', products.length);

  const productIdMap = {};
  for (const p of products) {
    productIdMap[p.slug] = p.id;
  }

  // 3. Feature definition'ları al veya oluştur
  const featureIdMap = {};
  
  for (const [slug, def] of Object.entries(FEATURE_DEFINITIONS)) {
    let feature = await prisma.featureDefinition.findUnique({ where: { slug } });
    
    if (!feature) {
      feature = await prisma.featureDefinition.create({
        data: {
          slug,
          name: def.name,
          inputType: def.inputType,
          unit: def.unit,
          isActive: true,
          order: Object.keys(featureIdMap).length
        }
      });
      console.log('➕ Yeni özellik oluşturuldu:', def.name);
    } else {
      feature = await prisma.featureDefinition.update({
        where: { slug },
        data: {
          name: def.name,
          inputType: def.inputType,
          unit: def.unit
        }
      });
      console.log('🔄 Özellik güncellendi:', def.name);
    }
    
    featureIdMap[slug] = feature.id;

    // CategoryFeature ilişkisini kontrol et/oluştur
    const existingCF = await prisma.categoryFeature.findFirst({
      where: { categoryId: category.id, featureId: feature.id }
    });
    
    if (!existingCF) {
      await prisma.categoryFeature.create({
        data: {
          categoryId: category.id,
          featureId: feature.id,
          sortOrder: Object.keys(featureIdMap).length
        }
      });
    }
  }
  console.log('✅ Özellik tanımları hazır\n');

  // 4. Preset değerleri ekle
  for (const [featureSlug, values] of Object.entries(PRESET_VALUES)) {
    const featureId = featureIdMap[featureSlug];
    if (!featureId) continue;

    await prisma.featurePresetValue.deleteMany({ where: { featureId } });

    for (let i = 0; i < values.length; i++) {
      await prisma.featurePresetValue.create({
        data: {
          featureId,
          value: values[i],
          order: i
        }
      });
    }
    console.log(`✅ Preset değerler eklendi: ${featureSlug} -> [${values.join(', ')}]`);
  }
  console.log('');

  // 5. Ürün teknik özelliklerini güncelle
  for (const [productName, specs] of Object.entries(PRODUCT_SPECS)) {
    const productSlug = PRODUCT_SLUGS[productName];
    const productId = productIdMap[productSlug];
    
    if (!productId) {
      console.error(`❌ Ürün bulunamadı: ${productName}`);
      continue;
    }

    // Mevcut değerleri sil
    await prisma.productFeatureValue.deleteMany({
      where: { productId }
    });

    // Yeni değerleri ekle
    let order = 0;
    for (const [featureSlug, value] of Object.entries(specs)) {
      const featureId = featureIdMap[featureSlug];
      if (!featureId) {
        console.warn(`⚠️ Özellik bulunamadı: ${featureSlug}`);
        continue;
      }

      const def = FEATURE_DEFINITIONS[featureSlug];
      
      let valueText = null;
      let valueNumber = null;
      
      if (def.inputType === 'NUMBER') {
        valueNumber = typeof value === 'number' ? value : parseFloat(value);
        valueText = String(value);
      } else {
        valueText = String(value);
      }

      await prisma.productFeatureValue.create({
        data: {
          productId,
          featureId,
          valueText,
          valueNumber,
          unit: def.unit,
          displayOrder: order++
        }
      });
    }
    
    console.log(`✅ ${productName}: ${Object.keys(specs).length} özellik güncellendi`);
  }

  console.log('\n🎉 Güneş Panelleri Seed Tamamlandı!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

