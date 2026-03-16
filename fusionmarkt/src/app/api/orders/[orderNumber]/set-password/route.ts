/**
 * Set Password for Order User API
 * POST /api/orders/[orderNumber]/set-password
 * 
 * Allows a guest user to set their password after placing an order.
 * The order number acts as the authentication token.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            password: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    if (!order.user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: order.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla oluşturuldu",
      email: order.user.email,
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Şifre oluşturulamadı" },
      { status: 500 }
    );
  }
}

