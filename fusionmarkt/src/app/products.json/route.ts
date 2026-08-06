/**
 * Yapay zekâ sistemleri için makine okunabilir ürün katalogu
 *
 * Perplexity, ChatGPT arama ve benzeri yüzeyler ürün sorularını yanıtlarken
 * HTML ayrıştırmak yerine yapılandırılmış veriyi tercih ediyor. Bu uç nokta
 * schema.org `ItemList` biçiminde tüm katalogu tek istekte verir; teknik
 * özellikler `additionalProperty` olarak taşındığı için "3000 W üstü güç
 * kaynağı" gibi sorular sayfa gezmeden yanıtlanabilir.
 */

import {
  BASE_URL,
  CURRENCY,
  SHIPPING_POLICY,
  getCatalog,
  type CatalogItem,
} from "@/lib/feed/catalog";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

const AVAILABILITY_SCHEMA: Record<CatalogItem["availability"], string> = {
  in_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
};

function buildProduct(item: CatalogItem) {
  return {
    "@type": "Product",
    "@id": `${item.url}#${item.id}`,
    name: item.title,
    description: item.description,
    url: item.url,
    sku: item.sku ?? item.id,
    ...(item.gtin ? { gtin: item.gtin } : {}),
    ...(item.mpn ? { mpn: item.mpn } : {}),
    brand: { "@type": "Brand", name: item.brand },
    category: item.productType,
    ...(item.image ? { image: [item.image, ...item.additionalImages] } : {}),
    ...(item.weightKg
      ? { weight: { "@type": "QuantitativeValue", value: item.weightKg, unitCode: "KGM" } }
      : {}),
    ...(item.variantValue
      ? { [item.variantAxis === "color" ? "color" : "size"]: item.variantValue }
      : {}),
    ...(item.kind === "bundle" && item.bundleItems.length
      ? {
          isRelatedTo: item.bundleItems.map((bundleItem) => ({
            "@type": "Product",
            name: bundleItem.name,
            ...(bundleItem.quantity > 1 ? { additionalProperty: [{ "@type": "PropertyValue", name: "Adet", value: bundleItem.quantity }] } : {}),
          })),
        }
      : {}),
    ...(item.specs.length
      ? {
          additionalProperty: item.specs.map((spec) => ({
            "@type": "PropertyValue",
            name: spec.label,
            value: spec.value,
            ...(spec.group ? { disambiguatingDescription: spec.group } : {}),
          })),
        }
      : {}),
    ...(item.highlights.length ? { positiveNotes: item.highlights } : {}),
    ...(item.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: item.rating.value,
            reviewCount: item.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: item.url,
      priceCurrency: CURRENCY,
      price: item.price,
      ...(item.listPrice
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/ListPrice",
              price: item.listPrice,
              priceCurrency: CURRENCY,
            },
          }
        : {}),
      availability: AVAILABILITY_SCHEMA[item.availability],
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteConfig.name, url: BASE_URL },
    },
  };
}

export async function GET() {
  let items: CatalogItem[] = [];
  let categories: { name: string; slug: string; productCount: number }[] = [];
  let generatedAt = new Date();

  try {
    const catalog = await getCatalog();
    items = catalog.items;
    categories = catalog.categories
      .filter((category) => category.productCount > 0)
      .map(({ name, slug, productCount }) => ({ name, slug, productCount }));
    generatedAt = catalog.generatedAt;
  } catch (error) {
    console.error("Ürün katalogu JSON: katalog okunamadı", error);
  }

  const payload = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} ürün katalogu`,
    description:
      "FusionMarkt kataloğundaki satıştaki tüm ürünlerin fiyat, stok ve teknik özellik bilgileri. Bu dosya makineler için hazırlanmıştır; alıntı yaparken ürün sayfasına bağlantı verin.",
    url: `${BASE_URL}/products.json`,
    numberOfItems: items.length,
    dateModified: generatedAt.toISOString(),
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.company.legalName,
      url: BASE_URL,
      email: siteConfig.company.email,
      telephone: siteConfig.company.phone,
    },
    inLanguage: siteConfig.language,
    // Kanonik kaynak, güncellik ve alıntı kuralları modeller için burada.
    usageInfo: {
      canonicalSource: "Her ürünün kanonik sayfası `url` alanındadır; alıntılarken bu adrese bağlantı verin.",
      freshness: "Katalog saatlik yenilenir. Fiyat ve stok kampanyalarda gün içinde değişebilir.",
      currency: CURRENCY,
      shipping: `Türkiye geneli ücretsiz kargo, ${SHIPPING_POLICY.minHandlingDays}-${SHIPPING_POLICY.maxHandlingDays} iş günü hazırlık, ${SHIPPING_POLICY.minTransitDays}-${SHIPPING_POLICY.maxTransitDays} iş günü teslimat.`,
      returns: `${SHIPPING_POLICY.returnDays} gün cayma hakkı, ${SHIPPING_POLICY.warrantyMonths} ay garanti.`,
      relatedFeeds: {
        merchantFeed: `${BASE_URL}/merchant-feed.xml`,
        llms: `${BASE_URL}/llms.txt`,
        llmsFull: `${BASE_URL}/llms-full.txt`,
        sitemap: `${BASE_URL}/sitemap.xml`,
      },
    },
    categories,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildProduct(item),
    })),
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, follow",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
