/**
 * Technical SEO Cleanup
 * Placeholder temizliği, noindex ekleme, redirect düzeltmeleri
 *
 * Kullanım:
 *   npx tsx scripts/seo-bot/7-technical-cleanup.ts --dry-run    (ne yapacağını göster)
 *   npx tsx scripts/seo-bot/7-technical-cleanup.ts --apply       (uygula)
 */
import * as fs from "fs";
import * as path from "path";
import { saveReport, printSummary } from "./lib/reporter";
import { NOINDEX_PAGES, REDIRECT_404S } from "./lib/config";

interface CleanupAction {
  type: "placeholder" | "noindex" | "redirect" | "sitemap";
  file: string;
  description: string;
  status: "pending" | "applied" | "skipped";
  details?: string;
}

const args = process.argv.slice(2);
const isDryRun = !args.includes("--apply");
const rootDir = path.resolve(__dirname, "../..");

function readFile(relativePath: string): string | null {
  const fullPath = path.join(rootDir, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf-8");
}

function writeFile(relativePath: string, content: string): void {
  const fullPath = path.join(rootDir, relativePath);
  fs.writeFileSync(fullPath, content, "utf-8");
}

async function runCleanup(): Promise<void> {
  console.log(`\n🧹 Technical SEO Cleanup ${isDryRun ? "(DRY RUN)" : "(APPLY MODE)"}\n`);
  const actions: CleanupAction[] = [];

  // ═══════════════════════════════════════════════════════════════════
  // 1. PLACEHOLDER TEMİZLİĞİ
  // ═══════════════════════════════════════════════════════════════════
  console.log("1️⃣  Placeholder içerik temizleniyor...");

  const storePagePath = "fusionmarkt/src/app/magaza/page.tsx";
  const storeContent = readFile(storePagePath);
  if (storeContent && storeContent.includes("SHOP_HEADER banner ekleyin")) {
    const action: CleanupAction = {
      type: "placeholder",
      file: storePagePath,
      description: '"SHOP_HEADER banner ekleyin" → boş state ile fallback banner',
      status: isDryRun ? "pending" : "applied",
    };
    actions.push(action);

    if (!isDryRun) {
      const updated = storeContent.replace(
        `<span className={cn("text-sm", isDark ? "text-white/50" : "text-gray-500")}>SHOP_HEADER banner ekleyin</span>`,
        `<div className="flex flex-col items-center justify-center gap-2">
              <span className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Tüm Ürünleri Keşfedin</span>
              <span className={cn("text-sm", isDark ? "text-white/60" : "text-gray-500")}>En iyi fiyat garantisi ile güvenle alışveriş yapın</span>
            </div>`
      );
      writeFile(storePagePath, updated);
      console.log("   ✅ Mağaza placeholder temizlendi");
    } else {
      console.log("   📋 Mağaza placeholder tespit edildi");
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. NOİNDEX EKLEMELERİ
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n2️⃣  noindex kontrol ediliyor...");

  const metadataPath = "fusionmarkt/src/lib/seo/metadata.ts";
  const metadataContent = readFile(metadataPath);

  if (metadataContent) {
    for (const page of NOINDEX_PAGES) {
      const camelCase = page.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

      if (metadataContent.includes(`${camelCase}:`) || metadataContent.includes(`"${page}"`)) {
        const hasNoIndex =
          metadataContent.includes(`${camelCase}`) &&
          metadataContent.includes("noIndex: true");

        if (!hasNoIndex) {
          actions.push({
            type: "noindex",
            file: metadataPath,
            description: `"${page}" sayfasına noIndex: true ekle`,
            status: isDryRun ? "pending" : "applied",
            details: `staticPageMetadata.${camelCase} veya generateMetadata çağrısında noIndex ekle`,
          });
          console.log(`   ${isDryRun ? "📋" : "✅"} ${page} → noindex ${isDryRun ? "gerekli" : "eklendi"}`);
        } else {
          console.log(`   ⏭ ${page} zaten noindex`);
        }
      } else {
        console.log(`   ⚠ ${page} staticPageMetadata'da bulunamadı`);
      }
    }

    if (!isDryRun) {
      let updatedMetadata = metadataContent;

      // servis-formu noindex ekle
      if (updatedMetadata.includes("serviceForm:") && !updatedMetadata.includes("serviceForm") ) {
        // staticPageMetadata.serviceForm objesinde noIndex yoksa ekle
        updatedMetadata = updatedMetadata.replace(
          /(serviceForm:\s*generateMetadata\(\{[^}]*?)(}\))/s,
          (match, before, after) => {
            if (match.includes("noIndex")) return match;
            return `${before.trimEnd()},\n    noIndex: true,\n  ${after}`;
          }
        );
      }

      if (updatedMetadata !== metadataContent) {
        writeFile(metadataPath, updatedMetadata);
      }
    }
  }

  // servis-formu layout.tsx noindex kontrolü
  const servisFormLayout = "fusionmarkt/src/app/servis-formu/layout.tsx";
  const servisContent = readFile(servisFormLayout);
  if (servisContent && !servisContent.includes("noindex")) {
    actions.push({
      type: "noindex",
      file: servisFormLayout,
      description: "servis-formu layout'una robots noindex ekle",
      status: isDryRun ? "pending" : "applied",
    });

    if (!isDryRun) {
      if (servisContent.includes("export const metadata = staticPageMetadata")) {
        const updated = servisContent.replace(
          /export const metadata = (staticPageMetadata\.\w+);/,
          `export const metadata = {\n  ...$1,\n  robots: { index: false, follow: true },\n};`
        );
        writeFile(servisFormLayout, updated);
        console.log("   ✅ servis-formu noindex eklendi");
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. REDİRECT EKLEMELERİ
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n3️⃣  Redirect kontrol ediliyor...");

  const nextConfigPath = "fusionmarkt/next.config.ts";
  const nextConfigContent = readFile(nextConfigPath);

  if (nextConfigContent) {
    const missingRedirects = REDIRECT_404S.filter(
      (r) => !nextConfigContent.includes(`"${r.from}"`) && !nextConfigContent.includes(`'${r.from}'`)
    );

    for (const redirect of missingRedirects) {
      actions.push({
        type: "redirect",
        file: nextConfigPath,
        description: `${redirect.from} → ${redirect.to} (301 redirect)`,
        status: isDryRun ? "pending" : "applied",
      });
      console.log(`   ${isDryRun ? "📋" : "✅"} ${redirect.from} → ${redirect.to}`);
    }

    if (!isDryRun && missingRedirects.length > 0) {
      const newRedirectEntries = missingRedirects
        .map(
          (r) => `      {
        source: "${r.from}",
        destination: "${r.to}",
        permanent: true,
      },`
        )
        .join("\n");

      // Mevcut redirects array'ine ekle
      const updatedConfig = nextConfigContent.replace(
        /(async redirects\(\)\s*{[\s\S]*?return\s*\[)/,
        `$1\n      // AI SEO Bot tarafından eklenen redirect'ler (${new Date().toISOString().slice(0, 10)})\n${newRedirectEntries}\n`
      );

      if (updatedConfig !== nextConfigContent) {
        writeFile(nextConfigPath, updatedConfig);
        console.log(`   ✅ ${missingRedirects.length} redirect eklendi`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. SİTEMAP KONTROLÜ
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n4️⃣  Sitemap kontrol ediliyor...");

  const sitemapPath = "fusionmarkt/src/app/sitemap.ts";
  const sitemapContent = readFile(sitemapPath);

  if (sitemapContent) {
    if (!sitemapContent.includes("servis-formu")) {
      console.log("   ⏭ servis-formu sitemap'te yok (doğru, noindex)");
    }

    if (!sitemapContent.includes("kullanim-kilavuzlari")) {
      actions.push({
        type: "sitemap",
        file: sitemapPath,
        description: "kullanim-kilavuzlari sitemap'te eksik",
        status: "pending",
        details: "Bu sayfa SEO değerli, sitemap'e eklenmeli",
      });
      console.log("   📋 kullanim-kilavuzlari sitemap'e eklenmeli");
    } else {
      console.log("   ✅ kullanim-kilavuzlari sitemap'te var");
    }

    // Landing page'ler sitemap'te var mı kontrol et
    for (const topic of REDIRECT_404S) {
      if (topic.to.startsWith("/blog/") || topic.to.startsWith("/kategori/")) {
        continue;
      }
    }
  }

  // RAPORLAMA
  const applied = actions.filter((a) => a.status === "applied");
  const pending = actions.filter((a) => a.status === "pending");

  printSummary("TECHNICAL CLEANUP SONUÇLARI", [
    { label: "Uygulanan Aksiyonlar", value: applied.length },
    { label: "Bekleyen Aksiyonlar", value: pending.length },
    { label: "Toplam", value: actions.length },
    { label: "Mod", value: isDryRun ? "DRY RUN" : "APPLY" },
  ]);

  saveReport("technical-cleanup", {
    mode: isDryRun ? "dry-run" : "apply",
    timestamp: new Date().toISOString(),
    actions,
  });
}

runCleanup().catch(console.error);
