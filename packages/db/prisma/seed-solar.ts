import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding solar panel comparison data...");

  const cat = await prisma.compareCategory.create({
    data: {
      name: "Taşınabilir Solar Paneller",
      slug: "solar-panel",
      order: 1,
      isActive: true,
    },
  });
  console.log("  ✅ Category created:", cat.name);

  // ── Spec Groups ──────────────────────────────────────────────────────────
  const groups = [
    {
      name: "Teknik Özellikler",
      specs: [
        { label: "Çıkış Gücü", unit: "W", icon: "Zap" },
        { label: "Hücre Tipi", unit: null, icon: "Sun" },
        { label: "Panel Dizilimi", unit: null, icon: "Activity" },
        { label: "Konnektör", unit: null, icon: "Plug" },
        { label: "Çalışma Gerilimi (Vmp)", unit: "V", icon: "Zap" },
        { label: "Çalışma Akımı (Imp)", unit: "A", icon: "Activity" },
        { label: "Açık Devre Gerilimi (Voc)", unit: "V", icon: "ZapOff" },
        { label: "Kısa Devre Akımı (Isc)", unit: "A", icon: "Activity" },
        { label: "Verimlilik", unit: "%", icon: "Rocket" },
        { label: "Çalışma Sıcaklığı", unit: null, icon: "SunMedium" },
        { label: "IP Koruma", unit: null, icon: "Droplets" },
        { label: "Katlama Tipi", unit: null, icon: "Package" },
        { label: "Katlanmış Boyut", unit: "mm", icon: "Ruler" },
        { label: "Açık Boyut", unit: "mm", icon: "Ruler" },
        { label: "Ağırlık", unit: "kg", icon: "Weight" },
      ],
    },
    {
      name: "Initial Entropy Energy Uyumluluk",
      specs: [
        { label: "P800 (512 Wh · 300W · 12-60V)", unit: null, icon: "Battery" },
        { label: "P1800 (1024 Wh · 500W · 10-52V)", unit: null, icon: "Battery" },
        { label: "SINGO2000 PRO (1920 Wh · 500W · 10-50V)", unit: null, icon: "Battery" },
        { label: "P3200 (2048 Wh · 1000W · 12-80V)", unit: null, icon: "Battery" },
        { label: "SH4000 Duo (5120 Wh · 3000W · 70-450V + 12-55V)", unit: null, icon: "Battery" },
      ],
    },
    {
      name: "EcoFlow River Serisi Uyumluluk",
      specs: [
        { label: "RIVER 2 (256 Wh · 110W · 11-30V)", unit: null, icon: "Battery" },
        { label: "RIVER 2 Max (512 Wh · 220W · 11-30V)", unit: null, icon: "Battery" },
        { label: "RIVER 2 Pro (768 Wh · 220W · 11-50V)", unit: null, icon: "Battery" },
        { label: "RIVER 3 (245 Wh · 110W · 11-30V)", unit: null, icon: "Battery" },
        { label: "RIVER 3 Max Plus (858 Wh · 220W · 11-50V)", unit: null, icon: "Battery" },
      ],
    },
    {
      name: "EcoFlow Delta Serisi Uyumluluk",
      specs: [
        { label: "DELTA 2 (1024 Wh · 500W · 11-60V)", unit: null, icon: "Battery" },
        { label: "DELTA 2 Max (2048 Wh · 1000W · 11-60V)", unit: null, icon: "Battery" },
        { label: "DELTA 3 Plus (1024 Wh · 500W · 10-65V)", unit: null, icon: "Battery" },
        { label: "DELTA 3 1600 (1500 Wh · 1000W · 10-55V)", unit: null, icon: "Battery" },
        { label: "DELTA Pro (3600 Wh · 1600W · 11-150V)", unit: null, icon: "Battery" },
        { label: "DELTA Pro 3 (4096 Wh · 2400W · 30-150V + 11-60V)", unit: null, icon: "Battery" },
        { label: "DELTA Pro Ultra (6144 Wh · 5600W · 30-150V + 80-60V)", unit: null, icon: "Battery" },
      ],
    },
    {
      name: "Anker SOLIX & Powerhouse Uyumluluk",
      specs: [
        { label: "SOLIX C300X (288 Wh · 100W · 11-28V)", unit: null, icon: "Battery" },
        { label: "SOLIX C800X (768 Wh · 300W · 11-60V)", unit: null, icon: "Battery" },
        { label: "C1600 Gen 2 (1024 Wh · 600W · 11-60V)", unit: null, icon: "Battery" },
        { label: "PowerHouse 767 (2048 Wh · 1000W · 11-60V)", unit: null, icon: "Battery" },
        { label: "SOLIX F1500 (1536 Wh · 400W · 11-60V)", unit: null, icon: "Battery" },
        { label: "SOLIX F3800 Duo (3072 Wh · 2400W · 11-160V + 11-60V)", unit: null, icon: "Battery" },
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

  // ── Products ─────────────────────────────────────────────────────────────
  const products = [
    {
      name: "SP100",
      order: 0,
      specs: {
        // Teknik Özellikler
        "Çıkış Gücü": "100W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "25W × 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "18V",
        "Çalışma Akımı (Imp)": "5.6A",
        "Açık Devre Gerilimi (Voc)": "21.6V",
        "Kısa Devre Akımı (Isc)": "6.16A",
        "Verimlilik": "21–23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "387×609×30 mm",
        "Açık Boyut": "1250×609×10 mm",
        "Ağırlık": "5 kg",
        // Initial Entropy Energy
        "P800 (512 Wh · 300W · 12-60V)": "✓",
        "P1800 (1024 Wh · 500W · 10-52V)": "✓",
        "SINGO2000 PRO (1920 Wh · 500W · 10-50V)": "✓",
        "P3200 (2048 Wh · 1000W · 12-80V)": "✓",
        "SH4000 Duo (5120 Wh · 3000W · 70-450V + 12-55V)": "✓",
        // EcoFlow River
        "RIVER 2 (256 Wh · 110W · 11-30V)": "✓",
        "RIVER 2 Max (512 Wh · 220W · 11-30V)": "✓",
        "RIVER 2 Pro (768 Wh · 220W · 11-50V)": "✓",
        "RIVER 3 (245 Wh · 110W · 11-30V)": "✓",
        "RIVER 3 Max Plus (858 Wh · 220W · 11-50V)": "✓",
        // EcoFlow Delta
        "DELTA 2 (1024 Wh · 500W · 11-60V)": "✓",
        "DELTA 2 Max (2048 Wh · 1000W · 11-60V)": "✓",
        "DELTA 3 Plus (1024 Wh · 500W · 10-65V)": "✓",
        "DELTA 3 1600 (1500 Wh · 1000W · 10-55V)": "✓",
        "DELTA Pro (3600 Wh · 1600W · 11-150V)": "✓",
        "DELTA Pro 3 (4096 Wh · 2400W · 30-150V + 11-60V)": "✓",
        "DELTA Pro Ultra (6144 Wh · 5600W · 30-150V + 80-60V)": "✓",
        // Anker
        "SOLIX C300X (288 Wh · 100W · 11-28V)": "✓",
        "SOLIX C800X (768 Wh · 300W · 11-60V)": "✓",
        "C1600 Gen 2 (1024 Wh · 600W · 11-60V)": "✓",
        "PowerHouse 767 (2048 Wh · 1000W · 11-60V)": "✓",
        "SOLIX F1500 (1536 Wh · 400W · 11-60V)": "✓",
        "SOLIX F3800 Duo (3072 Wh · 2400W · 11-160V + 11-60V)": "✓",
      },
    },
    {
      name: "SP200",
      order: 1,
      specs: {
        // Teknik Özellikler
        "Çıkış Gücü": "200W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "50W × 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "24V",
        "Çalışma Akımı (Imp)": "8.33A",
        "Açık Devre Gerilimi (Voc)": "28.8V",
        "Kısa Devre Akımı (Isc)": "9.12A",
        "Verimlilik": "21–23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "610×608×55 mm",
        "Açık Boyut": "2076×608×30 mm",
        "Ağırlık": "8 kg",
        // Initial Entropy Energy
        "P800 (512 Wh · 300W · 12-60V)": "✓",
        "P1800 (1024 Wh · 500W · 10-52V)": "✓",
        "SINGO2000 PRO (1920 Wh · 500W · 10-50V)": "✓",
        "P3200 (2048 Wh · 1000W · 12-80V)": "✓",
        "SH4000 Duo (5120 Wh · 3000W · 70-450V + 12-55V)": "✓",
        // EcoFlow River
        "RIVER 2 (256 Wh · 110W · 11-30V)": "✓",
        "RIVER 2 Max (512 Wh · 220W · 11-30V)": "✓",
        "RIVER 2 Pro (768 Wh · 220W · 11-50V)": "✓",
        "RIVER 3 (245 Wh · 110W · 11-30V)": "✓",
        "RIVER 3 Max Plus (858 Wh · 220W · 11-50V)": "✓",
        // EcoFlow Delta
        "DELTA 2 (1024 Wh · 500W · 11-60V)": "✓",
        "DELTA 2 Max (2048 Wh · 1000W · 11-60V)": "✓",
        "DELTA 3 Plus (1024 Wh · 500W · 10-65V)": "✓",
        "DELTA 3 1600 (1500 Wh · 1000W · 10-55V)": "✓",
        "DELTA Pro (3600 Wh · 1600W · 11-150V)": "✓",
        "DELTA Pro 3 (4096 Wh · 2400W · 30-150V + 11-60V)": "✓",
        "DELTA Pro Ultra (6144 Wh · 5600W · 30-150V + 80-60V)": "✓",
        // Anker
        "SOLIX C300X (288 Wh · 100W · 11-28V)": "✓",
        "SOLIX C800X (768 Wh · 300W · 11-60V)": "✓",
        "C1600 Gen 2 (1024 Wh · 600W · 11-60V)": "✓",
        "PowerHouse 767 (2048 Wh · 1000W · 11-60V)": "✓",
        "SOLIX F1500 (1536 Wh · 400W · 11-60V)": "✓",
        "SOLIX F3800 Duo (3072 Wh · 2400W · 11-160V + 11-60V)": "✓*",
      },
    },
    {
      name: "SP400",
      order: 2,
      specs: {
        // Teknik Özellikler
        "Çıkış Gücü": "400W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "100W × 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "44V",
        "Çalışma Akımı (Imp)": "10A",
        "Açık Devre Gerilimi (Voc)": "52.8V",
        "Kısa Devre Akımı (Isc)": "10A",
        "Verimlilik": "21–23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "725×990×55 mm",
        "Açık Boyut": "2617×990×30 mm",
        "Ağırlık": "16.1 kg",
        // Initial Entropy Energy
        "P800 (512 Wh · 300W · 12-60V)": "2× SP200 Paralel (400W) ile kullanın",
        "P1800 (1024 Wh · 500W · 10-52V)": "2× SP200 Paralel (400W) ile kullanın",
        "SINGO2000 PRO (1920 Wh · 500W · 10-50V)": "2× SP200 Paralel (400W) ile kullanın",
        "P3200 (2048 Wh · 1000W · 12-80V)": "✓",
        "SH4000 Duo (5120 Wh · 3000W · 70-450V + 12-55V)": "✓",
        // EcoFlow River
        "RIVER 2 (256 Wh · 110W · 11-30V)": "✗",
        "RIVER 2 Max (512 Wh · 220W · 11-30V)": "✗",
        "RIVER 2 Pro (768 Wh · 220W · 11-50V)": "✗",
        "RIVER 3 (245 Wh · 110W · 11-30V)": "✗",
        "RIVER 3 Max Plus (858 Wh · 220W · 11-50V)": "✗",
        // EcoFlow Delta
        "DELTA 2 (1024 Wh · 500W · 11-60V)": "✓",
        "DELTA 2 Max (2048 Wh · 1000W · 11-60V)": "✓",
        "DELTA 3 Plus (1024 Wh · 500W · 10-65V)": "✓",
        "DELTA 3 1600 (1500 Wh · 1000W · 10-55V)": "✓",
        "DELTA Pro (3600 Wh · 1600W · 11-150V)": "✓",
        "DELTA Pro 3 (4096 Wh · 2400W · 30-150V + 11-60V)": "✓",
        "DELTA Pro Ultra (6144 Wh · 5600W · 30-150V + 80-60V)": "✓",
        // Anker
        "SOLIX C300X (288 Wh · 100W · 11-28V)": "✗",
        "SOLIX C800X (768 Wh · 300W · 11-60V)": "✓",
        "C1600 Gen 2 (1024 Wh · 600W · 11-60V)": "✓",
        "PowerHouse 767 (2048 Wh · 1000W · 11-60V)": "✓",
        "SOLIX F1500 (1536 Wh · 400W · 11-60V)": "✓",
        "SOLIX F3800 Duo (3072 Wh · 2400W · 11-160V + 11-60V)": "✓*",
      },
    },
  ];

  for (const prod of products) {
    const dbProd = await prisma.product.findFirst({
      where: { name: { contains: prod.name, mode: "insensitive" } },
      select: { id: true, name: true, price: true, comparePrice: true, thumbnail: true, slug: true, images: true },
    });

    const compareProduct = await prisma.compareProduct.create({
      data: {
        categoryId: cat.id,
        productId: dbProd?.id || null,
        name: prod.name,
        image: "/compare/compared-solar.png",
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

  console.log("\n✅ Solar panel comparison seed complete!");
  console.log(`\nFrontend link: /karsilastir/solar-panel`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
