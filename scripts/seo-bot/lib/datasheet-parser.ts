/**
 * Datasheet Parser
 * .cache/datasheets/ dizinindeki text dosyalarından okur
 * PDF indirme devre dışı -- veriler manuel olarak cache'e yazıldı
 */
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.resolve(__dirname, "../.cache/datasheets");

interface ManualProduct {
  category: string;
  name: string;
  slug: string;
  imageUrl: string;
  datasheetUrl: string;
  userManualUrl?: string;
}

interface ManualsData {
  generatedAt: string;
  products: ManualProduct[];
  catalogues: { name: string; url: string }[];
}

function loadManualsData(): ManualsData {
  const dataPath = path.resolve(
    __dirname,
    "../../../fusionmarkt/src/data/manuals-data.json"
  );
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

export interface DatasheetContent {
  slug: string;
  name: string;
  category: string;
  text: string;
  datasheetUrl: string;
}

export async function getDatasheetContent(slug: string): Promise<DatasheetContent | null> {
  const manualsData = loadManualsData();
  const product = manualsData.products.find((p) => p.slug === slug);

  // Cache'den oku (.txt dosyasi)
  const cachePath = path.join(CACHE_DIR, `${slug}.txt`);
  if (fs.existsSync(cachePath)) {
    const cached = fs.readFileSync(cachePath, "utf-8");
    return {
      slug,
      name: product?.name || slug,
      category: product?.category || "Bilinmiyor",
      text: cached,
      datasheetUrl: product?.datasheetUrl || "",
    };
  }

  if (!product) return null;

  console.log(`  ⚠ Cache bulunamadı: ${slug}.txt (datasheet kullanılamayacak)`);
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    text: "",
    datasheetUrl: product.datasheetUrl,
  };
}

export async function getAllDatasheets(): Promise<DatasheetContent[]> {
  const manualsData = loadManualsData();
  const results: DatasheetContent[] = [];

  for (const product of manualsData.products) {
    const content = await getDatasheetContent(product.slug);
    if (content) results.push(content);
  }

  return results;
}

export function getDatasheetSlugs(): string[] {
  const manualsData = loadManualsData();
  return manualsData.products.map((p) => p.slug);
}

export function getCachedSlugs(): string[] {
  if (!fs.existsSync(CACHE_DIR)) return [];
  return fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith(".txt"))
    .map((f) => f.replace(".txt", ""));
}
