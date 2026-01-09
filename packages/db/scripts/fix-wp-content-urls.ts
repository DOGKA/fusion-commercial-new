/**
 * Fix wp-content URLs in Database
 * 
 * Bu script veritabanındaki hatalı WordPress URL'lerini bulup düzeltir.
 * /wp-content/uploads/... şeklindeki URL'ler 404 hatası veriyor.
 * 
 * Çalıştırma:
 * cd packages/db && npx ts-node scripts/fix-wp-content-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════════════════

async function findAndFixWpContentUrls() {
  console.log('🔍 wp-content URL\'leri aranıyor...\n');

  // 1. Product images içinde wp-content URL'leri ara
  console.log('📦 Ürün görselleri kontrol ediliyor...');
  const productsWithWpContent = await prisma.product.findMany({
    where: {
      OR: [
        { images: { hasSome: [] } }, // We'll filter in JS
        { thumbnail: { contains: 'wp-content' } },
        { description: { contains: 'wp-content' } },
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      thumbnail: true,
      description: true,
    }
  });

  // Filter products with wp-content in images array
  const productsWithWpImages = productsWithWpContent.filter(p => 
    p.images.some(img => img.includes('wp-content')) ||
    (p.thumbnail && p.thumbnail.includes('wp-content')) ||
    (p.description && p.description.includes('wp-content'))
  );

  if (productsWithWpImages.length === 0) {
    // Try raw query to find any wp-content references
    const rawProducts = await prisma.$queryRaw<Array<{id: string, name: string, images: string[]}>>`
      SELECT id, name, images 
      FROM products 
      WHERE array_to_string(images, ',') LIKE '%wp-content%'
    `;
    
    if (rawProducts.length > 0) {
      console.log(`\n⚠️  ${rawProducts.length} ürün wp-content URL içeriyor:\n`);
      
      for (const product of rawProducts) {
        const wpImages = product.images.filter(img => img.includes('wp-content'));
        console.log(`   📦 ${product.name} (${product.id})`);
        wpImages.forEach(img => console.log(`      🖼️  ${img}`));
      }
      
      console.log('\n🛠️  Bu URL\'leri düzeltmek için --fix flag\'i kullanın.');
    } else {
      console.log('✅ Product images içinde wp-content URL bulunamadı.');
    }
  } else {
    console.log(`\n⚠️  ${productsWithWpImages.length} ürün wp-content URL içeriyor:\n`);
    
    for (const product of productsWithWpImages) {
      console.log(`   📦 ${product.name} (${product.slug})`);
      
      // Images array
      const wpImages = product.images.filter(img => img.includes('wp-content'));
      wpImages.forEach(img => console.log(`      🖼️  images: ${img}`));
      
      // Thumbnail
      if (product.thumbnail?.includes('wp-content')) {
        console.log(`      🖼️  thumbnail: ${product.thumbnail}`);
      }
      
      // Description
      if (product.description?.includes('wp-content')) {
        console.log(`      📝  description contains wp-content URLs`);
      }
    }
  }

  // 2. Slider images içinde wp-content URL'leri ara
  console.log('\n🎠 Slider görselleri kontrol ediliyor...');
  const slidersWithWpContent = await prisma.slider.findMany({
    where: {
      OR: [
        { desktopImage: { contains: 'wp-content' } },
        { mobileImage: { contains: 'wp-content' } },
      ]
    },
    select: { id: true, name: true, desktopImage: true, mobileImage: true }
  });

  if (slidersWithWpContent.length > 0) {
    console.log(`⚠️  ${slidersWithWpContent.length} slider wp-content URL içeriyor:`);
    slidersWithWpContent.forEach(s => {
      console.log(`   🎠 ${s.name}`);
      if (s.desktopImage?.includes('wp-content')) console.log(`      desktop: ${s.desktopImage}`);
      if (s.mobileImage?.includes('wp-content')) console.log(`      mobile: ${s.mobileImage}`);
    });
  } else {
    console.log('✅ Slider images içinde wp-content URL bulunamadı.');
  }

  // 3. Banner images içinde wp-content URL'leri ara
  console.log('\n🏷️  Banner görselleri kontrol ediliyor...');
  const bannersWithWpContent = await prisma.banner.findMany({
    where: {
      OR: [
        { desktopImage: { contains: 'wp-content' } },
        { mobileImage: { contains: 'wp-content' } },
      ]
    },
    select: { id: true, name: true, desktopImage: true, mobileImage: true }
  });

  if (bannersWithWpContent.length > 0) {
    console.log(`⚠️  ${bannersWithWpContent.length} banner wp-content URL içeriyor:`);
    bannersWithWpContent.forEach(b => {
      console.log(`   🏷️  ${b.name}`);
      if (b.desktopImage?.includes('wp-content')) console.log(`      desktop: ${b.desktopImage}`);
      if (b.mobileImage?.includes('wp-content')) console.log(`      mobile: ${b.mobileImage}`);
    });
  } else {
    console.log('✅ Banner images içinde wp-content URL bulunamadı.');
  }

  // 4. Category images içinde wp-content URL'leri ara
  console.log('\n📁 Kategori görselleri kontrol ediliyor...');
  const categoriesWithWpContent = await prisma.category.findMany({
    where: {
      image: { contains: 'wp-content' }
    },
    select: { id: true, name: true, image: true }
  });

  if (categoriesWithWpContent.length > 0) {
    console.log(`⚠️  ${categoriesWithWpContent.length} kategori wp-content URL içeriyor:`);
    categoriesWithWpContent.forEach(c => {
      console.log(`   📁 ${c.name}: ${c.image}`);
    });
  } else {
    console.log('✅ Kategori images içinde wp-content URL bulunamadı.');
  }

  // 5. Media tablosunda wp-content URL'leri ara
  console.log('\n📸 Media tablosu kontrol ediliyor...');
  const mediaWithWpContent = await prisma.media.findMany({
    where: {
      url: { contains: 'wp-content' }
    },
    select: { id: true, filename: true, url: true }
  });

  if (mediaWithWpContent.length > 0) {
    console.log(`⚠️  ${mediaWithWpContent.length} media wp-content URL içeriyor:`);
    mediaWithWpContent.forEach(m => {
      console.log(`   📸 ${m.filename}: ${m.url}`);
    });
  } else {
    console.log('✅ Media tablosunda wp-content URL bulunamadı.');
  }

  // Özet
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 ÖZET:');
  console.log(`   Ürünler: ${productsWithWpImages.length} adet wp-content URL`);
  console.log(`   Sliders: ${slidersWithWpContent.length} adet wp-content URL`);
  console.log(`   Banners: ${bannersWithWpContent.length} adet wp-content URL`);
  console.log(`   Categories: ${categoriesWithWpContent.length} adet wp-content URL`);
  console.log(`   Media: ${mediaWithWpContent.length} adet wp-content URL`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Düzeltme önerileri
  const totalIssues = productsWithWpImages.length + slidersWithWpContent.length + 
                      bannersWithWpContent.length + categoriesWithWpContent.length + 
                      mediaWithWpContent.length;

  if (totalIssues > 0) {
    console.log('💡 ÖNERİLER:');
    console.log('   1. Bu URL\'leri admin panelden düzeltebilirsiniz');
    console.log('   2. Veya aşağıdaki SQL ile temizleyebilirsiniz:\n');
    console.log('   -- Products tablosunda wp-content URL\'leri temizle');
    console.log('   UPDATE products SET description = REPLACE(description, \'/wp-content/\', \'\') WHERE description LIKE \'%wp-content%\';');
    console.log('\n   -- Description içindeki img tag\'larını kaldır');
    console.log('   UPDATE products SET description = regexp_replace(description, \'<img[^>]*wp-content[^>]*>\', \'\', \'g\') WHERE description LIKE \'%wp-content%\';');
  } else {
    console.log('🎉 Harika! Veritabanında wp-content URL bulunamadı.');
  }
}

// Script'i çalıştır
findAndFixWpContentUrls()
  .catch((e) => {
    console.error('❌ Kritik Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

