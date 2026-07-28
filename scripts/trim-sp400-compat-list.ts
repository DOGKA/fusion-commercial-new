/**
 * Panel seçimi yazısındaki uyumluluk listesinden SP400'ün bağlanamadığı
 * cihazlara dair cümleleri çıkarır.
 *
 * ── Gerekçe ────────────────────────────────────────────────────────────────
 * Editoryal karar: liste hangi panelin çalıştığını söylesin, çalışmayanı
 * saymasın. P800 ve P1800 maddelerinde SP400 cümlesi kaldırılıyor; geriye
 * "SP100 ✅, SP200 ✅" kalıyor.
 *
 * P3200 ve SH4000 maddelerine DOKUNULMUYOR: oralarda SP400 çalışan bir
 * seçenek ve cümleler nasıl bağlanacağını anlatıyor (P3200'de paralel,
 * SH4000'de HV girişine seri). Bunlar "uyumsuzluk uyarısı" değil, uyumlu
 * kurulumun kullanım talimatı.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/trim-sp400-compat-list.ts            # rapor
 *   npx tsx scripts/trim-sp400-compat-list.ts --apply    # yazar
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;
  for (const rel of [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ]) {
    const candidate = join(REPO_ROOT, rel);
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }
  console.error("DATABASE_URL bulunamadı.");
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

const SLUGS = ["tasinabilir-gunes-paneli-secimi-100w-200w-400w"];
const SEED_FILES = ["packages/db/prisma/seed-blog-02.ts"];

interface Rule {
  id: string;
  why: string;
  find: string;
  replace: string;
}

const RULES: Rule[] = [
  {
    id: "p800-sp400-cumlesi",
    why: "P800 maddesinden SP400 cümlesi çıkarıldı; uyumlu paneller kaldı.",
    find: `<li><strong>P800 (DC giriş 12–60V, max 10A / 300W):</strong> SP100 ✅, SP200 ✅. <strong>SP400 önerilmez</strong> — 52.8V açık devre voltajı aralığa girer, ancak P800'ün solar tavanı 300W olduğu için panelin 400W'ı kullanılamaz.</li>`,
    replace: `<li><strong>P800 (DC giriş 12–60V, max 10A / 300W):</strong> SP100 ✅, SP200 ✅.</li>`,
  },
  {
    id: "p1800-sp400-cumlesi",
    why: "P1800 maddesinden SP400 cümlesi çıkarıldı; uyumlu paneller kaldı.",
    find: `<li><strong>P1800 (DC giriş 10–52V, max 11A / 500W):</strong> SP100 ✅, SP200 ✅. <strong>SP400 bağlanmaz</strong> — açık devre voltajı 52.8V, cihazın 52V tavanının üzerinde. Voc soğuk havada yükseldiği için aradaki fark tolerans payı değildir.</li>`,
    replace: `<li><strong>P1800 (DC giriş 10–52V, max 11A / 500W):</strong> SP100 ✅, SP200 ✅.</li>`,
  },
];

function applyRules(input: string): { text: string; applied: string[] } {
  let result = input;
  const applied: string[] = [];
  for (const rule of RULES) {
    if (!result.includes(rule.find)) continue;
    result = result.split(rule.find).join(rule.replace);
    applied.push(rule.id);
  }
  return { text: result, applied };
}

function printApplied(applied: string[]) {
  for (const id of applied) {
    const rule = RULES.find((r) => r.id === id)!;
    console.log(`  • ${id}`);
    console.log(`    ${rule.why}`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — değişiklikler yazılacak\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  console.log("═".repeat(78));
  console.log("VERİTABANI");
  console.log("═".repeat(78));

  const posts = await prisma.blogPost.findMany({
    where: { slug: { in: SLUGS } },
    select: { id: true, slug: true, title: true, content: true },
  });

  const pending: { id: string; slug: string; content: string }[] = [];
  const matchedAnywhere = new Set<string>();

  for (const post of posts) {
    const { text, applied } = applyRules(post.content);
    if (applied.length === 0) continue;
    applied.forEach((id) => matchedAnywhere.add(id));
    console.log(`\n${post.title}`);
    console.log(`/blog/${post.slug}`);
    printApplied(applied);
    pending.push({ id: post.id, slug: post.slug, content: text });
  }

  console.log(`\n${"═".repeat(78)}`);
  console.log("SEED DOSYALARI");
  console.log("═".repeat(78));

  const fileWrites: { path: string; text: string }[] = [];
  for (const relativePath of SEED_FILES) {
    const fullPath = join(REPO_ROOT, relativePath);
    if (!existsSync(fullPath)) continue;
    const { text, applied } = applyRules(readFileSync(fullPath, "utf8"));
    if (applied.length === 0) continue;
    applied.forEach((id) => matchedAnywhere.add(id));
    console.log(`\n${relativePath}`);
    printApplied(applied);
    fileWrites.push({ path: fullPath, text });
  }

  const unmatched = RULES.filter((rule) => !matchedAnywhere.has(rule.id));
  if (unmatched.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("UYARI — hiçbir yerde eşleşmeyen kurallar");
    console.log("═".repeat(78));
    for (const rule of unmatched) console.log(`  ${rule.id}`);
  }

  if (!apply) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("Deneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  if (pending.length) {
    const backupPath = join(SCRIPT_DIR, ".sp400-compat-list-backup.json");
    writeFileSync(
      backupPath,
      JSON.stringify(
        posts.map((post) => ({ slug: post.slug, content: post.content })),
        null,
        2
      )
    );
    console.log(`\nYedek: ${relative(REPO_ROOT, backupPath)}`);

    for (const entry of pending) {
      await prisma.blogPost.update({
        where: { id: entry.id },
        data: { content: entry.content },
      });
      console.log(`  güncellendi: /blog/${entry.slug}`);
    }
  }

  for (const file of fileWrites) {
    writeFileSync(file.path, file.text);
    console.log(`  yazıldı: ${relative(REPO_ROOT, file.path)}`);
  }

  console.log("\nTamamlandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
