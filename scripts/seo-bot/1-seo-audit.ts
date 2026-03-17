/**
 * SEO Audit Script
 * CSV crawl data + DB verilerini analiz eder, sorunları tespit eder
 *
 * Kullanım: npx tsx scripts/seo-bot/1-seo-audit.ts
 */
import * as fs from "fs";
import * as path from "path";
import { getProductsWithSpecs, getBlogPosts, getCategoriesWithCounts, disconnectDb } from "./lib/db-reader";
import { saveReport, printSummary } from "./lib/reporter";
import { SEO_RULES, NOINDEX_PAGES } from "./lib/config";

interface SEOIssue {
  type: "critical" | "warning" | "info";
  category: string;
  page: string;
  issue: string;
  recommendation: string;
}

function parseCsv(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].match(/(?:"[^"]*"|[^,])+/g)?.map((h) => h.replace(/"/g, "").trim()) || [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(?:"[^"]*"|[^,])+/g)?.map((v) => v.replace(/"/g, "").trim()) || [];
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

async function runAudit() {
  console.log("🔍 FusionMarkt SEO Audit başlıyor...\n");
  const issues: SEOIssue[] = [];

  // 1. CSV Analizi - 404'ler
  console.log("📊 CSV crawl data analiz ediliyor...");
  const rootDir = path.resolve(__dirname, "../..");
  const responseCodes = parseCsv(path.join(rootDir, "response_codes_all.csv"));
  const pageTitles = parseCsv(path.join(rootDir, "page_titles_all.csv"));

  const notFoundUrls = responseCodes.filter(
    (r) => r["Status Code"] === "404" && r["Content Type"]?.includes("text/html")
  );

  for (const row of notFoundUrls) {
    const url = row["Address"] || "";
    if (url.includes("fusionmarkt.com")) {
      issues.push({
        type: "critical",
        category: "404 Hatası",
        page: url,
        issue: `Sayfa 404 dönüyor (${row["Inlinks"] || 0} iç link var)`,
        recommendation: "Redirect ekleyin veya sayfayı oluşturun",
      });
    }
  }

  // 2. Placeholder/Hatalı İçerik Tespiti
  console.log("🔎 Placeholder içerik taranıyor...");
  const storePage = path.resolve(rootDir, "fusionmarkt/src/app/magaza/page.tsx");
  if (fs.existsSync(storePage)) {
    const storeContent = fs.readFileSync(storePage, "utf-8");
    if (storeContent.includes("SHOP_HEADER banner ekleyin")) {
      issues.push({
        type: "critical",
        category: "Placeholder İçerik",
        page: "/magaza",
        issue: '"SHOP_HEADER banner ekleyin" placeholder metni canlıda görünüyor',
        recommendation: 'Placeholder\'ı anlamlı fallback ile değiştirin (ör: "Tüm Ürünleri Keşfedin")',
      });
    }
  }

  // 3. "Kategori Bulunamadı" Sayfaları
  for (const row of pageTitles) {
    const title = row["Title 1"] || "";
    if (title.includes("Kategori Bulunamadı") && row["Indexability"] === "Indexable") {
      issues.push({
        type: "critical",
        category: "Boş Kategori Sayfası",
        page: row["Address"] || "",
        issue: `"Kategori Bulunamadı" başlığı ile indeksleniyor`,
        recommendation: "noindex ekleyin veya doğru kategoriye redirect yapın",
      });
    }
  }

  // 4. noindex Olması Gereken Sayfalar
  console.log("🔒 noindex kontrol ediliyor...");
  for (const row of pageTitles) {
    const url = row["Address"] || "";
    const indexability = row["Indexability"] || "";
    for (const noindexSlug of NOINDEX_PAGES) {
      if (url.includes(noindexSlug) && indexability === "Indexable") {
        issues.push({
          type: "warning",
          category: "İndeks Kontrolü",
          page: url,
          issue: `"${noindexSlug}" sayfası indexable durumda`,
          recommendation: "noindex meta etiketi ekleyin",
        });
      }
    }
  }

  // 5. DB - Ürün Meta Analizi
  console.log("🗄️  Veritabanı ürün meta verileri kontrol ediliyor...");
  try {
    const products = await getProductsWithSpecs();

    for (const product of products) {
      if (!product.metaTitle || product.metaTitle.length < SEO_RULES.metaTitle.min) {
        issues.push({
          type: "warning",
          category: "Eksik Meta Title",
          page: `/urun/${product.slug}`,
          issue: `Meta title ${product.metaTitle ? `çok kısa (${product.metaTitle.length} karakter)` : "boş"}`,
          recommendation: `${SEO_RULES.metaTitle.min}-${SEO_RULES.metaTitle.max} karakter arası meta title ekleyin`,
        });
      }

      if (!product.metaDescription || product.metaDescription.length < SEO_RULES.metaDescription.min) {
        issues.push({
          type: "warning",
          category: "Eksik Meta Description",
          page: `/urun/${product.slug}`,
          issue: `Meta description ${product.metaDescription ? `çok kısa (${product.metaDescription.length} karakter)` : "boş"}`,
          recommendation: `${SEO_RULES.metaDescription.min}-${SEO_RULES.metaDescription.max} karakter arası description ekleyin`,
        });
      }

      if (!product.metaKeywords || product.metaKeywords.length < SEO_RULES.metaKeywords.min) {
        issues.push({
          type: "info",
          category: "Eksik Keywords",
          page: `/urun/${product.slug}`,
          issue: `Meta keywords ${product.metaKeywords?.length || 0} adet (min ${SEO_RULES.metaKeywords.min})`,
          recommendation: "Hedef keyword'leri ekleyin",
        });
      }

      if (!product.description || product.description.split(/\s+/).length < SEO_RULES.descriptionMinWords) {
        issues.push({
          type: "warning",
          category: "Zayıf Ürün Açıklaması",
          page: `/urun/${product.slug}`,
          issue: `Ürün açıklaması ${product.description ? "çok kısa" : "boş"} (min ${SEO_RULES.descriptionMinWords} kelime)`,
          recommendation: "AI ile zengin ürün açıklaması üretin (product-seo.ts)",
        });
      }

      if (product.slug.length > 100) {
        issues.push({
          type: "info",
          category: "Uzun URL",
          page: `/urun/${product.slug}`,
          issue: `URL çok uzun (${product.slug.length} karakter)`,
          recommendation: "Daha kısa, model odaklı URL kullanın",
        });
      }
    }

    // 6. Blog Meta Analizi
    console.log("📝 Blog meta verileri kontrol ediliyor...");
    const posts = await getBlogPosts();

    for (const post of posts) {
      if (!post.metaTitle) {
        issues.push({
          type: "info",
          category: "Blog Eksik Meta",
          page: `/blog/${post.slug}`,
          issue: "Blog yazısının meta title'ı boş",
          recommendation: "SEO-optimized meta title ekleyin",
        });
      }
      if (!post.metaDescription) {
        issues.push({
          type: "info",
          category: "Blog Eksik Meta",
          page: `/blog/${post.slug}`,
          issue: "Blog yazısının meta description'ı boş",
          recommendation: "155 karakterlik meta description ekleyin",
        });
      }
    }

    // 7. Kategori Analizi
    console.log("📂 Kategori sayfa verileri kontrol ediliyor...");
    const categories = await getCategoriesWithCounts();

    for (const cat of categories) {
      if (cat.productCount === 0) {
        issues.push({
          type: "warning",
          category: "Boş Kategori",
          page: `/kategori/${cat.slug}`,
          issue: "Kategoride hiç ürün yok",
          recommendation: "Ürün ekleyin veya kategoriyi gizleyin/noindex yapın",
        });
      }
    }
  } catch (error) {
    console.warn("⚠ DB bağlantı hatası (CSV analizi yine de raporda):", (error as Error).message);
  }

  // Raporlama
  const critical = issues.filter((i) => i.type === "critical");
  const warnings = issues.filter((i) => i.type === "warning");
  const infos = issues.filter((i) => i.type === "info");

  printSummary("SEO AUDIT SONUÇLARI", [
    { label: "Kritik Sorunlar", value: critical.length },
    { label: "Uyarılar", value: warnings.length },
    { label: "Bilgi", value: infos.length },
    { label: "Toplam Sorun", value: issues.length },
  ]);

  if (critical.length > 0) {
    console.log("🔴 KRİTİK SORUNLAR:");
    for (const issue of critical) {
      console.log(`   ${issue.page}`);
      console.log(`   └─ ${issue.issue}`);
      console.log(`      → ${issue.recommendation}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log("🟡 UYARILAR:");
    for (const issue of warnings.slice(0, 10)) {
      console.log(`   ${issue.page}: ${issue.issue}`);
    }
    if (warnings.length > 10) {
      console.log(`   ... ve ${warnings.length - 10} uyarı daha (rapor dosyasında)`);
    }
  }

  saveReport("seo-audit", {
    timestamp: new Date().toISOString(),
    summary: { critical: critical.length, warnings: warnings.length, info: infos.length },
    issues,
  });

  await disconnectDb();
}

runAudit().catch(console.error);
