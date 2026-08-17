/**
 * POST /api/cart/sync
 *
 * Giriş yapmış kullanıcının sepetini `Cart` / `CartItem` tablolarına yazar.
 *
 * NEDEN VAR: Sepet yalnızca localStorage'da tutuluyordu, dolayısıyla admin
 * panelindeki "Terk Edilmiş Sepetler" ekranı hiç veri görmüyordu — `Cart`
 * tablosuna satır ekleyen tek kod bir test script'iydi. Bu uç, sepetin sunucu
 * tarafındaki kopyasını güncel tutuyor.
 *
 * SEPETİN KAYNAĞI HÂLÂ İSTEMCİ. Burada yazılan veri yalnızca terk edilmiş sepet
 * hatırlatmaları ve raporlama için; sunucudan istemciye geri yükleme (cihazlar
 * arası sepet) yapılmıyor. O yüzden bu uç tek yönlü: gelen liste sunucudaki
 * listeyi olduğu gibi değiştirir.
 *
 * KAPSAM: Misafir kullanıcıların sepeti yazılmaz (Cart.userId zorunlu).
 * Paket/bundle satırları da yazılmaz; CartItem.productId zorunlu ve Product'a
 * bağlı, bundle satırının productId'si ise bundle kimliği — yabancı anahtar
 * kısıtını ihlal eder.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_DISTINCT_ITEMS = 100;
const MAX_QUANTITY_PER_PRODUCT = 999;
const MAX_VARIANT_INFO_LENGTH = 300;

interface SyncItem {
  productId: string;
  quantity: number;
  variantInfo: string | null;
}

/**
 * İstemciden gelen listeyi veritabanı şemasına uydurur.
 *
 * CartItem'da `@@unique([cartId, productId])` var, yani bir ürün sepette tek
 * satır olabiliyor. İstemci sepetinde ise aynı ürün farklı varyantlarla ayrı
 * satırlar halinde durabiliyor. Bu yüzden ürün bazında toplayıp varyant
 * etiketlerini `variantInfo` alanında metin olarak saklıyoruz.
 */
function normalizeItems(raw: unknown): SyncItem[] {
  if (!Array.isArray(raw)) return [];

  const aggregated = new Map<string, { quantity: number; variants: Set<string> }>();

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;

    // Bundle satırları atlanıyor (dosya başındaki KAPSAM notu).
    if (item.isBundle === true) continue;

    const productId = item.productId;
    if (typeof productId !== "string" || productId.length === 0) continue;

    const rawQuantity = Number(item.quantity);
    if (!Number.isFinite(rawQuantity) || rawQuantity < 1) continue;
    const quantity = Math.min(Math.floor(rawQuantity), MAX_QUANTITY_PER_PRODUCT);

    const existing = aggregated.get(productId);
    const bucket = existing ?? { quantity: 0, variants: new Set<string>() };
    bucket.quantity = Math.min(bucket.quantity + quantity, MAX_QUANTITY_PER_PRODUCT);

    const variantLabel = item.variantLabel;
    if (typeof variantLabel === "string" && variantLabel.trim().length > 0) {
      bucket.variants.add(variantLabel.trim());
    }

    if (!existing) aggregated.set(productId, bucket);
    if (aggregated.size >= MAX_DISTINCT_ITEMS) break;
  }

  return [...aggregated.entries()].map(([productId, bucket]) => ({
    productId,
    quantity: bucket.quantity,
    variantInfo:
      bucket.variants.size > 0
        ? [...bucket.variants].join(", ").slice(0, MAX_VARIANT_INFO_LENGTH)
        : null,
  }));
}

function isSameContent(
  stored: Array<{ productId: string; quantity: number; variantInfo: string | null }>,
  incoming: SyncItem[]
): boolean {
  if (stored.length !== incoming.length) return false;
  const storedMap = new Map(stored.map((item) => [item.productId, item]));
  return incoming.every((item) => {
    const match = storedMap.get(item.productId);
    return (
      match !== undefined &&
      match.quantity === item.quantity &&
      (match.variantInfo ?? null) === item.variantInfo
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    const limit = checkRateLimit(`cart-sync:${userId}`, RATE_LIMITS.cartSync);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderildi" },
        { status: 429, headers: { "Retry-After": String(limit.resetIn) } }
      );
    }

    const body = await request.json().catch(() => null);
    const items = normalizeItems((body as { items?: unknown } | null)?.items);

    const existingCart = await prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: { select: { productId: true, quantity: true, variantInfo: true } },
      },
    });

    // Sepet boşaldıysa satırı tamamen siliyoruz. Boş bir Cart satırı bırakmak,
    // terk edilmiş sepet sorgusunu (`items: { some: {} }`) etkilemese de
    // gereksiz kayıt biriktiriyor.
    if (items.length === 0) {
      if (existingCart) {
        await prisma.cart.delete({ where: { id: existingCart.id } });
      }
      return NextResponse.json({ synced: 0, changed: Boolean(existingCart) });
    }

    // Bundle'lar ayıklandıktan sonra bile silinmiş ürün kalabilir; yabancı
    // anahtar hatası almamak için varlık kontrolü yapılıyor.
    const knownProducts = await prisma.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: { id: true },
    });
    const knownIds = new Set(knownProducts.map((product) => product.id));
    const validItems = items.filter((item) => knownIds.has(item.productId));

    if (validItems.length === 0) {
      if (existingCart) {
        await prisma.cart.delete({ where: { id: existingCart.id } });
      }
      return NextResponse.json({ synced: 0, changed: Boolean(existingCart) });
    }

    // İçerik aynıysa hiçbir şey yazmıyoruz. Bu sadece performans değil, doğruluk
    // meselesi: terk edilmiş sepet tespiti `Cart.updatedAt`e bakıyor. Kullanıcı
    // her sayfa yenilemesinde senkron tetiklediği için, değişmeyen sepette de
    // yazsaydık terk zamanı sürekli ileriye kayar ve hiçbir sepet asla terk
    // edilmiş sayılmazdı.
    if (existingCart && isSameContent(existingCart.items, validItems)) {
      return NextResponse.json({ synced: validItems.length, changed: false });
    }

    await prisma.$transaction(async (tx) => {
      // `updatedAt` açıkça veriliyor: CartItem satırlarını değiştirmek Cart
      // satırının updatedAt'ini kendiliğinden güncellemiyor, terk tespiti ise
      // o alana bakıyor.
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: { updatedAt: new Date() },
        select: { id: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cartItem.createMany({
        data: validItems.map((item) => ({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          variantInfo: item.variantInfo,
        })),
      });
    });

    return NextResponse.json({ synced: validItems.length, changed: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Sepet kaydedilemedi" }, { status: 500 });
  }
}
