/**
 * Send Activation Code API
 * POST /api/auth/send-activation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendActivationEmail, generateActivationCode } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 });
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
      return NextResponse.json({ error: "Email zaten doğrulanmış" }, { status: 400 });
    }

    // Generate activation code
    const activationCode = generateActivationCode();
    const activationCodeExp = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to database
    await prisma.user.update({
      where: { email },
      data: {
        activationCode,
        activationCodeExp,
      },
    });

    // Send email using new API
    const result = await sendActivationEmail(email, activationCode, user.name || undefined);

    if (!result.success) {
      return NextResponse.json({ error: "Email gönderilemedi" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Aktivasyon kodu gönderildi",
    });
  } catch (error) {
    console.error("Send activation error:", error);
    return NextResponse.json(
      { error: "Aktivasyon kodu gönderilemedi" },
      { status: 500 }
    );
  }
}
