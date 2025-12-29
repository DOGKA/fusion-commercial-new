import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItem {
  productId: string;
  categoryId?: string;
  quantity: number;
  price: number;
  salePrice?: number;
}

// POST - Kupon doğrula
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cartTotal, cartItems } = body;

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { valid: false, error: "Kupon kodu giriniz" },
        { status: 400 }
      );
    }

    // Kuponu bul
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Geçersiz kupon kodu" },
        { status: 400 }
      );
    }

    // Kupon aktif mi?
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon artık geçerli değil" },
        { status: 400 }
      );
    }

    // Süre kontrolü
    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { valid: false, error: "Bu kuponun süresi dolmuş" },
        { status: 400 }
      );
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon henüz geçerli değil" },
        { status: 400 }
      );
    }

    // Kullanım limiti kontrolü
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: "Bu kupon kullanım limitine ulaşmış" },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KATEGORİ VE ÜRÜN KONTROLÜ
    // ═══════════════════════════════════════════════════════════════════════════

    // Sepet ürünlerini veritabanından çek (kategori bilgisi için)
    let eligibleTotal = cartTotal || 0;
    let eligibleItems: CartItem[] = cartItems || [];

    // Kupon kısıtlama alanlarını al (type assertion - prisma generate sonrası düzelir)
    const couponData = coupon as typeof coupon & {
      allowedCategories?: string[];
      excludedCategories?: string[];
      allowedProducts?: string[];
      excludedProducts?: string[];
      excludeSaleItems?: boolean;
      freeShipping?: boolean;
    };

    if (cartItems && cartItems.length > 0) {
      const productIds = cartItems.map((item: CartItem) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { 
          id: true, 
          categoryId: true,
          comparePrice: true,
          price: true,
        },
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      // Her ürün için uygunluk kontrolü
      eligibleItems = [];
      eligibleTotal = 0;

      for (const item of cartItems as CartItem[]) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        const categoryId = product.categoryId;
        // comparePrice varsa ve price'dan büyükse ürün indirimde demek
        const isOnSale = product.comparePrice && Number(product.comparePrice) > Number(product.price);

        // İndirimli ürün kontrolü
        if (couponData.excludeSaleItems && isOnSale) {
          continue; // İndirimli ürünleri atla
        }

        // Kategori kısıtlaması kontrolü
        const allowedCategories = couponData.allowedCategories || [];
        const excludedCategories = couponData.excludedCategories || [];

        // İzin verilen kategoriler varsa kontrol et
        if (allowedCategories.length > 0 && categoryId) {
          if (!allowedCategories.includes(categoryId)) {
            continue; // Bu kategori izin verilenler listesinde değil
          }
        }

        // Hariç tutulan kategoriler kontrolü
        if (excludedCategories.length > 0 && categoryId) {
          if (excludedCategories.includes(categoryId)) {
            continue; // Bu kategori hariç tutulanlar listesinde
          }
        }

        // Ürün kısıtlaması kontrolü
        const allowedProducts = couponData.allowedProducts || [];
        const excludedProducts = couponData.excludedProducts || [];

        // İzin verilen ürünler varsa kontrol et
        if (allowedProducts.length > 0) {
          if (!allowedProducts.includes(item.productId)) {
            continue; // Bu ürün izin verilenler listesinde değil
          }
        }

        // Hariç tutulan ürünler kontrolü
        if (excludedProducts.length > 0) {
          if (excludedProducts.includes(item.productId)) {
            continue; // Bu ürün hariç tutulanlar listesinde
          }
        }

        // Ürün uygun - toplama ekle
        const itemPrice = item.salePrice || item.price;
        eligibleItems.push(item);
        eligibleTotal += itemPrice * item.quantity;
      }
    }

    // Uygun ürün yoksa
    if (eligibleItems.length === 0 && cartItems && cartItems.length > 0) {
      return NextResponse.json(
        { 
          valid: false, 
          error: "Bu kupon sepetinizdeki ürünler için geçerli değil" 
        },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════

    // Minimum tutar kontrolü (uygun ürünler üzerinden)
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    
    if (minAmount > 0 && eligibleTotal < minAmount) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Bu kupon minimum ${minAmount.toLocaleString("tr-TR")} ₺ alışverişlerde geçerlidir` 
        },
        { status: 400 }
      );
    }

    // İndirim hesapla (uygun ürünler üzerinden)
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (eligibleTotal * Number(coupon.discountValue)) / 100;
      // Maksimum indirim kontrolü
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      // FIXED
      discount = Number(coupon.discountValue);
    }

    // İndirim uygun tutar geçemez
    if (discount > eligibleTotal) {
      discount = eligibleTotal;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        discount: Math.round(discount * 100) / 100,
        description: coupon.description,
        freeShipping: couponData.freeShipping || false,
        // Uygunluk bilgisi
        eligibleTotal: Math.round(eligibleTotal * 100) / 100,
        eligibleItemCount: eligibleItems.length,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, error: "Kupon doğrulanamadı" },
      { status: 500 }
    );
  }
}
