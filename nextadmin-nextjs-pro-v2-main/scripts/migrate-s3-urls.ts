/**
 * Stockholm -> Frankfurt S3 URL Migrasyonu
 * 
 * Eski: https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/...
 * Yeni: https://fusionmarkt.s3.eu-central-1.amazonaws.com/...
 * 
 * Çalıştır: npx ts-node scripts/migrate-s3-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Eski ve yeni URL pattern'leri
const OLD_URL_BASE = 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt';
const NEW_URL_BASE = 'https://fusionmarkt.s3.eu-central-1.amazonaws.com';

async function migrateUrls() {
  console.log('🚀 S3 URL Migrasyonu Başlıyor...\n');
  console.log(`Eski: ${OLD_URL_BASE}`);
  console.log(`Yeni: ${NEW_URL_BASE}\n`);

  let totalUpdated = 0;

  // 1. Products tablosundaki thumbnail ve images alanlarını güncelle
  console.log('📦 Products tablosu güncelleniyor...');
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { thumbnail: { contains: 'mybucketajax' } },
        { images: { hasSome: [] } }, // images array'i olan ürünler
      ]
    }
  });

  for (const product of products) {
    let needsUpdate = false;
    const updates: any = {};

    // Thumbnail güncelle
    if (product.thumbnail && product.thumbnail.includes('mybucketajax')) {
      updates.thumbnail = product.thumbnail.replace(OLD_URL_BASE, NEW_URL_BASE);
      needsUpdate = true;
    }

    // Images array güncelle
    if (product.images && product.images.length > 0) {
      const newImages = product.images.map((img: string) => 
        img.includes('mybucketajax') ? img.replace(OLD_URL_BASE, NEW_URL_BASE) : img
      );
      if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
        updates.images = newImages;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates
      });
      totalUpdated++;
      console.log(`  ✓ ${product.name?.substring(0, 50)}...`);
    }
  }
  console.log(`  Toplam ${totalUpdated} ürün güncellendi.\n`);

  // 2. Sliders tablosunu güncelle
  console.log('🖼️ Sliders tablosu güncelleniyor...');
  let sliderUpdated = 0;
  
  try {
    const sliders = await prisma.slider.findMany();
    for (const slider of sliders) {
      let needsUpdate = false;
      const updates: any = {};

      if (slider.desktopImage && slider.desktopImage.includes('mybucketajax')) {
        updates.desktopImage = slider.desktopImage.replace(OLD_URL_BASE, NEW_URL_BASE);
        needsUpdate = true;
      }
      if (slider.mobileImage && slider.mobileImage.includes('mybucketajax')) {
        updates.mobileImage = slider.mobileImage.replace(OLD_URL_BASE, NEW_URL_BASE);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prisma.slider.update({
          where: { id: slider.id },
          data: updates
        });
        sliderUpdated++;
      }
    }
    console.log(`  Toplam ${sliderUpdated} slider güncellendi.\n`);
  } catch (e) {
    console.log('  Slider tablosu bulunamadı veya boş.\n');
  }

  // 3. Banners tablosunu güncelle
  console.log('🎯 Banners tablosu güncelleniyor...');
  let bannerUpdated = 0;
  
  try {
    const banners = await prisma.banner.findMany();
    for (const banner of banners) {
      let needsUpdate = false;
      const updates: any = {};

      if (banner.desktopImage && banner.desktopImage.includes('mybucketajax')) {
        updates.desktopImage = banner.desktopImage.replace(OLD_URL_BASE, NEW_URL_BASE);
        needsUpdate = true;
      }
      if (banner.mobileImage && banner.mobileImage.includes('mybucketajax')) {
        updates.mobileImage = banner.mobileImage.replace(OLD_URL_BASE, NEW_URL_BASE);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prisma.banner.update({
          where: { id: banner.id },
          data: updates
        });
        bannerUpdated++;
      }
    }
    console.log(`  Toplam ${bannerUpdated} banner güncellendi.\n`);
  } catch (e) {
    console.log('  Banner tablosu bulunamadı veya boş.\n');
  }

  // 4. Categories tablosunu güncelle (eğer image alanı varsa)
  console.log('📁 Categories tablosu güncelleniyor...');
  let categoryUpdated = 0;
  
  try {
    const categories = await prisma.category.findMany();
    for (const category of categories) {
      if (category.image && category.image.includes('mybucketajax')) {
        await prisma.category.update({
          where: { id: category.id },
          data: {
            image: category.image.replace(OLD_URL_BASE, NEW_URL_BASE)
          }
        });
        categoryUpdated++;
      }
    }
    console.log(`  Toplam ${categoryUpdated} kategori güncellendi.\n`);
  } catch (e) {
    console.log('  Category tablosu bulunamadı veya image alanı yok.\n');
  }

  // 5. Media tablosunu güncelle
  console.log('🗂️ Media tablosu güncelleniyor...');
  let mediaUpdated = 0;
  
  try {
    const mediaItems = await prisma.media.findMany({
      where: {
        url: { contains: 'mybucketajax' }
      }
    });
    for (const media of mediaItems) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          url: media.url.replace(OLD_URL_BASE, NEW_URL_BASE),
          key: media.key.replace('fusionmarkt/', '')
        }
      });
      mediaUpdated++;
    }
    console.log(`  Toplam ${mediaUpdated} medya kaydı güncellendi.\n`);
  } catch (e) {
    console.log('  Media tablosu bulunamadı veya boş.\n');
  }

  console.log('✅ Migrasyon tamamlandı!');
  console.log(`Toplam güncellenen kayıt: ${totalUpdated + sliderUpdated + bannerUpdated + categoryUpdated + mediaUpdated}`);
}

migrateUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
