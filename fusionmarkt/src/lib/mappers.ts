/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { Product, ProductVariant, ProductBadge } from "@/components/ui/ProductCard";
import {
  isOnSale,
  calculateDiscountPercent,
  generateSystemBadges,
  LOW_STOCK_THRESHOLD,
} from "./badge-config";

const isColorAttribute = (attribute: any) => {
  const slug = (attribute?.slug || "").toLowerCase();
  const name = (attribute?.name || "").toLowerCase();
  const type = attribute?.type;
  const displayType = attribute?.displayType;

  return (
    type === "COLOR" ||
    displayType === "COLOR_SWATCH" ||
    slug.includes("renk") ||
    name.includes("renk") ||
    slug.includes("color") ||
    name.includes("color")
  );
};

// Check if a string looks like a color value or color name
const isColorLike = (str: string): boolean => {
  if (!str) return false;
  const lower = str.toLowerCase();
  
  // Color keywords
  const colorNames = [
    "renk", "color", "beyaz", "siyah", "kırmızı", "mavi", "yeşil", "sarı",
    "turuncu", "mor", "pembe", "gri", "kahve", "lacivert", "turkuaz",
    "white", "black", "red", "blue", "green", "yellow", "orange", "purple",
    "pink", "gray", "grey", "brown", "navy", "turquoise", "cyan", "magenta"
  ];
  
  return colorNames.some(c => lower.includes(c));
};

// Parse combinationKey like "renk:beyaz|beden:l" into attribute-value pairs
const parseCombinationKey = (combinationKey: string): Array<{ attr: string; value: string }> => {
  if (!combinationKey) return [];
  
  return combinationKey.split("|").map(pair => {
    const [attr, value] = pair.split(":");
    return { attr: attr?.trim() || "", value: value?.trim() || "" };
  }).filter(p => p.attr && p.value);
};

const mapApiVariantsToCardVariants = (apiProduct: any): ProductVariant[] => {
  const variants: ProductVariant[] = [];
  const seen = new Map<string, ProductVariant>();

  (apiProduct?.variants || []).forEach((variant: any) => {
    const variantInStock = (variant?.stock ?? 0) > 0 && variant?.isActive !== false;
    const variantImage = variant?.image;

    // First try variantOptions (proper attribute-value relations)
    const variantOptions = variant?.variantOptions || [];
    
    if (variantOptions.length > 0) {
      variantOptions.forEach((opt: any) => {
        const attribute = opt?.attribute;
        const attributeValue = opt?.attributeValue;
        if (!attribute || !attributeValue) return;

        const key = `${attribute.id}-${attributeValue.id}`;
        const label = attributeValue.name || attributeValue.value || attribute.name || "";
        const isColor = isColorAttribute(attribute);
        const colorValue = attributeValue.color || attributeValue.value || null;
        const imageValue = attributeValue.image || variantImage || null;

        if (seen.has(key)) {
          const existing = seen.get(key)!;
          existing.inStock = existing.inStock || variantInStock;
          if (!existing.color && colorValue) existing.color = colorValue;
          if (!existing.image && imageValue) existing.image = imageValue;
          return;
        }

        const cardVariant: ProductVariant = {
          id: key,
          name: label,
          type: isColor ? "color" : "size",
          value: label,
          inStock: variantInStock,
          color: colorValue || undefined,
          image: imageValue || undefined,
        };

        seen.set(key, cardVariant);
        variants.push(cardVariant);
      });
    } else {
      // Fallback: parse combinationKey for simple variants without ProductVariantOption records
      const combinationKey = variant?.combinationKey || "";
      const variantName = variant?.name || "";
      const variantType = variant?.type || "";
      const variantValue = variant?.value || "";
      
      // Use value field directly (new system with displayValue/colorCode)
      // Or fallback to parsing combinationKey
      const variantColorCode = variant?.colorCode || "";
      
      if (variantValue) {
        // Direct value usage (preferred - new system)
        const key = `${variant.id}-direct`;
        
        if (!seen.has(key)) {
          const isColor = !!variantColorCode || variantType?.toLowerCase() === "color" || isColorLike(variantValue);
          const displayValue = variantValue.charAt(0).toUpperCase() + variantValue.slice(1);
          
          const cardVariant: ProductVariant = {
            id: variant.id,
            name: displayValue,
            type: isColor ? "color" : "size",
            value: displayValue,
            inStock: variantInStock,
            color: variantColorCode || undefined,
            image: variantImage || undefined,
          };
          
          seen.set(key, cardVariant);
          variants.push(cardVariant);
        }
      } else if (variantName) {
        // Fallback to name field
        const key = `${variant.id}-name`;
        
        if (!seen.has(key)) {
          const isColor = !!variantColorCode || variantType?.toLowerCase() === "color" || isColorLike(variantName);
          const displayValue = variantName.charAt(0).toUpperCase() + variantName.slice(1);
          
          const cardVariant: ProductVariant = {
            id: variant.id,
            name: displayValue,
            type: isColor ? "color" : "size",
            value: displayValue,
            inStock: variantInStock,
            color: variantColorCode || undefined,
            image: variantImage || undefined,
          };
          
          seen.set(key, cardVariant);
          variants.push(cardVariant);
        }
      }
    }
  });

  return variants;
};

/**
 * Maps API product response to ProductCard interface
 * 
 * IMPORTANT: saleEndDate kontrolü yapılır.
 * İndirim süresi geçmişse comparePrice dikkate alınmaz.
 * 
 * Mevcut Schema:
 * - price: Aktif satış fiyatı (indirimli)
 * - comparePrice: Orijinal karşılaştırma fiyatı
 * - saleEndDate: İndirim bitiş tarihi
 */
export function mapApiProductToCard(apiProduct: any): Product {
  // Sadece VARIABLE tipindeki ürünlerde varyantları göster
  const isVariableProduct = apiProduct.productType === "VARIABLE";
  const mappedVariants = isVariableProduct ? mapApiVariantsToCardVariants(apiProduct) : [];

  // ============================================
  // SALE PRICE LOGIC - saleEndDate kontrolü
  // ============================================
  const price = Number(apiProduct.price) || 0;
  const comparePrice = apiProduct.comparePrice ? Number(apiProduct.comparePrice) : null;
  const saleEndDate = apiProduct.saleEndDate ?? null;
  
  // İndirim aktif mi kontrol et
  // comparePrice > price VE (saleEndDate null VEYA saleEndDate >= now)
  const saleActive = isOnSale(price, comparePrice, saleEndDate);
  
  // Gösterilecek fiyat = her zaman price (zaten indirimli fiyat)
  const displayPrice = price;
  
  // Orijinal fiyat = indirim aktifse comparePrice, değilse null
  const originalPrice = saleActive && comparePrice && comparePrice > price 
    ? comparePrice 
    : null;
  
  // İndirim yüzdesi (sadece indirim aktifse)
  const discountPercent = saleActive && comparePrice
    ? calculateDiscountPercent(price, comparePrice)
    : null;

  // ============================================
  // BADGES - Manuel + Sistem Rozetleri
  // ============================================
  
  // 1. Manuel rozetler (admin tarafından atanan)
  const manualBadges: ProductBadge[] = apiProduct.productBadges && Array.isArray(apiProduct.productBadges)
    ? apiProduct.productBadges
        .filter((pb: any) => pb.badge && pb.badge.label)
        .map((pb: any) => ({
          label: pb.badge.label,
          color: pb.badge.color || "#FFFFFF",
          bgColor: pb.badge.bgColor || "#22C55E",
          icon: pb.badge.icon || null,
        }))
    : [];

  // 2. Sistem rozetleri (otomatik hesaplanan)
  const systemBadges = generateSystemBadges({
    price: price,
    comparePrice: saleActive ? comparePrice : null, // Sadece indirim aktifse
    saleEndDate: saleEndDate,
    stock: apiProduct.stock,
    createdAt: apiProduct.createdAt,
  });

  // Sistem rozetlerini ProductBadge formatına dönüştür
  const systemBadgesFormatted: ProductBadge[] = systemBadges.map(sb => ({
    label: sb.label,
    color: sb.color,
    bgColor: sb.bgColor,
    icon: null,
  }));

  // Tüm rozetleri birleştir: Sistem rozetleri önce, sonra manuel
  const allBadges = [...systemBadgesFormatted, ...manualBadges];

  // ============================================
  // STOCK STATUS
  // ============================================
  const stock = apiProduct.stock ?? apiProduct.stockQuantity ?? 0;
  const stockStatus = stock > LOW_STOCK_THRESHOLD 
    ? "in_stock" 
    : stock > 0 
      ? "low_stock" 
      : "out_of_stock";

  return {
    id: apiProduct.id,
    slug: apiProduct.slug || "",
    title: apiProduct.name || apiProduct.title || "Ürün",
    subtitle: apiProduct.shortDescription || apiProduct.subtitle || undefined,
    videoLabel: apiProduct.videoUrl ? "Videolu Ürün" : undefined,
    brand: apiProduct.brand || "",
    price: displayPrice,
    originalPrice: originalPrice,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : null,
    stockStatus,
    stockQuantity: stock,
    ratingAverage: apiProduct.ratingAverage || 0,
    ratingCount: apiProduct.ratingCount || apiProduct._count?.reviews || 0,
    freeShipping: apiProduct.freeShipping || false,
    image: apiProduct.thumbnail || apiProduct.image || (apiProduct.images?.[0]) || undefined,
    // Badges array (sistem + manuel birleşik)
    badges: allBadges.length > 0 ? allBadges : undefined,
    // Legacy badge desteği artık kullanılmıyor
    badge: undefined,
    variants: mappedVariants.length ? mappedVariants : undefined,
  };
}

/**
 * Maps array of API products to ProductCard array
 */
export function mapApiProductsToCards(apiProducts: any[]): Product[] {
  if (!Array.isArray(apiProducts)) return [];
  return apiProducts.map(mapApiProductToCard);
}
