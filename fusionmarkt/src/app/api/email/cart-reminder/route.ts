/**
 * Cart Reminder Email API
 * POST /api/email/cart-reminder - Send abandoned cart reminder email
 * Supports optional coupon code
 */

import { NextRequest, NextResponse } from "next/server";
import { sendCartReminderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, name, items, total, coupon } = body;

    if (!to || !items || items.length === 0) {
      return NextResponse.json(
        { error: "E-posta adresi ve sepet ürünleri gerekli" },
        { status: 400 }
      );
    }

    const result = await sendCartReminderEmail(to, name, items, total, coupon);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "E-posta gönderilemedi" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [CART REMINDER EMAIL] Error:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500 }
    );
  }
}
