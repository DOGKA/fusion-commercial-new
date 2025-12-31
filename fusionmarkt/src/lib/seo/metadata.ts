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
      "apple-mobile-web-app-capable": "yes",
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
}: ProductMetaParams): Metadata {
  const title = titleTemplates.product.replace("%s", name);
  const productDescription = description 
    ? `${name} - ${description.slice(0, 150)}...`
    : `${name} ${brand ? `- ${brand}` : ""} taşınabilir güç kaynağı. ${inStock ? "Stokta mevcut" : "Stokta yok"}. FusionMarkt güvencesiyle satın alın.`;
  
  const keywords = [
    name.toLowerCase(),
    brand?.toLowerCase(),
    category?.toLowerCase(),
    "taşınabilir güç kaynağı",
    "power station",
    sku?.toLowerCase(),
  ].filter(Boolean) as string[];

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
      "apple-mobile-web-app-capable": "yes",
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
    // Root `app/layout.tsx` title template zaten sonuna `| FusionMarkt` ekliyor.
    title: "Taşınabilir Güç Kaynakları & Enerji Çözümleri",
    description: "ieetek,İnitial Entropy Energy ,IEETEK taşınabilir güç kaynakları, güneş panelleri ve enerji depolama sistemleri. Yetkili distribütör garantisiyle güvenli alışveriş.",
    canonical: "/",
  }),
  
  shop: generateMetadata({
    title: "Mağaza - Tüm Ürünler",
    description: "Taşınabilir güç kaynakları, güneş panelleri ve aksesuarlar. En iyi fiyat garantisi ve hızlı kargo ile FusionMarkt'ta.",
    canonical: "/magaza",
    keywords: ["power station", "güç kaynağı", "güneş paneli", "ecoflow", "bluetti"],
  }),
  
  about: generateMetadata({
    title: "Hakkımızda",
    description: "FusionMarkt - Türkiye'nin önde gelen taşınabilir enerji çözümleri distribütörü. Yetkili satıcı garantisi ve profesyonel destek.",
    canonical: "/hakkimizda",
  }),
  
  contact: generateMetadata({
    title: "İletişim",
    description: "FusionMarkt ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için buradayız.",
    canonical: "/iletisim",
  }),
  
  blog: generateMetadata({
    title: "Blog - Enerji Rehberi",
    description: "Taşınabilir enerji, off-grid yaşam, kamp ipuçları ve ürün incelemeleri. Enerji bağımsızlığı hakkında her şey.",
    canonical: "/blog",
    type: "website",
  }),
  
  faq: generateMetadata({
    title: "Sıkça Sorulan Sorular",
    description: "Taşınabilir güç kaynakları, sipariş, kargo ve iade hakkında merak ettikleriniz. Tüm sorularınızın cevapları burada.",
    canonical: "/sikca-sorulan-sorular",
  }),
  
  powerCalculator: generateMetadata({
    title: "Güç Hesaplayıcı",
    description: "İhtiyacınıza uygun güç kaynağını bulun. Cihazlarınızın güç tüketimini hesaplayın ve doğru ürünü seçin.",
    canonical: "/guc-hesaplayici",
    keywords: ["güç hesaplama", "watt hesaplama", "power station seçimi"],
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

