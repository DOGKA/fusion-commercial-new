/**
 * Check Email API
 * POST /api/auth/check-email
 * Checks if an email is already registered
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { isValidEmail } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Geçersiz email formatı" }, { status: 400 });
    }

    // Check if user exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      exists: !!existingUser,
      userName: existingUser?.name || null,
    });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Email kontrol edilemedi" },
      { status: 500 }
    );
  }
}

