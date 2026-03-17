/**
 * Internal Links Optimizer
 * Blog ve ürün içeriklerinde iç link fırsatlarını tespit eder
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/6-internal-links.ts
 */
import { getProductsWithSpecs, getBlogPosts, getCategoriesWithCounts, disconnectDb } from "./lib/db-reader";
import { saveReport, printSummary } from "./lib/reporter";
import { LANDING_PAGE_TOPICS } from "./lib/config";

interface LinkOpportunity {
  sourcePage: string;
  sourceType: "blog" | "product";
  targetPage: string;
  targetType: "category" | "product" | "blog" | "landing" | "tool";
  anchorText: string;
  context: string;
  priority: "high" | "medium" | "low";
}

const ANCHOR_KEYWORDS: Record<string, { target: string; type: LinkOpportunity["targetType"] }[]> = {
  "taşınabilir güç kaynağı": [
    { target: "/kategori/tasinabilir-guc-kaynaklari", type: "category" },
  ],
  "güneş paneli": [
    { target: "/kategori/gunes-panelleri", type: "category" },
  ],
  "solar panel": [
    { target: "/kategori/gunes-panelleri", type: "category" },
  ],
  "güç hesaplayıcı": [
    { target: "/guc-hesaplayici", type: "tool" },
  ],
  "kamp için güç kaynağı": [
    { target: "/kamp-icin-tasinabilir-guc-kaynagi", type: "landing" },
  ],
  "karavan güç kaynağı": [
    { target: "/karavan-icin-guc-kaynagi-ve-solar-panel", type: "landing" },
  ],
  "cpap güç kaynağı": [
    { target: "/cpap-icin-guc-kaynagi", type: "landing" },
  ],
  "elektrik kesintisi": [
    { target: "/ev-icin-yedek-guc-cozumu", type: "landing" },
  ],
  "şantiye enerji": [
    { target: "/santiye-icin-tasinabilir-enerji", type: "landing" },
  ],
  "lifepo4": [
    { target: "/blog/lifepo4-batarya-nedir-avantajlari-nelerdir", type: "blog" },
  ],
  "mppt": [
    { target: "/blog/mppt-vs-pwm-sarj-kontrolcusu-fark-nedir", type: "blog" },
  ],
  "saf sinüs": [
    { target: "/blog/saf-sinus-dalga-vs-modifiye-sinus-fark-nedir", type: "blog" },
  ],
  "pass-through": [
    { target: "/blog/guc-istasyonunda-pass-through-sarj-ups-modu", type: "blog" },
  ],
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function findKeywordInContent(content: string, keyword: string): boolean {
  return content.toLowerCase().includes(keyword.toLowerCase());
}

function hasLinkTo(html: string, target: string): boolean {
  return html.includes(`href="${target}"`) || html.includes(`href='${target}'`);
}

async function analyzeInternalLinks(): Promise<void> {
  console.log("🔗 Internal Link Optimizer başlıyor...\n");

  const products = await getProductsWithSpecs();
  const blogPosts = await getBlogPosts();
  const categories = await getCategoriesWithCounts();
  const opportunities: LinkOpportunity[] = [];

  // Blog yazılarını analiz et
  console.log(`📝 ${blogPosts.length} blog yazısı analiz ediliyor...`);

  for (const post of blogPosts) {
    const content = post.content || "";
    const plainText = stripHtml(content);

    // 1. Keyword-bazlı link fırsatları
    for (const [keyword, targets] of Object.entries(ANCHOR_KEYWORDS)) {
      if (findKeywordInContent(plainText, keyword)) {
        for (const { target, type } of targets) {
          if (!hasLinkTo(content, target)) {
            opportunities.push({
              sourcePage: `/blog/${post.slug}`,
              sourceType: "blog",
              targetPage: target,
              targetType: type,
              anchorText: keyword,
              context: `"${keyword}" geçiyor ama link yok`,
              priority: type === "category" ? "high" : "medium",
            });
          }
        }
      }
    }

    // 2. Ürün adı geçen yerlerde ürün linki kontrolü
    for (const product of products) {
      const modelName = product.name.split(" ").pop() || "";
      if (modelName.length > 2 && findKeywordInContent(plainText, modelName)) {
        if (!hasLinkTo(content, `/urun/${product.slug}`)) {
          opportunities.push({
            sourcePage: `/blog/${post.slug}`,
            sourceType: "blog",
            targetPage: `/urun/${product.slug}`,
            targetType: "product",
            anchorText: product.name,
            context: `"${modelName}" ürün adı geçiyor ama ürün linki yok`,
            priority: "medium",
          });
        }
      }
    }

    // 3. Kategori linki kontrolü (her blog en az 1 kategori linki olmalı)
    const hasCategoryLink = categories.some((c) =>
      hasLinkTo(content, `/kategori/${c.slug}`)
    );
    if (!hasCategoryLink) {
      opportunities.push({
        sourcePage: `/blog/${post.slug}`,
        sourceType: "blog",
        targetPage: "/kategori/tasinabilir-guc-kaynaklari",
        targetType: "category",
        anchorText: "taşınabilir güç kaynakları",
        context: "Blog yazısında hiç kategori linki yok",
        priority: "high",
      });
    }
  }

  // Ürün açıklamalarını analiz et
  console.log(`📦 ${products.length} ürün açıklaması analiz ediliyor...`);

  for (const product of products) {
    const content = product.description || "";
    if (!content) continue;

    const plainText = stripHtml(content);

    for (const [keyword, targets] of Object.entries(ANCHOR_KEYWORDS)) {
      if (findKeywordInContent(plainText, keyword)) {
        for (const { target, type } of targets) {
          if (!hasLinkTo(content, target)) {
            opportunities.push({
              sourcePage: `/urun/${product.slug}`,
              sourceType: "product",
              targetPage: target,
              targetType: type,
              anchorText: keyword,
              context: `Ürün açıklamasında "${keyword}" geçiyor ama link yok`,
              priority: "low",
            });
          }
        }
      }
    }
  }

  // Raporlama
  const highPriority = opportunities.filter((o) => o.priority === "high");
  const mediumPriority = opportunities.filter((o) => o.priority === "medium");
  const lowPriority = opportunities.filter((o) => o.priority === "low");

  printSummary("INTERNAL LINK ANALİZİ", [
    { label: "Yüksek Öncelik", value: highPriority.length },
    { label: "Orta Öncelik", value: mediumPriority.length },
    { label: "Düşük Öncelik", value: lowPriority.length },
    { label: "Toplam Fırsat", value: opportunities.length },
  ]);

  if (highPriority.length > 0) {
    console.log("🔴 YÜKSEK ÖNCELİK:");
    for (const opp of highPriority.slice(0, 15)) {
      console.log(`   ${opp.sourcePage}`);
      console.log(`   └─ "${opp.anchorText}" → ${opp.targetPage}`);
      console.log(`      ${opp.context}\n`);
    }
  }

  saveReport("internal-links", {
    timestamp: new Date().toISOString(),
    summary: {
      high: highPriority.length,
      medium: mediumPriority.length,
      low: lowPriority.length,
    },
    opportunities,
  });

  await disconnectDb();
}

analyzeInternalLinks().catch(console.error);
