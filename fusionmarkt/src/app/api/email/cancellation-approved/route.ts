/**
 * Cancellation Approved Email API
 * POST /api/email/cancellation-approved
 */

import { NextRequest, NextResponse } from "next/server";
import { sendCancellationApprovedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, orderNumber, name, total, paymentMethod, adminNote } = body;

    if (!to || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendCancellationApprovedEmail({
      to,
      orderNumber,
      name,
      total,
      paymentMethod: paymentMethod || "card",
      adminNote,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
