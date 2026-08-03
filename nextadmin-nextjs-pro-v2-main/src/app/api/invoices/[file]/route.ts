/**
 * Admin-side Invoice PDF Stream
 *
 * GET /api/invoices/<filename>?t=<token>
 *
 * DOSYA KONUMU (F2-70): Faturalar `public/` dışına, `@repo/storage`'ın
 * gösterdiği ortak klasöre taşındı — iki uygulama da oraya bakıyor. Taşınma
 * öncesi yüklenmiş dosyalar için eski `public/storage/invoices/` klasörü geri
 * dönüş olarak korunuyor.
 *
 * ERİŞİM KURALI (F2-61): **yönetici oturumu zorunlu + token zorunlu.**
 *
 * Bu ucun tek meşru tüketicisi admin panelinin kendisi; müşteri faturasını
 * storefront üzerinden alıyor. Buna rağmen uç, oturum aramadan yalnızca
 * token'a bakıyordu ve `middleware.ts` onu koruyamıyor: oradaki
 * `isStaticFile = pathname.includes(".")` kuralı, `.pdf` uzantısı yüzünden bu
 * yolu "statik dosya" sayıp yetki kontrolünü atlıyor.
 *
 * Sonuç: storefront tarafı sıkılaştırılsa bile **aynı token admin alan adından
 * çalışmaya devam ederdi** ve düzeltme baştan delinmiş olurdu. O yüzden iki
 * kopya birlikte kapatıldı.
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";
import { findInvoiceFile, safeInvoiceFileName } from "@repo/storage";
import { readFile } from "fs/promises";

export const dynamic = "force-dynamic";

function notFound() {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  try {
    const { file } = await context.params;
    const fileName = safeInvoiceFileName(file);
    if (!fileName) return notFound();

    const token = new URL(request.url).searchParams.get("t");
    if (!token || token.length < 16) return notFound();

    // 403 değil 404: siparişin varlığını da sızdırmamak için.
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") return notFound();

    const order = await prisma.order.findFirst({
      where: {
        invoiceToken: token,
        invoiceUrl: { contains: fileName },
      },
      select: { id: true },
    });
    if (!order) return notFound();

    const filePath = await findInvoiceFile(fileName);
    if (!filePath) {
      console.warn(`[invoices] File missing on disk: ${fileName}`);
      return notFound();
    }

    const buffer = await readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        // Token URL'de duruyor; `Referer` başlığıyla dışarı sızmasın.
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("[invoices] stream error:", error);
    return notFound();
  }
}
