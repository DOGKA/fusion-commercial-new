/**
 * Kategori Bazlı Özellik Tanımları Seed Script
 * 
 * Bu script:
 * 1. Özellik tanımları (FeatureDefinition) oluşturur
 * 2. Kategorilere özellik atar (CategoryFeature)
 * 3. SELECT tipi özellikler için preset values ekler
 * 
 * Kullanım:
 * npx ts-node scripts/seed-features.ts
 */

import { PrismaClient } from '@prisma/client';

// Migration çalıştırıldıktan sonra bu script çalışacak
// Henüz migration yoksa TypeScript hataları normal
const prisma = new PrismaClient() as any;

// Migration çalıştırılana kadar manuel enum tanımı
const FeatureInputType = {
  TEXT: 'TEXT' as const,
  NUMBER: 'NUMBER' as const,
  SELECT: 'SELECT' as const,
};

// Özellik tanımları
const featureDefinitions = [
  // ===== TAŞINABİLİR GÜÇ KAYNAKLARI =====
  { name: 'Kapasite', slug: 'kapasite', inputType: FeatureInputType.NUMBER, unit: 'Wh', description: 'Batarya kapasitesi' },
  { name: 'Çıkış Gücü', slug: 'cikis-gucu', inputType: FeatureInputType.NUMBER, unit: 'W', description: 'Maksimum çıkış gücü' },
  { name: 'Tepe Güç', slug: 'tepe-guc', inputType: FeatureInputType.NUMBER, unit: 'W', description: 'Anlık maksimum güç' },
  { name: 'Batarya Tipi', slug: 'batarya-tipi', inputType: FeatureInputType.SELECT, description: 'Batarya teknolojisi' },
  { name: 'Ağırlık', slug: 'agirlik', inputType: FeatureInputType.NUMBER, unit: 'kg', description: 'Ürün ağırlığı' },
  { name: 'AC Çıkış Sayısı', slug: 'ac-cikis-sayisi', inputType: FeatureInputType.NUMBER, unit: 'adet', description: 'AC priz sayısı' },
  { name: 'USB-A Port', slug: 'usb-a-port', inputType: FeatureInputType.NUMBER, unit: 'adet', description: 'USB-A port sayısı' },
  { name: 'USB-C Port', slug: 'usb-c-port', inputType: FeatureInputType.NUMBER, unit: 'adet', description: 'USB-C port sayısı' },
  { name: 'DC Çıkış', slug: 'dc-cikis', inputType: FeatureInputType.TEXT, description: 'DC çıkış bilgisi' },
  { name: 'Şarj Süresi', slug: 'sarj-suresi', inputType: FeatureInputType.TEXT, description: 'Tam şarj süresi' },
  { name: 'Solar Giriş', slug: 'solar-giris', inputType: FeatureInputType.NUMBER, unit: 'W', description: 'Maksimum solar giriş gücü' },
  { name: 'Boyutlar', slug: 'boyutlar', inputType: FeatureInputType.TEXT, description: 'Ürün boyutları (GxDxY)' },
  { name: 'Garanti Süresi', slug: 'garanti-suresi', inputType: FeatureInputType.TEXT, description: 'Garanti süresi' },
  { name: 'Döngü Ömrü', slug: 'dongu-omru', inputType: FeatureInputType.NUMBER, unit: 'döngü', description: 'Batarya döngü ömrü' },
  
  // ===== ENDÜSTRİYEL ELDİVENLER =====
  { name: 'Malzeme', slug: 'malzeme', inputType: FeatureInputType.SELECT, description: 'Eldiven malzemesi' },
  { name: 'EN Standardı', slug: 'en-standardi', inputType: FeatureInputType.TEXT, description: 'EN güvenlik standardı' },
  { name: 'Kaplama', slug: 'kaplama', inputType: FeatureInputType.SELECT, description: 'Eldiven kaplama tipi' },
  { name: 'Kesim Seviyesi', slug: 'kesim-seviyesi', inputType: FeatureInputType.SELECT, description: 'Kesim koruma seviyesi' },
  { name: 'Renk', slug: 'renk', inputType: FeatureInputType.TEXT, description: 'Ürün rengi' },
  { name: 'Beden Aralığı', slug: 'beden-araligi', inputType: FeatureInputType.TEXT, description: 'Mevcut bedenler' },
  { name: 'Paket Adedi', slug: 'paket-adedi', inputType: FeatureInputType.NUMBER, unit: 'çift', description: 'Paketteki eldiven adedi' },
  
  // ===== GÜNEŞ PANELLERİ =====
  { name: 'Panel Gücü', slug: 'panel-gucu', inputType: FeatureInputType.NUMBER, unit: 'W', description: 'Panel watt değeri' },
  { name: 'Verimlilik', slug: 'verimlilik', inputType: FeatureInputType.NUMBER, unit: '%', description: 'Panel verimliliği' },
  { name: 'Hücre Tipi', slug: 'hucre-tipi', inputType: FeatureInputType.SELECT, description: 'Solar hücre tipi' },
  { name: 'Açık Devre Gerilimi', slug: 'acik-devre-gerilimi', inputType: FeatureInputType.NUMBER, unit: 'V', description: 'Voc değeri' },
  { name: 'Kısa Devre Akımı', slug: 'kisa-devre-akimi', inputType: FeatureInputType.NUMBER, unit: 'A', description: 'Isc değeri' },
  { name: 'Katlanabilir', slug: 'katlanabilir', inputType: FeatureInputType.SELECT, description: 'Katlanabilir özellik' },
  
  // ===== TELESKOPİK MERDİVENLER =====
  { name: 'Maksimum Yükseklik', slug: 'maksimum-yukseklik', inputType: FeatureInputType.NUMBER, unit: 'm', description: 'Açık halde maksimum yükseklik' },
  { name: 'Kapalı Boyut', slug: 'kapali-boyut', inputType: FeatureInputType.NUMBER, unit: 'cm', description: 'Kapalı halde boyut' },
  { name: 'Taşıma Kapasitesi', slug: 'tasima-kapasitesi', inputType: FeatureInputType.NUMBER, unit: 'kg', description: 'Maksimum yük kapasitesi' },
  { name: 'Basamak Sayısı', slug: 'basamak-sayisi', inputType: FeatureInputType.NUMBER, unit: 'adet', description: 'Toplam basamak sayısı' },
  { name: 'Merdiven Malzemesi', slug: 'merdiven-malzemesi', inputType: FeatureInputType.SELECT, description: 'Ana gövde malzemesi' },
];

// SELECT tipi özellikler için preset değerler
const presetValues: Record<string, string[]> = {
  'batarya-tipi': ['LiFePO4', 'Li-ion', 'NMC', 'LTO'],
  'malzeme': ['Nitril', 'Lateks', 'PU', 'Kumaş','Neopren', 'Deri', 'Karışım'],
  'kaplama': ['Tam Kaplı', 'Avuç İçi Kaplı', 'Parmak Ucu Kaplı', 'Kaplamasız', 'Köpük Nitril'],
  'kesim-seviyesi': ['A', 'B', 'C', 'D', 'E', 'F'],
  'hucre-tipi': ['Monokristal', 'Polikristal', 'İnce Film', 'PERC', 'TOPCon', 'HJT'],
  'katlanabilir': ['Evet', 'Hayır'],
  'merdiven-malzemesi': ['Alüminyum', 'Çelik', 'Fiberglas', 'Karbon Fiber'],
};

// Kategori - Özellik eşleştirmeleri
const categoryFeatures: Record<string, { features: string[], defaults: string[] }> = {
  'tasinabilir-guc-kaynaklari': {
    features: ['kapasite', 'cikis-gucu', 'tepe-guc', 'batarya-tipi', 'agirlik', 'ac-cikis-sayisi', 'usb-a-port', 'usb-c-port', 'dc-cikis', 'sarj-suresi', 'solar-giris', 'boyutlar', 'garanti-suresi', 'dongu-omru'],
    defaults: ['kapasite', 'cikis-gucu', 'batarya-tipi', 'agirlik']
  },
  'endustriyel-eldivenler': {
    features: ['malzeme', 'en-standardi', 'kaplama', 'kesim-seviyesi', 'renk', 'beden-araligi', 'paket-adedi'],
    defaults: ['malzeme', 'en-standardi', 'kesim-seviyesi']
  },
  'gunes-panelleri': {
    features: ['panel-gucu', 'verimlilik', 'hucre-tipi', 'acik-devre-gerilimi', 'kisa-devre-akimi', 'boyutlar', 'agirlik', 'katlanabilir'],
    defaults: ['panel-gucu', 'verimlilik', 'hucre-tipi']
  },
  'teleskopik-merdivenler': {
    features: ['maksimum-yukseklik', 'kapali-boyut', 'tasima-kapasitesi', 'basamak-sayisi', 'merdiven-malzemesi', 'agirlik'],
    defaults: ['maksimum-yukseklik', 'tasima-kapasitesi']
  },
};

async function main() {
  console.log('🚀 Özellik tanımları seed işlemi başlıyor...\n');

  // 1. Özellik tanımlarını oluştur
  console.log('📝 Özellik tanımları oluşturuluyor...');
  for (const def of featureDefinitions) {
    const feature = await prisma.featureDefinition.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        inputType: def.inputType,
        unit: def.unit,
        description: def.description,
      },
      create: {
        name: def.name,
        slug: def.slug,
        inputType: def.inputType,
        unit: def.unit,
        description: def.description,
        order: featureDefinitions.indexOf(def),
      },
    });
    console.log(`  ✅ ${feature.name} (${feature.inputType})`);

    // 2. Preset değerleri ekle (SELECT tipi için)
    if (presetValues[def.slug]) {
      for (let i = 0; i < presetValues[def.slug].length; i++) {
        const value = presetValues[def.slug][i];
        await prisma.featurePresetValue.upsert({
          where: { 
            featureId_value: { 
              featureId: feature.id, 
              value: value 
            } 
          },
          update: { order: i },
          create: {
            featureId: feature.id,
            value: value,
            order: i,
          },
        });
      }
      console.log(`     ↳ ${presetValues[def.slug].length} preset değer eklendi`);
    }
  }

  // 3. Kategorileri bul ve özellik atamaları yap
  console.log('\n📂 Kategorilere özellik atanıyor...');
  for (const [categorySlug, config] of Object.entries(categoryFeatures)) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.log(`  ⚠️  Kategori bulunamadı: ${categorySlug}`);
      continue;
    }

    console.log(`  📁 ${category.name}`);

    for (let i = 0; i < config.features.length; i++) {
      const featureSlug = config.features[i];
      const feature = await prisma.featureDefinition.findUnique({
        where: { slug: featureSlug },
      });

      if (!feature) {
        console.log(`     ⚠️  Özellik bulunamadı: ${featureSlug}`);
        continue;
      }

      await prisma.categoryFeature.upsert({
        where: {
          categoryId_featureId: {
            categoryId: category.id,
            featureId: feature.id,
          },
        },
        update: {
          sortOrder: i,
          isDefault: config.defaults.includes(featureSlug),
        },
        create: {
          categoryId: category.id,
          featureId: feature.id,
          sortOrder: i,
          isDefault: config.defaults.includes(featureSlug),
        },
      });
      console.log(`     ✅ ${feature.name}${config.defaults.includes(featureSlug) ? ' (varsayılan)' : ''}`);
    }
  }

  console.log('\n✨ Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
