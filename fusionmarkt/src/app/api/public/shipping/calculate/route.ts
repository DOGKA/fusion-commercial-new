import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { calculateShippingCost } from "@/lib/order-pricing";

// ═══════════════════════════════════════════════════════════════
// SHIPPING CALCULATION API
// Sepet bazlı kargo seçenekleri hesaplama
// ═══════════════════════════════════════════════════════════════
//
// Bedelin kendisi `lib/order-pricing.ts`'te hesaplanıyor. Sebebi: sipariş
// oluşturulurken kargo bedeli sunucuda yeniden hesaplanıyor (istemciden gelen
// tutara güvenilmiyor) ve iki hesabın birbirinden sapması, müşteriye gösterilen
// bedelle tahsil edilenin farklı olması demek olurdu. Bu uç yalnızca sonucu
// arayüzün beklediği "seçenek listesi" şekline çeviriyor.

// Varsayılan ayar (yalnızca sepet boşken dönen eşik için)
const DEFAULT_FREE_SHIPPING_LIMIT = 2000;

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ShippingOption {
  id: string;
  name: string;
  /**
   * Opsiyonel: ödeme sayfası bu alanı **çizmiyor** (kendi yerel tipinde bile
   * yok). Yalnızca ağır sınıf seçeneğinde, neden farklı bir bedel çıktığını
   * açıklamak için doldruluyor. Standart/ücretsiz kargoda müşteriye sunulan bir
   * seçim olmadığı için yazılacak bir şey de yok — kargo firmasını biz
   * seçiyoruz, teslim süresi beyanı ise `/gonderim-yerleri` sayfasında.
   */
  description?: string;
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
    const { items, cartTotal: providedCartTotal } = body as { 
      items?: CartItem[]; 
      city?: string;
      cartTotal?: number; // Tam sepet toplamı (bundle dahil)
    };

    // cartTotal gönderilmişse items boş olabilir (bundle-only sepet)
    const hasItems = items && Array.isArray(items) && items.length > 0;
    const hasCartTotal = typeof providedCartTotal === 'number' && providedCartTotal > 0;

    // Items ve cartTotal yoksa sadece threshold bilgisini döndür (settings için)
    if (!hasItems && !hasCartTotal) {
      // Kargo ayarlarını al
      const shippingSettings = await prisma.shippingSettings.findUnique({
        where: { id: "default" },
      });
      const freeShippingLimit = shippingSettings?.freeShippingLimit 
        ? Number(shippingSettings.freeShippingLimit) 
        : DEFAULT_FREE_SHIPPING_LIMIT;
      
      return NextResponse.json({
        options: [],
        freeShippingThreshold: freeShippingLimit,
        amountToFreeShipping: freeShippingLimit,
        hasFreeShipping: false,
        hasHeavyClass: false,
        message: null,
      });
    }

    // Sepet toplamını hesapla - cartTotal gönderilmişse onu kullan (bundle dahil toplam)
    const itemsTotal = hasItems 
      ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
      : 0;
    const cartTotal = providedCartTotal || itemsTotal;

    const productIds = hasItems ? items.map(item => item.productId) : [];

    const {
      cost: shippingCost,
      freeShippingLimit,
      hasHeavyClass,
      hasFreeShipping,
    } = await calculateShippingCost(productIds, cartTotal);

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
        cost: shippingCost,
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
          cost: shippingCost,
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
