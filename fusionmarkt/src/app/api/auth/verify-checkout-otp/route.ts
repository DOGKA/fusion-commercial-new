import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`verify-otp:${clientIP}`, RATE_LIMITS.auth);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen biraz bekleyin.", retryAfter: rateLimit.resetIn },
        { status: 429 }
      );
    }

    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "E-posta ve kod gerekli" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        activationCode: true,
        activationCodeExp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    if (!user.activationCode || !user.activationCodeExp) {
      return NextResponse.json({ error: "Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin." }, { status: 400 });
    }

    if (new Date() > new Date(user.activationCodeExp)) {
      return NextResponse.json({ error: "Kodun süresi dolmuş. Lütfen yeni kod isteyin." }, { status: 400 });
    }

    if (user.activationCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
    }

    // Clear the OTP code
    await prisma.user.update({
      where: { id: user.id },
      data: { activationCode: null, activationCodeExp: null },
    });

    // Return verified: true so the client can call signIn("credentials") or use the session
    // The client will trigger auto-login using NextAuth signIn
    return NextResponse.json({
      success: true,
      verified: true,
      userId: user.id,
      userName: user.name,
    });
  } catch (error) {
    console.error("Verify checkout OTP error:", error);
    return NextResponse.json({ error: "Doğrulama başarısız" }, { status: 500 });
  }
}
