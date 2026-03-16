/**
 * Taşınabilir Güç Kaynakları - Teknik Özellikler Seed Script
 * Bu script veritabanındaki mevcut teknik özellikleri günceller
 */

require('dotenv').config({ path: 'packages/db/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ürün verileri - Kullanıcıdan alınan gerçek veriler
const PRODUCT_SPECS = {
  "Singo1000": {
    kapasite: 1008,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 1000,
    "tepe-guc": 2000,
    "max-cikis-gucu": 2000,
    "ac-sarj-gucu": 800,
    "max-solar-sarj": 200,
    "solar-giris-voltaj": "10–30 V",
    "max-dc-pv-akimi": 10,
    "kablosuz-sarj": "true",
    "ups-eps": "true",
    "agirlik": 11.1,
    "ip-koruma": "IP20",
    "boyutlar": "348×264×192 mm",
    "usb-a-port": 1,
    "usb-c-port": 2,
    "ac-cikis-sayisi": 2,
    "ses-seviyesi": "<65 dB",
    "sarj-suresi": "~1.5 saat (AC)",
    "solar-sarj-suresi": "5-6 saat"
  },
  "Singo2000PRO": {
    kapasite: 1920,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 2000,
    "tepe-guc": 4000,
    "max-cikis-gucu": 4000,
    "ac-sarj-gucu": 1500,
    "max-solar-sarj": 500,
    "solar-giris-voltaj": "10–50 V",
    "max-dc-pv-akimi": 11,
    "kablosuz-sarj": "true",
    "ups-eps": "true",
    "agirlik": 20.5,
    "ip-koruma": "IP20",
    "boyutlar": "355×347×226 mm",
    "usb-a-port": 1,
    "usb-c-port": 2,
    "ac-cikis-sayisi": 4,
    "ses-seviyesi": "<65 dB",
    "sarj-suresi": "~1.5 saat (AC)",
    "solar-sarj-suresi": "4-5 saat"
  },
  "P800": {
    kapasite: 512,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 800,
    "tepe-guc": 1600,
    "max-cikis-gucu": 1600,
    "ac-sarj-gucu": 600,
    "max-solar-sarj": 300,
    "solar-giris-voltaj": "12–60 V",
    "max-dc-pv-akimi": 10,
    "kablosuz-sarj": "false",
    "ups-eps": "true",
    "agirlik": 6.55,
    "ip-koruma": "IP20",
    "boyutlar": "299×191×196.6 mm",
    "usb-a-port": 3,
    "usb-c-port": 2,
    "ac-cikis-sayisi": 2,
    "ses-seviyesi": "<60 dB",
    "sarj-suresi": "~1.2 saat (AC)",
    "solar-sarj-suresi": "3-4 saat"
  },
  "P1800": {
    kapasite: 1024,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 1800,
    "tepe-guc": 3600,
    "max-cikis-gucu": 3600,
    "ac-sarj-gucu": 1200,
    "max-solar-sarj": 500,
    "solar-giris-voltaj": "10–52 V",
    "max-dc-pv-akimi": 11,
    "kablosuz-sarj": "false",
    "ups-eps": "true",
    "agirlik": 12.7,
    "ip-koruma": "IP20",
    "boyutlar": "361.5×269.5×232.6 mm",
    "usb-a-port": 3,
    "usb-c-port": 2,
    "ac-cikis-sayisi": 3,
    "ses-seviyesi": "<65 dB",
    "sarj-suresi": "~1.2 saat (AC)",
    "solar-sarj-suresi": "3-4 saat"
  },
  "P3200": {
    kapasite: 2048,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 3200,
    "tepe-guc": 6400,
    "max-cikis-gucu": 6400,
    "ac-sarj-gucu": 1800,
    "max-solar-sarj": 1000,
    "solar-giris-voltaj": "12–80 V",
    "max-dc-pv-akimi": 16,
    "kablosuz-sarj": "false",
    "ups-eps": "true",
    "agirlik": 24.35,
    "ip-koruma": "IP20",
    "boyutlar": "445×298×311 mm",
    "usb-a-port": 4,
    "usb-c-port": 4,
    "ac-cikis-sayisi": 4,
    "ses-seviyesi": "<65 dB",
    "sarj-suresi": "~1.5 saat (AC)",
    "solar-sarj-suresi": "2-3 saat"
  },
  "SH4000": {
    kapasite: 5120,
    "batarya-tipi": "LiFePO4",
    "cikis-gucu": 4000,
    "tepe-guc": 8000,
    "max-cikis-gucu": 8000,
    "ac-sarj-gucu": 3600,
    "max-solar-sarj": 3000,
    "solar-giris-voltaj": "70–450 V (HV) / 12–50 V (LV)",
    "max-dc-pv-akimi": 16,
    "kablosuz-sarj": "false",
    "ups-eps": "true",
    "agirlik": 65,
    "ip-koruma": "IP54",
    "boyutlar": "510×673×266 mm (Inverter) / 510×375×198 mm (Batarya)",
    "usb-a-port": 0,
    "usb-c-port": 2,
    "ac-cikis-sayisi": 2,
    "ses-seviyesi": "<40 dB",
    "sarj-suresi": "~1.5 saat (AC)",
    "solar-sarj-suresi": "1.5-2 saat"
  }
};

// Özellik tanımları - slug -> { name, inputType, unit }
const FEATURE_DEFINITIONS = {
  "kapasite": { name: "Kapasite", inputType: "NUMBER", unit: "Wh" },
  "batarya-tipi": { name: "Batarya Tipi", inputType: "SELECT", unit: null },
  "cikis-gucu": { name: "Çıkış Gücü", inputType: "NUMBER", unit: "W" },
  "tepe-guc": { name: "Tepe Güç", inputType: "NUMBER", unit: "W" },
  "max-cikis-gucu": { name: "Max. Çıkış Gücü", inputType: "NUMBER", unit: "W" },
  "ac-sarj-gucu": { name: "AC Şarj Gücü", inputType: "NUMBER", unit: "W" },
  "max-solar-sarj": { name: "Max. Solar Şarj", inputType: "NUMBER", unit: "W" },
  "solar-giris-voltaj": { name: "Solar Giriş Voltajı", inputType: "TEXT", unit: null },
  "max-dc-pv-akimi": { name: "Max. DC PV Akımı", inputType: "NUMBER", unit: "A" },
  "kablosuz-sarj": { name: "Kablosuz Şarj", inputType: "SELECT", unit: null },
  "ups-eps": { name: "UPS/EPS Fonksiyonu", inputType: "SELECT", unit: null },
  "agirlik": { name: "Ağırlık", inputType: "NUMBER", unit: "kg" },
  "ip-koruma": { name: "IP Koruma", inputType: "SELECT", unit: null },
  "boyutlar": { name: "Boyutlar", inputType: "TEXT", unit: null },
  "usb-a-port": { name: "USB-A Port", inputType: "NUMBER", unit: "adet" },
  "usb-c-port": { name: "USB-C Port", inputType: "NUMBER", unit: "adet" },
  "ac-cikis-sayisi": { name: "AC Çıkış Sayısı", inputType: "NUMBER", unit: "adet" },
  "ses-seviyesi": { name: "Ses Seviyesi", inputType: "TEXT", unit: null },
  "sarj-suresi": { name: "Şarj Süresi (AC)", inputType: "TEXT", unit: null },
  "solar-sarj-suresi": { name: "Şarj Süresi (Solar)", inputType: "TEXT", unit: null }
};

// Preset değerler
const PRESET_VALUES = {
  "kablosuz-sarj": ["Evet", "Hayır"],
  "ups-eps": ["Evet", "Hayır"],
  "batarya-tipi": ["LiFePO4", "Li-ion", "NMC", "LTO"],
  "ip-koruma": ["IP20", "IP54", "IP65", "IP67"]
};

// Ürün slug eşleştirme
const PRODUCT_SLUG_MAP = {
  "Singo1000": "1008wh-tasinabilir-guc-kaynagi-99-99-mppt-bms-coklu-koruma-kablosuz-sarj-singo1000",
  "Singo2000PRO": "1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro",
  "P800": "512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800",
  "P1800": "1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800",
  "P3200": "2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200",
  "SH4000": "5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000"
};

async function main() {
  console.log('🚀 Taşınabilir Güç Kaynakları - Teknik Özellikler Seed Başlıyor...\n');

  // 1. Kategori ID'sini al
  const category = await prisma.category.findUnique({
    where: { slug: 'tasinabilir-guc-kaynaklari' }
  });
  
  if (!category) {
    console.error('❌ Kategori bulunamadı: tasinabilir-guc-kaynaklari');
    return;
  }
  console.log('✅ Kategori bulundu:', category.id);

  // 2. Ürünleri al
  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    select: { id: true, slug: true, name: true }
  });
  console.log('✅ Ürün sayısı:', products.length);

  // Ürün slug -> ID map
  const productIdMap = {};
  for (const p of products) {
    productIdMap[p.slug] = p.id;
  }

  // 3. Mevcut feature definition'ları al veya oluştur
  const featureIdMap = {};
  
  for (const [slug, def] of Object.entries(FEATURE_DEFINITIONS)) {
    let feature = await prisma.featureDefinition.findUnique({ where: { slug } });
    
    if (!feature) {
      // Yeni özellik oluştur
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
      // Mevcut özelliği güncelle
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

    // Mevcut preset'leri sil
    await prisma.featurePresetValue.deleteMany({
      where: { featureId }
    });

    // Yeni preset'leri ekle
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
    const productSlug = PRODUCT_SLUG_MAP[productName];
    const productId = productIdMap[productSlug];
    
    if (!productId) {
      console.error(`❌ Ürün bulunamadı: ${productName} (${productSlug})`);
      continue;
    }

    // Mevcut ProductFeatureValue'ları sil
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
      
      // Değeri dönüştür
      let valueText = null;
      let valueNumber = null;
      
      if (def.inputType === 'NUMBER') {
        valueNumber = typeof value === 'number' ? value : parseFloat(value);
        valueText = String(value);
      } else if (def.inputType === 'SELECT') {
        // true/false -> Evet/Hayır
        if (value === 'true' || value === true) {
          valueText = 'Evet';
        } else if (value === 'false' || value === false) {
          valueText = 'Hayır';
        } else {
          valueText = String(value);
        }
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

  console.log('\n🎉 Seed tamamlandı!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

