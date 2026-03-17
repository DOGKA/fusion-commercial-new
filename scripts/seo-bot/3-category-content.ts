/**
 * Category Content Generator
 * Kategori sayfaları için zengin HTML açıklama, SSS ve karşılaştırma içeriği üretir
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/3-category-content.ts --dry-run    (önizleme)
 *   npx tsx scripts/seo-bot/3-category-content.ts --apply       (dosyaya yaz)
 */
import { getProductsWithSpecs, getCategoriesWithCounts, disconnectDb } from "./lib/db-reader";
import { generateContent, generateJSON } from "./lib/ai-client";
import { saveReport, printSummary } from "./lib/reporter";
import { CATEGORY_SLUGS, TARGET_KEYWORDS } from "./lib/config";
import * as fs from "fs";
import * as path from "path";

interface CategoryContent {
  slug: string;
  name: string;
  heroDescription: string;
  faqItems: { question: string; answer: string }[];
  comparisonData: string;
  useCaseLinks: { title: string; slug: string }[];
  seoDescription: string;
}

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");

async function generateCategoryContent(): Promise<void> {
  console.log(`\n🚀 Category Content Generator ${isDryRun ? "(DRY RUN)" : "(APPLY MODE)"}\n`);

  const products = await getProductsWithSpecs();
  const categories = await getCategoriesWithCounts();
  const results: CategoryContent[] = [];

  const targetCategories = categories.filter(
    (c) => Object.values(CATEGORY_SLUGS).includes(c.slug)
  );

  console.log(`📂 ${targetCategories.length} kategori işlenecek\n`);

  for (const category of targetCategories) {
    console.log(`\n━━━ ${category.name} (${category.slug}) ━━━`);

    const categoryProducts = products.filter(
      (p) => p.category.slug === category.slug
    );

    const productsInfo = categoryProducts
      .map(
        (p) =>
          `- ${p.name}: ${p.price} TL, ${p.technicalSpecs
            .slice(0, 5)
            .map((s) => `${s.label}=${s.value}`)
            .join(", ")}`
      )
      .join("\n");

    const relevantKeywords = [
      ...TARGET_KEYWORDS.tier1_commercial,
      ...TARGET_KEYWORDS.tier2_usecase,
    ]
      .filter((k) => {
        const slugWords = category.slug.replace(/-/g, " ");
        return k.includes("güç") || k.includes("solar") || k.includes("panel") || 
               k.includes("enerji") || slugWords.includes(k.split(" ")[0]);
      })
      .slice(0, 10);

    // 1. Hero açıklama (200-300 kelime)
    console.log("  📝 Hero açıklama üretiliyor...");
    const heroDescription = await generateContent({
      prompt: `"${category.name}" kategorisi için 200-300 kelimelik SEO-optimized hero açıklama yaz.

KATEGORİ: ${category.name}
ÜRÜN SAYISI: ${category.productCount}
ÜRÜNLER:
${productsInfo}

HEDEF KEYWORDS: ${relevantKeywords.join(", ")}

KURALLAR:
- HTML formatında (p, strong etiketleri).
- İlk cümlede ana keyword olsun.
- Ürün çeşitliliğini, fiyat aralığını ve avantajları anlat.
- "FusionMarkt güvencesiyle" gibi güven sinyalleri ekle.
- Doğal, bilgilendirici ton; agresif satış yapma.
- Kullanım senaryolarına değin (kamp, karavan, ev, profesyonel).`,
      maxTokens: 1500,
      temperature: 0.6,
    });

    // 2. SSS (5 soru-cevap)
    console.log("  ❓ SSS üretiliyor...");
    const faqItems = await generateJSON<{ question: string; answer: string }[]>({
      prompt: `"${category.name}" kategorisi için 5 SSS (Sıkça Sorulan Sorular) üret.

KATEGORİ: ${category.name}
ÜRÜNLER:
${productsInfo}

Her soru gerçek bir kullanıcı sorusu olsun:
- "Hangi model bana uygun?"
- "Kaç Wh kapasiteye ihtiyacım var?"
- "Solar panel ile şarj süresi ne kadar?"
- "Garanti ve iade koşulları nedir?"
- "Kamp/karavan/ev kullanımı için hangisi?"

JSON array formatında döndür: [{ "question": "...", "answer": "..." }]
Cevaplar 2-3 cümle, teknik ama anlaşılır olsun.`,
      maxTokens: 2000,
      temperature: 0.6,
    });

    // 3. Karşılaştırma tablosu
    console.log("  📊 Karşılaştırma verisi üretiliyor...");
    const comparisonData = await generateContent({
      prompt: `"${category.name}" kategorisindeki ürünler için HTML karşılaştırma tablosu üret.

ÜRÜNLER:
${productsInfo}

Tablo sütunları: Model, Kapasite, Çıkış Gücü, Fiyat, En Uygun Kullanım
HTML <table> formatında döndür. <thead> ve <tbody> kullan. Temiz ve okunabilir olsun.`,
      maxTokens: 2000,
      temperature: 0.4,
    });

    // 4. Kategori SEO açıklaması (config.ts için)
    console.log("  🔍 SEO description üretiliyor...");
    const seoDescResult = await generateJSON<{ seoDescription: string }>({
      prompt: `"${category.name}" kategorisi için 150-160 karakter meta description yaz.
ÜRÜNLER: ${categoryProducts.map((p) => p.name).join(", ")}
KEYWORDS: ${relevantKeywords.slice(0, 5).join(", ")}

JSON formatında döndür: { "seoDescription": "..." }
Ticari niyet, ürün çeşitliliği ve güven sinyali içersin.`,
      maxTokens: 300,
      temperature: 0.5,
    });

    const result: CategoryContent = {
      slug: category.slug,
      name: category.name,
      heroDescription,
      faqItems,
      comparisonData,
      useCaseLinks: [],
      seoDescription: seoDescResult.seoDescription,
    };

    results.push(result);
    console.log(`  ✅ Tamamlandı`);

    if (!isDryRun) {
      const outputDir = path.resolve(
        __dirname,
        "../..",
        "fusionmarkt/src/data/category-content"
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const outputPath = path.join(outputDir, `${category.slug}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  💾 Kaydedildi: ${outputPath}`);
    }
  }

  printSummary("CATEGORY CONTENT SONUÇLARI", [
    { label: "İşlenen Kategori", value: results.length },
    { label: "Mod", value: isDryRun ? "DRY RUN" : "APPLY" },
  ]);

  saveReport("category-content", {
    mode: isDryRun ? "dry-run" : "apply",
    timestamp: new Date().toISOString(),
    results,
  });

  await disconnectDb();
}

generateCategoryContent().catch(console.error);
