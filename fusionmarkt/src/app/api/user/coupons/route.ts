/**
 * GET /api/user/coupons
 *
 * Hesabım → Kuponlarım listesinin istemci tarafı kaynağı.
 *
 * Sorgunun kendisi `lib/user-coupons.ts`'te: aynı listeyi sayfanın sunucu
 * tarafı ilk render'ı da kullanıyor (F2-45) ve iki kopya zamanla birbirinden
 * ayrılırdı. Bu handler yalnızca oturum kontrolü + hata sarmalaması yapıyor.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserCoupons } from "@/lib/user-coupons";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    return NextResponse.json(await getUserCoupons(session.user.id));
  } catch (error) {
    console.error("Kuponlar alınamadı:", error);
    return NextResponse.json({ error: "Kuponlar alınamadı" }, { status: 500 });
  }
}
