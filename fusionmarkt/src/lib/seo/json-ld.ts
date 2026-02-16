/**
 * FusionMarkt JSON-LD Structured Data
 * Google Rich Results için yapısal veri şemaları
 */

import { siteConfig } from "./config";

/**
 * Organization Schema - Şirket bilgileri
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.company.name,
    legalName: siteConfig.company.legalName,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/images/logo.svg`,
      width: "200",
      height: "60",
    },
    foundingDate: siteConfig.company.foundingDate,
    email: siteConfig.company.email,
    telephone: siteConfig.company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.company.address.streetAddress,
      addressLocality: siteConfig.company.address.addressLocality,
      addressRegion: siteConfig.company.address.addressRegion,
      postalCode: siteConfig.company.address.postalCode,
      addressCountry: siteConfig.company.address.addressCountry,
    },
    sameAs: [
      `https://twitter.com/${siteConfig.social.twitter.replace("@", "")}`,
      `https://facebook.com/${siteConfig.social.facebook}`,
      `https://instagram.com/${siteConfig.social.instagram}`,
      `https://youtube.com/${siteConfig.social.youtube}`,
      `https://linkedin.com/company/${siteConfig.social.linkedin}`,
    ],
  };
}

/**
 * WebSite Schema - Site arama özelliği
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    hasPart: [
      {
        "@type": "CreativeWork",
        name: siteConfig.resources.appManual.name,
        url: siteConfig.resources.appManual.url,
      },
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/magaza?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: siteConfig.language,
  };
}

/**
 * Product Schema - Ürün detay sayfası için (Google Rich Results optimized)
 */
export interface ProductSchemaParams {
  name: string;
  description?: string;
  image?: string | string[];
  price: number;
  discountPrice?: number;
  comparePrice?: number;
  currency?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  brand?: string;
  category?: string;
  inStock?: boolean;
  stockCount?: number;
  rating?: {
    value: number;
    count: number;
  };
  url: string;
  // Ek SEO alanları
  weight?: string;
  dimensions?: { width: string; height: string; depth: string };
  color?: string;
  material?: string;
  isBundle?: boolean;
}

export function generateProductSchema({
  name,
  description,
  image,
  price,
  discountPrice,
  comparePrice,
  currency = "TRY",
  sku,
  gtin,
  mpn,
  brand,
  category,
  inStock = true,
  stockCount,
  rating,
  url,
  weight,
  dimensions,
  color,
  material,
  isBundle = false,
}: ProductSchemaParams) {
  const images = Array.isArray(image) ? image : image ? [image] : [];
  const finalPrice = discountPrice || price;
  const originalPrice = comparePrice || price;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isBundle ? "ProductGroup" : "Product",
    "@id": `${siteConfig.url}${url}#product`,
    name,
    description: description || `${name} - Türkiye'nin güvenilir enerji marketi FusionMarkt'ta satışta. 2 yıl garanti, ücretsiz kargo.`,
    image: images,
    url: `${siteConfig.url}${url}`,
    brand: {
      "@type": "Brand",
      name: brand || siteConfig.name,
    },
    category,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}${url}`,
      priceCurrency: currency,
      price: finalPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 gün
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      // Kargo bilgisi
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      // İade politikası
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  // Ürün tanımlayıcıları
  if (sku) schema.sku = sku;
  if (gtin) schema.gtin13 = gtin;
  if (mpn) schema.mpn = mpn;
  
  // Stok bilgisi
  if (stockCount !== undefined && stockCount > 0) {
    (schema.offers as Record<string, unknown>).inventoryLevel = {
      "@type": "QuantitativeValue",
      value: stockCount,
    };
  }

  // Fiyat karşılaştırma (indirim gösterimi)
  if (originalPrice > finalPrice) {
    (schema.offers as Record<string, unknown>).priceSpecification = {
      "@type": "PriceSpecification",
      price: finalPrice,
      priceCurrency: currency,
      valueAddedTaxIncluded: true,
    };
  }

  // Fiziksel özellikler
  if (weight) {
    schema.weight = {
      "@type": "QuantitativeValue",
      value: weight,
      unitCode: "KGM",
    };
  }
  
  if (dimensions) {
    schema.depth = { "@type": "QuantitativeValue", value: dimensions.depth, unitCode: "CMT" };
    schema.width = { "@type": "QuantitativeValue", value: dimensions.width, unitCode: "CMT" };
    schema.height = { "@type": "QuantitativeValue", value: dimensions.height, unitCode: "CMT" };
  }

  if (color) schema.color = color;
  if (material) schema.material = material;

  // Rating
  if (rating && rating.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.value,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * BreadcrumbList Schema - Sayfa navigasyonu
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * FAQ Schema - SSS sayfası için
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Article Schema - Blog yazıları için
 */
export interface ArticleSchemaParams {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  url: string;
}

export function generateArticleSchema({
  title,
  description,
  image,
  author = siteConfig.creator,
  publishedAt,
  updatedAt,
  url,
}: ArticleSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}${url}#article`,
    headline: title,
    description,
    image: image ? `${siteConfig.url}${image}` : undefined,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${url}`,
    },
  };
}

/**
 * LocalBusiness Schema - Yerel işletme bilgisi
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.company.name,
    image: `${siteConfig.url}/images/logo.svg`,
    url: siteConfig.url,
    telephone: siteConfig.company.phone,
    email: siteConfig.company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.company.address.streetAddress,
      addressLocality: siteConfig.company.address.addressLocality,
      addressRegion: siteConfig.company.address.addressRegion,
      postalCode: siteConfig.company.address.postalCode,
      addressCountry: siteConfig.company.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.8956, // Ankara/Çankaya - Yıldızevler
      longitude: 32.8093,
    },
    priceRange: "₺₺₺",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };
}

/**
 * ItemList Schema - Kategori/Liste sayfaları için
 */
export interface ItemListParams {
  name: string;
  items: Array<{
    name: string;
    url: string;
    image?: string;
    price?: number;
  }>;
  url: string;
}

export function generateItemListSchema({ name, items, url }: ItemListParams) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${siteConfig.url}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        url: `${siteConfig.url}${item.url}`,
        image: item.image,
        offers: item.price
          ? {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "TRY",
            }
          : undefined,
      },
    })),
  };
}

/**
 * WebPage Schema - Ana sayfa ve genel sayfalar için
 */
export interface WebPageSchemaParams {
  name: string;
  description: string;
  url: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "FAQPage";
}

export function generateWebPageSchema(params: WebPageSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": params.type || "WebPage",
    "@id": `${siteConfig.url}${params.url}#webpage`,
    name: params.name,
    description: params.description,
    url: `${siteConfig.url}${params.url}`,
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: siteConfig.language,
  };
}

/**
 * HowTo Schema - Kullanım kılavuzları için
 */
export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface HowToSchemaParams {
  name: string;
  description?: string;
  image?: string;
  totalTime?: string; // ISO 8601 format, e.g., "PT30M"
  steps: HowToStep[];
  url: string;
}

export function generateHowToSchema({
  name,
  description,
  image,
  totalTime,
  steps,
  url,
}: HowToSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    image: image ? `${siteConfig.url}${image}` : undefined,
    totalTime,
    url: `${siteConfig.url}${url}`,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? `${siteConfig.url}${step.image}` : undefined,
    })),
  };
}

