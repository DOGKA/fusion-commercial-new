/**
 * Blog Content Generator
 * Karşılaştırma ve karar içerikleri üretir (seed-blogs pattern)
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/5-blog-generator.ts --dry-run     (önizleme)
 *   npx tsx scripts/seo-bot/5-blog-generator.ts --apply        (DB'ye yaz)
 *   npx tsx scripts/seo-bot/5-blog-generator.ts --topic ecoflow (tek konu)
 */
import { getProductsWithSpecs, getProductBySlugKeyword, disconnectDb, getDb } from "./lib/db-reader";
import { getDatasheetContent } from "./lib/datasheet-parser";
import { generateContent, generateJSON } from "./lib/ai-client";
import { saveReport, printSummary } from "./lib/reporter";
import { BLOG_TOPICS } from "./lib/config";
import * as fs from "fs";
import * as path from "path";

interface BlogResult {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  content: string;
  publishedAt: string;
}

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");
const topicFilter = args.find((a, i) => args[i - 1] === "--topic") || null;

async function generateBlogs(): Promise<void> {
  console.log(`\n🚀 Blog Content Generator ${isDryRun ? "(DRY RUN)" : "(APPLY MODE)"}\n`);

  const allProducts = await getProductsWithSpecs();
  const topics = topicFilter
    ? BLOG_TOPICS.filter((t) => t.slug.includes(topicFilter))
    : BLOG_TOPICS;

  console.log(`📝 ${topics.length} blog yazısı üretilecek\n`);
  const results: BlogResult[] = [];

  for (const topic of topics) {
    console.log(`\n━━━ ${topic.title} ━━━`);

    // İlgili ürün verilerini topla
    const relatedProducts = [];
    for (const productSlug of topic.products) {
      const product = await getProductBySlugKeyword(productSlug);
      if (product) {
        const datasheet = await getDatasheetContent(productSlug);
        relatedProducts.push({ product, datasheet });
      }
    }

    const productsInfo = relatedProducts
      .map(({ product, datasheet }) => {
        const specs = product.technicalSpecs
          .map((s) => `  ${s.label}: ${s.value}`)
          .join("\n");
        return `ÜRÜN: ${product.name} (${product.price} TL)
Kategori: ${product.category.name}
Teknik Özellikler:
${specs}
Datasheet bilgi: ${datasheet?.text?.slice(0, 500) || "Mevcut değil"}`;
      })
      .join("\n\n---\n\n");

    // 1. Meta veriler
    console.log("  📝 Meta veriler üretiliyor...");
    const meta = await generateJSON<{
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      excerpt: string;
      tags: string[];
    }>({
      prompt: `"${topic.title}" başlıklı blog yazısı için meta veriler üret.
TÜR: ${topic.type === "comparison" ? "Karşılaştırma" : "Rehber"}
İLGİLİ ÜRÜNLER: ${relatedProducts.map(({ product }) => product.name).join(", ")}

JSON formatında döndür:
{
  "metaTitle": "60-70 karakter, blog başlığı SEO versiyonu",
  "metaDescription": "150-160 karakter, merak uyandıran + bilgilendirici",
  "metaKeywords": ["5-8 keyword"],
  "excerpt": "1-2 cümle özet",
  "tags": ["3-5 etiket"]
}`,
      maxTokens: 800,
      temperature: 0.5,
    });

    // 2. Blog içeriği
    console.log("  📄 Blog içeriği üretiliyor...");
    const contentPrompt = topic.type === "comparison"
      ? `"${topic.title}" başlıklı KARŞILAŞTIRMA blog yazısı yaz.

ÜRÜN VERİLERİ:
${productsInfo}

YAPI:
1. Giriş - Neden bu karşılaştırma önemli (1-2 paragraf)
2. Temel Özellik Karşılaştırması - Detaylı HTML tablo (kapasite, güç, ağırlık, fiyat, özellikler)
3. Performans Karşılaştırması - Gerçek kullanım senaryolarında hangisi daha iyi
4. Kullanım Senaryosuna Göre Öneri - "Kamp için X, karavan için Y, ev için Z"
5. Fiyat-Performans Analizi - Hangi model en iyi değeri sunuyor
6. Sonuç ve Öneri - Net bir tavsiye

KURALLAR:
- HTML formatı (h2, h3, p, ul, li, strong, table, tr, th, td).
- 1500-2500 kelime.
- Gerçek teknik veriler kullan, uydurmadan.
- Tarafsız ol ama FusionMarkt ürünlerini öner.
- İç link placeholder: [LINK:/urun/slug], [LINK:/kategori/slug], [LINK:/guc-hesaplayici]
- Veri odaklı, karşılaştırmalı tablolar kullan.`
      : `"${topic.title}" başlıklı REHBER blog yazısı yaz.

ÜRÜN VERİLERİ:
${productsInfo}

YAPI:
1. Giriş - Problem tanımı ve çözüm yaklaşımı (2-3 paragraf)
2. Detaylı Analiz - Teknik açıklama, hesaplamalar, veri tabloları
3. Ürün Önerileri - Hangi model hangi duruma uygun
4. Pratik İpuçları - 5-7 maddelik kullanım tavsiyeleri
5. Sıkça Sorulan Sorular - 3-4 SSS
6. Sonuç - Özet ve aksiyon çağrısı

KURALLAR:
- HTML formatı (h2, h3, p, ul, li, strong, table, tr, th, td).
- 1500-2500 kelime.
- Gerçek teknik veriler kullan.
- Referans niteliğinde derin içerik (lightweight ticari destek değil).
- İç link placeholder: [LINK:/urun/slug], [LINK:/kategori/slug]
- Veri içeren, karşılaştırmalı, gerçekten referans niteliğinde olsun.`;

    const content = await generateContent({
      prompt: contentPrompt,
      maxTokens: 4000,
      temperature: 0.65,
    });

    const result: BlogResult = {
      slug: topic.slug,
      title: topic.title,
      excerpt: meta.excerpt,
      category: "Enerji",
      tags: meta.tags,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      metaKeywords: meta.metaKeywords,
      content,
      publishedAt: new Date().toISOString().slice(0, 10),
    };

    results.push(result);
    console.log(`  ✅ Tamamlandı (${content.length} karakter)`);

    if (!isDryRun) {
      console.log("  💾 DB'ye yazılıyor...");
      const db = getDb();

      const existing = await db.blogPost.findUnique({
        where: { slug: topic.slug },
      });

      if (existing) {
        console.log(`  ⚠ "${topic.slug}" zaten var, atlanıyor`);
      } else {
        await db.blogPost.create({
          data: {
            slug: result.slug,
            title: result.title,
            content: result.content,
            excerpt: result.excerpt,
            category: result.category,
            tags: result.tags,
            metaTitle: result.metaTitle,
            metaDescription: result.metaDescription,
            metaKeywords: result.metaKeywords,
            status: "DRAFT",
            authorName: "FusionMarkt",
            publishedAt: new Date(result.publishedAt),
          },
        });
        console.log("  ✅ Blog oluşturuldu (DRAFT olarak)");
      }
    }
  }

  // Seed script formatında da çıktı oluştur
  if (!isDryRun && results.length > 0) {
    const seedScriptPath = path.resolve(
      __dirname,
      "..",
      `seed-blogs-ai.ts`
    );
    const seedContent = `/**
 * AI-Generated Blog Posts
 * Oluşturma tarihi: ${new Date().toISOString()}
 * Kullanım: npx tsx scripts/seed-blogs-ai.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogs = ${JSON.stringify(
      results.map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        category: r.category,
        tags: r.tags,
        metaTitle: r.metaTitle,
        metaDescription: r.metaDescription,
        metaKeywords: r.metaKeywords,
        publishedAt: r.publishedAt,
        content: r.content,
      })),
      null,
      2
    )};

async function seedBlogs() {
  for (const blog of blogs) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: blog.slug } });
    if (existing) {
      console.log(\`⏭ "\${blog.slug}" zaten var, atlanıyor\`);
      continue;
    }
    await prisma.blogPost.create({
      data: { ...blog, status: "DRAFT", authorName: "FusionMarkt", publishedAt: new Date(blog.publishedAt) },
    });
    console.log(\`✅ "\${blog.title}" oluşturuldu\`);
  }
  await prisma.$disconnect();
}

seedBlogs().catch(console.error);
`;
    fs.writeFileSync(seedScriptPath, seedContent, "utf-8");
    console.log(`\n💾 Seed script oluşturuldu: ${seedScriptPath}`);
  }

  printSummary("BLOG GENERATOR SONUÇLARI", [
    { label: "Üretilen Blog", value: results.length },
    { label: "Mod", value: isDryRun ? "DRY RUN" : "APPLY" },
  ]);

  saveReport("blog-generator", {
    mode: isDryRun ? "dry-run" : "apply",
    timestamp: new Date().toISOString(),
    results,
  });

  await disconnectDb();
}

generateBlogs().catch(console.error);
