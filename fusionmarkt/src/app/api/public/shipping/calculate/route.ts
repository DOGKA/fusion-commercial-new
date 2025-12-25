import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// ═══════════════════════════════════════════════════════════════
// SHIPPING CALCULATION API
// Sepet bazlı kargo seçenekleri hesaplama
// ═══════════════════════════════════════════════════════════════

// Varsayılan ayarlar (fallback)
const DEFAULT_FREE_SHIPPING_LIMIT = 2000;
const DEFAULT_SHIPPING_COST = 100;
const HEAVY_CLASS_SHIPPING_COST = 1000;

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  isFree: boolean;
  estimatedDays: string;
  type: "FREE_SHIPPING" | "FLAT_RATE";
}

interface ShippingCalculationResult {
  options: ShippingOption[];
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
  hasHeavyClass: boolean;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body as { items: CartItem[]; city?: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sepet boş" },
        { status: 400 }
      );
    }

    // Sepet toplamını hesapla
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Ürünlerin kargo bilgilerini al
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        freeShipping: true,
        shippingClass: true,
        weight: true,
      },
    });

    // Kargo ayarlarını veritabanından al
    const shippingSettings = await prisma.shippingSettings.findUnique({
      where: { id: "default" },
    });
    
    // Kargo sınıflarını veritabanından al (cost alanı dahil)
    const shippingClasses = await prisma.$queryRaw<Array<{slug: string; cost: number}>>`
      SELECT slug, cost FROM shipping_classes WHERE slug = 'standart-kargo' LIMIT 1
    `;
    const standartKargo = shippingClasses[0];
    
    // Değerleri ayarla (DB'den veya varsayılan)
    const freeShippingLimit = shippingSettings?.freeShippingLimit 
      ? Number(shippingSettings.freeShippingLimit) 
      : DEFAULT_FREE_SHIPPING_LIMIT;
    const standardShippingCost = standartKargo?.cost 
      ? Number(standartKargo.cost) 
      : DEFAULT_SHIPPING_COST;

    // ═══════════════════════════════════════════════════════════════
    // KARGO HESAPLAMA MANTIĞI
    // ═══════════════════════════════════════════════════════════════

    // 1. Ürünlerin kargo sınıflarını analiz et
    const hasLegacyFreeShipping = products.some(p => p.freeShipping === true);
    
    // Ağır sınıf kontrolü - string field ile
    const hasHeavyClass = products.some(p => 
      p.shippingClass === "agir-sinif-kargo" || 
      p.shippingClass?.includes("agir") ||
      (p.weight && Number(p.weight) >= 20) // 20kg ve üzeri ağır sınıf
    );
    
    // Ücretsiz kargo sınıfı kontrolü
    const hasFreeShippingClass = products.some(p => 
      p.shippingClass === "ucretsiz-kargo"
    );

    // 2. Ücretsiz kargo koşullarını kontrol et
    let hasFreeShipping = false;
    
    // a) Ürünün freeShipping flag'i true ise
    if (hasLegacyFreeShipping) {
      hasFreeShipping = true;
    }
    
    // b) Ücretsiz kargo sınıfında ürün varsa
    if (hasFreeShippingClass) {
      hasFreeShipping = true;
    }
    
    // c) Sepet toplamı ücretsiz kargo limitini geçtiyse
    if (cartTotal >= freeShippingLimit) {
      hasFreeShipping = true;
    }

    // NOT: Ağır sınıf ürünler ücretsiz kargoya DAHİL DEĞİL!
    // Ağır sınıf kendi kargo bedeli ile gider

    // Ücretsiz kargoya ne kadar kaldı
    const amountToFreeShipping = hasFreeShipping ? 0 : Math.max(0, freeShippingLimit - cartTotal);

    // ═══════════════════════════════════════════════════════════════
    // KARGO SEÇENEKLERİ OLUŞTUR
    // ═══════════════════════════════════════════════════════════════

    const options: ShippingOption[] = [];

    // Ağır sınıf varsa, özel kargo seçeneği
    if (hasHeavyClass) {
      options.push({
        id: "heavy-shipping",
        name: "Ağır Sınıf Kargo",
        description: "Büyük/ağır ürünler için özel teslimat",
        cost: HEAVY_CLASS_SHIPPING_COST,
        isFree: false,
        estimatedDays: "3-5 iş günü",
        type: "FLAT_RATE",
      });
    }

    // Kargo seçenekleri (ağır sınıf yoksa)
    if (!hasHeavyClass) {
      if (hasFreeShipping) {
        // Ücretsiz Kargo (2000 TL üzeri)
        options.push({
          id: "free-shipping",
          name: "Ücretsiz Kargo",
          description: "", // TODO: Kullanıcı belirleyecek
          cost: 0,
          isFree: true,
          estimatedDays: "",
          type: "FREE_SHIPPING",
        });
      } else {
        // Standart Kargo (2000 TL altı - ücretli)
        options.push({
          id: "standard-shipping",
          name: "Standart Kargo",
          description: "", // TODO: Kullanıcı belirleyecek
          cost: standardShippingCost,
          isFree: false,
          estimatedDays: "",
          type: "FLAT_RATE",
        });
      }
    }

    // Sonuç mesajı
    let message: string | undefined;
    
    if (hasHeavyClass) {
      message = "Sepetinizde ağır sınıf ürün bulunmaktadır. Özel teslimat uygulanacaktır.";
    } else if (!hasFreeShipping && amountToFreeShipping > 0) {
      message = `${formatPrice(amountToFreeShipping)} daha ekle, ücretsiz kargo kazan!`;
    }

    const result: ShippingCalculationResult = {
      options,
      freeShippingThreshold: freeShippingLimit,
      amountToFreeShipping,
      hasFreeShipping: hasFreeShipping && !hasHeavyClass, // Ağır sınıf varsa ücretsiz kargo yok
      hasHeavyClass,
      message,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Kargo hesaplanamadı" },
      { status: 500 }
    );
  }
}

// Para formatı
function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
