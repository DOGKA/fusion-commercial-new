/**
 * Fatura PDF akışı
 *
 * GET /api/invoices/<filename>?t=<token>
 *
 * Filename `<orderNumber>.pdf` formatındadır. Token DB'deki `Order.invoiceToken`
 * ile eşleştirilir; eşleşmezse 404 döner.
 *
 * ERİŞİM KURALI (F2-61): **oturum zorunlu + token zorunlu.**
 *   oturum yok           → 404
 *   oturum var + sahibi  → izin
 *   oturum var + admin   → izin
 *   oturum var + başkası → 404
 *
 * F2-61 başta daha yumuşak bir kural öneriyordu ("oturum yoksa token yeter"),
 * gerekçe e-posta bağlantılarının çalışmaya devam etmesiydi. Uygularken o
 * gerekçenin **dayanaksız** olduğu görüldü: fatura bildirim e-postası token'lı
 * adresi hiç taşımıyor, `/hesabim`'a yönlendiriyor (`InvoiceReadyEmail.tsx:36`)
 * ve dosyanın tek sürümü budur — geçmişte de token'lı bağlantı göndermemiş.
 * Token'lı adresi üreten tek iki yer `GET /api/orders` ile sipariş detay ucu,
 * ikisi de oturum arıyor. Yani çıkış yapmış hiçbir meşru akış yok; token'ı tek
 * başına yeterli saymak, sızan bir bağlantıyı gizli sekmede açan herkese
 * faturayı vermek demekti.
 *
 * Token yine de aranıyor (ikinci katman): admin faturayı yeniden yüklediğinde
 * token değişiyor, eski adres sahibinde bile ölüyor.
 *
 * DOSYA KONUMU (F2-70): Faturalar artık `public/` dışında, `@repo/storage`'ın
 * gösterdiği özel klasörde duruyor. Eskiden `public/storage/invoices/`
 * altındaydılar ve oradan **oturumsuz** indirilebiliyorlardı; yani yukarıdaki
 * kural yazılıydı ama uygulanmıyordu. Taşınma öncesi yüklenmiş dosyalar için
 * `findInvoiceFile` eski klasöre de bakar.
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    // Tek bir sorgu ile hem token hem dosya adı eşleşmesi kontrol edilir
    const order = await prisma.order.findFirst({
      where: {
        invoiceToken: token,
        invoiceUrl: { contains: fileName },
      },
      select: { id: true, userId: true },
    });
    if (!order) return notFound();

    // 403 yerine her durumda 404: siparişin varlığını da sızdırmamak için.
    const session = await getServerSession(authOptions);
    const signedInUserId = session?.user?.id;
    if (!signedInUserId) return notFound();

    const role = session?.user?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
    const isOwner = signedInUserId === order.userId;
    if (!isOwner && !isAdmin) return notFound();

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
        // Token URL'de duruyor; PDF içinden dış bağlantı izlenirse `Referer`
        // ile sızmasın. F2-61'de adı geçen sızma yollarından biri buydu.
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("[invoices] stream error:", error);
    return notFound();
  }
}
