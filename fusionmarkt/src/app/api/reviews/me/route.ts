/**
 * GET /api/reviews/me
 *
 * Değerlendirmelerim ekranının istemci tarafı kaynağı.
 *
 * Sorgunun kendisi `lib/my-reviews.ts`'te: aynı veriyi sayfanın sunucu tarafı
 * ilk render'ı da kullanıyor (F2-45). Bu handler yalnızca oturum + hata
 * sarmalaması yapıyor.
 *
 * SALT OKUNUR. Yorum yazma/güncelleme `POST /api/reviews`'ta kalıyor.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMyReviews } from "@/lib/my-reviews";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    return NextResponse.json(await getMyReviews(session.user.id));
  } catch (error) {
    console.error("My reviews error:", error);
    return NextResponse.json(
      { error: "Değerlendirmeleriniz alınamadı" },
      { status: 500 }
    );
  }
}
