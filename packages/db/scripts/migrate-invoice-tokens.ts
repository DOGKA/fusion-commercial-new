/**
 * Migration Script: Tokenize Invoice URLs
 *
 * Mevcut siparişlerden `invoiceUrl` değeri "/storage/invoices/<orderNumber>.pdf"
 * formatında olanları okur, her biri için yeni bir `invoiceToken` üretir ve URL'i
 * yeni stream route formatına ("/api/invoices/<filename>?t=<token>") günceller.
 *
 * Önemli: Eski sistemde fatura yüklenir yüklenmez bildirim maili gönderiliyordu.
 * Bu yüzden `invoiceUploadedAt` dolu olan kayıtlar için `invoiceNotifiedAt`'i
 * `invoiceUploadedAt` değeri ile dolduruyoruz — admin yeniden bildirim mailini
 * yanlışlıkla göndermesin diye.
 *
 * Kullanım:
 *   cd packages/db
 *   npx tsx scripts/migrate-invoice-tokens.ts
 *
 * Idempotent: zaten /api/invoices/ formatında olanlara dokunmaz.
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function migrateInvoiceTokens() {
  console.log("Starting invoice URL token migration...");

  const candidates = await prisma.order.findMany({
    where: {
      invoiceUrl: { startsWith: "/storage/invoices/" },
    },
    select: {
      id: true,
      orderNumber: true,
      invoiceUrl: true,
      invoiceUploadedAt: true,
      invoiceToken: true,
      invoiceNotifiedAt: true,
    },
  });

  console.log(`Found ${candidates.length} orders with legacy invoice URL`);

  if (candidates.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const order of candidates) {
    try {
      const url = order.invoiceUrl as string;
      const fileName = url.split("/").pop();
      if (!fileName) {
        console.warn(`Skipping ${order.orderNumber}: cannot extract file name from ${url}`);
        continue;
      }

      const token = order.invoiceToken || randomBytes(24).toString("hex");
      const newUrl = `/api/invoices/${fileName}?t=${token}`;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          invoiceUrl: newUrl,
          invoiceToken: token,
          invoiceNotifiedAt:
            order.invoiceNotifiedAt ?? order.invoiceUploadedAt ?? new Date(),
        },
      });

      updated++;
      if (updated % 100 === 0) {
        console.log(`Progress: ${updated}/${candidates.length}`);
      }
    } catch (error) {
      console.error(`Failed to migrate order ${order.orderNumber}:`, error);
      errors++;
    }
  }

  console.log("\n=== Migration Complete ===");
  console.log(`Successfully migrated: ${updated} orders`);
  console.log(`Failed: ${errors} orders`);
}

migrateInvoiceTokens()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
