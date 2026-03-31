import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

interface CartItemInput {
  productId: string;
  quantity: number;
  price: number;
  variant?: { id: string; value?: string };
  isBundle?: boolean;
  bundleId?: string;
}

interface ValidationError {
  type: "OUT_OF_STOCK" | "PRICE_CHANGED" | "PRODUCT_INACTIVE" | "COUPON_INVALID" | "SHIPPING_CHANGED";
  productId?: string;
  message: string;
  currentValue?: number;
  expectedValue?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, couponCode, shippingOptionId, cartTotal } = body as {
      items: CartItemInput[];
      couponCode?: string;
      shippingOptionId?: string;
      cartTotal?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ valid: false, errors: [{ type: "OUT_OF_STOCK", message: "Sepet boş" }] }, { status: 400 });
    }

    const errors: ValidationError[] = [];
    const correctedItems: (CartItemInput & { correctedPrice?: number; currentStock?: number; productName?: string })[] = [];

    const productIds = items.filter(i => !i.isBundle).map(i => i.productId);
    const products = await (prisma.product as any).findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        stock: true,
        isActive: true,
      },
    });
    const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

    const variantIds = items.filter(i => i.variant?.id).map(i => i.variant!.id);
    let variantMap = new Map<string, any>();
    if (variantIds.length > 0) {
      const variants = await (prisma.productVariant as any).findMany({
        where: { id: { in: variantIds } },
        select: { id: true, stock: true, price: true, isActive: true },
      });
      variantMap = new Map(variants.map((v: any) => [v.id, v]));
    }

    let recalculatedSubtotal = 0;

    for (const item of items) {
      if (item.isBundle) {
        recalculatedSubtotal += item.price * item.quantity;
        correctedItems.push(item);
        continue;
      }

      const product = productMap.get(item.productId);
      if (!product) {
        errors.push({ type: "PRODUCT_INACTIVE", productId: item.productId, message: "Ürün bulunamadı" });
        continue;
      }

      if (!product.isActive) {
        errors.push({ type: "PRODUCT_INACTIVE", productId: item.productId, message: `"${product.name}" artık satışta değil` });
        continue;
      }

      if (item.variant?.id) {
        const variant = variantMap.get(item.variant.id);
        if (!variant || !variant.isActive) {
          errors.push({ type: "PRODUCT_INACTIVE", productId: item.productId, message: `"${product.name}" seçili varyant artık mevcut değil` });
          continue;
        }
        if (variant.stock < item.quantity) {
          errors.push({
            type: "OUT_OF_STOCK",
            productId: item.productId,
            message: `"${product.name}" için yeterli stok yok (Mevcut: ${variant.stock})`,
            currentValue: variant.stock,
            expectedValue: item.quantity,
          });
        }
      } else {
        if (product.stock < item.quantity) {
          errors.push({
            type: "OUT_OF_STOCK",
            productId: item.productId,
            message: `"${product.name}" için yeterli stok yok (Mevcut: ${product.stock})`,
            currentValue: product.stock,
            expectedValue: item.quantity,
          });
        }
      }

      const dbPrice = Number(product.price);
      const dbComparePrice = product.comparePrice ? Number(product.comparePrice) : null;
      const effectivePrice = dbPrice;

      if (Math.abs(effectivePrice - item.price) > 0.01) {
        errors.push({
          type: "PRICE_CHANGED",
          productId: item.productId,
          message: `"${product.name}" fiyatı değişti`,
          currentValue: effectivePrice,
          expectedValue: item.price,
        });
        correctedItems.push({ ...item, correctedPrice: effectivePrice, productName: product.name });
        recalculatedSubtotal += effectivePrice * item.quantity;
      } else {
        correctedItems.push(item);
        recalculatedSubtotal += item.price * item.quantity;
      }
    }

    if (couponCode) {
      const coupon = await (prisma.coupon as any).findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon || !coupon.isActive) {
        errors.push({ type: "COUPON_INVALID", message: "Kupon artık geçerli değil" });
      } else {
        const now = new Date();
        if (coupon.endDate && new Date(coupon.endDate) < now) {
          errors.push({ type: "COUPON_INVALID", message: "Kuponun süresi dolmuş" });
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          errors.push({ type: "COUPON_INVALID", message: "Kupon kullanım limitine ulaşmış" });
        }
      }
    }

    const hasBlockingErrors = errors.some(e => e.type === "OUT_OF_STOCK" || e.type === "PRODUCT_INACTIVE");

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      correctedItems: errors.some(e => e.type === "PRICE_CHANGED") ? correctedItems : undefined,
      recalculatedSubtotal: Math.round(recalculatedSubtotal * 100) / 100,
      canProceedWithWarnings: !hasBlockingErrors && errors.length > 0,
    });
  } catch (error) {
    console.error("Checkout validate error:", error);
    return NextResponse.json({ valid: false, errors: [{ type: "PRODUCT_INACTIVE", message: "Doğrulama başarısız" }] }, { status: 500 });
  }
}
