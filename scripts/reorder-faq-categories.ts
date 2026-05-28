/**
 * FusionMarkt SSS Kategori Sıralaması Güncelleme Scripti
 *
 * SSS sayfasının kategori sıralamasını günceller (slug bazlı eşleşme).
 *
 * Hedef sıralama:
 *   1. Hesap ve Üyelik / Üyelik ve Hesap Yönetimi (hesap-uyelik | uyelik)
 *   2. Sipariş ve Kargo (siparis-kargo | siparis)
 *   3. Ödeme (odeme)
 *   4. İade ve Değişim (iade-degisim | iade)
 *   5. Ürünler ve Teknik Bilgiler (urunler-teknik) — varsa
 *  10-14. Güç Kaynağı alt kategorileri (mevcut sıralama korunur)
 *
 * Kullanım (packages/db dizininden):
 *   cd packages/db && npx tsx ../../scripts/reorder-faq-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ReorderEntry {
  // Birden fazla olası slug — hangisi varsa o eşleşir (admin tarafından
  // yeniden adlandırılmış olabilir).
  slugs: string[];
  order: number;
  label: string;
}

const updates: ReorderEntry[] = [
  { slugs: ["uyelik", "hesap-uyelik"], order: 1, label: "Hesap & Üyelik" },
  { slugs: ["siparis", "siparis-kargo"], order: 2, label: "Sipariş & Kargo" },
  { slugs: ["odeme"], order: 3, label: "Ödeme" },
  { slugs: ["iade", "iade-degisim"], order: 4, label: "İade & Değişim" },
  { slugs: ["urunler-teknik"], order: 5, label: "Ürünler ve Teknik" },
];

async function reorder() {
  console.log("🔧 SSS kategori sıralaması güncelleniyor (slug bazlı)...\n");

  let totalUpdated = 0;
  const notFound: ReorderEntry[] = [];

  for (const u of updates) {
    const result = await prisma.faqCategory.updateMany({
      where: { slug: { in: u.slugs } },
      data: { order: u.order },
    });

    if (result.count === 0) {
      console.warn(
        `⚠️  Bulunamadı [${u.label}] - aranan slug'lar: ${u.slugs.join(", ")}`,
      );
      notFound.push(u);
    } else {
      console.log(
        `✅ [${u.label}] → order=${u.order} (${result.count} kayıt, slug: ${u.slugs.join("/")})`,
      );
      totalUpdated += result.count;
    }
  }

  console.log(`\n🎉 Toplam ${totalUpdated} kategori güncellendi.`);

  console.log("\n📋 Güncel kategori listesi:");
  const allCats = await prisma.faqCategory.findMany({
    orderBy: { order: "asc" },
    select: { name: true, order: true, slug: true },
  });
  allCats.forEach((c) => {
    console.log(`   [${c.order}] ${c.name} (${c.slug})`);
  });

  if (notFound.length > 0) {
    console.log(
      "\n💡 Bulunmayan kayıtlar için scripti yukarıdaki slug'larla güncelleyin.",
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
