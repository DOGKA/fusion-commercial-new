/**
 * POST /api/user/coupons/check
 *
 * "Kupon kodum var" panelinin kaynağı (F2-31). Kullanıcı elindeki kodun
 * çalışıp çalışmadığını ödeme adımına gelmeden görüyor.
 *
 * Neden ödeme adımındaki `validate-coupon` kullanılmıyor: o uç sepet bekliyor
 * ve sepet boşken alt limit kontrolüne takılıp geçerli kuponu "geçersiz" diye
 * gösteriyor. Buradaki kontrol sepetten bağımsız olanlarla sınırlı; kural
 * `lib/user-coupons.ts`'te, liste ile aynı yerde.
 *
 * Oturum şart: kişi başı kullanım hakkı hesabı olmadan doğrulanamaz.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkCouponCode } from "@/lib/user-coupons";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code : "";

    const result = await checkCouponCode(session.user.id, code);

    // Geçersiz kod bir sunucu hatası değil, beklenen bir sonuç: 200 dönüp
    // gerekçeyi gövdede taşıyoruz, istemci tek yoldan okuyor.
    return NextResponse.json(result);
  } catch (error) {
    console.error("Kupon kodu kontrol edilemedi:", error);
    return NextResponse.json({ error: "Kupon kodu kontrol edilemedi" }, { status: 500 });
  }
}
