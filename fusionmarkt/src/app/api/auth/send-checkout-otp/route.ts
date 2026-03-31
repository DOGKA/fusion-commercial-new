import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { generateActivationCode, sendCheckoutOtpEmail } from "@/lib/email";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`checkout-otp:${clientIP}`, RATE_LIMITS.auth);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen biraz bekleyin.", retryAfter: rateLimit.resetIn },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const code = generateActivationCode();
    const codeExp = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { activationCode: code, activationCodeExp: codeExp },
    });

    const result = await sendCheckoutOtpEmail(user.email!, code, user.name || undefined);
    if (!result.success) {
      console.warn(`OTP email failed for ${normalizedEmail}, code: ${code}`);
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ success: true, message: "Doğrulama kodu gönderildi (dev: mail gönderilemedi)", devCode: code });
      }
      return NextResponse.json({ error: "Kod gönderilemedi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Doğrulama kodu gönderildi" });
  } catch (error) {
    console.error("Send checkout OTP error:", error);
    return NextResponse.json({ error: "Kod gönderilemedi" }, { status: 500 });
  }
}
