import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding solar panel comparison data...");

  // Clear existing solar panel comparison data (find by slug)
  const existing = await prisma.compareCategory.findUnique({
    where: { slug: "solar-panel" },
  });
  if (existing) {
    await prisma.compareCategory.delete({ where: { id: existing.id } });
    console.log("  🗑️  Old solar panel comparison data cleared");
  }

  // Category
  const cat = await prisma.compareCategory.create({
    data: {
      name: "Solar Paneller",
      slug: "solar-panel",
      order: 1,
      isActive: true,
    },
  });
  console.log("  ✅ Category created:", cat.name);

  // Spec Groups + Specs
  const groups = [
    {
      name: "Panel Özellikleri",
      specs: [
        { label: "Çıkış Gücü", unit: "W", icon: "Zap" },
        { label: "Hücre Tipi", unit: null, icon: "Sun" },
        { label: "Panel Dizilimi", unit: null, icon: "Activity" },
        { label: "Konnektör", unit: null, icon: "Plug" },
      ],
    },
    {
      name: "Elektriksel Özellikler",
      specs: [
        { label: "Çalışma Gerilimi (Vmp)", unit: "V", icon: "Zap" },
        { label: "Çalışma Akımı (Imp)", unit: "A", icon: "Activity" },
        { label: "Açık Devre Gerilimi (Voc)", unit: "V", icon: "ZapOff" },
        { label: "Kısa Devre Akımı (Isc)", unit: "A", icon: "Activity" },
        { label: "Verimlilik", unit: null, icon: "Rocket" },
      ],
    },
    {
      name: "Fiziksel Özellikler",
      specs: [
        { label: "Çalışma Sıcaklığı", unit: null, icon: "SunMedium" },
        { label: "IP Koruma", unit: null, icon: "Droplets" },
        { label: "Katlama Tipi", unit: null, icon: "Package" },
        { label: "Katlanmış Boyut", unit: "mm", icon: "Ruler" },
        { label: "Açık Boyut", unit: "mm", icon: "Ruler" },
        { label: "Ağırlık", unit: "kg", icon: "Weight" },
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

  const solarImage = "/compare/compared-solar.png";

  // Products data from the comparison table (Page 1)
  const products = [
    {
      name: "SP100",
      order: 0,
      specs: {
        "Çıkış Gücü": "100W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "25W x 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "18V",
        "Çalışma Akımı (Imp)": "5.6A",
        "Açık Devre Gerilimi (Voc)": "21.6V",
        "Kısa Devre Akımı (Isc)": "6.16A",
        "Verimlilik": "21~23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "387×609×30 mm",
        "Açık Boyut": "1250×609×10 mm",
        "Ağırlık": "5 kg",
      },
    },
    {
      name: "SP200",
      order: 1,
      specs: {
        "Çıkış Gücü": "200W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "50W x 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "24V",
        "Çalışma Akımı (Imp)": "8.33A",
        "Açık Devre Gerilimi (Voc)": "28.8V",
        "Kısa Devre Akımı (Isc)": "9.12A",
        "Verimlilik": "21~23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "610×608×45 mm",
        "Açık Boyut": "2074×608×30 mm",
        "Ağırlık": "8 kg",
      },
    },
    {
      name: "SP400",
      order: 2,
      specs: {
        "Çıkış Gücü": "400W",
        "Hücre Tipi": "Monokristal Silikon",
        "Panel Dizilimi": "100W x 4",
        "Konnektör": "MC4",
        "Çalışma Gerilimi (Vmp)": "44V",
        "Çalışma Akımı (Imp)": "10A",
        "Açık Devre Gerilimi (Voc)": "52.8V",
        "Kısa Devre Akımı (Isc)": "10A",
        "Verimlilik": "21~23%",
        "Çalışma Sıcaklığı": "-20°C ~ +70°C",
        "IP Koruma": "IP67",
        "Katlama Tipi": "4 Katlama",
        "Katlanmış Boyut": "725×990×45 mm",
        "Açık Boyut": "2617×990×30 mm",
        "Ağırlık": "16.3 kg",
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
        image: solarImage,
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
