/**
 * Cancellation Rejected Email API
 * POST /api/email/cancellation-rejected
 */

import { NextRequest, NextResponse } from "next/server";
import { sendCancellationRejectedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, orderNumber, name, reason } = body;

    if (!to || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendCancellationRejectedEmail({
      to,
      orderNumber,
      name,
      reason,
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
