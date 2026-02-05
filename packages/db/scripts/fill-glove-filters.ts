import { PrismaClient } from "@prisma/client";

type YesNo = "Evet" | "Hayır";

const CATEGORY_SLUG = "endustriyel-eldivenler";

const FEATURE_SLUGS = {
  cutResistance: "kesim-seviyesi",
  material: "kaplama",
  touchscreen: "dokunmatik-ekran-uyumlu",
} as const;

// Dokunmatik Ekran = Evet olan modeller
const TOUCHSCREEN_MODELS = new Set([
  "TD01",
  "TD05",
  "TD06",
  "TD07",
  "TG1240",
  "TG1290",
  "TG1360",
  "TG3060",
  "TG5360",
  "TG5545",
  "TG5550",
  "TG6010",
  "TG6060",
  "TG6240",
  "TG7360",
]);

// Kesilme direnci listesi
const CUT_LEVELS: Record<string, string> = {
  TG1060: "A",
  TG1072: "A",
  TG1140: "A",
  TG1170: "A",
  TG1210: "A",
  TG1220: "A",
  TG1240: "A",
  TG1290: "A",
  TG1360: "A",
  TG1500: "A",
  TG1655: "A",
  TG1850: "A",
  TG1895: "A",
  TG3060: "C",
  TG5060: "C",
  TG5140: "C",
  TG5150: "C",
  TG5210: "C",
  TG5220: "C",
  TG5240: "C",
  TG5010: "D",
  TG5070: "D",
  TG5180: "D",
  TG5580: "D",
  TG5660: "D",
  TG5895: "D",
  TG6070: "D",
  TG6500: "D",
  TGSL1: "D",
  TG5545: "E",
  TG5550: "E",
  TG6240: "E",
  TG6250: "E",
  TG5570: "F",
  TG6010: "F",
  TG6060: "F",
  TG7360: "F",
};

const prisma = new PrismaClient();

function extractModelCode(text: string): string | null {
  const match = text.match(/\b(TD\d{2}|TG\d{4}|TGSL1)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function isTDSeries(modelCode: string | null): boolean {
  return modelCode ? modelCode.startsWith("TD") : false;
}

async function upsertFeatureValue(
  productId: string,
  featureId: string,
  valueText: string | null,
) {
  await prisma.productFeatureValue.upsert({
    where: {
      productId_featureId: {
        productId,
        featureId,
      },
    },
    update: {
      valueText,
      valueNumber: null,
      unit: null,
    },
    create: {
      productId,
      featureId,
      valueText,
      valueNumber: null,
      unit: null,
    },
  });
}

async function main() {
  console.log("Starting glove filter value fill...");

  const category = await prisma.category.findUnique({
    where: { slug: CATEGORY_SLUG },
    select: { id: true },
  });

  if (!category) {
    throw new Error(`Category not found: ${CATEGORY_SLUG}`);
  }

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

  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const modelCode =
      extractModelCode(product.slug) || extractModelCode(product.name);

    if (!modelCode) {
      console.warn(`Model code not found: ${product.slug}`);
      skipped += 1;
      continue;
    }

    const material = isTDSeries(modelCode) ? "nitril" : "pu";
    const touchscreen: YesNo = TOUCHSCREEN_MODELS.has(modelCode)
      ? "Evet"
      : "Hayır";
    const cutLevel = CUT_LEVELS[modelCode] || null;

    await upsertFeatureValue(
      product.id,
      featureMap.get(FEATURE_SLUGS.material)!,
      material,
    );
    updated += 1;

    await upsertFeatureValue(
      product.id,
      featureMap.get(FEATURE_SLUGS.touchscreen)!,
      touchscreen,
    );
    updated += 1;

    if (cutLevel) {
      await upsertFeatureValue(
        product.id,
        featureMap.get(FEATURE_SLUGS.cutResistance)!,
        cutLevel,
      );
      updated += 1;
    }
  }

  console.log(`Done. Updated values: ${updated}`);
  console.log(`Skipped (no model code): ${skipped}`);
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
