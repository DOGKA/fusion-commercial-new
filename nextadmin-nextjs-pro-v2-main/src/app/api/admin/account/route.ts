/**
 * Admin Account API
 * GET /api/admin/account - Kendi profil bilgilerini getir
 * PATCH /api/admin/account - Profil bilgilerini güncelle
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Profil bilgilerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ [ACCOUNT API] Get error:", error);
    return NextResponse.json({ error: "Profil bilgisi alınamadı" }, { status: 500 });
  }
}

// PATCH - Profil bilgilerini güncelle
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    // Güncelleme verisi
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Güncellenecek veri yok" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    console.log(`✅ Profile updated: ${updated.email}`);

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (error) {
    console.error("❌ [ACCOUNT API] Patch error:", error);
    return NextResponse.json({ error: "Profil güncellenemedi" }, { status: 500 });
  }
}
