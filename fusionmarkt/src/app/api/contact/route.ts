/**
 * Contact Form API
 * POST /api/contact - Submit contact form
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactFormNotification } from "@/lib/email";

// reCAPTCHA verification (optional)
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await res.json();
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch {
    console.error("reCAPTCHA verification failed");
    return false;
  }
}

// Rate limiting için basit in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 mesaj
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 saat

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // IP adresi al
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Rate limit kontrolü
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Çok fazla mesaj gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message, recaptchaToken } = body;

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json(
          { error: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin." },
          { status: 400 }
        );
      }
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Ad soyad gereklidir" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta adresi" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Mesaj gereklidir" },
        { status: 400 }
      );
    }

    // User agent al
    const userAgent = request.headers.get("user-agent") || undefined;

    // Mesajı kaydet
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        ipAddress: ip,
        userAgent,
      },
    });

    console.log(`📧 New contact message from ${email} (ID: ${contactMessage.id})`);

    // Send email notification to info@fusionmarkt.com
    try {
      await sendContactFormNotification({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
      });
      console.log(`📧 Contact form notification sent to info@fusionmarkt.com`);
    } catch (emailError) {
      console.error("Failed to send contact form notification:", emailError);
      // Don't fail the request if email fails - message is already saved
    }

    return NextResponse.json({
      success: true,
      message: "Mesajınız başarıyla gönderildi",
      id: contactMessage.id,
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

