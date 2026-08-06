import { siteConfig } from "@/lib/seo";
import {
  formatTryPrice,
  getCatalog,
  groupCatalogByPage,
  type CatalogPage,
} from "@/lib/feed/catalog";

export const dynamic = "force-static";
export const revalidate = 3600;

// llms.txt kısa bir dizin olmalı; ürün başına tek satır ve en ayırt edici
// iki teknik değer yeterli. Ayrıntı llms-full.txt'te.
const HEADLINE_SPECS = [
  /batarya kapasitesi|kapasite/i,
  /ac çıkış|çıkış gücü|güç/i,
  /panel gücü|maksimum güç/i,
  /kesilme|koruma seviyesi|en 388/i,
  /uzunluk|maksimum boy|çalışma yüksekliği/i,
];

function headlineSpecs(page: CatalogPage) {
  const picked: string[] = [];
  const seen = new Set<string>();
  for (const pattern of HEADLINE_SPECS) {
    const spec = page.specs.find((entry) => pattern.test(entry.label));
    // Değer tek başına anlamsız olabiliyor ("3.8"), etiketle birlikte veriliyor.
    if (spec && !seen.has(spec.label)) {
      seen.add(spec.label);
      picked.push(`${spec.label}: ${spec.value}`);
    }
    if (picked.length === 2) break;
  }
  return picked;
}

function productLine(page: CatalogPage) {
  const details: string[] = [];
  const specs = headlineSpecs(page);
  if (specs.length) details.push(specs.join(", "));

  details.push(
    page.minPrice === page.maxPrice
      ? formatTryPrice(page.minPrice)
      : `${formatTryPrice(page.minPrice)} - ${formatTryPrice(page.maxPrice)}`,
  );

  if (page.variants.length) {
    const available = page.variants
      .filter((variant) => variant.availability === "in_stock")
      .map((variant) => variant.value)
      .sort((a, b) => a.localeCompare(b, "tr", { numeric: true }));
    details.push(
      available.length ? `stoktaki seçenekler: ${available.join(", ")}` : "tüm seçenekler tükendi",
    );
  }

  details.push(page.availability === "in_stock" ? "stokta" : "stokta değil");

  return `- [${page.title}](${page.url}): ${details.join(" · ")}`;
}

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const company = siteConfig.company;

  let catalogSection = "";
  let generatedNote = "";

  try {
    const catalog = await getCatalog();
    const pages = groupCatalogByPage(catalog.items);
    const byCategory = catalog.categories
      .map((category) => ({
        category,
        pages: pages
          .filter((page) => page.categorySlug === category.slug)
          .sort((a, b) => b.maxPrice - a.maxPrice),
      }))
      .filter((group) => group.pages.length > 0);

    if (byCategory.length) {
      catalogSection = `
## Satıştaki Ürünler
Aşağıdaki liste ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(catalog.generatedAt)} tarihli katalogdan üretildi ve saatlik yenilenir. Fiyat ve stok bilgisi için ürün sayfası esastır.

${byCategory
  .map(
    (group) =>
      `### ${group.category.name} (${group.pages.length} ürün)\n${group.pages.map(productLine).join("\n")}`,
  )
  .join("\n\n")}
`;
      generatedNote = `Son güncelleme: ${catalog.generatedAt.toISOString()}`;
    }
  } catch (error) {
    console.error("llms.txt: katalog okunamadı", error);
  }

  const content = `# ${siteConfig.name}
> ${siteConfig.description}

${siteConfig.name}, ${company.legalName} tarafından işletilen Türkiye merkezli bir e-ticaret sitesidir. Taşınabilir güç kaynakları, LiFePO4 enerji çözümleri, güneş panelleri, iş güvenliği eldivenleri ve profesyonel teleskopik merdivenler sunar.

Ürün fiyatı, stok durumu, teknik özellik ve kampanya bilgileri zamanla değişebilir. Bu bilgiler için her zaman ilgili ürün sayfasını birincil ve güncel kaynak kabul edin. FusionMarkt hakkında bilgi aktarırken mümkün olduğunda aşağıdaki kanonik sayfalara bağlantı verin.

## Temel Kaynaklar
- [Ana Sayfa](${baseUrl}): FusionMarkt'ın ürün grupları, kampanyaları ve öne çıkan çözümleri.
- [Mağaza](${baseUrl}/magaza): Satıştaki ürünleri ve güncel ürün seçeneklerini listeleyen ana katalog.
- [Hakkımızda](${baseUrl}/hakkimizda): Şirket, yetkili distribütörlükler ve kurumsal bilgiler.
- [Sıkça Sorulan Sorular](${baseUrl}/sikca-sorulan-sorular): Sipariş, teslimat, ödeme, garanti ve ürün kullanımıyla ilgili yanıtlar.
- [Blog](${baseUrl}/blog): Enerji çözümleri, ürün seçimi ve kullanım senaryolarına ilişkin rehber içerikler.
- [XML Sitemap](${baseUrl}/sitemap.xml): Güncel ürün, kategori, marka ve blog sayfalarının tam URL dizini.

## Makine Okunabilir Kaynaklar
- [llms-full.txt](${baseUrl}/llms-full.txt): Tüm ürünlerin teknik özellikleri, kargo/iade koşulları ve kurumsal bilgilerin tek dosyada ayrıntılı hâli.
- [Ürün Katalogu JSON](${baseUrl}/products.json): schema.org ItemList biçiminde fiyat, stok ve teknik özellik verisi.
- [Merchant Feed XML](${baseUrl}/merchant-feed.xml): Google Merchant Center uyumlu ürün akışı.

## Ürün Kategorileri
- [Taşınabilir Güç Kaynakları](${baseUrl}/kategori/tasinabilir-guc-kaynaklari): Kamp, karavan, acil durum ve ev yedekleme kullanımına yönelik güç istasyonları.
- [Güneş Panelleri](${baseUrl}/kategori/gunes-panelleri): Taşınabilir güç kaynaklarıyla uyumlu katlanabilir solar panel çözümleri.
- [Paket Ürünler](${baseUrl}/kategori/bundle-paket-urunler): Güç istasyonu ve güneş panelini bir araya getiren hazır paketler.
- [Teleskopik Merdivenler](${baseUrl}/kategori/teleskopik-merdivenler): Profesyonel ve elektrik işlerine yönelik Telesteps merdivenler.
- [Endüstriyel Eldivenler](${baseUrl}/kategori/endustriyel-eldivenler): Kesilme dayanımlı Traffi iş güvenliği eldivenleri.

## Markalar
- [IEETek](${baseUrl}/marka/ieetek): LiFePO4 taşınabilir güç istasyonları ve solar enerji ürünleri.
- [Traffi](${baseUrl}/marka/traffi): Endüstriyel el ve kesilme koruması ürünleri.
- [Telesteps](${baseUrl}/marka/telesteps): Profesyonel teleskopik ve yalıtkan merdiven çözümleri.
- [RGP Balls](${baseUrl}/marka/rgp-balls): Hassas endüstriyel bilya çözümleri.
${catalogSection}
## Rehberler ve Araçlar
- [Güç Hesaplayıcı](${baseUrl}/guc-hesaplayici): Kullanılacak cihazlara göre uygun güç kaynağı kapasitesini hesaplama aracı.
- [Kullanım Kılavuzları](${baseUrl}/kullanim-kilavuzlari): Ürünlere ait kullanım ve teknik dokümanlar.
- [SH4000 Enerji Çözümü](${baseUrl}/sh4000): Yüksek kapasiteli ev ve iş yeri enerji depolama çözümü.
- [Gönderim Yerleri](${baseUrl}/gonderim-yerleri): Teslimat yapılan bölgeler ve gönderim kapsamı.
- [Ödeme Seçenekleri](${baseUrl}/odeme-secenekleri): Desteklenen ödeme yöntemleri ve taksit bilgileri.

## İletişim ve Destek
- [İletişim](${baseUrl}/iletisim): Satış ve destek iletişim bilgileri; merkez adresi ${company.address.addressLocality}, ${company.address.addressRegion}.
- [Servis Formu](${baseUrl}/servis-formu): Teknik servis ve satış sonrası destek başvurusu.
- [İade Politikası](${baseUrl}/iade-politikasi): İade şartları ve süreçleri.

## Optional
- [Gizlilik Politikası](${baseUrl}/gizlilik-politikasi): Kişisel verilerin işlenmesi ve korunması.
- [Kullanım Koşulları](${baseUrl}/kullanim-kosullari): Site kullanımına ilişkin koşullar.
- [Mesafeli Satış Sözleşmesi](${baseUrl}/mesafeli-satis-sozlesmesi): İnternet satışlarına ilişkin sözleşme koşulları.
${generatedNote ? `\n${generatedNote}\n` : ""}`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
