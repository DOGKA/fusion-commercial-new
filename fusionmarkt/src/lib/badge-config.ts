/**
 * Badge System Configuration
 * 
 * Merkezi rozet sistemi ayarları.
 * Bu değerler hem frontend hem de admin panelinde kullanılır.
 */

// ============================================
// SYSTEM BADGE THRESHOLDS
// ============================================

/**
 * Low Stock Threshold
 * Stok bu değere eşit veya altındaysa "Son X adet" rozeti gösterilir.
 * Örnek: 5 = "Son 3 adet" (stok 3 ise)
 */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * New Product Days
 * Ürün bu gün sayısından daha yeni ise "Yeni" rozeti gösterilir.
 * Örnek: 30 = son 30 gün içinde oluşturulan ürünler "Yeni" olarak işaretlenir.
 */
export const NEW_PRODUCT_DAYS = 30;

// ============================================
// SYSTEM BADGE TYPES
// ============================================

export type SystemBadgeType = 
  | "DISCOUNT_PERCENT" 
  | "LOW_STOCK" 
  | "NEW_PRODUCT";

// ============================================
// SYSTEM BADGE STYLES
// ============================================

export const SYSTEM_BADGE_STYLES: Record<SystemBadgeType, { color: string; bgColor: string }> = {
  DISCOUNT_PERCENT: {
    color: "#FFFFFF",
    bgColor: "#EF4444", // Kırmızı - İndirim
  },
  LOW_STOCK: {
    color: "#FFFFFF", 
    bgColor: "#F59E0B", // Turuncu - Uyarı
  },
  NEW_PRODUCT: {
    color: "#FFFFFF",
    bgColor: "#22C55E", // Yeşil - Yeni
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * İndirim aktif mi kontrol eder.
 * 
 * Mevcut schema'da:
 * - price: Aktif satış fiyatı
 * - comparePrice: Orijinal fiyat (karşılaştırma fiyatı)
 * - saleEndDate: İndirim bitiş tarihi
 * 
 * Kural: comparePrice > price AND (saleEndDate == null OR saleEndDate >= now)
 */
export function isOnSale(
  price: number,
  comparePrice: number | null | undefined,
  saleEndDate: Date | string | null | undefined
): boolean {
  // comparePrice yoksa veya price'dan küçük/eşitse indirim yok
  if (!comparePrice || comparePrice <= price) {
    return false;
  }

  // saleEndDate yoksa süresiz indirim (aktif)
  if (!saleEndDate) {
    return true;
  }

  // saleEndDate varsa tarih kontrolü yap
  const endDate = typeof saleEndDate === "string" ? new Date(saleEndDate) : saleEndDate;
  const now = new Date();
  
  // Gün sonuna kadar geçerli olsun (23:59:59)
  endDate.setHours(23, 59, 59, 999);
  
  return endDate >= now;
}

/**
 * İndirim yüzdesini hesaplar.
 * 
 * Mevcut schema'da:
 * - price: Aktif satış fiyatı (indirimli)
 * - comparePrice: Orijinal fiyat
 * 
 * Yüzde = ((comparePrice - price) / comparePrice) * 100
 */
export function calculateDiscountPercent(
  price: number,
  comparePrice: number | null | undefined
): number {
  if (!comparePrice || comparePrice <= 0 || price <= 0 || price >= comparePrice) {
    return 0;
  }
  
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Ürünün "Yeni" olup olmadığını kontrol eder.
 */
export function isNewProduct(
  createdAt: Date | string | null | undefined,
  daysThreshold: number = NEW_PRODUCT_DAYS
): boolean {
  if (!createdAt) {
    return false;
  }

  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffTime = now.getTime() - created.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= daysThreshold;
}

/**
 * Stok düşük mü kontrol eder.
 */
export function isLowStock(
  stock: number | null | undefined,
  threshold: number = LOW_STOCK_THRESHOLD
): boolean {
  if (stock === null || stock === undefined) {
    return false;
  }
  
  // Stok 0 ise "Tükendi" durumu, low stock değil
  // Stok > 0 ve <= threshold ise low stock
  return stock > 0 && stock <= threshold;
}

// ============================================
// SYSTEM BADGE INTERFACE
// ============================================

export interface SystemBadge {
  type: SystemBadgeType;
  label: string;
  color: string;
  bgColor: string;
  isSystem: true; // Sistem rozeti olduğunu belirtir
  priority: number; // Sıralama önceliği (düşük = önce)
}

// ============================================
// GENERATE SYSTEM BADGES
// ============================================

interface ProductForBadges {
  price: number;
  comparePrice?: number | null;  // Orijinal fiyat (karşılaştırma fiyatı)
  saleEndDate?: Date | string | null;
  stock?: number | null;
  createdAt?: Date | string | null;
}

/**
 * Ürün verilerine göre sistem rozetlerini oluşturur.
 * Bu rozetler manuel değil, ürün özelliklerinden otomatik hesaplanır.
 * 
 * Schema:
 * - price: Aktif satış fiyatı
 * - comparePrice: Orijinal fiyat (eskiden salePrice olarak geçiyordu)
 * - saleEndDate: İndirim bitiş tarihi
 */
export function generateSystemBadges(product: ProductForBadges): SystemBadge[] {
  const badges: SystemBadge[] = [];
  
  // 1. İndirim Rozeti
  // comparePrice > price ise ve saleEndDate geçerli ise indirim aktif
  const saleActive = isOnSale(product.price, product.comparePrice, product.saleEndDate);
  if (saleActive && product.comparePrice) {
    const discountPercent = calculateDiscountPercent(product.price, product.comparePrice);
    if (discountPercent > 0) {
      badges.push({
        type: "DISCOUNT_PERCENT",
        label: `%${discountPercent} İndirim`,
        color: SYSTEM_BADGE_STYLES.DISCOUNT_PERCENT.color,
        bgColor: SYSTEM_BADGE_STYLES.DISCOUNT_PERCENT.bgColor,
        isSystem: true,
        priority: 1, // En önce indirim görünsün
      });
    }
  }
  
  // 2. Düşük Stok Rozeti
  if (isLowStock(product.stock)) {
    badges.push({
      type: "LOW_STOCK",
      label: `Son ${product.stock} adet`,
      color: SYSTEM_BADGE_STYLES.LOW_STOCK.color,
      bgColor: SYSTEM_BADGE_STYLES.LOW_STOCK.bgColor,
      isSystem: true,
      priority: 2,
    });
  }
  
  // 3. Yeni Ürün Rozeti
  if (isNewProduct(product.createdAt)) {
    badges.push({
      type: "NEW_PRODUCT",
      label: "Yeni",
      color: SYSTEM_BADGE_STYLES.NEW_PRODUCT.color,
      bgColor: SYSTEM_BADGE_STYLES.NEW_PRODUCT.bgColor,
      isSystem: true,
      priority: 3,
    });
  }
  
  // Priority'ye göre sırala (düşük önce)
  return badges.sort((a, b) => a.priority - b.priority);
}

/**
 * İndirim aktif mi kontrol eder ve döner.
 * 
 * Mevcut schema:
 * - price: Aktif satış fiyatı (zaten indirimli)
 * - comparePrice: Orijinal karşılaştırma fiyatı
 * - saleEndDate: İndirim bitiş tarihi
 * 
 * İndirim süresi geçmişse price değeri "normal fiyat" olarak işlenir,
 * comparePrice ignore edilir.
 */
export function isSaleActive(
  price: number,
  comparePrice: number | null | undefined,
  saleEndDate: Date | string | null | undefined
): boolean {
  return isOnSale(price, comparePrice, saleEndDate);
}

/**
 * Gösterilecek fiyat bilgilerini döner.
 * 
 * @returns {
 *   displayPrice: Gösterilecek fiyat
 *   originalPrice: Orijinal fiyat (indirim aktifse comparePrice, değilse null)
 *   discountPercent: İndirim yüzdesi (aktifse, değilse null)
 *   isDiscounted: İndirim aktif mi
 * }
 */
export function getPriceInfo(
  price: number,
  comparePrice: number | null | undefined,
  saleEndDate: Date | string | null | undefined
): {
  displayPrice: number;
  originalPrice: number | null;
  discountPercent: number | null;
  isDiscounted: boolean;
} {
  const saleActive = isOnSale(price, comparePrice, saleEndDate);
  
  if (saleActive && comparePrice) {
    return {
      displayPrice: price,
      originalPrice: comparePrice,
      discountPercent: calculateDiscountPercent(price, comparePrice),
      isDiscounted: true,
    };
  }
  
  // İndirim aktif değil veya süresi geçmiş
  return {
    displayPrice: price,
    originalPrice: null,
    discountPercent: null,
    isDiscounted: false,
  };
}
