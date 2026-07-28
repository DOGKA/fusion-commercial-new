/**
 * Sitedeki tüm ürün verisini üretici datasheet'lerine karşı denetler.
 *
 * Aynı teknik değerler dört ayrı yerde tutuluyor ve birbirinden bağımsız
 * güncelleniyor; bu da zamanla birbirinden ayrışmalarına yol açıyor:
 *
 *   1. Veritabanı  → product_feature_values (ürün sayfasında görünen tablo) ve
 *                    technical_specs (yalnızca feature değeri olmayan ürünlerde
 *                    devreye giren yedek). Denetim ekrana geleni esas alır,
 *                    ikisi çeliştiğinde ayrıca uyarır.
 *   2. Kod         → fusionmarkt/src/lib/power-calculator/products.ts
 *                    (güç hesaplayıcının panel önerisi bu değerlerden çıkıyor)
 *   3. Dokümantasyon → packages/db/prisma/products-reference.md
 *                    (yeni blog yazılırken referans alınan dosya)
 *   4. Blog HTML   → blog_posts.content içindeki sayısal iddialar
 *
 * Doğruluk kaynağı scripts/datasheet-reference.ts; oradaki değerler üreticinin
 * yayınladığı PDF'lerden birebir alınmıştır.
 *
 * Kullanım (repo kökünden):
 *   npx tsx scripts/audit-datasheet-consistency.ts
 *   npx tsx scripts/audit-datasheet-consistency.ts --json
 *
 * Salt okunur; hiçbir şey yazmaz.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import {
  POWER_STATIONS as DS_STATIONS,
  SOLAR_PANELS as DS_PANELS,
  checkCompatibility,
  vocAtTemperature,
  type PowerStationSpec,
  type SolarPanelSpec,
} from "./datasheet-reference.js";
import {
  POWER_STATIONS as SITE_STATIONS,
  SOLAR_PANELS as SITE_PANELS,
} from "../fusionmarkt/src/lib/power-calculator/products.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;
  const candidates = [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ].map((relativePath) => join(REPO_ROOT, relativePath));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }
  console.error("DATABASE_URL bulunamadı.");
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

type Issue = {
  severity: "hata" | "eksik" | "not";
  source: string;
  model: string;
  field: string;
  expected: string;
  found: string;
};

const issues: Issue[] = [];

function report(issue: Issue) {
  issues.push(issue);
}

/** "1024 Wh" → 1024, "12.7 kg" → 12.7, "51.2V" → 51.2 */
function num(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const match = value.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : null;
}

/** Aralık/boyut karşılaştırmalarında biçim farklarını (×, ~, boşluk, birim) siler. */
function norm(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[×x*]/g, "*")
    .replace(/[–—-]/g, "~")
    .replace(/\s+/g, "")
    .replace(/mm|kg|wh|w|v|a|db/g, "");
}

/**
 * Spec etiketleri kaynaktan kaynağa değişiyor: SH4000'de giriş ayrımı için
 * "(HV)" soneki, panellerde kısaltma parantezi "(Voc)" gibi. Karşılaştırmadan
 * önce parantezli kısımlar ve noktalama atılıyor.
 */
function normLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-zçğıöşü0-9]/g, "");
}

/** Etiket haritasında hem birebir hem de parantezsiz eşleşme arar. */
function findSpec(byLabel: Map<string, string>, label: string): string | undefined {
  const direct = byLabel.get(label);
  if (direct !== undefined) return direct;

  const target = normLabel(label);
  for (const [key, value] of byLabel) {
    if (normLabel(key) === target) return value;
  }
  return undefined;
}

function numbersMatch(a: number | null, b: number | null, tolerance = 0.01): boolean {
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= tolerance;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1) Kod: power-calculator/products.ts
// ═══════════════════════════════════════════════════════════════════════════

function auditProductsTs() {
  for (const ds of DS_STATIONS) {
    const site = SITE_STATIONS.find(
      (s) => s.id.toLowerCase() === ds.key || s.name.toLowerCase().includes(ds.key)
    );
    if (!site) {
      // Singo2000 (Pro olmayan) sitede satılmıyor; eksiklik değil.
      if (ds.key !== "singo2000") {
        report({
          severity: "eksik",
          source: "products.ts",
          model: ds.model,
          field: "ürün kaydı",
          expected: "tanımlı olmalı",
          found: "yok",
        });
      }
      continue;
    }

    const checks: [string, number | string | null, number | string][] = [
      ["capacity (Wh)", site.capacity, ds.batteryWh],
      ["batteryVoltage (V)", site.batteryVoltage, ds.batteryNominalV],
      ["acChargingPower (W)", site.acChargingPower, ds.acChargingW],
      ["carChargingPower (W)", site.carChargingPower, ds.carChargingW],
      ["continuousPower (W)", site.continuousPower, ds.continuousW],
      ["surgePower (W)", site.surgePower, ds.surgeW],
      ["weight (kg)", site.weight, ds.weightKg],
      ["batteryToAcEfficiency (%)", site.batteryToAcEfficiency, ds.batteryToAcPct],
      ["acToBatteryEfficiency (%)", site.acToBatteryEfficiency, ds.acToBatteryPct],
    ];

    for (const [field, found, expected] of checks) {
      if (!numbersMatch(num(found), num(expected))) {
        report({
          severity: "hata",
          source: "products.ts",
          model: ds.model,
          field,
          expected: String(expected),
          found: String(found),
        });
      }
    }

    // Solar giriş: SH4000'de site HV değerlerini tutuyor, diğerlerinde tek giriş.
    const expectedSolarW = ds.hvSolarMaxW ?? ds.solarMaxW;
    if (!numbersMatch(num(site.solarMaxW), expectedSolarW)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "solarMaxW (W)",
        expected: String(expectedSolarW),
        found: String(site.solarMaxW),
      });
    }

    const expectedMaxV = ds.hvInputMaxV ?? ds.dcInputMaxV;
    const expectedMinV = ds.hvInputMinV ?? ds.dcInputMinV;
    if (!numbersMatch(num(site.mpptMax), expectedMaxV)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "mpptMax (V)",
        expected: String(expectedMaxV),
        found: String(site.mpptMax),
      });
    }
    if (!numbersMatch(num(site.mpptMin), expectedMinV)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "mpptMin (V)",
        expected: String(expectedMinV),
        found: String(site.mpptMin),
      });
    }

    const expectedCurrent = ds.hvMaxPvCurrentA ?? ds.maxPvCurrentA;
    if (!numbersMatch(num(site.maxDcInputCurrent), expectedCurrent)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "maxDcInputCurrent (A)",
        expected: String(expectedCurrent),
        found: String(site.maxDcInputCurrent),
      });
    }

    if (norm(site.dimensions) !== norm(ds.dimensionsMm)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "dimensions",
        expected: ds.dimensionsMm,
        found: site.dimensions,
      });
    }
  }

  for (const ds of DS_PANELS) {
    const site = SITE_PANELS.find((p) => p.id.toLowerCase() === ds.key);
    if (!site) continue;

    const checks: [string, number, number][] = [
      ["watt (W)", site.watt, ds.watt],
      ["voc (V)", site.voc, ds.vocV],
      ["vmp (V)", site.vmp, ds.vmpV],
      ["isc (A)", site.isc, ds.iscA],
      ["imp (A)", site.imp, ds.impA],
      ["weight (kg)", site.weight, ds.weightKg],
    ];
    for (const [field, found, expected] of checks) {
      if (!numbersMatch(found, expected)) {
        report({
          severity: "hata",
          source: "products.ts",
          model: ds.model,
          field,
          expected: String(expected),
          found: String(found),
        });
      }
    }
    if (norm(site.foldedDimension) !== norm(ds.foldedMm)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "foldedDimension",
        expected: ds.foldedMm,
        found: site.foldedDimension,
      });
    }
    if (norm(site.unfoldedDimension) !== norm(ds.unfoldedMm)) {
      report({
        severity: "hata",
        source: "products.ts",
        model: ds.model,
        field: "unfoldedDimension",
        expected: ds.unfoldedMm,
        found: site.unfoldedDimension,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2) Veritabanı: technical_specs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Aynı teknik değer veritabanında iki tabloda tutuluyor ve etiketleri farklı:
 * ürün sayfası `product_feature_values`'ı gösteriyor ("Max. Solar Şarj"),
 * `technical_specs` ise yalnızca feature değeri olmayan ürünlerde yedek olarak
 * devreye giriyor ("Max Solar Giriş"). Bu yüzden her kontrol birden çok etiket
 * adayı taşıyor; ilk eşleşen kullanılır.
 */
type SpecCheck = {
  field: string;
  labels: string[];
  expected: string | number;
  /** Değer hiç bulunamazsa bildirilsin mi. Panel uyumluluğunu belirleyen alanlar. */
  critical?: boolean;
  /** İki girişli cihazlarda değer birleşik yazılıyor: "70–450 V (HV) / 12–50 V (LV)". */
  contains?: boolean;
};

function stationSpecChecks(ds: PowerStationSpec): SpecCheck[] {
  return [
    {
      field: "Batarya Kapasitesi",
      labels: ["Batarya Kapasitesi", "Kapasite"],
      expected: ds.batteryWh,
    },
    { field: "Batarya Voltajı", labels: ["Batarya Voltajı"], expected: ds.batteryNominalV },
    { field: "AC Şarj Gücü", labels: ["AC Şarj Gücü"], expected: ds.acChargingW },
    { field: "Araç Şarj Gücü", labels: ["Araç Şarj Gücü"], expected: ds.carChargingW },
    {
      field: "Max Solar Giriş",
      labels: ["Max Solar Giriş", "Max. Solar Şarj"],
      expected: ds.hvSolarMaxW ?? ds.solarMaxW,
      critical: true,
    },
    {
      field: "DC Giriş Voltaj Aralığı",
      labels: ["DC Giriş Voltaj Aralığı", "Solar Giriş Voltajı"],
      expected: ds.hvInputRangeV ?? ds.dcInputRangeV,
      critical: true,
      contains: true,
    },
    {
      field: "Max DC/PV Giriş Akımı",
      labels: ["Max Solar Giriş Akımı", "Max. DC PV Akımı"],
      expected: ds.hvMaxPvCurrentA ?? ds.maxPvCurrentA,
      critical: true,
    },
    {
      field: "Sürekli Çıkış Gücü",
      labels: ["Sürekli Çıkış Gücü", "Çıkış Gücü"],
      expected: ds.continuousW,
    },
    { field: "Tepe Güç", labels: ["Tepe Güç", "Max. Çıkış Gücü"], expected: ds.surgeW },
    { field: "Ağırlık", labels: ["Ağırlık"], expected: ds.weightKg },
    {
      field: "Boyutlar",
      labels: ["Boyutlar"],
      expected: ds.dimensionsMm,
      contains: true,
    },
    { field: "IP Koruma", labels: ["IP Koruma"], expected: ds.ipRating },
    { field: "Ses Seviyesi", labels: ["Ses Seviyesi"], expected: ds.noiseDb },
    { field: "Batarya Tipi", labels: ["Batarya Tipi", "Hücre Tipi"], expected: ds.cellType },
    { field: "USB-C Port", labels: ["USB-C Port"], expected: ds.usbCPorts },
    { field: "USB-A Port", labels: ["USB-A Port"], expected: ds.usbAPorts },
    {
      field: "Kablosuz Şarj",
      labels: ["Kablosuz Şarj"],
      expected: ds.wirelessChargerW ? "Evet" : "Hayır",
    },
  ];
}

function panelSpecChecks(ds: SolarPanelSpec): SpecCheck[] {
  return [
    { field: "Panel Gücü", labels: ["Çıkış Gücü", "Panel Gücü"], expected: ds.watt },
    {
      field: "Açık Devre Voltajı (Voc)",
      labels: ["Açık Devre Voltajı", "Açık Devre Gerilimi"],
      expected: ds.vocV,
      critical: true,
    },
    {
      field: "Çalışma Voltajı (Vmp)",
      labels: ["Çalışma Voltajı"],
      expected: ds.vmpV,
      critical: true,
    },
    {
      field: "Kısa Devre Akımı (Isc)",
      labels: ["Kısa Devre Akımı"],
      expected: ds.iscA,
      critical: true,
    },
    { field: "Çalışma Akımı (Imp)", labels: ["Çalışma Akımı"], expected: ds.impA },
    { field: "Ağırlık", labels: ["Ağırlık"], expected: ds.weightKg },
    { field: "IP Koruma", labels: ["IP Koruma"], expected: ds.ipRating },
    { field: "Hücre Tipi", labels: ["Hücre Tipi"], expected: ds.cellType },
    {
      field: "Katlanmış Boyutlar",
      labels: ["Katlanmış Boyutlar"],
      expected: ds.foldedMm,
    },
    {
      field: "Açılmış Boyutlar",
      labels: ["Açılmış Boyutlar"],
      expected: ds.unfoldedMm,
    },
    { field: "Katlanma Tipi", labels: ["Katlanma Tipi"], expected: ds.foldType },
    {
      field: "Çalışma Sıcaklığı",
      labels: ["Çalışma Sıcaklığı"],
      expected: ds.workingTempC,
      contains: true,
    },
    {
      field: "Panel Konfigürasyonu",
      labels: ["Panel Konfigürasyonu"],
      expected: ds.panelConfig,
    },
    { field: "MC4 Nominal Voltaj", labels: ["MC4 Nominal Voltaj"], expected: ds.vmpV },
    { field: "MC4 Nominal Akım", labels: ["MC4 Nominal Akım"], expected: ds.impA },
  ];
}

type FeatureValueRow = {
  valueText: string | null;
  valueNumber: unknown;
  unit: string | null;
  feature: { name: string } | null;
};

type DbProduct = {
  name: string;
  slug: string;
  technicalSpecs: { label: string; value: string }[];
  productFeatureValues: FeatureValueRow[];
};

/** Değer özelliğe göre ya metin alanında ya da sayı + birim ikilisinde duruyor. */
function renderFeatureValue(row: FeatureValueRow): string {
  if (row.valueText !== null) return row.valueText;
  if (row.valueNumber === null || row.valueNumber === undefined) return "";
  return `${String(row.valueNumber)}${row.unit ?? ""}`;
}

function featureMap(product: DbProduct): Map<string, string> {
  return new Map(
    product.productFeatureValues
      .filter((v) => v.feature)
      .map((v) => [v.feature!.name.trim(), renderFeatureValue(v)])
  );
}

function techSpecMap(product: DbProduct): Map<string, string> {
  return new Map(product.technicalSpecs.map((s) => [s.label.trim(), s.value]));
}

function findByLabels(map: Map<string, string>, labels: string[]): string | undefined {
  for (const label of labels) {
    const found = findSpec(map, label);
    if (found !== undefined) return found;
  }
  return undefined;
}

function valueMatches(found: string, check: SpecCheck): boolean {
  if (typeof check.expected === "number") {
    return numbersMatch(num(found), check.expected);
  }
  const f = norm(found);
  const e = norm(String(check.expected));
  return check.contains ? f.includes(e) : f === e;
}

/**
 * Model anahtarı birden fazla üründe geçebiliyor: B5120 genişletme bataryasının
 * slug'ında da "sh4000" var. Slug'ı anahtarla biten ürün asıl üründür; yoksa
 * spec sayısı en yüksek olan seçilir.
 */
function matchProduct(products: DbProduct[], key: string): DbProduct | undefined {
  const candidates = products.filter((p) => p.slug.toLowerCase().includes(key));
  if (candidates.length <= 1) return candidates[0];

  return (
    candidates.find((p) => p.slug.toLowerCase().endsWith(key)) ??
    candidates.sort((a, b) => b.technicalSpecs.length - a.technicalSpecs.length)[0]
  );
}

async function auditDatabase() {
  const products: DbProduct[] = await prisma.product.findMany({
    select: {
      name: true,
      slug: true,
      technicalSpecs: { select: { label: true, value: true } },
      productFeatureValues: {
        select: {
          valueText: true,
          valueNumber: true,
          unit: true,
          feature: { select: { name: true } },
        },
      },
    },
  });

  const targets = [
    ...DS_STATIONS.filter((ds) => ds.key !== "singo2000") // katalogda yok
      .map((ds) => ({ model: ds.model, key: ds.key, checks: stationSpecChecks(ds) })),
    ...DS_PANELS.map((ds) => ({
      model: ds.model,
      key: ds.key,
      checks: panelSpecChecks(ds),
    })),
  ];

  for (const target of targets) {
    const product = matchProduct(products, target.key);
    if (!product) {
      report({
        severity: "eksik",
        source: "veritabanı",
        model: target.model,
        field: "ürün kaydı",
        expected: "tanımlı olmalı",
        found: "yok",
      });
      continue;
    }

    const shown = featureMap(product);
    const fallback = techSpecMap(product);

    // SingleProductView.tsx ile aynı seçim: feature değerleri varsa tablo
    // onlardan render ediliyor, technical_specs hiç ekrana gelmiyor.
    const displayed = shown.size > 0 ? shown : fallback;
    const source =
      shown.size > 0
        ? "ürün sayfası · product_feature_values"
        : "ürün sayfası · technical_specs (yedek)";

    for (const check of target.checks) {
      const found = findByLabels(displayed, check.labels);

      if (found === undefined) {
        if (check.critical) {
          report({
            severity: "eksik",
            source,
            model: target.model,
            field: check.field,
            expected: String(check.expected),
            found: "satır yok",
          });
        }
      } else if (!valueMatches(found, check)) {
        report({
          severity: "hata",
          source,
          model: target.model,
          field: check.field,
          expected: String(check.expected),
          found,
        });
      }

      // İki tablo aynı alanı farklı yazıyorsa hatalı olan sessizce yayında
      // kalabiliyor: P3200'ün solar giriş limiti yedekte doğruydu, yayındaki
      // kopyaya surge gücü yazılmıştı.
      if (shown.size === 0 || fallback.size === 0) continue;
      const backup = findByLabels(fallback, check.labels);
      if (found !== undefined && backup !== undefined && norm(found) !== norm(backup)) {
        report({
          severity: "not",
          source: "veritabanı · iki tablo çelişiyor",
          model: target.model,
          field: check.field,
          expected: `${backup} (yedek tablo)`,
          found: `${found} (yayında)`,
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3) Dokümantasyon: products-reference.md
// ═══════════════════════════════════════════════════════════════════════════

function auditReferenceDoc() {
  const path = join(REPO_ROOT, "packages/db/prisma/products-reference.md");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");

  // Model başlığından bir sonraki başlığa kadar olan bölümü al.
  function sectionFor(model: string): string {
    const start = text.indexOf(`### ${model}`);
    if (start === -1) return "";
    const next = text.indexOf("\n### ", start + 1);
    return text.slice(start, next === -1 ? undefined : next);
  }

  for (const ds of DS_STATIONS) {
    const section = sectionFor(ds.model) || sectionFor(ds.model.replace("Pro", " Pro"));
    if (!section) continue;

    const whMatch = section.match(/(\d[\d.]*)\s*Wh/i);
    if (whMatch && !numbersMatch(num(whMatch[1]), ds.batteryWh)) {
      report({
        severity: "hata",
        source: "products-reference.md",
        model: ds.model,
        field: "Batarya Wh",
        expected: String(ds.batteryWh),
        found: whMatch[1],
      });
    }

    const effMatches = [...section.matchAll(/%(\d[\d.]*)/g)].map((m) => Number(m[1]));
    for (const eff of effMatches) {
      if (eff > 97 && eff <= 100) {
        report({
          severity: "hata",
          source: "products-reference.md",
          model: ds.model,
          field: "Verimlilik",
          expected: `${ds.batteryToAcPct}`,
          found: `%${eff}`,
        });
      }
    }

    const weightMatch = section.match(/\*\*([\d.]+)\s*kg\*\*/i);
    if (weightMatch && !numbersMatch(num(weightMatch[1]), ds.weightKg)) {
      report({
        severity: "hata",
        source: "products-reference.md",
        model: ds.model,
        field: "Ağırlık",
        expected: String(ds.weightKg),
        found: weightMatch[1],
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4) Blog HTML: sayısal iddialar
// ═══════════════════════════════════════════════════════════════════════════

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

const ALL_MODEL_NAMES = [
  ...DS_STATIONS.map((s) => s.model),
  ...DS_PANELS.map((p) => p.model),
];

/**
 * Karşılaştırma tablolarında model adı ve sayı yan yana düşer ama aynı satıra
 * ait değildir ("P800 | P1800 | Kapasite | 512Wh | 1024Wh"). Model adıyla sayı
 * arasında başka bir model geçiyorsa eşleşme güvenilir değildir.
 */
function hasInterveningModel(span: string, self: string): boolean {
  const body = span.slice(self.length);
  return ALL_MODEL_NAMES.some(
    (name) => name !== self && new RegExp(name.replace(/(\d)/, "\\s?$1"), "i").test(body)
  );
}

async function auditBlogClaims() {
  const posts = await prisma.blogPost.findMany({
    select: { slug: true, content: true },
    orderBy: { slug: "asc" },
  });

  for (const post of posts) {
    const text = stripTags(post.content);

    for (const ds of DS_STATIONS) {
      // Singo2000 ile Singo2000Pro adları iç içe geçtiği için baz model atlanıyor.
      if (ds.key === "singo2000") continue;

      const modelPattern = new RegExp(
        `${ds.model.replace(/(\d)/, "\\s?$1")}[^.;]{0,40}?(\\d[\\d.,]*)\\s*Wh`,
        "gi"
      );
      for (const match of text.matchAll(modelPattern)) {
        if (hasInterveningModel(match[0], ds.model)) continue;
        // "512-1024Wh" gibi aralıklar ve "~900 Wh" gibi kullanılabilir kapasite
        // tahminleri iddia değil; yaklaşıklık işareti varsa atla.
        if (/[~≈]|\d\s*[-–]\s*\d/.test(match[0])) continue;

        const claimed = num(match[1].replace(/\./g, ""));
        if (claimed === null || claimed < 100) continue;
        if (!numbersMatch(claimed, ds.batteryWh, 1)) {
          report({
            severity: "not",
            source: `blog:${post.slug}`,
            model: ds.model,
            field: "Wh iddiası",
            expected: String(ds.batteryWh),
            found: `${match[1]} — "${match[0].trim().slice(0, 90)}"`,
          });
        }
      }

      const rangePattern = new RegExp(
        `${ds.model.replace(/(\d)/, "\\s?$1")}[^.;]{0,40}?(\\d+)\\s*[–~-]\\s*(\\d+)\\s*V`,
        "gi"
      );
      for (const match of text.matchAll(rangePattern)) {
        if (hasInterveningModel(match[0], ds.model)) continue;

        const lo = Number(match[1]);
        const hi = Number(match[2]);
        const validRanges = [
          [ds.dcInputMinV, ds.dcInputMaxV],
          ds.hvInputMinV ? [ds.hvInputMinV, ds.hvInputMaxV!] : null,
          [num(ds.batteryRangeV.split("~")[0])!, num(ds.batteryRangeV.split("~")[1])!],
        ].filter(Boolean) as number[][];

        if (!validRanges.some(([a, b]) => a === lo && b === hi)) {
          report({
            severity: "not",
            source: `blog:${post.slug}`,
            model: ds.model,
            field: "voltaj aralığı iddiası",
            expected: validRanges.map(([a, b]) => `${a}–${b}V`).join(" veya "),
            found: `${lo}–${hi}V — "${match[0].trim().slice(0, 90)}"`,
          });
        }
      }
    }

    for (const ds of DS_PANELS) {
      const vocPattern = new RegExp(
        `${ds.model}[^.;]{0,60}?Voc[^\\d]{0,14}(\\d[\\d.,]*)\\s*V`,
        "gi"
      );
      for (const match of text.matchAll(vocPattern)) {
        const claimed = num((match[1] ?? "").replace(",", "."));
        if (claimed === null) continue;
        if (numbersMatch(claimed, ds.vocV, 0.05)) continue;

        // Voc yerine Vmp yazılması yaygın bir karıştırma; sonucu doğrudan
        // etkilediği için not değil hata sayılıyor.
        const isVmpConfusion = numbersMatch(claimed, ds.vmpV, 0.05);
        report({
          severity: isVmpConfusion ? "hata" : "not",
          source: `blog:${post.slug}`,
          model: ds.model,
          field: isVmpConfusion ? "Voc yerine Vmp yazılmış" : "Voc iddiası",
          expected: `${ds.vocV}V${isVmpConfusion ? ` (${claimed}V bu panelin Vmp değeri)` : ""}`,
          found: `${claimed}V — "${match[0].trim().slice(0, 90)}"`,
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5) Uyumluluk matrisi
// ═══════════════════════════════════════════════════════════════════════════

function printCompatibilityMatrix() {
  console.log(`\n${"═".repeat(78)}`);
  console.log("PANEL ↔ GÜÇ KAYNAĞI UYUMLULUK MATRİSİ (datasheet'ten hesaplanmış)");
  console.log("═".repeat(78));

  for (const station of DS_STATIONS) {
    console.log(`\n${station.model}`);
    const inputs: { useHv: boolean; label: string }[] = station.hvInputMinV
      ? [
          { useHv: false, label: `LV ${station.dcInputRangeV}V / ${station.solarMaxW}W` },
          { useHv: true, label: `HV ${station.hvInputRangeV}V / ${station.hvSolarMaxW}W` },
        ]
      : [{ useHv: false, label: `${station.dcInputRangeV}V / ${station.solarMaxW}W` }];

    for (const input of inputs) {
      console.log(`  ${input.label}`);
      for (const panel of DS_PANELS) {
        const results = [1, 2, 3].map((series) =>
          checkCompatibility(station, panel, series, input.useHv)
        );
        const okResults = results.filter((r) => r.ok);
        const label = okResults.length
          ? okResults
              .map((r) => (r.series === 1 ? r.reason : `${r.series}× seri: ${r.reason}`))
              .join(" | ")
          : results[0].reason;
        console.log(`    ${okResults.length ? "✓" : "✗"} ${panel.model.padEnd(6)} ${label}`);
      }
    }
  }

  console.log(`\n  Soğuk hava notu: Voc 25°C değeridir. 0°C'de SP400 ${vocAtTemperature(52.8, 0).toFixed(1)}V,`);
  console.log(`  SP200 ${vocAtTemperature(28.8, 0).toFixed(1)}V, SP100 ${vocAtTemperature(21.6, 0).toFixed(1)}V'a çıkar.`);
}

// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  auditProductsTs();
  await auditDatabase();
  auditReferenceDoc();
  await auditBlogClaims();

  const order = { hata: 0, eksik: 1, not: 2 } as const;
  issues.sort(
    (a, b) =>
      order[a.severity] - order[b.severity] ||
      a.source.localeCompare(b.source) ||
      a.model.localeCompare(b.model)
  );

  const counts = {
    hata: issues.filter((i) => i.severity === "hata").length,
    eksik: issues.filter((i) => i.severity === "eksik").length,
    not: issues.filter((i) => i.severity === "not").length,
  };

  console.log("═".repeat(78));
  console.log("DATASHEET TUTARLILIK DENETİMİ");
  console.log("═".repeat(78));
  console.log(`  hata:  ${counts.hata}  (datasheet ile çelişen değer)`);
  console.log(`  eksik: ${counts.eksik}  (olması gereken ama bulunmayan veri)`);
  console.log(`  not:   ${counts.not}  (gözden geçirilmeli, otomatik tespit)`);

  let currentSource = "";
  for (const issue of issues) {
    if (issue.source !== currentSource) {
      currentSource = issue.source;
      console.log(`\n${"─".repeat(78)}`);
      console.log(currentSource);
      console.log("─".repeat(78));
    }
    console.log(`  [${issue.severity}] ${issue.model} · ${issue.field}`);
    console.log(`         beklenen: ${issue.expected}`);
    console.log(`         bulunan:  ${issue.found}`);
  }

  printCompatibilityMatrix();

  if (process.argv.includes("--json")) {
    const path = join(SCRIPT_DIR, ".datasheet-audit.json");
    writeFileSync(path, JSON.stringify(issues, null, 2));
    console.log(`\nJSON rapor: ${path}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
