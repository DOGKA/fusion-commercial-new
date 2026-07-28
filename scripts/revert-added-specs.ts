/**
 * add-missing-specs.ts'in eklediği satırları geri alır.
 *
 * ── Neden ──────────────────────────────────────────────────────────────────
 * O script yanlış tabloya yazdı. Ürün sayfası teknik özellik tablosunu
 * `product_feature_values`'tan render ediyor; `technical_specs` yalnızca
 * feature değeri olmayan ürünler için yedek:
 *
 *   const specsToShow = hasProductFeatureValues ? filteredSpecs : techSpecs;
 *   (fusionmarkt/src/components/product/SingleProductView.tsx)
 *
 * İlgili dokuz ürünün hepsinde feature değerleri dolu, dolayısıyla eklenen
 * satırlar hiç görünmüyor. Üstelik gereksizdiler: solar giriş akımı limiti ve
 * panel Isc değerleri görünen tabloda zaten vardı. Aynı verinin ikinci bir
 * kopyası ileride sessizce tutarsızlaşır, bu yüzden geri alınıyor.
 *
 * Silme ölçütü üç koşulun birlikte sağlanması: etiket + grup + değer eşleşmesi
 * ve satırın bu ekleme sırasında oluşturulmuş olması (createdAt eşiği). Böylece
 * aynı etiketi taşıyan eski satırlara dokunulmaz.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/revert-added-specs.ts            # rapor, hiçbir şey silmez
 *   npx tsx scripts/revert-added-specs.ts --apply    # siler
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { POWER_STATIONS, SOLAR_PANELS } from "./datasheet-reference";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;
  for (const rel of [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ]) {
    const candidate = join(REPO_ROOT, rel);
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }
  console.error("DATABASE_URL bulunamadı.");
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

/** Bu tarihten önce oluşturulmuş satırlara dokunulmaz. */
const CREATED_AFTER = new Date("2026-07-27T00:00:00Z");

function station(key: string) {
  const s = POWER_STATIONS.find((p) => p.key === key);
  if (!s) throw new Error(`datasheet-reference'ta güç kaynağı yok: ${key}`);
  return s;
}

function panel(key: string) {
  const p = SOLAR_PANELS.find((x) => x.key === key);
  if (!p) throw new Error(`datasheet-reference'ta panel yok: ${key}`);
  return p;
}

const sh4000 = station("sh4000");

interface TargetRow {
  key: string;
  group: string;
  label: string;
  value: string;
}

/** add-missing-specs.ts'teki ROWS listesinin birebir aynısı. */
const TARGETS: TargetRow[] = [
  ...(["p800", "p1800", "p3200", "singo2000pro"] as const).map((key) => ({
    key,
    group: "DC Giriş",
    label: "Max Solar Giriş Akımı",
    value: `${station(key).maxPvCurrentA}A`,
  })),
  {
    key: "sh4000",
    group: "DC Giriş (HV)",
    label: "Max Solar Giriş Akımı (HV)",
    value: `${sh4000.hvMaxPvCurrentA}A`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    label: "Araç Şarj Gücü",
    value: `${sh4000.carChargingW}W`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    label: "Max Solar Giriş (LV)",
    value: `${sh4000.solarMaxW}W`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    label: "DC Giriş Voltaj Aralığı (LV)",
    value: `${sh4000.dcInputRangeV}V`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    label: "Max Solar Giriş Akımı (LV)",
    value: `${sh4000.maxPvCurrentA}A`,
  },
  ...(["sp100", "sp200", "sp400"] as const).map((key) => ({
    key,
    group: "Elektriksel",
    label: "Kısa Devre Akımı",
    value: `${panel(key).iscA}A`,
  })),
];

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  technicalSpecs: {
    id: string;
    label: string;
    value: string;
    group: string | null;
    createdAt: Date;
  }[];
};

function matchProduct(products: DbProduct[], key: string): DbProduct | undefined {
  const candidates = products.filter((p) => p.slug.toLowerCase().includes(key));
  if (candidates.length <= 1) return candidates[0];

  return (
    candidates.find((p) => p.slug.toLowerCase().endsWith(key)) ??
    candidates.sort((a, b) => b.technicalSpecs.length - a.technicalSpecs.length)[0]
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — satırlar silinecek\n"
      : "MOD: deneme çalışması — hiçbir şey silinmeyecek\n"
  );

  const products: DbProduct[] = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      technicalSpecs: {
        select: {
          id: true,
          label: true,
          value: true,
          group: true,
          createdAt: true,
        },
      },
    },
  });

  const doomed: { id: string; productName: string; row: TargetRow; createdAt: Date }[] = [];
  const notFound: string[] = [];
  const tooOld: string[] = [];

  for (const target of TARGETS) {
    const product = matchProduct(products, target.key);
    if (!product) {
      notFound.push(`${target.key} — eşleşen ürün bulunamadı`);
      continue;
    }

    const matches = product.technicalSpecs.filter(
      (s) =>
        s.label.trim() === target.label &&
        (s.group ?? "") === target.group &&
        s.value.trim() === target.value
    );

    if (matches.length === 0) {
      notFound.push(`${product.name} · ${target.label} — satır yok`);
      continue;
    }

    for (const m of matches) {
      if (m.createdAt < CREATED_AFTER) {
        tooOld.push(
          `${product.name} · ${m.label} — ${m.createdAt.toISOString()} (eski, korunuyor)`
        );
        continue;
      }
      doomed.push({
        id: m.id,
        productName: product.name,
        row: target,
        createdAt: m.createdAt,
      });
    }
  }

  console.log("═".repeat(78));
  console.log("SİLİNECEK SATIRLAR");
  console.log("═".repeat(78));

  const byProduct = new Map<string, typeof doomed>();
  for (const d of doomed) {
    const list = byProduct.get(d.productName) ?? [];
    list.push(d);
    byProduct.set(d.productName, list);
  }

  for (const [name, rows] of byProduct) {
    console.log(`\n${name}`);
    for (const r of rows) {
      console.log(
        `  [${r.row.group}] ${r.row.label.padEnd(30)} ${r.row.value.padEnd(8)} ${r.createdAt.toISOString()}`
      );
    }
  }

  if (tooOld.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("KORUNANLAR — eklemeden önce de vardı");
    console.log("═".repeat(78));
    for (const t of tooOld) console.log(`  ${t}`);
  }

  if (notFound.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("BULUNAMAYANLAR");
    console.log("═".repeat(78));
    for (const n of notFound) console.log(`  ${n}`);
  }

  console.log(`\nToplam ${doomed.length} satır silinecek.`);

  if (!apply) {
    console.log("\nDeneme çalışmasıydı. Silmek için --apply ekleyin.");
    return;
  }

  if (doomed.length === 0) {
    console.log("\nSilinecek bir şey yok.");
    return;
  }

  const result = await prisma.technicalSpec.deleteMany({
    where: { id: { in: doomed.map((d) => d.id) } },
  });

  console.log(`\n${result.count} satır silindi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
