/**
 * POST /api/user/wishlist/merge
 *
 * Tarayıcıda (localStorage) duran favorileri kullanıcının hesabına taşır.
 * Giriş anında bir kez çağrılır; akış plan 04 §4.1'de tanımlı.
 *
 * ⚠️ Göç tek yönlüdür ve sıra kritiktir: istemci localStorage'ı ancak BAŞARILI
 * yanıttan sonra siler. Burada hata dönerse veri tarayıcıda kalır ve sonraki
 * oturumda tekrar denenir.
 *
 * Çakışma kuralları:
 *   - Aynı (productId, variantId) DB'de varsa → DB kaydı korunur, gelen atılır
 *     (DB kaydının `createdAt` ve `priceAtAdd` değeri zaten doğru).
 *   - Yalnızca gelende varsa → eklenir, `createdAt = addedAt` korunur.
 *   - Ürün silinmiş / pasifse → sessizce atlanır, `skipped` sayacına yazılır.
 *   - Varyant artık yoksa → kalem varyantsız eklenir (ürünü kaybetmemek,
 *     varyantı kaybetmeye tercih edildi).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { ensureWishlist, getWishlistItems } from "@/lib/wishlist";

interface IncomingItem {
  productId?: unknown;
  variantId?: unknown;
  addedAt?: unknown;
  priceAtAdd?: unknown;
}

/** Aynı ürünün aynı varyantı gelen listede iki kez varsa tekilleştirir. */
function dedupe(items: { productId: string; variantId: string | null; addedAt: Date; priceAtAdd: number | null }[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.productId}::${item.variantId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const incoming: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

    // Kötü niyetli / bozuk istemci koca bir dizi gönderemesin.
    if (incoming.length > 500) {
      return NextResponse.json({ error: "Çok fazla kalem" }, { status: 400 });
    }

    const parsed = dedupe(
      incoming
        .filter((item): item is IncomingItem & { productId: string } =>
          typeof item.productId === "string" && item.productId.length > 0
        )
        .map((item) => {
          const timestamp =
            typeof item.addedAt === "number" ? new Date(item.addedAt) : new Date();
          return {
            productId: item.productId,
            variantId: typeof item.variantId === "string" && item.variantId ? item.variantId : null,
            addedAt: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
            priceAtAdd: typeof item.priceAtAdd === "number" ? item.priceAtAdd : null,
          };
        })
    );

    if (parsed.length === 0) {
      return NextResponse.json({
        items: await getWishlistItems(session.user.id),
        merged: 0,
        skipped: 0,
      });
    }

    // Silinmiş / pasif ürünler ve artık var olmayan varyantlar ayıklanır;
    // aksi halde tek bir geçersiz kalem FK hatasıyla tüm göçü bloke eder.
    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: parsed.map((i) => i.productId) }, isActive: true },
        select: { id: true },
      }),
      prisma.productVariant.findMany({
        where: {
          id: { in: parsed.map((i) => i.variantId).filter((id): id is string => id !== null) },
        },
        select: { id: true, productId: true },
      }),
    ]);

    const activeProducts = new Set(products.map((p) => p.id));
    const variantOwner = new Map(variants.map((v) => [v.id, v.productId]));

    const wishlistId = await ensureWishlist(session.user.id);
    const existing = await prisma.wishlistItem.findMany({
      where: { wishlistId },
      select: { productId: true, variantId: true },
    });
    const existingKeys = new Set(
      existing.map((item) => `${item.productId}::${item.variantId ?? ""}`)
    );

    let skipped = 0;
    const toCreate: {
      wishlistId: string;
      productId: string;
      variantId: string | null;
      priceAtAdd: number | null;
      createdAt: Date;
    }[] = [];

    for (const item of parsed) {
      if (!activeProducts.has(item.productId)) {
        skipped++;
        continue;
      }

      // Varyant kaybolmuşsa ya da başka ürüne aitse varyantsız devam.
      const variantId =
        item.variantId && variantOwner.get(item.variantId) === item.productId
          ? item.variantId
          : null;

      if (existingKeys.has(`${item.productId}::${variantId ?? ""}`)) {
        skipped++;
        continue;
      }
      existingKeys.add(`${item.productId}::${variantId ?? ""}`);

      toCreate.push({
        wishlistId,
        productId: item.productId,
        variantId,
        priceAtAdd: item.priceAtAdd,
        createdAt: item.addedAt,
      });
    }

    if (toCreate.length > 0) {
      await prisma.wishlistItem.createMany({ data: toCreate });
    }

    console.info(
      `[wishlist merge] user=${session.user.id} merged=${toCreate.length} skipped=${skipped}`
    );

    return NextResponse.json({
      items: await getWishlistItems(session.user.id),
      merged: toCreate.length,
      skipped,
    });
  } catch (error) {
    console.error("Wishlist merge error:", error);
    return NextResponse.json(
      { error: "Beğendikleriniz hesabınıza taşınamadı" },
      { status: 500 }
    );
  }
}
