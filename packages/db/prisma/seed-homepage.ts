import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const S3 = "https://fusionmarkt.s3.eu-central-1.amazonaws.com/mainphotos";

async function main() {
  console.log("Seeding homepage data...");

  // Önce eski verileri temizle
  await prisma.homepageTrendingCard.deleteMany({});
  console.log("  🗑️  Eski trending kartlar silindi");

  // 1. Trending Carousel Cards
  const trendingCards = [
    { title: "P800 Taşınabilir Güç Kaynağı", badge: "Yeni", attributes: "768Wh | 800W", image: `${S3}/P800mainphoto.png`, buttonLink: "/urun/p800", order: 0 },
    { title: "P1800 Taşınabilir Güç Kaynağı", badge: "En Çok Satan", attributes: "1440Wh | 1800W", image: `${S3}/P1800mainphoto.png`, buttonLink: "/urun/p1800", order: 1 },
    { title: "P3200 Taşınabilir Güç Kaynağı", badge: "Flagship", attributes: "3072Wh | 3200W", image: `${S3}/p3200mainphoto.png`, buttonLink: "/urun/p3200", order: 2 },
    { title: "SH4000 Ev Enerji Sistemi", badge: "Yeni", attributes: "5120Wh | 4000W", image: `${S3}/SH4000mainphoto.png`, buttonLink: "/sh4000", order: 3 },
    { title: "Singo 2000 Pro", badge: "Outdoor", attributes: "2048Wh | 2000W", image: `${S3}/Singo2000promainphoto.png`, buttonLink: "/urun/singo-2000-pro", order: 4 },
    { title: "B5120 Batarya Modülü", badge: "Yeni", attributes: "5120Wh | LiFePO4", image: `${S3}/B5120mainphoto.png`, buttonLink: "/urun/b5120", order: 5 },
    { title: "SP100 Solar Panel", badge: "Solar", attributes: "100W | Katlanabilir", image: `${S3}/SP100mainphoto.png`, buttonLink: "/urun/sp100", order: 6 },
    { title: "SP200 Solar Panel", badge: "Solar", attributes: "200W | Katlanabilir", image: `${S3}/SP200mainphoto.png`, buttonLink: "/urun/sp200", order: 7 },
    { title: "SP400 Solar Panel", badge: "Solar", attributes: "400W | Katlanabilir", image: `${S3}/sp400mainphoto.png`, buttonLink: "/urun/sp400", order: 8 },
    { title: "TG1290 Taşınabilir Güç Kaynağı", badge: "Yeni", attributes: "1290Wh | 1200W", image: `${S3}/TG1290mainphoto.png`, buttonLink: "/urun/tg1290", order: 9 },
  ];

  for (const card of trendingCards) {
    await prisma.homepageTrendingCard.create({
      data: { ...card, buttonText: "Daha Fazla", isActive: true },
    });
  }
  console.log(`  ✅ ${trendingCards.length} trending cards created`);

  // 2. Promo Banner
  await prisma.homepagePromo.create({
    data: {
      title: "Banner Başlığı",
      subtitle: "Alt başlık metni buraya gelecek.",
      buttonText: "İncele",
      buttonLink: "#",
      order: 0,
      isActive: true,
    },
  });
  console.log("  ✅ 1 promo banner created");

  // 3. Video Banner
  await prisma.homepageVideoBanner.create({
    data: {
      name: "Ana Sayfa Video Banner",
      videoType: "upload",
      videoUrl: "https://demo.halilgulerweb.com/wp-content/uploads/2026/02/798970133ee6459a86602b36cac04fb8.HD-720p-3.0Mbps-64523111.mp4",
      isActive: true,
    },
  });
  console.log("  ✅ 1 video banner created");

  // 4. Category Showcase 1
  const section1 = await prisma.homepageCategorySection.create({
    data: {
      sectionTitle: "Kategori Başlığı",
      bannerEyebrow: "YENİ",
      bannerTitle: "Ürün Adı Buraya",
      bannerDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      bannerBtnText: "Daha Fazla",
      bannerBtnLink: "#",
      seeMoreLink: "#",
      accessoryLink: "#",
      order: 0,
      isActive: true,
    },
  });

  const products1 = [
    { title: "Ürün Adı 1", badge: "Yeni", spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 0 },
    { title: "Ürün Adı 2", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 1 },
    { title: "Ürün Adı 3", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 2 },
    { title: "Ürün Adı 4", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 3 },
  ];

  for (const p of products1) {
    await prisma.homepageCategorySectionProduct.create({
      data: { ...p, sectionId: section1.id, link: "#" },
    });
  }
  console.log("  ✅ Category showcase 1 created with 4 products");

  // 5. Category Showcase 2
  const section2 = await prisma.homepageCategorySection.create({
    data: {
      sectionTitle: "Kategori Başlığı",
      bannerEyebrow: "YENİ",
      bannerTitle: "Ürün Adı Buraya",
      bannerDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      bannerBtnText: "Daha Fazla",
      bannerBtnLink: "#",
      seeMoreLink: "#",
      accessoryLink: "#",
      order: 1,
      isActive: true,
    },
  });

  const products2 = [
    { title: "Ürün Adı 1", badge: "Yeni", spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 0 },
    { title: "Ürün Adı 2", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 1 },
    { title: "Ürün Adı 3", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 2 },
    { title: "Ürün Adı 4", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000.00", order: 3 },
  ];

  for (const p of products2) {
    await prisma.homepageCategorySectionProduct.create({
      data: { ...p, sectionId: section2.id, link: "#" },
    });
  }
  console.log("  ✅ Category showcase 2 created with 4 products");

  // 6. Video Grid
  const videos = [
    { title: "İnceleme Videosu 1", youtubeUrl: "", order: 0 },
    { title: "İnceleme Videosu 2", youtubeUrl: "", order: 1 },
    { title: "İnceleme Videosu 3", youtubeUrl: "", order: 2 },
    { title: "İnceleme Videosu 4", youtubeUrl: "", order: 3 },
  ];

  for (const v of videos) {
    await prisma.homepageVideo.create({
      data: { ...v, isActive: true },
    });
  }
  console.log(`  ✅ ${videos.length} videos created`);

  console.log("\n✅ Homepage seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
