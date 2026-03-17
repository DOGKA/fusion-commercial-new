/**
 * Product SEO Generator
 * AI ile ürün meta title/description/keywords + zengin HTML description üretir
 * Datasheet PDF + DB teknik spec verilerini kullanır
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/2-product-seo.ts --dry-run    (önizleme)
 *   npx tsx scripts/seo-bot/2-product-seo.ts --apply       (DB'ye yaz)
 *   npx tsx scripts/seo-bot/2-product-seo.ts --slug p800   (tek ürün)
 */
import { getProductsWithSpecs, getProductBySlugKeyword, disconnectDb, getDb } from "./lib/db-reader";
import { getDatasheetContent } from "./lib/datasheet-parser";
import { generateJSON, generateContent } from "./lib/ai-client";
import { saveReport, saveBackup, printSummary } from "./lib/reporter";
import { SEO_RULES } from "./lib/config";

interface ProductSEOResult {
  productId: string;
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  shortDescription: string;
  description: string;
}

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");
const targetSlug = args.find((a, i) => args[i - 1] === "--slug") || null;

async function generateProductSEO(): Promise<void> {
  console.log(`\n🚀 Product SEO Generator ${isDryRun ? "(DRY RUN)" : "(APPLY MODE)"}\n`);

  let products;
  if (targetSlug) {
    const product = await getProductBySlugKeyword(targetSlug);
    products = product ? [product] : [];
    if (products.length === 0) {
      console.log(`❌ "${targetSlug}" slug'ı ile eşleşen ürün bulunamadı`);
      return;
    }
  } else {
    products = await getProductsWithSpecs();
  }

  console.log(`📦 ${products.length} ürün işlenecek\n`);

  if (!isDryRun) {
    const backupData = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      metaKeywords: p.metaKeywords,
      shortDescription: p.shortDescription,
      descriptionLength: p.description?.length || 0,
    }));
    saveBackup("product-seo", backupData);
  }

  const results: ProductSEOResult[] = [];

  for (const product of products) {
    console.log(`\n━━━ ${product.name} (${product.slug.slice(0, 40)}...) ━━━`);

    const slugParts = product.slug.split("-");
    const modelKeyword = slugParts.find((p) =>
      /^(p\d+|sh\d+|se\d+|sp\d+|singo\d+|tg\d+)/i.test(p)
    ) || product.slug.split("-").pop() || "";

    const datasheet = await getDatasheetContent(modelKeyword.toLowerCase());

    const specsText = product.technicalSpecs
      .map((s) => `${s.label}: ${s.value}`)
      .join("\n");

    const featuresText = product.keyFeatures
      .map((f) => f.title)
      .join(", ");

    // 1. Meta title + description + keywords
    console.log("  📝 Meta veriler üretiliyor...");
    const metaResult = await generateJSON<{
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      shortDescription: string;
    }>({
      prompt: `Aşağıdaki ürün için SEO-optimized meta veriler üret:

ÜRÜN: ${product.name}
KATEGORİ: ${product.category.name}
MARKA: ${product.brand || "IEETek"}
FİYAT: ${product.price} TL
TEKNİK ÖZELLİKLER:
${specsText || "Bilgi yok"}

ÖNE ÇIKAN ÖZELLİKLER: ${featuresText || "Bilgi yok"}

DATASHEET İÇERİĞİ:
${datasheet?.text?.slice(0, 2000) || "Datasheet mevcut değil"}

KURALLAR:
- metaTitle: ${SEO_RULES.metaTitle.min}-${SEO_RULES.metaTitle.max} karakter. Model adı + ana özellik + ticari keyword.
  Örnek: "IEETek P800 - 512Wh LiFePO4 Taşınabilir Güç Kaynağı"
- metaDescription: ${SEO_RULES.metaDescription.min}-${SEO_RULES.metaDescription.max} karakter. Özellik + fayda + CTA.
- metaKeywords: ${SEO_RULES.metaKeywords.min}-${SEO_RULES.metaKeywords.max} adet hedef keyword array.
- shortDescription: 1-2 cümle, ürünün ana değer önerisi.

JSON formatında döndür: { "metaTitle": "...", "metaDescription": "...", "metaKeywords": ["..."], "shortDescription": "..." }`,
      maxTokens: 1000,
      temperature: 0.5,
    });

    // 2. Zengin HTML description
    console.log("  📄 Zengin açıklama üretiliyor...");
    const description = await generateContent({
      prompt: `Aşağıdaki ürün için zengin, SEO-optimized HTML ürün açıklaması üret:

ÜRÜN: ${product.name}
KATEGORİ: ${product.category.name}
MARKA: ${product.brand || "IEETek"}
TEKNİK ÖZELLİKLER:
${specsText || "Bilgi yok"}

DATASHEET İÇERİĞİ:
${datasheet?.text?.slice(0, 3000) || "Datasheet mevcut değil"}

AÇIKLAMA YAPISI (her biri h2 başlığı ile):
1. Ürün Genel Bakış (2-3 paragraf, ana özellikleri ve değer önerisini anlat)
2. Hangi Cihazları Kaç Saat Çalıştırır? (tablo: cihaz, güç, tahmini süre)
3. Kimler İçin Uygun? (kullanım senaryoları: kamp, karavan, ev, profesyonel, vb.)
4. Uyumlu Güneş Panelleri (SP100, SP200, SP400 ile uyumluluk, şarj süreleri)
5. Sıkça Sorulan Sorular (3-5 SSS, Schema.org FAQ uyumlu)
6. Teknik Özellikler Özeti (önemli specs'leri vurgula)

KURALLAR:
- Saf HTML kullan (h2, h3, p, ul, li, strong, table, tr, th, td).
- Minimum 400 kelime, maksimum 800 kelime.
- Doğal keyword yerleştirmesi yap.
- Gerçek teknik verileri kullan, uydurmadan.
- İç link placeholder'ları ekle: [LINK:/kategori/tasinabilir-guc-kaynaklari] formatında.`,
      maxTokens: 4000,
      temperature: 0.6,
    });

    const result: ProductSEOResult = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      metaTitle: metaResult.metaTitle,
      metaDescription: metaResult.metaDescription,
      metaKeywords: metaResult.metaKeywords,
      shortDescription: metaResult.shortDescription,
      description,
    };

    results.push(result);

    console.log(`  ✅ Meta Title: ${result.metaTitle}`);
    console.log(`  ✅ Meta Desc: ${result.metaDescription.slice(0, 80)}...`);
    console.log(`  ✅ Keywords: ${result.metaKeywords.join(", ")}`);
    console.log(`  ✅ Description: ${result.description.length} karakter`);

    if (!isDryRun) {
      console.log("  💾 DB'ye yazılıyor...");
      const db = getDb();
      const updateData: Record<string, unknown> = {
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        metaKeywords: result.metaKeywords,
        shortDescription: result.shortDescription,
      };
      // description sadece mevcut yoksa veya --force-desc varsa yazilir
      if (!product.description || product.description.length < 100 || args.includes("--force-desc")) {
        updateData.description = result.description;
      } else {
        console.log("  ⚠ Mevcut description korundu (--force-desc ile zorlanabilir)");
      }
      await db.product.update({
        where: { id: product.id },
        data: updateData,
      });
      console.log("  ✅ DB güncellendi");
    }
  }

  printSummary("PRODUCT SEO SONUÇLARI", [
    { label: "İşlenen Ürün", value: results.length },
    { label: "Mod", value: isDryRun ? "DRY RUN (DB'ye yazılmadı)" : "APPLY (DB güncellendi)" },
  ]);

  saveReport("product-seo", {
    mode: isDryRun ? "dry-run" : "apply",
    timestamp: new Date().toISOString(),
    results,
  });

  await disconnectDb();
}

generateProductSEO().catch(console.error);
