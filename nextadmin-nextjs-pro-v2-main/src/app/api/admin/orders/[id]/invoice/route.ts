/**
 * Admin Order Invoice API
 * POST /api/admin/orders/[id]/invoice - Upload invoice (LOCAL)
 * DELETE /api/admin/orders/[id]/invoice - Delete invoice
 *
 * DOSYA KONUMU (F2-70): Yüklenen PDF eskiden **iki `public/` klasörüne birden**
 * yazılıyordu (storefront'unki ve admin'inki), çünkü iki uygulama da dosyayı
 * okuyabilmeliydi. `public/` altındaki her şey kimlik doğrulaması olmadan
 * servis edildiği için bu, faturaları herkese açık hale getiriyordu. Artık
 * `@repo/storage`'ın gösterdiği **tek ortak özel klasöre** yazılıyor; iki
 * uygulama da oradan okuyor, kopyalamaya gerek kalmadı.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { revalidateTag } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { getInvoiceDir, getLegacyInvoiceDir } from "@repo/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔒 Yetkilendirme kontrolü helper
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Yetkilendirme gerekli", status: 401 };
  }
  
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return { authorized: false, error: "Bu işlem için yetkiniz yok", status: 403 };
  }
  
  return { authorized: true, session };
}

// Public URL is served via tokenized API stream route (see /api/invoices/[file])
const PUBLIC_URL_BASE = "/api/invoices";

/**
 * Silme sırasında bakılacak klasörler: yeni özel klasör ve taşınma öncesinden
 * kalan iki `public` klasörü. Eski dosyalar yerinde bırakıldığı için (31 Tem
 * kullanıcı kararı) silme onları da temizleyebilmeli, yoksa admin panelinden
 * "sil" denen bir fatura diskte kalıp herkese açık olmaya devam ederdi.
 */
function invoiceDeleteTargets(fileName: string): string[] {
  return [
    path.join(getInvoiceDir(), fileName),
    path.join(getLegacyInvoiceDir(), fileName),
    path.join(process.cwd(), "..", "fusionmarkt", "public", "storage", "invoices", fileName),
  ];
}

/**
 * POST /api/admin/orders/[id]/invoice
 * Upload invoice PDF to local storage
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("invoice") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Fatura dosyası gerekli" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Sadece PDF dosyaları kabul edilir" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan küçük olmalı" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const storageDir = getInvoiceDir();
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    // Generate file name and token for the new tokenized URL scheme.
    // Bildirim maili artık burada gönderilmiyor — admin sipariş detayında
    // "Kaydet" basıldığında (checkbox aktifse) tetiklenir.
    const fileName = `${order.orderNumber}.pdf`;
    const token = randomBytes(24).toString("hex");
    const filePath = path.join(storageDir, fileName);

    await writeFile(filePath, buffer);

    const invoiceUrl = `${PUBLIC_URL_BASE}/${fileName}?t=${token}`;

    console.log(`📁 Invoice saved to: ${filePath}`);

    // Update order — yeni fatura ile birlikte bildirim durumu sıfırlanır.
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        invoiceUrl,
        invoiceToken: token,
        invoiceUploadedAt: new Date(),
        invoiceNotifiedAt: null,
      },
    });

    console.log(`✅ Invoice uploaded for order ${order.orderNumber}: ${invoiceUrl}`);

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      invoiceUrl,
      invoiceUploadedAt: updatedOrder.invoiceUploadedAt,
    });
  } catch (error) {
    console.error("❌ [INVOICE API] Upload error:", error);
    return NextResponse.json(
      { error: "Fatura yüklenemedi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id]/invoice
 * Delete invoice from local storage
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 Yetkilendirme kontrolü
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    if (!order.invoiceUrl) {
      return NextResponse.json(
        { error: "Bu siparişe ait fatura yok" },
        { status: 400 }
      );
    }

    // Yeni klasör ve eski `public` kopyaları — hepsinden silinir.
    const fileName = `${order.orderNumber}.pdf`;

    for (const target of invoiceDeleteTargets(fileName)) {
      try {
        if (existsSync(target)) {
          await unlink(target);
          console.log(`🗑️ Deleted: ${target}`);
        }
      } catch (fsError) {
        console.warn(`File delete warning (${target}):`, fsError);
      }
    }

    // Update order
    await prisma.order.update({
      where: { id },
      data: {
        invoiceUrl: null,
        invoiceUploadedAt: null,
        invoiceToken: null,
        invoiceNotifiedAt: null,
      },
    });

    console.log(`✅ Invoice deleted for order ${order.orderNumber}`);

    // Revalidate cache
    revalidateTag("orders");

    return NextResponse.json({
      success: true,
      message: "Fatura silindi",
    });
  } catch (error) {
    console.error("❌ [INVOICE API] Delete error:", error);
    return NextResponse.json(
      { error: "Fatura silinemedi" },
      { status: 500 }
    );
  }
}
