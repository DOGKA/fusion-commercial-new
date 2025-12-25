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
    const { email, password, name, phone } = body;

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

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Parola en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Check password complexity (at least one uppercase, one lowercase, one number)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json(
        { error: "Parola en az bir büyük harf, bir küçük harf ve bir rakam içermelidir" },
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

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        role: "CUSTOMER",
        // Newsletter subscription could be stored in a separate table or user metadata
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

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
