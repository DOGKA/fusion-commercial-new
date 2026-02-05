import { PrismaClient } from "@prisma/client";

type SolarPanelValues = {
  panelPower: number;
  cellType: string;
  foldingType: string;
  ipProtection: string;
};

const FEATURE_SLUGS = {
  panelPower: "panel-gucu",
  cellType: "hucre-tipi",
  foldingType: "katlanma-tipi",
  ipProtection: "ip-koruma",
} as const;

const SOLAR_VALUES: Array<{ slug: string; values: SolarPanelValues }> = [
  {
    slug: "tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100",
    values: {
      panelPower: 100,
      cellType: "Monocrystalline",
      foldingType: "4 Fold",
      ipProtection: "IP67",
    },
  },
  {
    slug: "tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200",
    values: {
      panelPower: 200,
      cellType: "Monocrystalline",
      foldingType: "4 Fold",
      ipProtection: "IP67",
    },
  },
  {
    slug: "tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400",
    values: {
      panelPower: 400,
      cellType: "Monocrystalline",
      foldingType: "4 Fold",
      ipProtection: "IP67",
    },
  },
];

const prisma = new PrismaClient();

async function main() {
  console.log("Starting solar panel filter value fill...");

  const featureSlugList = Object.values(FEATURE_SLUGS);
  const featureDefs = await prisma.featureDefinition.findMany({
    where: { slug: { in: featureSlugList } },
    select: { id: true, slug: true },
  });

  const featureMap = new Map(featureDefs.map((f) => [f.slug, f.id]));
  const missingFeatures = featureSlugList.filter((slug) => !featureMap.has(slug));
  if (missingFeatures.length > 0) {
    throw new Error(`Missing feature definitions: ${missingFeatures.join(", ")}`);
  }

  const productSlugs = SOLAR_VALUES.map((p) => p.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: productSlugs } },
    select: { id: true, slug: true },
  });
  const productMap = new Map(products.map((p) => [p.slug, p.id]));

  let updated = 0;
  let missingProducts = 0;

  for (const product of SOLAR_VALUES) {
    const productId = productMap.get(product.slug);
    if (!productId) {
      console.warn(`Product not found: ${product.slug}`);
      missingProducts += 1;
      continue;
    }

    const entries: Array<[keyof SolarPanelValues, number | string]> = [
      ["panelPower", product.values.panelPower],
      ["cellType", product.values.cellType],
      ["foldingType", product.values.foldingType],
      ["ipProtection", product.values.ipProtection],
    ];

    for (const [key, value] of entries) {
      const featureSlug = FEATURE_SLUGS[key];
      const featureId = featureMap.get(featureSlug);
      if (!featureId) continue;

      const valueNumber = typeof value === "number" ? value : null;
      const valueText = typeof value === "string" ? value : null;

      await prisma.productFeatureValue.upsert({
        where: {
          productId_featureId: {
            productId,
            featureId,
          },
        },
        update: {
          valueNumber,
          valueText,
          unit: null,
        },
        create: {
          productId,
          featureId,
          valueNumber,
          valueText,
          unit: null,
        },
      });

      updated += 1;
    }
  }

  console.log(`Done. Updated values: ${updated}`);
  console.log(`Missing products: ${missingProducts}`);
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
