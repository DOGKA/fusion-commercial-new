import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// TÜM ÜRÜN TEKNİK ÖZELLİKLERİNİ EKLEYİP FİLTRELERİN ÇALIŞMASINI SAĞLAYAN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════

// Önce eksik feature tanımlarını oluştur
const MISSING_FEATURES = [
  { name: 'Dahili Fener', slug: 'dahili-fener', inputType: 'SELECT', unit: null },
  { name: 'Kablosuz Şarj', slug: 'kablosuz-sarj', inputType: 'SELECT', unit: null },
  { name: 'Dahili Powerbank', slug: 'dahili-powerbank', inputType: 'SELECT', unit: null },
  { name: 'Dokunmatik Ekran Uyumlu', slug: 'dokunmatik-ekran-uyumlu', inputType: 'SELECT', unit: null },
  { name: 'AC Çıkış', slug: 'ac-cikis', inputType: 'SELECT', unit: null },
  { name: 'Merdiven Tipi', slug: 'merdiven-tipi', inputType: 'SELECT', unit: null },
  { name: 'Yalıtkan', slug: 'yalitkan', inputType: 'SELECT', unit: null },
];

// Ürün slug'ları ve teknik özellikleri
interface ProductFeature {
  featureSlug: string;
  valueNumber?: number;
  valueText?: string;
}

interface ProductData {
  slug: string;
  features: ProductFeature[];
}

// ═══════════════════════════════════════════════════════════════════════════
// TAŞINABİLİR GÜÇ KAYNAKLARI
// ═══════════════════════════════════════════════════════════════════════════
const POWER_STATIONS: ProductData[] = [
  {
    slug: '512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
    features: [
      { featureSlug: 'kapasite', valueNumber: 512 },
      { featureSlug: 'cikis-gucu', valueNumber: 1600 },
      { featureSlug: 'dahili-fener', valueText: 'true' },
      { featureSlug: 'kablosuz-sarj', valueText: 'false' },
      { featureSlug: 'dahili-powerbank', valueText: 'false' },
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 200 },
    ],
  },
  {
    slug: '1008wh-tasinabilir-guc-kaynagi-99-99-mppt-bms-coklu-koruma-kablosuz-sarj-singo1000',
    features: [
      { featureSlug: 'kapasite', valueNumber: 1008 },
      { featureSlug: 'cikis-gucu', valueNumber: 1000 },
      { featureSlug: 'dahili-fener', valueText: 'false' }, // Singo1000'de fener YOK
      { featureSlug: 'kablosuz-sarj', valueText: 'true' }, // Kablosuz şarj VAR
      { featureSlug: 'dahili-powerbank', valueText: 'false' },
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 200 },
    ],
  },
  {
    slug: '1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
    features: [
      { featureSlug: 'kapasite', valueNumber: 1024 },
      { featureSlug: 'cikis-gucu', valueNumber: 3600 },
      { featureSlug: 'dahili-fener', valueText: 'true' }, // Dahili fener VAR
      { featureSlug: 'kablosuz-sarj', valueText: 'false' },
      { featureSlug: 'dahili-powerbank', valueText: 'false' },
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 400 },
    ],
  },
  {
    slug: '1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
    features: [
      { featureSlug: 'kapasite', valueNumber: 1920 },
      { featureSlug: 'cikis-gucu', valueNumber: 4000 },
      { featureSlug: 'dahili-fener', valueText: 'false' }, // Singo2000Pro'da fener YOK
      { featureSlug: 'kablosuz-sarj', valueText: 'true' }, // Kablosuz şarj VAR
      { featureSlug: 'dahili-powerbank', valueText: 'false' },
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 500 },
    ],
  },
  {
    slug: '2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
    features: [
      { featureSlug: 'kapasite', valueNumber: 2048 },
      { featureSlug: 'cikis-gucu', valueNumber: 3200 }, // 3200W çıkış gücü!
      { featureSlug: 'dahili-fener', valueText: 'true' }, // Dahili fener VAR
      { featureSlug: 'kablosuz-sarj', valueText: 'false' },
      { featureSlug: 'dahili-powerbank', valueText: 'true' }, // Dahili powerbank VAR
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 1000 },
    ],
  },
  {
    slug: '5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
    features: [
      { featureSlug: 'kapasite', valueNumber: 5120 },
      { featureSlug: 'cikis-gucu', valueNumber: 8000 },
      { featureSlug: 'dahili-fener', valueText: 'false' }, // SH4000'de fener YOK
      { featureSlug: 'kablosuz-sarj', valueText: 'false' },
      { featureSlug: 'dahili-powerbank', valueText: 'false' },
      { featureSlug: 'ac-cikis', valueText: 'true' },
      { featureSlug: 'solar-giris', valueNumber: 2400 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GÜNEŞ PANELLERİ
// ═══════════════════════════════════════════════════════════════════════════
const SOLAR_PANELS: ProductData[] = [
  {
    slug: 'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
    features: [
      { featureSlug: 'panel-gucu', valueNumber: 100 },
      { featureSlug: 'katlanabilir', valueText: 'true' },
      { featureSlug: 'verimlilik', valueNumber: 23 },
    ],
  },
  {
    slug: 'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
    features: [
      { featureSlug: 'panel-gucu', valueNumber: 200 },
      { featureSlug: 'katlanabilir', valueText: 'true' },
      { featureSlug: 'verimlilik', valueNumber: 23 },
    ],
  },
  {
    slug: 'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
    features: [
      { featureSlug: 'panel-gucu', valueNumber: 400 },
      { featureSlug: 'katlanabilir', valueText: 'true' },
      { featureSlug: 'verimlilik', valueNumber: 23 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ENDÜSTRİYEL ELDİVENLER
// TG1290 ve TG6240 - Dokunmatik ekran uyumlu
// TD01, TD05, TD06, TD07 - Tek kullanımlık nitril, dokunmatik ekran YOK
// TG5545 - Darbe emici, dokunmatik ekran YOK
// ═══════════════════════════════════════════════════════════════════════════
const GLOVES: ProductData[] = [
  {
    slug: '10-cift-tg1290-dokunmatik-antistatik-a-seviye-kesilme-yirtilma-direncli-cok-amacli-is-eldiveni',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'true' }, // DOKUNMATIK EKRAN VAR
      { featureSlug: 'kesim-seviyesi', valueText: 'A' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 10 },
    ],
  },
  {
    slug: 'tg1290-dokunmatik-antistatik-a-seviye-kesilme-yirtilma-direncli-cok-amacli-is-eldiveni',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'true' }, // DOKUNMATIK EKRAN VAR
      { featureSlug: 'kesim-seviyesi', valueText: 'A' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 1 },
    ],
  },
  {
    slug: 'tg6240-microdex-lxt-nitrile-kesilme-seviyesi-e-is-eldiveni',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'true' }, // DOKUNMATIK EKRAN VAR
      { featureSlug: 'kesim-seviyesi', valueText: 'E' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
    ],
  },
  {
    slug: 'td01-karbon-notr-biyobozunur-nitril-tek-kullanim-eldiven-100lu-kutu',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'false' }, // DOKUNMATIK YOK
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 100 },
    ],
  },
  {
    slug: 'td05-x-dura-grip-siyah-nitril-tek-kullanim-eldiven-50li-kutu',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'false' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 50 },
    ],
  },
  {
    slug: 'td06-x-dura-grip-mavi-nitril-tek-kullanim-eldiven-50li-kutu',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'false' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 50 },
    ],
  },
  {
    slug: 'td07-x-dura-grip-turuncu-nitril-tek-kullanim-eldiven-50li-kutu',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'false' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
      { featureSlug: 'paket-adedi', valueNumber: 50 },
    ],
  },
  {
    slug: 'tg5545-darbe-emici-nitril-kopuk-kesim-seviyesi-e-guvenlik-eldiveni',
    features: [
      { featureSlug: 'dokunmatik-ekran-uyumlu', valueText: 'false' },
      { featureSlug: 'kesim-seviyesi', valueText: 'E' },
      { featureSlug: 'kaplama', valueText: 'nitril' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TELESKOPİK MERDİVENLER
// 1600ET ve TS1600ET - 3.8m, 13 basamak, Alüminyum Kevlar
// ═══════════════════════════════════════════════════════════════════════════
const LADDERS: ProductData[] = [
  {
    slug: '3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-1600et-tactical',
    features: [
      { featureSlug: 'maksimum-yukseklik', valueNumber: 3.8 },
      { featureSlug: 'basamak-sayisi', valueNumber: 13 },
      { featureSlug: 'tasima-kapasitesi', valueNumber: 150 },
      { featureSlug: 'merdiven-malzemesi', valueText: 'aluminyum-kevlar' },
      { featureSlug: 'merdiven-tipi', valueText: 'teleskopik' },
      { featureSlug: 'yalitkan', valueText: 'true' },
    ],
  },
  {
    slug: '3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-ts1600et-tactical',
    features: [
      { featureSlug: 'maksimum-yukseklik', valueNumber: 3.8 },
      { featureSlug: 'basamak-sayisi', valueNumber: 13 },
      { featureSlug: 'tasima-kapasitesi', valueNumber: 150 },
      { featureSlug: 'merdiven-malzemesi', valueText: 'aluminyum-kevlar' },
      { featureSlug: 'merdiven-tipi', valueText: 'teleskopik' },
      { featureSlug: 'yalitkan', valueText: 'true' },
    ],
  },
];

async function addAllProductFeatures() {
  console.log('🚀 Tüm ürün teknik özellikleri ekleniyor...\n');

  // 1. Eksik feature tanımlarını oluştur
  console.log('📋 Eksik feature tanımları oluşturuluyor...');
  for (const feature of MISSING_FEATURES) {
    const existing = await prisma.featureDefinition.findUnique({
      where: { slug: feature.slug },
    });

    if (!existing) {
      await prisma.featureDefinition.create({
        data: {
          name: feature.name,
          slug: feature.slug,
          inputType: feature.inputType as any,
          unit: feature.unit,
        },
      });
      console.log(`   ✅ Oluşturuldu: ${feature.name}`);
    } else {
      console.log(`   ⏭️ Zaten var: ${feature.name}`);
    }
  }

  // 2. Tüm feature tanımlarını al
  const allFeatures = await prisma.featureDefinition.findMany();
  const featureMap = new Map(allFeatures.map((f) => [f.slug, f]));
  console.log(`\n📚 Toplam ${featureMap.size} feature tanımı mevcut\n`);

  // 3. Tüm ürün verilerini birleştir
  const allProducts = [...POWER_STATIONS, ...SOLAR_PANELS, ...GLOVES, ...LADDERS];

  let totalAdded = 0;
  let totalUpdated = 0;
  let notFound = 0;

  for (const productData of allProducts) {
    // Ürünü bul
    const product = await prisma.product.findFirst({
      where: { slug: productData.slug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${productData.slug.substring(0, 50)}...`);
      notFound++;
      continue;
    }

    console.log(`📦 ${product.name.substring(0, 40)}...`);

    for (const featureData of productData.features) {
      const feature = featureMap.get(featureData.featureSlug);

      if (!feature) {
        console.log(`   ⚠️ Feature bulunamadı: ${featureData.featureSlug}`);
        continue;
      }

      // Mevcut değeri kontrol et
      const existing = await prisma.productFeatureValue.findUnique({
        where: {
          productId_featureId: {
            productId: product.id,
            featureId: feature.id,
          },
        },
      });

      if (existing) {
        // Güncelle
        await prisma.productFeatureValue.update({
          where: { id: existing.id },
          data: {
            valueNumber: featureData.valueNumber ?? null,
            valueText: featureData.valueText ?? null,
          },
        });
        totalUpdated++;
      } else {
        // Oluştur
        await prisma.productFeatureValue.create({
          data: {
            productId: product.id,
            featureId: feature.id,
            valueNumber: featureData.valueNumber ?? null,
            valueText: featureData.valueText ?? null,
            unit: feature.unit,
          },
        });
        totalAdded++;
      }
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 İşlem tamamlandı!');
  console.log(`   ✅ Eklenen: ${totalAdded}`);
  console.log(`   🔄 Güncellenen: ${totalUpdated}`);
  console.log(`   ❌ Bulunamayan ürün: ${notFound}`);
  console.log('═'.repeat(60));
}

// Script'i çalıştır
addAllProductFeatures()
  .catch((e) => {
    console.error('❌ Kritik Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

