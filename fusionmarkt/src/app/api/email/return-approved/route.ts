/**
 * Return Approved Email API
 * POST /api/email/return-approved
 */

import { NextRequest, NextResponse } from "next/server";
import { sendReturnApprovedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, orderNumber, name, total, returnAddress, returnInstructions, adminNote } = body;

    if (!to || !orderNumber || !returnAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendReturnApprovedEmail({
      to,
      orderNumber,
      name,
      total,
      returnAddress,
      returnInstructions,
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
