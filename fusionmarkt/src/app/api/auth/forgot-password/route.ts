/**
 * Forgot Password API - Send Reset Link
 * POST /api/auth/forgot-password
 * 
 * Rate Limited: 3 requests per 5 minutes per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendPasswordResetEmail, generateResetToken } from "@/lib/email";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Rate Limiting (Prevent email spam)
    // ─────────────────────────────────────────────────────────────────────────
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`forgot-password:${clientIP}`, RATE_LIMITS.passwordReset);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: "Çok fazla istek. Lütfen biraz bekleyin.",
          retryAfter: rateLimit.resetIn 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          }
        }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Eğer bu email ile kayıtlı bir hesap varsa, şifre sıfırlama linki gönderildi.",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save to database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExp: resetTokenExp,
      },
    });

    // Create reset link (NEXTAUTH_URL must be set in production!)
    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      console.error("❌ NEXTAUTH_URL not configured!");
      return NextResponse.json(
        { error: "Sistem yapılandırma hatası" },
        { status: 500 }
      );
    }
    const resetLink = `${baseUrl}/resetpassword?token=${resetToken}`;

    // Send email using new API
    const result = await sendPasswordResetEmail(email, resetLink, user.name || undefined);

    if (!result.success) {
      console.error("Failed to send password reset email");
    }

    return NextResponse.json({
      success: true,
      message: "Eğer bu email ile kayıtlı bir hesap varsa, şifre sıfırlama linki gönderildi.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Şifre sıfırlama linki gönderilemedi" },
      { status: 500 }
    );
  }
}
