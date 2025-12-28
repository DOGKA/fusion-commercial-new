/**
 * Contact Form API
 * POST /api/contact - Submit contact form
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { name, email, phone, subject, message } = body;

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

