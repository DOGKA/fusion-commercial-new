/**
 * Reset Password API - Verify Token & Update Password
 * GET /api/auth/reset-password?token=xxx - Verify token
 * POST /api/auth/reset-password - Reset password
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

// Verify token is valid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        passwordResetTokenExp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    // Check if token expired
    if (!user.passwordResetTokenExp || new Date() > user.passwordResetTokenExp) {
      return NextResponse.json({ valid: false, expired: true }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

// Reset password
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    // Validation
    if (!token) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Tüm alanları doldurun" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Şifreler eşleşmiyor" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş link" }, { status: 404 });
    }

    // Check if token expired
    if (!user.passwordResetTokenExp || new Date() > user.passwordResetTokenExp) {
      return NextResponse.json({ error: "Şifre sıfırlama linkinin süresi dolmuş" }, { status: 400 });
    }

    // Check if new password is same as current (if user has a password)
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json({ error: "Yeni şifre eskisiyle aynı olamaz" }, { status: 400 });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 }
    );
  }
}
