/**
 * Seri/paralel rehberine sonradan eklenen "P1800 + 1× SP400" örneğini kaldırır.
 *
 * ── Gerekçe ────────────────────────────────────────────────────────────────
 * Örnek, fix-sp200-voc.ts içindeki `hesap-sp400-eklendi` kuralıyla eklenmişti.
 * Editoryal karar: yazılarda hangi kombinasyonun çalışmadığını saymak yerine
 * yalnızca çalışan kombinasyonlar anlatılacak. Bu blok, çalışmayan tek bir
 * eşleşmeyi öne çıkardığı için kaldırılıyor.
 *
 * Kaldırma, ekleme kuralının birebir tersidir: araya sokulan blok çıkarılır,
 * bir sonraki örnek başlığı yerinde bırakılır.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/remove-sp400-example.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/remove-sp400-example.ts --apply    # yazar
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

const SLUGS = ["solar-panel-seri-paralel-baglanti-rehberi"];
const SEED_FILES = ["scripts/seed-blogs-v4.ts"];

interface Rule {
  id: string;
  why: string;
  find: string;
  replace: string;
}

const RULES: Rule[] = [
  {
    id: "sp400-ornegi-kaldirildi",
    why: "Çalışmayan kombinasyon örneği kaldırıldı; yazı yalnızca çalışan kurulumları anlatacak.",
    find: `<p><strong>P1800 + 1× SP400:</strong></p>
<ul>
<li>VOC: 52.8V (tek panel; seri/paralel farketmez) → P1800 limiti 52V → <strong>YAPMAYIN.</strong> Tek panelde bile limit aşılıyor. SP400 yalnızca P3200 (80V limit) ya da SH4000'in HV MC4 girişiyle (en az 2 panel seri) kullanılır.</li>
</ul>

<p><strong>P3200 + 2× SP200 Seri:</strong></p>`,
    replace: `<p><strong>P3200 + 2× SP200 Seri:</strong></p>`,
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
    const backupPath = join(SCRIPT_DIR, ".sp400-example-backup.json");
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
