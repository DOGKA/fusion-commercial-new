/**
 * Admin Order Invoice API
 * POST /api/admin/orders/[id]/invoice - Upload invoice (LOCAL)
 * DELETE /api/admin/orders/[id]/invoice - Delete invoice
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

// Local storage path - fusionmarkt public folder (both apps need access)
const STORAGE_BASE_PATH = path.join(process.cwd(), "..", "fusionmarkt", "public", "storage", "invoices");
// Also save to admin's public folder for direct access
const ADMIN_STORAGE_PATH = path.join(process.cwd(), "public", "storage", "invoices");
// Public URL is served via tokenized API stream route (see /api/invoices/[file])
const PUBLIC_URL_BASE = "/api/invoices";

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

    // Ensure directories exist (both frontend and admin)
    if (!existsSync(STORAGE_BASE_PATH)) {
      await mkdir(STORAGE_BASE_PATH, { recursive: true });
    }
    if (!existsSync(ADMIN_STORAGE_PATH)) {
      await mkdir(ADMIN_STORAGE_PATH, { recursive: true });
    }

    // Generate file name and token for the new tokenized URL scheme.
    // Bildirim maili artık burada gönderilmiyor — admin sipariş detayında
    // "Kaydet" basıldığında (checkbox aktifse) tetiklenir.
    const fileName = `${order.orderNumber}.pdf`;
    const token = randomBytes(24).toString("hex");
    const frontendFilePath = path.join(STORAGE_BASE_PATH, fileName);
    const adminFilePath = path.join(ADMIN_STORAGE_PATH, fileName);

    // Write file to both locations
    await writeFile(frontendFilePath, buffer);
    await writeFile(adminFilePath, buffer);

    const invoiceUrl = `${PUBLIC_URL_BASE}/${fileName}?t=${token}`;

    console.log(`📁 Invoice saved to: ${frontendFilePath}`);
    console.log(`📁 Invoice also saved to: ${adminFilePath}`);

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

    // Delete from both storage locations
    const fileName = `${order.orderNumber}.pdf`;
    const frontendFilePath = path.join(STORAGE_BASE_PATH, fileName);
    const adminFilePath = path.join(ADMIN_STORAGE_PATH, fileName);
    
    try {
      if (existsSync(frontendFilePath)) {
        await unlink(frontendFilePath);
        console.log(`🗑️ Deleted: ${frontendFilePath}`);
      }
      if (existsSync(adminFilePath)) {
        await unlink(adminFilePath);
        console.log(`🗑️ Deleted: ${adminFilePath}`);
      }
    } catch (fsError) {
      console.warn("File delete warning (file may not exist):", fsError);
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
