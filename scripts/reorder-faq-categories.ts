/**
 * FusionMarkt SSS Kategori Sıralaması Güncelleme Scripti
 *
 * SSS sayfasının kategori sıralamasını günceller:
 *   1. Üyelik ve Hesap Yönetimi
 *   2. Sipariş ve Kargo İşlemleri
 *   3. Ödeme İşlemleri ve Faturalandırma
 *   4. İade, Değişim ve Teknik Destek
 *   5-9. Güç Kaynağı alt kategorileri (10-14, mevcut sıralama korunur)
 *
 * Kullanım:
 *   export $(cat packages/db/.env | xargs) && npx tsx scripts/reorder-faq-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ReorderEntry {
  name: string;
  order: number;
}

const updates: ReorderEntry[] = [
  { name: "Üyelik ve Hesap Yönetimi", order: 1 },
  { name: "Sipariş ve Kargo İşlemleri", order: 2 },
  { name: "Ödeme İşlemleri ve Faturalandırma", order: 3 },
  { name: "İade, Değişim ve Teknik Destek", order: 4 },
];

async function reorder() {
  console.log("🔧 SSS kategori sıralaması güncelleniyor...\n");

  let totalUpdated = 0;
  const notFound: string[] = [];

  for (const u of updates) {
    const result = await prisma.faqCategory.updateMany({
      where: { name: u.name },
      data: { order: u.order },
    });

    if (result.count === 0) {
      console.warn(`⚠️  Bulunamadı: "${u.name}"`);
      notFound.push(u.name);
    } else {
      console.log(`✅ "${u.name}" → order=${u.order} (${result.count} kayıt)`);
      totalUpdated += result.count;
    }
  }

  console.log(`\n🎉 Toplam ${totalUpdated} kategori güncellendi.`);

  if (notFound.length > 0) {
    console.log("\n📋 Veritabanındaki mevcut kategoriler:");
    const allCats = await prisma.faqCategory.findMany({
      orderBy: { order: "asc" },
      select: { name: true, order: true, slug: true },
    });
    allCats.forEach((c) => {
      console.log(`   [${c.order}] ${c.name} (${c.slug})`);
    });
    console.log(
      "\n💡 Yukarıdaki listedeki tam ismi alıp scripti tekrar düzenleyin.",
    );
  }
}

reorder()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
