/**
 * Verify Activation Code API
 * POST /api/auth/verify-activation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email ve kod gerekli" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        success: true,
        message: "Email zaten doğrulanmış",
        alreadyVerified: true,
      });
    }

    // Check activation code
    if (!user.activationCode || !user.activationCodeExp) {
      return NextResponse.json({ error: "Aktivasyon kodu bulunamadı. Yeni kod isteyin." }, { status: 400 });
    }

    // Check if expired
    if (new Date() > user.activationCodeExp) {
      return NextResponse.json({ error: "Aktivasyon kodunun süresi dolmuş. Yeni kod isteyin." }, { status: 400 });
    }

    // Check if code matches
    if (user.activationCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "Geçersiz aktivasyon kodu" }, { status: 400 });
    }

    // Verify email
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        activationCode: null,
        activationCodeExp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email başarıyla doğrulandı",
    });
  } catch (error) {
    console.error("Verify activation error:", error);
    return NextResponse.json(
      { error: "Aktivasyon doğrulanamadı" },
      { status: 500 }
    );
  }
}
