import { prisma, BannerType, BannerPlacement } from "@repo/db";

async function main() {
  console.log("Banner verileri guncelleniyor...");

  // Mevcut bannerları temizle
  await prisma.bannerCard.deleteMany({});
  await prisma.banner.deleteMany({});

  // Sadece Frontend'de gercekten var olan banner
  // CategoryBento.tsx'deki kategoriler
  const categoryBanner = await prisma.banner.create({
    data: {
      name: "Ana Sayfa Kategori Grid",
      bannerType: BannerType.GRID,
      placement: BannerPlacement.HOME_CATEGORY,
      order: 0,
      isActive: true,
      cards: {
        create: [
          {
            title: "Tasinabilir Guc Kaynaklari",
            subtitle: "256Wh'den 6kWh'e kadar her ihtiyaca uygun cozumler",
            badge: "24 Urun",
            buttonText: "Kesfet",
            buttonLink: "/urunler/tasinabilir-guc-kaynaklari",
            icon: "battery",
            gradientFrom: "emerald-500/20",
            gradientTo: "cyan-500/20",
            desktopColSpan: 2,
            desktopRowSpan: 2,
            mobileColSpan: 2,
            mobileRowSpan: 1,
            order: 0,
            isActive: true,
          },
          {
            title: "Gunes Panelleri",
            subtitle: "Katlanabilir, tasinabilir solar paneller",
            badge: "18 Urun",
            buttonText: "Kesfet",
            buttonLink: "/urunler/gunes-panelleri",
            icon: "sun",
            gradientFrom: "amber-500/20",
            gradientTo: "orange-500/20",
            desktopColSpan: 1,
            desktopRowSpan: 2,
            mobileColSpan: 1,
            mobileRowSpan: 1,
            order: 1,
            isActive: true,
          },
          {
            title: "Aksesuarlar",
            subtitle: "Kablolar, adaptorler ve ek bataryalar",
            badge: "42 Urun",
            buttonText: "Kesfet",
            buttonLink: "/urunler/aksesuarlar",
            icon: "plug",
            gradientFrom: "purple-500/20",
            gradientTo: "pink-500/20",
            desktopColSpan: 1,
            desktopRowSpan: 2,
            mobileColSpan: 1,
            mobileRowSpan: 1,
            order: 2,
            isActive: true,
          },
          {
            title: "Bundle Setler",
            subtitle: "Hazir paketler ile avantajli fiyatlar",
            badge: "8 Urun",
            buttonText: "Kesfet",
            buttonLink: "/urunler/bundle-setler",
            icon: "package",
            gradientFrom: "blue-500/20",
            gradientTo: "indigo-500/20",
            desktopColSpan: 2,
            desktopRowSpan: 1,
            mobileColSpan: 2,
            mobileRowSpan: 1,
            order: 3,
            isActive: true,
          },
        ],
      },
    },
    include: { cards: true },
  });

  console.log(`Banner olusturuldu: ${categoryBanner.name} (${categoryBanner.cards.length} kart)`);
  console.log("Tamamlandi!");
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
