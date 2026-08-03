/**
 * GET /api/orders/[orderNumber]/detail
 *
 * Sipariş detay ekranının istemci tarafı kaynağı.
 *
 * NEDEN AYRI BİR UÇ — kardeşi `[orderNumber]/route.ts` bu iş için kullanılamaz:
 *  1. O uç sipariş-onay sayfası için yazıldı ve durumu `success/failed/pending`e
 *     düzleştiriyor; detay ekranı ham `OrderStatus`'e ihtiyaç duyuyor.
 *  2. Kargo/fatura/damga alanlarını döndürmüyor.
 *  3. **Oturumsuz erişime izin veriyor** (sipariş numarası + e-posta ile). Detay
 *     ekranı talep açma gibi işlemlerin giriş noktası olduğu için burada oturum
 *     zorunlu ve token atlatması yok.
 *
 * Sorgunun ve yetki kararının kendisi `lib/order-detail.ts`'te: aynı veriyi
 * sayfanın sunucu tarafı ilk render'ı da kullanıyor (F2-45). Bu handler yalnızca
 * oturumu çözüp sonucu HTTP'ye çeviriyor.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrderDetail } from "@/lib/order-detail";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    const { orderNumber } = await params;
    const result = await getOrderDetail(orderNumber, {
      userId: session.user.id,
      role: (session.user as { role?: string }).role,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json({ error: "Sipariş detayı alınamadı" }, { status: 500 });
  }
}
