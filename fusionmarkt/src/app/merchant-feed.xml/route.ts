/**
 * Google Merchant Center ürün feed'i (RSS 2.0 + g: namespace)
 *
 * Merchant Center, Google Shopping ve Shopping graph'ını besleyen yapay zekâ
 * yüzeyleri bu dosyayı günlük olarak çeker. Fiyat, stok ve kargo koşulları
 * ürün sayfasındaki JSON-LD ile birebir aynı kaynaktan üretilir; aksi halde
 * Merchant Center "price mismatch" uyarısı verir.
 */

import {
  BASE_URL,
  SHIPPING_POLICY,
  formatFeedPrice,
  getCatalog,
  type CatalogItem,
} from "@/lib/feed/catalog";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // XML 1.0'da geçersiz olan kontrol karakterleri feed'i tamamen bozar.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function tag(name: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

/** Merchant Center başlık sınırı 150 karakter. */
function trimTitle(title: string) {
  return title.length <= 150 ? title : `${title.slice(0, 147).trimEnd()}...`;
}

function buildItem(item: CatalogItem) {
  const hasIdentifier = Boolean(item.gtin || item.mpn);
  const parts = [
    tag("g:id", item.id),
    tag("g:title", trimTitle(item.title)),
    tag("g:description", item.description),
    tag("g:link", item.url),
    tag("g:image_link", item.image),
    ...item.additionalImages.map((url) => tag("g:additional_image_link", url)),
    tag("g:availability", item.availability),
    tag("g:condition", "new"),
    tag("g:brand", item.brand),
    tag("g:gtin", item.gtin),
    tag("g:mpn", item.mpn),
    hasIdentifier ? "" : tag("g:identifier_exists", "no"),
    tag("g:product_type", item.productType),
    tag("g:item_group_id", item.kind === "variant" ? item.groupId : null),
    tag("g:is_bundle", item.kind === "bundle" ? "yes" : null),
    tag("g:price", formatFeedPrice(item.listPrice ?? item.price)),
    item.listPrice ? tag("g:sale_price", formatFeedPrice(item.price)) : "",
    item.weightKg ? tag("g:shipping_weight", `${item.weightKg} kg`) : "",
    tag("g:min_handling_time", SHIPPING_POLICY.minHandlingDays),
    tag("g:max_handling_time", SHIPPING_POLICY.maxHandlingDays),
    `<g:shipping>${tag("g:country", SHIPPING_POLICY.country)}${tag("g:service", SHIPPING_POLICY.service)}${tag(
      "g:price",
      formatFeedPrice(SHIPPING_POLICY.price),
    )}${tag("g:min_transit_time", SHIPPING_POLICY.minTransitDays)}${tag(
      "g:max_transit_time",
      SHIPPING_POLICY.maxTransitDays,
    )}</g:shipping>`,
  ];

  if (item.variantValue && item.variantAxis) {
    parts.push(tag(item.variantAxis === "color" ? "g:color" : "g:size", item.variantValue));
  }

  return `<item>${parts.filter(Boolean).join("")}</item>`;
}

export async function GET() {
  let itemsXml = "";

  try {
    const catalog = await getCatalog();
    itemsXml = catalog.items.map(buildItem).join("");
  } catch (error) {
    // Feed'in tamamen kaybolması, Merchant Center'da tüm ürünlerin devre dışı
    // kalmasına yol açar. Boş ama geçerli bir feed dönmek daha az zararlı.
    console.error("Merchant feed: katalog okunamadı", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
${tag("title", `${siteConfig.name} Ürün Katalogu`)}
${tag("link", BASE_URL)}
${tag("description", siteConfig.description)}
${itemsXml}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
