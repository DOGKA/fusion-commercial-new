/**
 * Landing Page Generator
 * Use-case bazlı landing page içeriği ve Next.js sayfa şablonu üretir
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/4-landing-pages.ts --dry-run    (önizleme)
 *   npx tsx scripts/seo-bot/4-landing-pages.ts --apply       (dosya oluştur)
 *   npx tsx scripts/seo-bot/4-landing-pages.ts --topic kamp  (tek topic)
 */
import { getProductsWithSpecs, disconnectDb } from "./lib/db-reader";
import { generateContent, generateJSON } from "./lib/ai-client";
import { saveReport, printSummary } from "./lib/reporter";
import { LANDING_PAGE_TOPICS } from "./lib/config";
import * as fs from "fs";
import * as path from "path";

interface LandingPageResult {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  content: string;
  recommendedProducts: string[];
}

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");
const topicFilter = args.find((a, i) => args[i - 1] === "--topic") || null;

async function generateLandingPages(): Promise<void> {
  console.log(`\n🚀 Landing Page Generator ${isDryRun ? "(DRY RUN)" : "(APPLY MODE)"}\n`);

  const products = await getProductsWithSpecs();
  const topics = topicFilter
    ? LANDING_PAGE_TOPICS.filter((t) => t.slug.includes(topicFilter))
    : LANDING_PAGE_TOPICS;

  console.log(`📄 ${topics.length} landing page üretilecek\n`);
  const results: LandingPageResult[] = [];

  for (const topic of topics) {
    console.log(`\n━━━ ${topic.title} ━━━`);

    const categoryProducts = products.filter(
      (p) => p.category.slug === topic.relatedCategory
    );

    const productsInfo = categoryProducts
      .map(
        (p) =>
          `- ${p.name}: ${p.price} TL, ${p.technicalSpecs
            .slice(0, 3)
            .map((s) => `${s.label}=${s.value}`)
            .join(", ")}`
      )
      .join("\n");

    // 1. Meta veriler
    console.log("  📝 Meta veriler üretiliyor...");
    const meta = await generateJSON<{
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      recommendedProducts: string[];
    }>({
      prompt: `"${topic.title}" konulu landing page için meta veriler üret.

HEDEF KEYWORDS: ${topic.keywords.join(", ")}
KATEGORİ ÜRÜNLERİ:
${productsInfo}

JSON formatında döndür:
{
  "metaTitle": "50-60 karakter, ana keyword + değer önerisi",
  "metaDescription": "150-160 karakter, problem + çözüm + CTA",
  "metaKeywords": ["5-8 hedef keyword"],
  "recommendedProducts": ["bu use-case için en uygun 2-3 ürün adı"]
}`,
      maxTokens: 800,
      temperature: 0.5,
    });

    // 2. Sayfa içeriği (1000-2000 kelime)
    console.log("  📄 Sayfa içeriği üretiliyor...");
    const content = await generateContent({
      prompt: `"${topic.title}" konusunda kapsamlı bir landing page içeriği üret.

KONU: ${topic.title}
HEDEF KEYWORDS: ${topic.keywords.join(", ")}
KATEGORİ ÜRÜNLERİ:
${productsInfo}
ÖNERİLEN ÜRÜNLER: ${meta.recommendedProducts.join(", ")}

İÇERİK YAPISI (her biri h2 başlığı ile):
1. Giriş - Problem tanımı ve neden taşınabilir güç kaynağına ihtiyaç var (2-3 paragraf)
2. Güç İhtiyacı Hesaplama - Bu use-case için tipik cihazlar ve güç tüketimi tablosu
3. Hangi Model Size Uygun? - Ürün önerileri ve karşılaştırma
4. Solar Panel ile Kullanım - Güneş paneli entegrasyonu tavsiyeleri
5. Pratik İpuçları - 5-7 maddelik kullanım tavsiyeleri
6. Sıkça Sorulan Sorular - 3-4 SSS
7. Sonuç ve Aksiyon - CTA: Güç Hesaplayıcı'yı deneyin, ürünleri inceleyin

KURALLAR:
- HTML formatı (h2, h3, p, ul, li, strong, table, tr, th, td).
- 1000-1500 kelime.
- Doğal keyword yerleştirmesi.
- Gerçek teknik veriler kullan (ürün specs'lerinden).
- İç link placeholder: [LINK:/kategori/tasinabilir-guc-kaynaklari], [LINK:/guc-hesaplayici]
- Güç Hesaplayıcı'ya CTA: [CTA:guc-hesaplayici]
- Danışmanlık tonu: "doğru sistemi seçtiren uzman mağaza"`,
      maxTokens: 4000,
      temperature: 0.6,
    });

    const result: LandingPageResult = {
      slug: topic.slug,
      title: topic.title,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      metaKeywords: meta.metaKeywords,
      content,
      recommendedProducts: meta.recommendedProducts,
    };

    results.push(result);
    console.log(`  ✅ Tamamlandı (${content.length} karakter)`);

    if (!isDryRun) {
      const pageDir = path.resolve(
        __dirname,
        "../..",
        `fusionmarkt/src/app/${topic.slug}`
      );
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }

      // page.tsx şablonu
      const pageTemplate = `import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: ${JSON.stringify(result.metaTitle)},
  description: ${JSON.stringify(result.metaDescription)},
  keywords: ${JSON.stringify(result.metaKeywords)},
  alternates: {
    canonical: \`https://fusionmarkt.com/${topic.slug}\`,
  },
  openGraph: {
    title: ${JSON.stringify(result.metaTitle)},
    description: ${JSON.stringify(result.metaDescription)},
    type: "website",
    locale: "tr_TR",
    siteName: "FusionMarkt",
    url: \`https://fusionmarkt.com/${topic.slug}\`,
  },
};

export default function ${toPascalCase(topic.slug)}Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: ${JSON.stringify(topic.title)},
    description: ${JSON.stringify(result.metaDescription)},
    url: \`https://fusionmarkt.com/${topic.slug}\`,
    publisher: {
      "@type": "Organization",
      name: "FusionMarkt",
      url: "https://fusionmarkt.com",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="bg-background text-foreground">
        <div className="container max-w-4xl mx-auto px-4 py-16 pt-32">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            ${topic.title}
          </h1>
          <article
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: CONTENT }}
          />
        </div>
      </main>
    </>
  );
}

const CONTENT = ${JSON.stringify(result.content)};
`;

      fs.writeFileSync(path.join(pageDir, "page.tsx"), pageTemplate, "utf-8");
      console.log(`  💾 Sayfa oluşturuldu: ${pageDir}/page.tsx`);
    }
  }

  printSummary("LANDING PAGE SONUÇLARI", [
    { label: "Üretilen Sayfa", value: results.length },
    { label: "Mod", value: isDryRun ? "DRY RUN" : "APPLY" },
  ]);

  saveReport("landing-pages", {
    mode: isDryRun ? "dry-run" : "apply",
    timestamp: new Date().toISOString(),
    results,
  });

  await disconnectDb();
}

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

generateLandingPages().catch(console.error);
