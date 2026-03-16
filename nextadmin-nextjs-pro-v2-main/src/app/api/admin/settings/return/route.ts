/**
 * Admin Return Settings API
 * GET /api/admin/settings/return - Get return settings
 * PUT /api/admin/settings/return - Update return settings
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// 🔒 Authorization check helper
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

/**
 * GET /api/admin/settings/return
 * Get return settings
 */
export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        defaultReturnAddress: true,
        returnShippingInfo: true,
      },
    });

    return NextResponse.json({
      defaultReturnAddress: settings?.defaultReturnAddress || "",
      returnShippingInfo: settings?.returnShippingInfo || "Kargo ücreti alıcı ödemeli olarak gönderilmelidir.",
    });
  } catch (error) {
    console.error("❌ [RETURN SETTINGS] GET error:", error);
    return NextResponse.json(
      { error: "Ayarlar alınamadı" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/return
 * Update return settings
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { defaultReturnAddress, returnShippingInfo } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        defaultReturnAddress: defaultReturnAddress?.trim() || null,
        returnShippingInfo: returnShippingInfo?.trim() || "Kargo ücreti alıcı ödemeli olarak gönderilmelidir.",
      },
      create: {
        id: "default",
        defaultReturnAddress: defaultReturnAddress?.trim() || null,
        returnShippingInfo: returnShippingInfo?.trim() || "Kargo ücreti alıcı ödemeli olarak gönderilmelidir.",
      },
    });

    return NextResponse.json({
      success: true,
      message: "İade ayarları güncellendi",
      defaultReturnAddress: settings.defaultReturnAddress,
      returnShippingInfo: settings.returnShippingInfo,
    });
  } catch (error) {
    console.error("❌ [RETURN SETTINGS] PUT error:", error);
    return NextResponse.json(
      { error: "Ayarlar kaydedilemedi" },
      { status: 500 }
    );
  }
}
