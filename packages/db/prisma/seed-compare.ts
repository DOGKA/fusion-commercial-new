import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding comparison data...");

  const existing = await prisma.compareCategory.findUnique({
    where: { slug: "guc-kaynaklari" },
  });
  if (existing) {
    await prisma.compareCategory.delete({ where: { id: existing.id } });
  }
  console.log("  🗑️  Old comparison data cleared");

  const cat = await prisma.compareCategory.create({
    data: {
      name: "Taşınabilir Güç Kaynakları",
      slug: "guc-kaynaklari",
      order: 0,
      isActive: true,
    },
  });
  console.log("  ✅ Category created:", cat.name);

  // 5 ürün, 22 özellik
  const groups = [
    {
      name: "Batarya",
      specs: [
        { label: "Batarya Kapasitesi", unit: "Wh", icon: "Battery" },
        { label: "Batarya Tipi", unit: "Birim", icon: "Shield" },
        { label: "Yaşam Döngüsü", unit: "Birim", icon: "RefreshCw" },
      ],
    },
    {
      name: "Çıkış Gücü",
      specs: [
        { label: "Sürekli Çıkış", unit: "W", icon: "Zap" },
        { label: "AC Çıkış Adedi", unit: "Birim", icon: "Plug" },
        { label: "USB-C Port", unit: "Birim", icon: "Usb" },
        { label: "USB-A Port", unit: "Birim", icon: "Usb" },
        { label: "Kablosuz Şarj", unit: "Birim", icon: "Wifi" },
        { label: "Smart-Boost Çıkışı", unit: "W", icon: "Rocket" },
      ],
    },
    {
      name: "Şarj",
      specs: [
        { label: "AC Şarj (Şebeke)", unit: "W", icon: "PlugZap" },
        { label: "Şebekeden Tam Şarj", unit: "Birim", icon: "Clock" },
        { label: "Maks Solar Giriş", unit: "W", icon: "Sun" },
        { label: "Solar ile Tam Şarj", unit: "Birim", icon: "SunMedium" },
      ],
    },
    {
      name: "Genel",
      specs: [
        { label: "Ağırlık", unit: "kg", icon: "Weight" },
        { label: "Boyutlar", unit: "mm", icon: "Ruler" },
        { label: "UPS/EPS", unit: "Birim", icon: "ShieldCheck" },
        { label: "Dahili Işık", unit: "Birim", icon: "Lightbulb" },
        { label: "Uygulama Kontrolü", unit: "Birim", icon: "Smartphone" },
        { label: "IP Derecesi", unit: "Birim", icon: "Droplets" },
        { label: "Gürültü", unit: "dB", icon: "Volume2" },
      ],
    },
    {
      name: "Kutuda Ne Var",
      specs: [
        { label: "Kutu İçeriği", unit: "Birim", icon: "Package" },
      ],
    },
  ];

  const specMap: Record<string, string> = {};

  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    const group = await prisma.compareSpecGroup.create({
      data: { categoryId: cat.id, name: g.name, order: gi },
    });

    for (let si = 0; si < g.specs.length; si++) {
      const s = g.specs[si];
      const spec = await prisma.compareSpec.create({
        data: { groupId: group.id, label: s.label, unit: s.unit, icon: s.icon, order: si },
      });
      specMap[s.label] = spec.id;
    }
  }
  console.log("  ✅ Spec groups and specs created");

  const imageMap: Record<string, string> = {
    "P800": "/compare/compared-p800.png",
    "P1800": "/compare/compared-p1800.png",
    "SINGO2000 PRO": "/compare/compared-singo2000pro.png",
    "P3200": "/compare/compared-p3200.png",
    "SH4000": "/compare/compared-sh4000.png",
  };

  const searchNameMap: Record<string, string> = {
    "SINGO2000 PRO": "Singo2000PRO",
  };

  const products = [
    {
      name: "P800",
      order: 0,
      specs: {
        "Batarya Kapasitesi": "512",
        "Batarya Tipi": "LiFePO4",
        "Yaşam Döngüsü": "4000+",
        "Sürekli Çıkış": "800",
        "AC Çıkış Adedi": "2",
        "USB-C Port": "3",
        "USB-A Port": "2",
        "Kablosuz Şarj": "—",
        "Smart-Boost Çıkışı": "1200",
        "AC Şarj (Şebeke)": "600",
        "Şebekeden Tam Şarj": "~1.2 sa",
        "Maks Solar Giriş": "300",
        "Solar ile Tam Şarj": "3-4 sa",
        "Ağırlık": "6.55",
        "Boyutlar": "299x191x196",
        "UPS/EPS": "Evet",
        "Dahili Işık": "Evet",
        "Uygulama Kontrolü": "—",
        "IP Derecesi": "IP20",
        "Gürültü": "<60",
        "Kutu İçeriği": "Güç Kaynağı, AC Şarj Kablosu, Araç Şarj Kablosu, XT60-MC4 Dönüştürücü Kablo, 3 Modlu LED El Feneri, 4in1 Kablo, Kullanım Kılavuzu",
      },
    },
    {
      name: "P1800",
      order: 1,
      specs: {
        "Batarya Kapasitesi": "1024",
        "Batarya Tipi": "LiFePO4",
        "Yaşam Döngüsü": "4000+",
        "Sürekli Çıkış": "1800",
        "AC Çıkış Adedi": "2",
        "USB-C Port": "2",
        "USB-A Port": "3",
        "Kablosuz Şarj": "—",
        "Smart-Boost Çıkışı": "—",
        "AC Şarj (Şebeke)": "1200",
        "Şebekeden Tam Şarj": "~1.2 sa",
        "Maks Solar Giriş": "500",
        "Solar ile Tam Şarj": "3-4 sa",
        "Ağırlık": "12.7",
        "Boyutlar": "361x269x232",
        "UPS/EPS": "Evet",
        "Dahili Işık": "Evet",
        "Uygulama Kontrolü": "Evet (Wi-Fi/BT)",
        "IP Derecesi": "IP20",
        "Gürültü": "<65",
        "Kutu İçeriği": "Güç Kaynağı, AC Şarj Kablosu, Araç Şarj Kablosu, XT60-MC4 Dönüştürücü Kablo, 3 Modlu LED El Feneri, 4in1 Kablo, Kullanım Kılavuzu",
      },
    },
    {
      name: "SINGO2000 PRO",
      order: 2,
      specs: {
        "Batarya Kapasitesi": "1920",
        "Batarya Tipi": "LiFePO4",
        "Yaşam Döngüsü": "4000+",
        "Sürekli Çıkış": "2000",
        "AC Çıkış Adedi": "4",
        "USB-C Port": "2",
        "USB-A Port": "3",
        "Kablosuz Şarj": "10W",
        "Smart-Boost Çıkışı": "—",
        "AC Şarj (Şebeke)": "1500",
        "Şebekeden Tam Şarj": "~1.5 sa",
        "Maks Solar Giriş": "500",
        "Solar ile Tam Şarj": "4-5 sa",
        "Ağırlık": "20.5",
        "Boyutlar": "355x347x226",
        "UPS/EPS": "Evet",
        "Dahili Işık": "Evet",
        "Uygulama Kontrolü": "Evet (Wi-Fi)",
        "IP Derecesi": "IP20",
        "Gürültü": "<65",
        "Kutu İçeriği": "Güç Kaynağı, AC Şarj Kablosu, Araç Şarj Kablosu, XT60-MC4 Dönüştürücü Kablo, Kullanım Kılavuzu",
      },
    },
    {
      name: "P3200",
      order: 3,
      specs: {
        "Batarya Kapasitesi": "2048",
        "Batarya Tipi": "LiFePO4",
        "Yaşam Döngüsü": "4000+",
        "Sürekli Çıkış": "3200",
        "AC Çıkış Adedi": "4",
        "USB-C Port": "4",
        "USB-A Port": "4",
        "Kablosuz Şarj": "—",
        "Smart-Boost Çıkışı": "—",
        "AC Şarj (Şebeke)": "1800",
        "Şebekeden Tam Şarj": "~1.5 sa",
        "Maks Solar Giriş": "1000",
        "Solar ile Tam Şarj": "2-3 sa",
        "Ağırlık": "24.35",
        "Boyutlar": "445x298x371",
        "UPS/EPS": "Evet",
        "Dahili Işık": "Evet",
        "Uygulama Kontrolü": "Evet (Wi-Fi/BT)",
        "IP Derecesi": "IP20",
        "Gürültü": "<65",
        "Kutu İçeriği": "Güç Kaynağı, AC Şarj Kablosu, Araç Şarj Kablosu, XT60-MC4 Dönüştürücü Kablo, 10000mAh Powerbank (USB-EC5 Jumpstarter Çıkışlı) Fener, 4in1 Kablo, Kullanım Kılavuzu",
      },
    },
    {
      name: "SH4000",
      order: 4,
      specs: {
        "Batarya Kapasitesi": "5120",
        "Batarya Tipi": "LiFePO4",
        "Yaşam Döngüsü": "4000+",
        "Sürekli Çıkış": "4000",
        "AC Çıkış Adedi": "4",
        "USB-C Port": "2",
        "USB-A Port": "—",
        "Kablosuz Şarj": "—",
        "Smart-Boost Çıkışı": "—",
        "AC Şarj (Şebeke)": "3600",
        "Şebekeden Tam Şarj": "~1.5 sa",
        "Maks Solar Giriş": "3600",
        "Solar ile Tam Şarj": "1.5-2 sa",
        "Ağırlık": "65",
        "Boyutlar": "510x673x266",
        "UPS/EPS": "Evet",
        "Dahili Işık": "Evet",
        "Uygulama Kontrolü": "Evet (Wi-Fi/BT)",
        "IP Derecesi": "IP54",
        "Gürültü": "<40",
        "Kutu İçeriği": "İnvertör Ünitesi, 5.12kWh Batarya Modülü, AC Şarj Kablosu, XT60-MC4 Dönüştürücü Solar Kablo, Montaj Aksesuarları, Kullanım Kılavuzu",
      },
    },
  ];

  for (const prod of products) {
    const searchName = searchNameMap[prod.name] || prod.name;
    const dbProd = await prisma.product.findFirst({
      where: { name: { contains: searchName, mode: "insensitive" } },
      select: { id: true, name: true, price: true, comparePrice: true, thumbnail: true, slug: true, images: true },
    });

    const compareProduct = await prisma.compareProduct.create({
      data: {
        categoryId: cat.id,
        productId: dbProd?.id || null,
        name: prod.name,
        image: imageMap[prod.name] || null,
        price: dbProd?.price || null,
        comparePrice: dbProd?.comparePrice || null,
        buyLink: dbProd?.slug ? `/urun/${dbProd.slug}` : "#",
        order: prod.order,
        isActive: true,
      },
    });

    const specValues = Object.entries(prod.specs)
      .filter(([label]) => specMap[label])
      .map(([label, value]) => ({
        compareProductId: compareProduct.id,
        specId: specMap[label],
        value,
      }));

    if (specValues.length > 0) {
      await prisma.compareProductSpec.createMany({ data: specValues });
    }

    console.log(`  ✅ Product "${prod.name}" created with ${specValues.length} specs${dbProd ? " (DB linked)" : ""}`);
  }

  console.log("\n✅ Comparison seed complete!");
  console.log(`\nFrontend link: /karsilastir/guc-kaynaklari`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
