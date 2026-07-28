/**
 * SP400'ün uyumsuz olduğu güç kaynaklarıyla birlikte anıldığı blog pasajlarını
 * bulur. Yalnızca okur, hiçbir şey yazmaz.
 *
 * Gerekçe: SP400'ün açık devre voltajı (Voc) 52.8V. Aşağıdaki cihazların MPPT
 * giriş tavanı bunun altında kaldığı için panel doğrudan bağlandığında cihaz
 * aşırı voltaj korumasına geçer:
 *
 *   P1800          10–52V   → 52.8V tavanın üstünde
 *   Singo 2000 Pro 10–50V   → 52.8V tavanın üstünde
 *   SH4000 LV       12–50V   → 52.8V tavanın üstünde (HV girişi 70–450V, seri bağlantıyla uyumlu)
 *
 * Voc soğukta yükseldiği için (~-0,3%/°C) 0°C'de ~56V'a çıkar; aradaki fark
 * tolerans değil, kesin uyumsuzluktur.
 *
 * Kullanım (repo kökünden):
 *   npx tsx scripts/audit-sp400-compatibility.ts
 *
 * Rapor konsola basılır ve scripts/.sp400-audit.json dosyasına yazılır.
 */

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

/** Prisma Client .env okumaz; istemciyi kurmadan önce yükleniyor. */
function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;

  const candidates = [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ].map((relative) => join(REPO_ROOT, relative));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }

  console.error(
    "DATABASE_URL bulunamadı. Aranan dosyalar:\n" +
      candidates.map((path) => `  ${path}`).join("\n")
  );
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

/** SP400 ile aynı cümlede geçtiğinde hatalı eşleştirme sayılan cihazlar. */
const INCOMPATIBLE = [
  { label: "P1800", pattern: /P\s?1800/i },
  { label: "Singo 2000", pattern: /Singo\s?2000/i },
  { label: "SH4000 (LV)", pattern: /SH\s?4000/i },
];

const SP400 = /SP\s?400/i;

/**
 * HTML'i blok blok ayırır. Böylece rapor "hangi paragrafta / hangi tablo
 * satırında" sorusunu cevaplar, tüm gövdeyi basmaz.
 */
function splitBlocks(html: string): string[] {
  return html
    .split(/(?=<(?:p|h2|h3|h4|li|tr|blockquote|td)\b)/i)
    .map((block) => block.trim())
    .filter(Boolean);
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Finding = {
  slug: string;
  title: string;
  status: string;
  devices: string[];
  blockHtml: string;
  blockText: string;
};

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { slug: true, title: true, status: true, content: true },
    orderBy: { slug: "asc" },
  });

  const findings: Finding[] = [];
  const sp400Posts = new Set<string>();

  for (const post of posts) {
    if (!SP400.test(post.content)) continue;
    sp400Posts.add(post.slug);

    for (const block of splitBlocks(post.content)) {
      if (!SP400.test(block)) continue;

      const devices = INCOMPATIBLE.filter((device) =>
        device.pattern.test(block)
      ).map((device) => device.label);

      if (devices.length === 0) continue;

      findings.push({
        slug: post.slug,
        title: post.title,
        status: post.status,
        devices,
        blockHtml: block,
        blockText: stripTags(block),
      });
    }
  }

  console.log(`Toplam yazı: ${posts.length}`);
  console.log(`SP400 geçen yazı: ${sp400Posts.size}`);
  console.log(`Şüpheli pasaj: ${findings.length}\n`);

  let currentSlug = "";
  for (const finding of findings) {
    if (finding.slug !== currentSlug) {
      currentSlug = finding.slug;
      console.log(`\n${"─".repeat(78)}`);
      console.log(`${finding.title}`);
      console.log(`  /blog/${finding.slug}  [${finding.status}]`);
      console.log("─".repeat(78));
    }
    console.log(`\n  ⚠ ${finding.devices.join(", ")}`);
    console.log(`  ${finding.blockText}`);
  }

  const reportPath = join(SCRIPT_DIR, ".sp400-audit.json");
  writeFileSync(reportPath, JSON.stringify(findings, null, 2));
  console.log(`\n\nAyrıntılı rapor (HTML dahil): ${reportPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
