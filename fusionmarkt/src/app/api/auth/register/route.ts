/**
 * User Registration API
 * POST /api/auth/register
 * 
 * Rate Limited: 3 requests per 5 minutes per IP
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { buildConsentLogRows, CONSENT_CHANNELS, CONSENT_SOURCES } from "@/lib/consent";
import { PASSWORD_TOO_SHORT_ERROR, isPasswordLongEnough } from "@/lib/password-policy";

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  newsletter?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Rate Limiting (DDoS & Spam Protection)
    // ─────────────────────────────────────────────────────────────────────────
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`register:${clientIP}`, RATE_LIMITS.register);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: "Çok fazla kayıt denemesi. Lütfen biraz bekleyin.",
          retryAfter: rateLimit.resetIn 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    const body: RegisterBody = await request.json();
    const { email, password, name, phone, newsletter } = body;

    // ─────────────────────────────────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve parola gereklidir" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    if (!isPasswordLongEnough(password)) {
      return NextResponse.json(
        { error: PASSWORD_TOO_SHORT_ERROR },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Check existing user
    // ─────────────────────────────────────────────────────────────────────────
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 409 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create user
    // ─────────────────────────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    // Kutu işaretlenmemişse `undefined` gelir ve alan `null` kalır: "hiç
    // sorulmadı" ile "reddetti" ayrımı korunur (bkz. lib/consent.ts).
    const emailConsent = typeof newsletter === "boolean" ? newsletter : null;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        role: "CUSTOMER",
        emailConsent,
        consentUpdatedAt: emailConsent !== null ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (emailConsent !== null) {
      const logRows = buildConsentLogRows(
        [
          {
            channel: CONSENT_CHANNELS.EMAIL,
            granted: emailConsent,
            previousValue: null,
          },
        ],
        {
          userId: user.id,
          source: CONSENT_SOURCES.REGISTER,
          ipAddress: clientIP,
          userAgent: request.headers.get("user-agent"),
        }
      );

      // Kayıt zaten tamamlandı; denetim kaydı yazılamazsa kullanıcıyı
      // başarısız saymak yerine hatayı bildirip devam ediyoruz.
      try {
        await prisma.userConsentLog.createMany({ data: logRows });
      } catch (logError) {
        console.error("Consent log write failed on register:", logError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Hesabınız başarıyla oluşturuldu",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
