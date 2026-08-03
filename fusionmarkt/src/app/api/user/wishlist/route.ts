/**
 * Favoriler API
 *   GET    /api/user/wishlist  — taze fiyat/stok ile favori listesi
 *   POST   /api/user/wishlist  — favoriye ekle
 *   DELETE /api/user/wishlist  — favoriden çıkar
 *
 * Üçü de güncel listenin tamamını döndürüyor. Kalem başına yanıt döndürüp
 * istemcinin kendi state'ini ayrıca güncellemesi, iki tarafın sapması için
 * açık kapı bırakırdı; liste onlarca kalemlik olduğu için maliyeti önemsiz.
 *
 * Oturumsuz kullanıcı 401 alır ve `FavoritesContext` localStorage'a düşer —
 * favori eklemek için giriş zorunlu DEĞİL (mevcut davranış korunuyor).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { ensureWishlist, getWishlistItems } from "@/lib/wishlist";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const items = await getWishlistItems(session.user.id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { error: "Beğendikleriniz alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const productId = typeof body.productId === "string" ? body.productId : "";
    const variantId = typeof body.variantId === "string" && body.variantId ? body.variantId : null;

    if (!productId) {
      return NextResponse.json({ error: "Ürün belirtilmedi" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, isActive: true },
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    // Varyant gerçekten bu ürüne mi ait? Aksi halde başka ürünün varyantı
    // favoriye bağlanabilir ve fiyat/stok yanlış okunur.
    let priceAtAdd = Number(product.price);
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { productId: true, price: true, salePrice: true },
      });
      if (!variant || variant.productId !== productId) {
        return NextResponse.json({ error: "Ürün seçeneği bulunamadı" }, { status: 404 });
      }
      priceAtAdd =
        variant.salePrice != null
          ? Number(variant.salePrice)
          : variant.price != null
            ? Number(variant.price)
            : Number(product.price);
    }

    const wishlistId = await ensureWishlist(session.user.id);

    // Tekillik kısıtı `variantId` NULL olduğunda devreye girmediği için
    // (PostgreSQL NULL'ları eşit saymaz) varyantsız kalemde kontrol burada.
    const existing = await prisma.wishlistItem.findFirst({
      where: { wishlistId, productId, variantId },
      select: { id: true },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: { wishlistId, productId, variantId, priceAtAdd },
      });
    }

    return NextResponse.json({ items: await getWishlistItems(session.user.id) });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { error: "Ürün beğendiklerinize eklenemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") || "";
    const variantId = url.searchParams.get("variantId") || null;
    // "Tümünü temizle" — arayüzde onay diyaloğunun arkasında.
    const clearAll = url.searchParams.get("all") === "1";

    if (!productId && !clearAll) {
      return NextResponse.json({ error: "Ürün belirtilmedi" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: clearAll
          ? { wishlistId: wishlist.id }
          : { wishlistId: wishlist.id, productId, variantId },
      });
    }

    return NextResponse.json({ items: await getWishlistItems(session.user.id) });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Ürün beğendiklerinizden çıkarılamadı" },
      { status: 500 }
    );
  }
}
