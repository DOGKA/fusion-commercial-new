/**
 * Admin Password Change API
 * POST /api/admin/account/password - Şifre değiştir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import bcrypt from "bcrypt";

// POST - Şifre değiştir
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Mevcut ve yeni şifre gerekli" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalı" }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Mevcut şifreyi kontrol et
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 400 });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Güncelle
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password changed: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (error) {
    console.error("❌ [PASSWORD API] Error:", error);
    return NextResponse.json({ error: "Şifre değiştirilemedi" }, { status: 500 });
  }
}
