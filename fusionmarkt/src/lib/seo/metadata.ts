/**
 * FusionMarkt SEO Metadata Helpers
 * Dinamik meta tag oluşturma fonksiyonları
 */

import type { Metadata } from "next";
import { siteConfig, titleTemplates, categoryDescriptions, brandDescriptions } from "./config";

interface GenerateMetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Temel metadata oluşturucu
 */
export function generateMetadata({
  title,
  description = siteConfig.description,
  keywords = [],
  image,
  canonical,
  noIndex = false,
  noFollow = false,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
}: GenerateMetadataOptions): Metadata {
  const url = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;
  const ogImage = image || `${siteConfig.url}${siteConfig.ogImage}`;
  const allKeywords = [...new Set([...siteConfig.keywords, ...keywords])];

  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{ name: author || siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    
    // Canonical
    alternates: {
      canonical: url,
      languages: {
        "tr-TR": url,
      },
    },
    
    // Open Graph
    openGraph: {
      type: type === "article" ? "article" : "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: [author || siteConfig.creator],
      }),
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: siteConfig.social.twitter,
      creator: siteConfig.social.twitter,
    },
    
    // Other
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "format-detection": "telephone=no",
    },
  };
}

/**
 * Ürün sayfası için metadata
 */
export interface ProductMetaParams {
  name: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  image?: string;
  brand?: string;
  category?: string;
  slug: string;
  sku?: string;
  inStock?: boolean;
  // DB'den gelen SEO alanları (öncelikli)
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
}

export function generateProductMetadata({
  name,
  description,
  price,
  discountPrice,
  image,
  brand,
  category,
  slug,
  sku,
  inStock = true,
  metaTitle,
  metaDescription,
  metaKeywords,
}: ProductMetaParams): Metadata {
  // DB'den gelen metaTitle varsa onu kullan, yoksa template'den üret
  const title = metaTitle || titleTemplates.product.replace("%s", name);
  
  // DB'den gelen metaDescription varsa onu kullan, yoksa otomatik üret
  const productDescription = metaDescription 
    || (description 
      ? `${name} - ${description.slice(0, 150)}...`
      : `${name} ${brand ? `- ${brand}` : ""} taşınabilir güç kaynağı. ${inStock ? "Stokta mevcut" : "Stokta yok"}. FusionMarkt güvencesiyle satın alın.`);
  
  // DB'den gelen metaKeywords varsa onları da ekle
  const baseKeywords = [
    name.toLowerCase(),
    brand?.toLowerCase(),
    category?.toLowerCase(),
    "taşınabilir güç kaynağı",
    "power station",
    sku?.toLowerCase(),
  ].filter(Boolean) as string[];
  
  const keywords = metaKeywords && metaKeywords.length > 0
    ? [...new Set([...metaKeywords, ...baseKeywords])]
    : baseKeywords;

  const metadata = generateMetadata({
    title,
    description: productDescription,
    keywords,
    image,
    canonical: `/urun/${slug}`,
    type: "product",
  });

  // Ürün için ek meta taglar
  return {
    ...metadata,
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "format-detection": "telephone=no",
      "product:price:amount": String(discountPrice || price || 0),
      "product:price:currency": "TRY",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:brand": brand || siteConfig.name,
      "product:category": category || "Taşınabilir Güç Kaynağı",
    },
  };
}

/**
 * Kategori sayfası için metadata
 */
export interface CategoryMetaParams {
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  image?: string;
}

export function generateCategoryMetadata({
  name,
  slug,
  description,
  productCount,
  image,
}: CategoryMetaParams): Metadata {
  const title = titleTemplates.category.replace("%s", name);
  const categoryDesc = description || categoryDescriptions[slug] || 
    `${name} kategorisinde ${productCount ? `${productCount} ürün` : "ürünler"}. En iyi fiyatlar ve hızlı kargo ile FusionMarkt'ta.`;

  const keywords = [
    name.toLowerCase(),
    `${name.toLowerCase()} fiyat`,
    `${name.toLowerCase()} satın al`,
    "taşınabilir güç kaynağı",
  ];

  return generateMetadata({
    title,
    description: categoryDesc,
    keywords,
    image,
    canonical: `/kategori/${slug}`,
  });
}

/**
 * Marka sayfası için metadata
 */
export interface BrandMetaParams {
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  logo?: string;
}

export function generateBrandMetadata({
  name,
  slug,
  description,
  productCount,
  logo,
}: BrandMetaParams): Metadata {
  const title = titleTemplates.brand.replace("%s", name);
  const brandDesc = description || brandDescriptions[slug] || 
    `${name} marka ürünleri. ${productCount ? `${productCount} ürün` : "Tüm modeller"} FusionMarkt'ta yetkili distribütör garantisiyle.`;

  const keywords = [
    name.toLowerCase(),
    `${name.toLowerCase()} türkiye`,
    `${name.toLowerCase()} fiyat`,
    `${name.toLowerCase()} satın al`,
    `${name.toLowerCase()} yetkili satıcı`,
  ];

  return generateMetadata({
    title,
    description: brandDesc,
    keywords,
    image: logo,
    canonical: `/marka/${slug}`,
  });
}

/**
 * Blog yazısı için metadata
 */
export interface BlogMetaParams {
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export function generateBlogMetadata({
  title,
  excerpt,
  slug,
  image,
  author,
  publishedAt,
  updatedAt,
  tags = [],
}: BlogMetaParams): Metadata {
  const blogTitle = titleTemplates.blog.replace("%s", title);
  const description = excerpt || `${title} - FusionMarkt Blog'da enerji çözümleri hakkında bilgi edinin.`;

  return generateMetadata({
    title: blogTitle,
    description,
    keywords: tags,
    image,
    canonical: `/blog/${slug}`,
    type: "article",
    publishedTime: publishedAt,
    modifiedTime: updatedAt,
    author,
  });
}

/**
 * Statik sayfalar için metadata
 */
export const staticPageMetadata = {
  home: generateMetadata({
    title: "Taşınabilir Güç Kaynakları & Solar Panel | Enerji Çözümleri",
    description: "Taşınabilir güç kaynağı, LiFePO4 batarya, solar panel ve portable power station modelleri. IEETek yetkili distribütörü. Ücretsiz kargo, 2 yıl garanti ile Türkiye'nin güvenilir enerji marketi.",
    canonical: "/",
    keywords: ["taşınabilir güç kaynağı", "solar panel", "portable power station", "güç istasyonu", "lifepo4 batarya", "güneş paneli", "off-grid enerji"],
  }),
  
  shop: generateMetadata({
    title: "Mağaza - Taşınabilir Güç Kaynağı, Solar Panel ve Tüm Ürünler",
    description: "Taşınabilir güç kaynağı, solar panel, LiFePO4 portable power station, yalıtkan merdiven ve iş güvenliği eldiveni modelleri. En iyi fiyat garantisi, ücretsiz kargo ve 12 taksit imkanı ile FusionMarkt'ta.",
    canonical: "/magaza",
    keywords: ["taşınabilir güç kaynağı", "portable power station", "solar panel", "güneş paneli", "power station fiyat", "güç kaynağı satın al"],
  }),
  
  about: generateMetadata({
    title: "Hakkımızda - Türkiye'nin Güvenilir Enerji Marketi",
    description: "FusionMarkt - IEETek, Traffi, Telesteps yetkili distribütörü. Taşınabilir güç kaynağı, solar panel ve iş güvenliği ekipmanları alanında Türkiye'nin güvenilir marketi. Profesyonel destek, 2 yıl garanti.",
    canonical: "/hakkimizda",
  }),
  
  contact: generateMetadata({
    title: "İletişim - Bize Ulaşın",
    description: "FusionMarkt iletişim bilgileri. Taşınabilir güç kaynağı, solar panel siparişi ve teknik destek için bize ulaşın. Ankara merkez ofis, telefon ve e-posta.",
    canonical: "/iletisim",
    keywords: ["fusionmarkt iletişim", "güç kaynağı teknik destek", "fusionmarkt telefon"],
  }),
  
  blog: generateMetadata({
    title: "Blog - Taşınabilir Güç Kaynağı Rehberi ve Enerji Çözümleri",
    description: "Taşınabilir güç kaynağı karşılaştırmaları, solar panel kurulum rehberi, LiFePO4 batarya bilgileri, kamp enerji çözümleri ve ürün incelemeleri. Enerji bağımsızlığı hakkında uzman içerikler.",
    canonical: "/blog",
    type: "website",
    keywords: ["taşınabilir güç kaynağı rehber", "solar panel karşılaştırma", "lifepo4 batarya", "kamp enerji"],
  }),
  
  faq: generateMetadata({
    title: "Sıkça Sorulan Sorular - Taşınabilir Güç Kaynağı SSS",
    description: "Taşınabilir güç kaynağı, solar panel, LiFePO4 batarya, sipariş, kargo ve iade hakkında en çok sorulan sorular ve cevapları. Power station seçim rehberi.",
    canonical: "/sikca-sorulan-sorular",
    keywords: ["taşınabilir güç kaynağı sss", "power station soru", "solar panel sss"],
  }),
  
  powerCalculator: generateMetadata({
    title: "Güç Hesaplayıcı - Hangi Taşınabilir Güç Kaynağı Size Uygun?",
    description: "Cihazlarınızın watt tüketimini girin, size uygun taşınabilir güç kaynağını bulun. Power station kapasite hesaplama aracı. Kamp, karavan ve ev kullanımı için doğru ürünü seçin.",
    canonical: "/guc-hesaplayici",
    keywords: ["güç hesaplama", "watt hesaplama", "power station seçimi", "güç kaynağı kapasite hesaplama", "kamp güç ihtiyacı"],
  }),
  
  shippingLocations: generateMetadata({
    title: "Gönderim Yerleri",
    description: "FusionMarkt Türkiye geneli gönderim yapmaktadır. Kargo süreleri ve teslimat bilgileri.",
    canonical: "/gonderim-yerleri",
  }),
  
  favorites: generateMetadata({
    title: "Favorilerim",
    description: "Favori ürünlerinizi görüntüleyin ve yönetin.",
    canonical: "/favori",
    noIndex: true, // Kullanıcıya özel sayfa
  }),
  
  account: generateMetadata({
    title: "Hesabım",
    description: "Hesap bilgilerinizi, siparişlerinizi ve ayarlarınızı yönetin.",
    canonical: "/hesabim",
    noIndex: true,
  }),
  
  checkout: generateMetadata({
    title: "Ödeme",
    description: "Güvenli ödeme sayfası. Siparişinizi tamamlayın.",
    canonical: "/checkout",
    noIndex: true,
  }),
  
  // Yasal sayfalar
  privacyPolicy: generateMetadata({
    title: "Gizlilik Politikası",
    description: "FusionMarkt gizlilik politikası. Kişisel verilerinizin nasıl işlendiği hakkında bilgi.",
    canonical: "/gizlilik-politikasi",
  }),
  
  cookiePolicy: generateMetadata({
    title: "Çerez Politikası",
    description: "FusionMarkt çerez politikası. Web sitemizde kullanılan çerezler hakkında bilgi.",
    canonical: "/cerez-politikasi",
  }),
  
  termsOfUse: generateMetadata({
    title: "Kullanım Koşulları",
    description: "FusionMarkt web sitesi kullanım koşulları ve şartları.",
    canonical: "/kullanim-kosullari",
  }),
  
  returnPolicy: generateMetadata({
    title: "İade Politikası",
    description: "FusionMarkt iade ve değişim politikası. Kolay iade süreci.",
    canonical: "/iade-politikasi",
  }),
  
  distanceSalesContract: generateMetadata({
    title: "Mesafeli Satış Sözleşmesi",
    description: "FusionMarkt mesafeli satış sözleşmesi ön bilgilendirme formu.",
    canonical: "/mesafeli-satis-sozlesmesi",
  }),
  
  userAgreement: generateMetadata({
    title: "Kullanıcı Sözleşmesi",
    description: "FusionMarkt üyelik ve kullanıcı sözleşmesi.",
    canonical: "/kullanici-sozlesmesi",
  }),
  
  paymentOptions: generateMetadata({
    title: "Ödeme Seçenekleri",
    description: "FusionMarkt güvenli ödeme seçenekleri. Kredi kartı, havale/EFT ve taksit imkanları.",
    canonical: "/odeme-secenekleri",
  }),
  
  pricingPolicy: generateMetadata({
    title: "Ücretlendirme Politikası",
    description: "FusionMarkt ücretlendirme ve fiyatlandırma politikası.",
    canonical: "/ucretlendirme-politikasi",
  }),
};

