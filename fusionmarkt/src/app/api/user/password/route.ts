/**
 * User Password Change API
 * POST /api/user/password - Change password
 * 
 * Rate Limited: 5 attempts per 5 minutes per user (brute force protection)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@repo/db";
import { checkRateLimit } from "@/lib/rate-limit";

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting per user (brute force protection)
    const rateLimit = checkRateLimit(`password-change:${userId}`, { limit: 5, windowSeconds: 300 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen 5 dakika bekleyin." },
        { status: 429 }
      );
    }

    const body: ChangePasswordBody = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Yeni şifreler eşleşmiyor" },
        { status: 400 }
      );
    }

    // Password strength validation (same as registration)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Yeni şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json(
        { error: "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Bu hesap sosyal giriş ile oluşturulmuş. Şifre değiştirilemez." },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mevcut şifre hatalı" },
        { status: 400 }
      );
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Şifre değiştirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
