import { PrismaClient } from "@prisma/client";

type YesNo = "Evet" | "Hayır";

type PowerStationValues = {
  capacity: number;
  outputPower: number;
  maxSolarCharging: number;
  acOutput: YesNo;
  wirelessCharging: YesNo;
  builtinFlashlight: YesNo;
  builtinPowerbank: YesNo;
};

const FEATURE_SLUGS = {
  capacity: "kapasite",
  outputPower: "cikis-gucu",
  maxSolarCharging: "max-solar-sarj",
  acOutput: "ac-cikis",
  wirelessCharging: "kablosuz-sarj",
  builtinFlashlight: "dahili-fener",
  builtinPowerbank: "dahili-powerbank",
} as const;

const PRODUCT_VALUES: Array<{ slug: string; values: PowerStationValues }> = [
  {
    slug: "2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200",
    values: {
      capacity: 2048,
      outputPower: 3200,
      maxSolarCharging: 6400,
      acOutput: "Evet",
      wirelessCharging: "Hayır",
      builtinFlashlight: "Evet",
      builtinPowerbank: "Evet",
    },
  },
  {
    slug: "1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800",
    values: {
      capacity: 1024,
      outputPower: 1800,
      maxSolarCharging: 500,
      acOutput: "Evet",
      wirelessCharging: "Hayır",
      builtinFlashlight: "Evet",
      builtinPowerbank: "Hayır",
    },
  },
  {
    slug: "512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800",
    values: {
      capacity: 512,
      outputPower: 800,
      maxSolarCharging: 300,
      acOutput: "Evet",
      wirelessCharging: "Hayır",
      builtinFlashlight: "Evet",
      builtinPowerbank: "Hayır",
    },
  },
  {
    slug: "5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000",
    values: {
      capacity: 5120,
      outputPower: 4000,
      maxSolarCharging: 3000,
      acOutput: "Evet",
      wirelessCharging: "Hayır",
      builtinFlashlight: "Hayır",
      builtinPowerbank: "Hayır",
    },
  },
  {
    slug: "1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro",
    values: {
      capacity: 1920,
      outputPower: 2000,
      maxSolarCharging: 500,
      acOutput: "Evet",
      wirelessCharging: "Evet",
      builtinFlashlight: "Hayır",
      builtinPowerbank: "Hayır",
    },
  },
];

const prisma = new PrismaClient();

async function main() {
  console.log("Starting power station filter value fill...");

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

  const productSlugs = PRODUCT_VALUES.map((p) => p.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: productSlugs } },
    select: { id: true, slug: true },
  });
  const productMap = new Map(products.map((p) => [p.slug, p.id]));

  let updated = 0;
  let missingProducts = 0;

  for (const product of PRODUCT_VALUES) {
    const productId = productMap.get(product.slug);
    if (!productId) {
      console.warn(`Product not found: ${product.slug}`);
      missingProducts += 1;
      continue;
    }

    const entries: Array<[keyof PowerStationValues, number | YesNo]> = [
      ["capacity", product.values.capacity],
      ["outputPower", product.values.outputPower],
      ["maxSolarCharging", product.values.maxSolarCharging],
      ["acOutput", product.values.acOutput],
      ["wirelessCharging", product.values.wirelessCharging],
      ["builtinFlashlight", product.values.builtinFlashlight],
      ["builtinPowerbank", product.values.builtinPowerbank],
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
