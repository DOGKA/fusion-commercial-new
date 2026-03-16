import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// DOKUNMATİK EKRAN DESTEĞİ OLAN ELDİVENLER
// ═══════════════════════════════════════════════════════════════════════════

const TOUCHSCREEN_ENABLED_GLOVES = [
  'TG1290',
  '10 ÇİFT TG1290',
  'TD01',
  'TD04',
  'TD05',
  'TD06',
  'TD07',
  'TG1072',
  'TG1140',
  'TG1170',
  'TG5140',
  'TG5210',
];

// ═══════════════════════════════════════════════════════════════════════════
// DOKUNMATİK EKRAN DESTEĞİ OLMAYAN ELDİVENLER
// ═══════════════════════════════════════════════════════════════════════════

const TOUCHSCREEN_DISABLED_GLOVES = [
  'TG5545',
  'TG6240',
  'TM100',
  'TM106',
  'TM112',
  'TM178',
  'TG5895',
];

// ═══════════════════════════════════════════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════════════════

async function fixGlovesTouchscreen() {
  console.log('🧤 Eldiven dokunmatik ekran desteği güncelleniyor...\n');

  // Endüstriyel Eldivenler kategorisini bul
  const category = await prisma.category.findFirst({
    where: { 
      OR: [
        { slug: 'endustriyel-eldivenler' },
        { name: { contains: 'Eldivenler', mode: 'insensitive' } }
      ]
    },
  });

  if (!category) {
    console.log('❌ Eldivenler kategorisi bulunamadı!');
    return;
  }

  // Kategorideki tüm ürünleri al
  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    select: { id: true, name: true, slug: true },
  });

  console.log(`📦 ${products.length} eldiven ürünü bulundu.\n`);

  let enabledCount = 0;
  let disabledCount = 0;

  for (const product of products) {
    // Ürün adında dokunmatik destekli model var mı kontrol et
    const hasTouchscreen = TOUCHSCREEN_ENABLED_GLOVES.some(model => 
      product.name.toUpperCase().includes(model.toUpperCase())
    );

    const touchscreenValue = hasTouchscreen ? 'Evet' : 'Hayır';

    // Mevcut "Dokunmatik Ekran Desteği" spec'i sil
    await prisma.technicalSpec.deleteMany({
      where: {
        productId: product.id,
        label: { in: ['Dokunmatik Ekran Desteği', 'Dokunmatik Ekran', 'Dokunmatik Uyumluluk'] },
      },
    });

    // Yeni spec ekle
    await prisma.technicalSpec.create({
      data: {
        productId: product.id,
        label: 'Dokunmatik Ekran Desteği',
        value: touchscreenValue,
        group: 'Özellik',
        order: 100,
      },
    });

    if (hasTouchscreen) {
      console.log(`   ✅ ${product.name.substring(0, 50)}... → Dokunmatik: EVET`);
      enabledCount++;
    } else {
      console.log(`   ❌ ${product.name.substring(0, 50)}... → Dokunmatik: HAYIR`);
      disabledCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🎉 İşlem tamamlandı!`);
  console.log(`   ✅ Dokunmatik destekli: ${enabledCount}`);
  console.log(`   ❌ Dokunmatik desteksiz: ${disabledCount}`);
}

// Script'i çalıştır
fixGlovesTouchscreen()
  .catch((e) => {
    console.error('❌ Kritik Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

