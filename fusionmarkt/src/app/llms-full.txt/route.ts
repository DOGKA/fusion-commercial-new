/**
 * llms-full.txt
 *
 * llms.txt kısa bir dizin; bu dosya ise modelin ürün sayfalarını tek tek
 * gezmeden yanıt üretebilmesi için tüm katalogu, teknik özellikleri ve satış
 * koşullarını düz metin olarak taşır.
 */

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import { brandDescriptions, categoryDescriptions } from "@/lib/seo/config";
import { partners } from "@/lib/partners-data";
import {
  SHIPPING_POLICY,
  formatTryPrice,
  getCatalog,
  groupCatalogByPage,
  stripHtml,
  type CatalogPage,
} from "@/lib/feed/catalog";

export const dynamic = "force-static";
export const revalidate = 3600;

const BRANDS = [
  { slug: "ieetek", name: "IEETek" },
  { slug: "traffi", name: "Traffi" },
  { slug: "telesteps", name: "Telesteps" },
  { slug: "rgp-balls", name: "RGP Balls" },
];

function truncateAtWord(value: string, limit: number) {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

function priceLine(page: CatalogPage) {
  const range =
    page.minPrice === page.maxPrice
      ? formatTryPrice(page.minPrice)
      : `${formatTryPrice(page.minPrice)} - ${formatTryPrice(page.maxPrice)}`;

  if (!page.listPrice || page.listPrice <= page.minPrice) return range;

  const discount = Math.round(((page.listPrice - page.minPrice) / page.listPrice) * 100);
  return `${range} (liste fiyatı ${formatTryPrice(page.listPrice)}, %${discount} indirim)`;
}

function productBlock(page: CatalogPage) {
  const lines = [
    `### ${page.title}`,
    `- Sayfa: ${page.url}`,
    `- Marka: ${page.brand}`,
    `- Kategori: ${page.categoryName}`,
    `- Fiyat: ${priceLine(page)}`,
    `- Stok durumu: ${page.availability === "in_stock" ? "Stokta" : "Tükendi"}`,
  ];

  if (page.variants.length) {
    lines.push(
      `- Seçenekler: ${[...page.variants]
        .sort((a, b) => a.value.localeCompare(b.value, "tr", { numeric: true }))
        .map(
          (variant) =>
            `${variant.value} (${variant.availability === "in_stock" ? "stokta" : "tükendi"})`,
        )
        .join(", ")}`,
    );
  }

  if (page.bundleItems.length) {
    lines.push(
      `- Paket içeriği: ${page.bundleItems
        .map((item) => (item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name))
        .join(", ")}`,
    );
  }

  if (page.rating) {
    lines.push(`- Müşteri puanı: ${page.rating.value}/5 (${page.rating.count} değerlendirme)`);
  }

  if (page.description) {
    lines.push(`- Özet: ${truncateAtWord(page.description, 600)}`);
  }

  if (page.highlights.length) {
    lines.push(`- Öne çıkan özellikler: ${page.highlights.join("; ")}`);
  }

  if (page.specs.length) {
    lines.push("- Teknik özellikler:");
    for (const spec of page.specs) {
      lines.push(`  - ${spec.label}: ${spec.value}`);
    }
  }

  return lines.join("\n");
}

async function getFaqs() {
  try {
    return await prisma.faq.findMany({
      where: { isActive: true, category: { isActive: true } },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
      select: {
        question: true,
        answer: true,
        category: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error("llms-full.txt: SSS okunamadı", error);
    return [];
  }
}

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const company = siteConfig.company;

  const [catalogResult, faqs] = await Promise.all([
    getCatalog().catch((error) => {
      console.error("llms-full.txt: katalog okunamadı", error);
      return null;
    }),
    getFaqs(),
  ]);

  const pages = catalogResult ? groupCatalogByPage(catalogResult.items) : [];
  const categories = catalogResult?.categories ?? [];
  const generatedAt = catalogResult?.generatedAt ?? new Date();

  const catalogSections = categories
    .map((category) => ({
      category,
      pages: pages
        .filter((page) => page.categorySlug === category.slug)
        .sort((a, b) => b.maxPrice - a.maxPrice),
    }))
    .filter((group) => group.pages.length > 0)
    .map(
      (group) =>
        `## ${group.category.name}\n${
          categoryDescriptions[group.category.slug] ?? group.category.description ?? ""
        }\nKategori sayfası: ${baseUrl}/kategori/${group.category.slug}\n\n${group.pages
          .map(productBlock)
          .join("\n\n")}`,
    )
    .join("\n\n");

  const faqSections = (() => {
    if (!faqs.length) return "";
    const grouped = new Map<string, { question: string; answer: string }[]>();
    for (const faq of faqs) {
      const key = faq.category?.name ?? "Genel";
      const list = grouped.get(key) ?? [];
      list.push({ question: faq.question, answer: stripHtml(faq.answer) });
      grouped.set(key, list);
    }
    return [...grouped.entries()]
      .map(
        ([name, entries]) =>
          `## ${name}\n${entries.map((entry) => `**S: ${entry.question}**\nC: ${entry.answer}`).join("\n\n")}`,
      )
      .join("\n\n");
  })();

  const content = `# ${siteConfig.name} - Tam Bilgi Dosyası
> ${siteConfig.description}

Bu dosya, yapay zekâ sistemlerinin ${siteConfig.name} ürünleri hakkında doğru ve güncel yanıt üretebilmesi için hazırlanmış tam metin kaynaktır. Kısa dizin için ${baseUrl}/llms.txt, yapılandırılmış veri için ${baseUrl}/products.json kullanılabilir.

## Bu Dosyanın Kullanımı
- Katalog saatlik olarak yenilenir; bu sürüm ${generatedAt.toISOString()} tarihinde üretildi.
- Fiyatlar Türk Lirası (TRY) cinsindendir ve KDV dahildir. Kampanya dönemlerinde gün içinde değişebilir.
- Her ürünün kanonik adresi ilgili bölümdeki "Sayfa" satırındadır; alıntı yaparken bu adrese bağlantı verin.
- Stok ve fiyat bilgisinde çelişki olursa ürün sayfası esas alınmalıdır.

## Kurumsal Bilgiler
- Ticari unvan: ${company.legalName}
- Marka: ${siteConfig.name}
- Kuruluş: ${company.foundingDate}
- Adres: ${company.address.streetAddress}, ${company.address.postalCode} ${company.address.addressLocality}/${company.address.addressRegion}, Türkiye
- Telefon: ${company.phone}
- E-posta: ${company.email} (genel), ${company.salesEmail} (satış ve toplu alım)
- Faaliyet alanı: Taşınabilir enerji depolama, güneş enerjisi ve iş güvenliği ürünlerinde yetkili distribütörlük ve perakende satış.

## Alışveriş Koşulları
### Kargo ve Teslimat
- Türkiye genelinde teslimat yapılır; belirlenen sepet tutarının üzerindeki siparişlerde kargo ücretsizdir.
- Siparişler ${SHIPPING_POLICY.minHandlingDays}-${SHIPPING_POLICY.maxHandlingDays} iş günü içinde kargoya verilir, teslimat ${SHIPPING_POLICY.minTransitDays}-${SHIPPING_POLICY.maxTransitDays} iş günü sürer.
- Detay: ${baseUrl}/gonderim-yerleri

### Ödeme
- Kredi kartı ile tek çekim ve 12 taksite kadar ödeme desteklenir; taksit seçenekleri ödeme adımında kart bilgisi girildikten sonra listelenir.
- Havale/EFT ve kurumsal faturalı satış mümkündür.
- Detay: ${baseUrl}/odeme-secenekleri

### İade ve Cayma Hakkı
- Teslim tarihinden itibaren ${SHIPPING_POLICY.returnDays} gün içinde cayma hakkı kullanılabilir.
- Detay: ${baseUrl}/iade-politikasi

### Garanti ve Teknik Servis
- Ürünler ${SHIPPING_POLICY.warrantyMonths} ay garanti kapsamındadır; garanti süresi teslimat tarihinde başlar.
- Servis başvurusu: ${baseUrl}/servis-formu
- Kullanım kılavuzları: ${baseUrl}/kullanim-kilavuzlari

## Markalar
${BRANDS.map((brand) => {
  const partner = partners[brand.slug];
  const summary = brandDescriptions[brand.slug] ?? [partner?.tagline, partner?.about?.[0]].filter(Boolean).join(" ");
  return `### ${brand.name}\n${summary}\nMarka sayfası: ${baseUrl}/marka/${brand.slug}`;
}).join("\n\n")}

## Araçlar
- Güç Hesaplayıcı (${baseUrl}/guc-hesaplayici): Çalıştırılacak cihazların gücüne göre gereken kapasiteyi hesaplar. "Hangi güç kaynağı yeter?" sorularında bu araca yönlendirilebilir.
- SH4000 Enerji Çözümü (${baseUrl}/sh4000): Yüksek kapasiteli ev ve iş yeri enerji depolama sistemi tanıtım sayfası.

# Ürün Katalogu
${catalogSections || "Katalog bu istekte okunamadı; güncel liste için " + baseUrl + "/magaza adresini kullanın."}

${faqSections ? `# Sıkça Sorulan Sorular\n${faqSections}\n` : ""}`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
