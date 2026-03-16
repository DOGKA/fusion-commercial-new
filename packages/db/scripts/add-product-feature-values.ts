import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ürün slug'ları
const PRODUCT_SLUGS = {
  P800: '512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
  P1800: '1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
  SINGO2000PRO: '1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
  P3200: '2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
  SH4000: '5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
  SP100: 'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
  SP200: 'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
  SP400: 'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
};

// Feature slug'ları ve değerler
interface FeatureValue {
  featureSlug: string;
  valueNumber?: number;
  valueText?: string;
  unit?: string;
}

// ═══════════════════════════════════════════════════════════════
// GÜÇ KAYNAKLARI ÖZELLİK DEĞERLERİ
// ═══════════════════════════════════════════════════════════════

const P800_VALUES: FeatureValue[] = [
  { featureSlug: 'kapasite', valueNumber: 512, unit: 'Wh' },
  { featureSlug: 'cikis-gucu', valueNumber: 800, unit: 'W' },
  { featureSlug: 'tepe-guc', valueNumber: 1600, unit: 'W' },
  { featureSlug: 'batarya-tipi', valueText: 'LiFePO4' },
  { featureSlug: 'agirlik', valueNumber: 6.55, unit: 'kg' },
  { featureSlug: 'ac-cikis-sayisi', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'usb-a-port', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'usb-c-port', valueNumber: 3, unit: 'adet' },
  { featureSlug: 'dc-cikis', valueText: '13.2V⎓8A (×2)' },
  { featureSlug: 'sarj-suresi', valueText: '~0.85 saat (AC)' },
  { featureSlug: 'solar-giris', valueNumber: 300, unit: 'W' },
  { featureSlug: 'boyutlar', valueText: '299×191.4×196.6mm' },
  { featureSlug: 'dongu-omru', valueNumber: 4000, unit: 'döngü' },
  { featureSlug: 'verimlilik', valueNumber: 99, unit: '%' },
];

const P1800_VALUES: FeatureValue[] = [
  { featureSlug: 'kapasite', valueNumber: 1024, unit: 'Wh' },
  { featureSlug: 'cikis-gucu', valueNumber: 1800, unit: 'W' },
  { featureSlug: 'tepe-guc', valueNumber: 3600, unit: 'W' },
  { featureSlug: 'batarya-tipi', valueText: 'LiFePO4' },
  { featureSlug: 'agirlik', valueNumber: 12.7, unit: 'kg' },
  { featureSlug: 'ac-cikis-sayisi', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'usb-a-port', valueNumber: 3, unit: 'adet' },
  { featureSlug: 'usb-c-port', valueNumber: 3, unit: 'adet' },
  { featureSlug: 'dc-cikis', valueText: '13.2V⎓10A, 13.2V⎓8A (×2)' },
  { featureSlug: 'sarj-suresi', valueText: '~0.85 saat (AC)' },
  { featureSlug: 'solar-giris', valueNumber: 500, unit: 'W' },
  { featureSlug: 'boyutlar', valueText: '361.5×269.5×232.6mm' },
  { featureSlug: 'dongu-omru', valueNumber: 4000, unit: 'döngü' },
  { featureSlug: 'verimlilik', valueNumber: 99, unit: '%' },
];

const SINGO2000PRO_VALUES: FeatureValue[] = [
  { featureSlug: 'kapasite', valueNumber: 1920, unit: 'Wh' },
  { featureSlug: 'cikis-gucu', valueNumber: 2000, unit: 'W' },
  { featureSlug: 'tepe-guc', valueNumber: 4000, unit: 'W' },
  { featureSlug: 'batarya-tipi', valueText: 'LiFePO4' },
  { featureSlug: 'agirlik', valueNumber: 20.5, unit: 'kg' },
  { featureSlug: 'ac-cikis-sayisi', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'usb-a-port', valueNumber: 1, unit: 'adet' },
  { featureSlug: 'usb-c-port', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'dc-cikis', valueText: '132W, 13.2V⎓10A' },
  { featureSlug: 'sarj-suresi', valueText: '~1.5 saat (AC)' },
  { featureSlug: 'solar-giris', valueNumber: 500, unit: 'W' },
  { featureSlug: 'boyutlar', valueText: '355×347×226mm' },
  { featureSlug: 'dongu-omru', valueNumber: 4000, unit: 'döngü' },
  { featureSlug: 'verimlilik', valueNumber: 99, unit: '%' },
];

const P3200_VALUES: FeatureValue[] = [
  { featureSlug: 'kapasite', valueNumber: 2048, unit: 'Wh' },
  { featureSlug: 'cikis-gucu', valueNumber: 3200, unit: 'W' },
  { featureSlug: 'tepe-guc', valueNumber: 6400, unit: 'W' },
  { featureSlug: 'batarya-tipi', valueText: 'LiFePO4' },
  { featureSlug: 'agirlik', valueNumber: 24.35, unit: 'kg' },
  { featureSlug: 'ac-cikis-sayisi', valueNumber: 4, unit: 'adet' },
  { featureSlug: 'usb-a-port', valueNumber: 4, unit: 'adet' },
  { featureSlug: 'usb-c-port', valueNumber: 4, unit: 'adet' },
  { featureSlug: 'dc-cikis', valueText: '13.2V⎓10A, 13.2V⎓8A (×2)' },
  { featureSlug: 'sarj-suresi', valueText: '~1.2 saat (AC)' },
  { featureSlug: 'solar-giris', valueNumber: 1000, unit: 'W' },
  { featureSlug: 'boyutlar', valueText: '445×298×371mm' },
  { featureSlug: 'dongu-omru', valueNumber: 4000, unit: 'döngü' },
  { featureSlug: 'verimlilik', valueNumber: 99, unit: '%' },
];

const SH4000_VALUES: FeatureValue[] = [
  { featureSlug: 'kapasite', valueNumber: 5120, unit: 'Wh' },
  { featureSlug: 'cikis-gucu', valueNumber: 4000, unit: 'W' },
  { featureSlug: 'tepe-guc', valueNumber: 8000, unit: 'W' },
  { featureSlug: 'batarya-tipi', valueText: 'LiFePO4' },
  { featureSlug: 'agirlik', valueNumber: 65, unit: 'kg' },
  { featureSlug: 'usb-c-port', valueNumber: 2, unit: 'adet' },
  { featureSlug: 'dc-cikis', valueText: 'XT60: 12V⎓30A, 24V⎓25A, 36V⎓20A' },
  { featureSlug: 'sarj-suresi', valueText: '~1.5 saat (AC)' },
  { featureSlug: 'solar-giris', valueNumber: 3000, unit: 'W' },
  { featureSlug: 'boyutlar', valueText: '510×673×266mm' },
  { featureSlug: 'dongu-omru', valueNumber: 4000, unit: 'döngü' },
  { featureSlug: 'verimlilik', valueNumber: 99, unit: '%' },
];

// ═══════════════════════════════════════════════════════════════
// SOLAR PANEL ÖZELLİK DEĞERLERİ
// ═══════════════════════════════════════════════════════════════

const SP100_VALUES: FeatureValue[] = [
  { featureSlug: 'panel-gucu', valueNumber: 100, unit: 'W' },
  { featureSlug: 'hucre-tipi', valueText: 'Monokristal Silikon' },
  { featureSlug: 'verimlilik', valueNumber: 23, unit: '%' },
  { featureSlug: 'acik-devre-gerilimi', valueNumber: 21.6, unit: 'V' },
  { featureSlug: 'kisa-devre-akimi', valueNumber: 6.16, unit: 'A' },
  { featureSlug: 'katlanabilir', valueText: 'Evet' },
  { featureSlug: 'agirlik', valueNumber: 5, unit: 'kg' },
  { featureSlug: 'boyutlar', valueText: '387×609×30mm (Kapalı)' },
];

const SP200_VALUES: FeatureValue[] = [
  { featureSlug: 'panel-gucu', valueNumber: 200, unit: 'W' },
  { featureSlug: 'hucre-tipi', valueText: 'Monokristal Silikon' },
  { featureSlug: 'verimlilik', valueNumber: 23, unit: '%' },
  { featureSlug: 'acik-devre-gerilimi', valueNumber: 28.8, unit: 'V' },
  { featureSlug: 'kisa-devre-akimi', valueNumber: 9.12, unit: 'A' },
  { featureSlug: 'katlanabilir', valueText: 'Evet' },
  { featureSlug: 'agirlik', valueNumber: 8, unit: 'kg' },
  { featureSlug: 'boyutlar', valueText: '610×608×45mm (Kapalı)' },
];

const SP400_VALUES: FeatureValue[] = [
  { featureSlug: 'panel-gucu', valueNumber: 400, unit: 'W' },
  { featureSlug: 'hucre-tipi', valueText: 'Monokristal Silikon' },
  { featureSlug: 'verimlilik', valueNumber: 23, unit: '%' },
  { featureSlug: 'acik-devre-gerilimi', valueNumber: 52.8, unit: 'V' },
  { featureSlug: 'kisa-devre-akimi', valueNumber: 10, unit: 'A' },
  { featureSlug: 'katlanabilir', valueText: 'Evet' },
  { featureSlug: 'agirlik', valueNumber: 16.3, unit: 'kg' },
  { featureSlug: 'boyutlar', valueText: '725×990×45mm (Kapalı)' },
];

// ═══════════════════════════════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════

async function addProductFeatureValues() {
  console.log('🚀 Ürün özellik değerleri ekleniyor...\n');

  // Tüm feature tanımlarını al
  const allFeatures = await prisma.featureDefinition.findMany();
  const featureMap = new Map(allFeatures.map(f => [f.slug, f]));

  const productData: { slug: string; values: FeatureValue[] }[] = [
    { slug: PRODUCT_SLUGS.P800, values: P800_VALUES },
    { slug: PRODUCT_SLUGS.P1800, values: P1800_VALUES },
    { slug: PRODUCT_SLUGS.SINGO2000PRO, values: SINGO2000PRO_VALUES },
    { slug: PRODUCT_SLUGS.P3200, values: P3200_VALUES },
    { slug: PRODUCT_SLUGS.SH4000, values: SH4000_VALUES },
    { slug: PRODUCT_SLUGS.SP100, values: SP100_VALUES },
    { slug: PRODUCT_SLUGS.SP200, values: SP200_VALUES },
    { slug: PRODUCT_SLUGS.SP400, values: SP400_VALUES },
  ];

  for (const { slug, values } of productData) {
    // Ürünü bul
    const product = await prisma.product.findFirst({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${slug}`);
      continue;
    }

    console.log(`📦 ${product.name} işleniyor...`);

    // Mevcut feature değerlerini sil
    await prisma.productFeatureValue.deleteMany({
      where: { productId: product.id },
    });

    // Yeni değerleri ekle
    let addedCount = 0;
    for (let i = 0; i < values.length; i++) {
      const fv = values[i];
      const feature = featureMap.get(fv.featureSlug);
      
      if (!feature) {
        console.log(`   ⚠️ Özellik bulunamadı: ${fv.featureSlug}`);
        continue;
      }

      await prisma.productFeatureValue.create({
        data: {
          productId: product.id,
          featureId: feature.id,
          valueNumber: fv.valueNumber ?? null,
          valueText: fv.valueText ?? null,
          unit: fv.unit ?? feature.unit ?? null,
          displayOrder: i,
        },
      });
      addedCount++;
    }

    console.log(`   ✅ ${addedCount} özellik eklendi\n`);
  }

  console.log('🎉 Tüm ürün özellik değerleri başarıyla eklendi!');
}

// Script'i çalıştır
addProductFeatureValues()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
