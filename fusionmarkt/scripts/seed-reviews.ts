/**
 * Yorum Seed Script'i
 *
 * seed-reviews-data.ts içindeki yorumları veritabanına ekler.
 * Her yorum için gerçekçi bir müşteri kaydı (isim + e-posta, şifresiz)
 * oluşturur; yorumlar onaylı ve "doğrulanmış alışveriş" olarak eklenir.
 * Tarihler geçmişe yayılır, üyelik tarihi yorumdan öncedir.
 *
 * Çalıştırma (fusionmarkt klasöründe):
 *   npx tsx scripts/seed-reviews.ts             -> DRY RUN (veritabanına yazmaz, ne yapacağını gösterir)
 *   npx tsx scripts/seed-reviews.ts --apply     -> Gerçekten ekler
 *   npx tsx scripts/seed-reviews.ts --rollback  -> Bu script'in eklediği yorum ve kullanıcıları siler
 *
 * Script tekrar çalıştırılabilir (idempotent): daha önce eklenmiş yorumları atlar.
 */

import { prisma } from "@repo/db";
import { SEED_TARGETS, SeedReview, SeedTarget } from "./seed-reviews-data";

const APPLY = process.argv.includes("--apply");
const ROLLBACK = process.argv.includes("--rollback");

// ------------------------------------------------------------------
// Yardımcılar
// ------------------------------------------------------------------

/** API'deki maskeleme ile birebir aynı: "Doğukan Arık" -> "D*** A***" */
function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0].toUpperCase() + "***";
    })
    .join(" ");
}

/** Deterministik hash (aynı isim her çalıştırmada aynı e-postayı üretir) */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function foldTurkish(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z]/g, "");
}

/** "Ayşe Kaya" -> "ayse.kaya61@gmail.com" gibi gerçekçi, deterministik e-posta */
function genEmail(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = foldTurkish(parts[0]);
  const last = foldTurkish(parts[parts.length - 1]);
  const h = hash(name);
  const num = (h % 88) + 10; // 10-97 arası iki haneli sayı
  const domains = ["gmail.com", "gmail.com", "gmail.com", "hotmail.com", "outlook.com", "icloud.com"];
  const domain = domains[h % domains.length];
  const formats = [
    `${first}.${last}${num}`,
    `${first}${last}${num}`,
    `${first}_${last}`,
    `${first}${last.charAt(0)}${num}`,
    `${last}${first}${num % 10}`,
  ];
  const local = formats[Math.floor(h / 7) % formats.length];
  return `${local}@${domain}`;
}

/** Yorum tarihini üretir: daysAgo gün önce, gün içinde makul bir saat */
function reviewDate(review: SeedReview): Date {
  const h = hash(review.name + review.comment);
  const d = new Date();
  d.setDate(d.getDate() - review.daysAgo);
  d.setHours(9 + (h % 14), h % 60, (h * 7) % 60, 0); // 09:00 - 22:59 arası
  return d;
}

// ------------------------------------------------------------------
// Ürün / paket eşleştirme
// ------------------------------------------------------------------

type Match = { id: string; name: string; slug: string };

async function findTarget(target: SeedTarget): Promise<Match | null> {
  const or = target.keywords.flatMap((k) => [
    { slug: { contains: k, mode: "insensitive" as const } },
    { name: { contains: k, mode: "insensitive" as const } },
  ]);

  const rows: Match[] =
    target.type === "product"
      ? await prisma.product.findMany({ where: { OR: or }, select: { id: true, name: true, slug: true } })
      : await prisma.bundle.findMany({ where: { OR: or }, select: { id: true, name: true, slug: true } });

  if (rows.length === 0) return null;
  if (rows.length > 1) {
    // En kısa slug büyük ihtimalle ana ürün (varyant/aksesuar değil)
    rows.sort((a, b) => a.slug.length - b.slug.length);
    console.log(`   ⚠️  "${target.label}" için ${rows.length} eşleşme bulundu:`);
    rows.forEach((r) => console.log(`      - ${r.name} (${r.slug})`));
    console.log(`      -> "${rows[0].name}" seçildi. Yanlışsa keywords listesini daralt.`);
  }
  return rows[0];
}

// ------------------------------------------------------------------
// Rollback
// ------------------------------------------------------------------

async function rollback() {
  const emails = new Set<string>();
  for (const target of SEED_TARGETS) {
    for (const r of target.reviews) emails.add(genEmail(r.name));
  }

  const users = await prisma.user.findMany({
    where: { email: { in: Array.from(emails) } },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("Silinecek seed kullanıcısı bulunamadı. (Daha önce --apply çalıştırılmamış olabilir)");
    return;
  }

  const userIds = users.map((u) => u.id);
  const delReviews = await prisma.review.deleteMany({ where: { userId: { in: userIds } } });
  const delUsers = await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  console.log(`🗑️  ${delReviews.count} yorum ve ${delUsers.count} kullanıcı silindi.`);
}

// ------------------------------------------------------------------
// Seed
// ------------------------------------------------------------------

async function seed() {
  console.log(APPLY ? "🚀 APPLY modu - veritabanına yazılacak\n" : "🔍 DRY RUN - veritabanına YAZILMAZ (--apply ile çalıştırınca yazar)\n");

  // Her kullanıcının en eski yorum tarihi (üyelik tarihi ondan önce olmalı)
  const earliestByName = new Map<string, Date>();
  for (const target of SEED_TARGETS) {
    for (const r of target.reviews) {
      const d = reviewDate(r);
      const prev = earliestByName.get(r.name);
      if (!prev || d < prev) earliestByName.set(r.name, d);
    }
  }

  // Kullanıcıları hazırla
  const userIdByName = new Map<string, string>();
  let usersCreated = 0;
  let usersExisting = 0;

  for (const [name, firstReview] of earliestByName) {
    const email = genEmail(name);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (existing) {
      userIdByName.set(name, existing.id);
      usersExisting++;
      continue;
    }

    // Üyelik, ilk yorumdan 2-40 gün önce (deterministik)
    const memberDaysBefore = 2 + (hash(name) % 39);
    const createdAt = new Date(firstReview.getTime() - memberDaysBefore * 24 * 60 * 60 * 1000);

    if (APPLY) {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          emailVerified: new Date(createdAt.getTime() + 10 * 60 * 1000),
          createdAt,
        },
        select: { id: true },
      });
      userIdByName.set(name, user.id);
    }
    usersCreated++;
  }

  console.log(`👤 Kullanıcı: ${usersCreated} yeni, ${usersExisting} zaten mevcut\n`);

  // Yorumları ekle
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const target of SEED_TARGETS) {
    const match = await findTarget(target);

    if (!match) {
      console.log(`❌ ${target.label}: eşleşen ${target.type === "product" ? "ürün" : "paket"} BULUNAMADI (keywords: ${target.keywords.join(", ")})`);
      totalFailed += target.reviews.length;
      continue;
    }

    const ratings = target.reviews.map((r) => r.rating);
    const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
    console.log(`\n📦 ${target.label} -> ${match.name} (${match.slug})`);
    console.log(`   ${target.reviews.length} yorum | ortalama ${avg} | ${ratings.filter((r) => r === 5).length}x5⭐ ${ratings.filter((r) => r === 4).length}x4⭐`);

    for (const r of target.reviews) {
      const targetWhere = target.type === "product" ? { productId: match.id } : { bundleId: match.id };

      // Aynı yorum daha önce eklendiyse atla (tekrar çalıştırma güvenliği)
      const dup = await prisma.review.findFirst({
        where: { comment: r.comment, ...targetWhere },
        select: { id: true },
      });
      if (dup) {
        totalSkipped++;
        continue;
      }

      const date = reviewDate(r);
      const displayName = r.masked ? maskName(r.name) : r.name;

      if (APPLY) {
        const userId = userIdByName.get(r.name);
        if (!userId) {
          console.log(`   ⚠️  ${r.name} için kullanıcı bulunamadı, yorum atlandı`);
          totalFailed++;
          continue;
        }
        await prisma.review.create({
          data: {
            ...targetWhere,
            userId,
            rating: r.rating,
            title: r.title || null,
            comment: r.comment,
            images: [],
            displayName,
            isVerified: true, // doğrulanmış alışveriş rozeti
            isApproved: true, // onaylı, sitede direkt görünür
            createdAt: date,
            updatedAt: date,
          },
        });
      }

      console.log(`   ${APPLY ? "✅" : "·"} ${r.rating}⭐ ${displayName} (${date.toLocaleDateString("tr-TR")}) "${r.comment.slice(0, 60)}${r.comment.length > 60 ? "..." : ""}"`);
      totalCreated++;
    }
  }

  console.log("\n════════════════════════════════════════");
  console.log(APPLY ? "✅ Tamamlandı!" : "🔍 Dry run bitti - henüz hiçbir şey yazılmadı.");
  console.log(`   • Eklenen${APPLY ? "" : " (eklenecek)"}: ${totalCreated}`);
  console.log(`   • Atlanan (zaten var): ${totalSkipped}`);
  if (totalFailed > 0) console.log(`   • Başarısız/eşleşmeyen: ${totalFailed}`);
  console.log("════════════════════════════════════════");
  if (!APPLY) {
    console.log('\nYazmak için: npx tsx scripts/seed-reviews.ts --apply');
  } else {
    console.log("\nNot: Ürün sayfaları cache'li ise yorumların görünmesi için revalidate gerekebilir.");
  }
}

async function main() {
  if (ROLLBACK) {
    await rollback();
  } else {
    await seed();
  }
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
