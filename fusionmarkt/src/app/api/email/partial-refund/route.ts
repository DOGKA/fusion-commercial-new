/**
 * Kısmi İade Tamamlandı E-postası (F2-73)
 * POST /api/email/partial-refund
 *
 * Admin paneli çağırıyor: e-posta gönderimi mağaza uygulamasında yaşıyor,
 * panelin kendi gönderim altyapısı yok (diğer iade e-postaları da böyle).
 */

import { NextRequest, NextResponse } from "next/server";
import { sendPartialRefundEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, orderNumber, name, refundedTotal, items, isCardPayment, adminNote } = body;

    if (!to || !orderNumber || !refundedTotal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Kalem listesi boşsa e-posta anlamsız: müşteriye neyin iade edildiğini
    // söyleyemiyorsak "iadeniz tamamlandı" demek yeni soru doğurur.
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "İade edilen ürün listesi boş" }, { status: 400 });
    }

    const result = await sendPartialRefundEmail({
      to,
      orderNumber,
      name,
      refundedTotal,
      items: items.map((item: { name?: unknown; quantity?: unknown }) => ({
        name: typeof item?.name === "string" ? item.name : "Ürün",
        quantity: typeof item?.quantity === "number" ? item.quantity : 1,
      })),
      isCardPayment: isCardPayment === true,
      adminNote,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
