import { prisma, BannerType, BannerPlacement } from "@repo/db";

async function main() {
  console.log("🚀 SHOP_HEADER banner ekleniyor...");

  // Mevcut SHOP_HEADER banner var mı kontrol et
  const existing = await prisma.banner.findFirst({
    where: { placement: BannerPlacement.SHOP_HEADER },
  });

  if (existing) {
    console.log("⚠️  SHOP_HEADER banner zaten mevcut:", existing.name);
    return;
  }

  // SHOP_HEADER banner oluştur
  const shopHeaderBanner = await prisma.banner.create({
    data: {
      name: "Mağaza Üst Banner",
      bannerType: BannerType.SINGLE,
      placement: BannerPlacement.SHOP_HEADER,
      title: "Profesyonel Enerji Çözümleri",
      subtitle: "Kamp, karavan ve acil durum için güvenilir güç kaynakları",
      buttonText: "Tüm Ürünleri Gör",
      buttonLink: "/magaza",
      gradientFrom: "#10b981",
      gradientTo: "#059669",
      order: 0,
      isActive: true,
    },
  });

  console.log(`✅ SHOP_HEADER banner oluşturuldu: ${shopHeaderBanner.name} (ID: ${shopHeaderBanner.id})`);
  console.log("🎉 Tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

