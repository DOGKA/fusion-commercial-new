import { Metadata } from "next";
import KullanimKilavuzlariClient from "./KullanimKilavuzlariClient";
import manualsData from "@/data/manuals-data.json";

export const metadata: Metadata = {
  title: "IEETek Kullanım Kılavuzları PDF İndir | FusionMarkt Türkiye",
  description: "IEETek P800, P1800, P2400, P3200, SH4000, Singo1000, Singo2000, SP100, SP200, SP400 taşınabilir güç istasyonu ve güneş paneli Türkçe kullanım kılavuzları. Ücretsiz PDF indir, teknik özellikler, kurulum rehberi.",
  keywords: [
    // Ürün bazlı anahtar kelimeler
    "IEETek P800 kullanım kılavuzu",
    "IEETek P800 Türkçe manuel",
    "IEETek P1800 kullanım kılavuzu",
    "IEETek P1800 Türkçe manuel",
    "IEETek P2400 kullanım kılavuzu",
    "IEETek P3200 kullanım kılavuzu",
    "IEETek P3200 Türkçe manuel",
    "IEETek SH4000 kullanım kılavuzu",
    "IEETek SH4000 Türkçe manuel",
    "IEETek SE5000 kullanım kılavuzu",
    "IEETek SP5000 kullanım kılavuzu",
    "IEETek Singo1000 kullanım kılavuzu",
    "IEETek Singo1000 Türkçe manuel",
    "IEETek Singo2000 kullanım kılavuzu",
    "IEETek Singo2000 Türkçe manuel",
    "IEETek Singo2000 Pro kullanım kılavuzu",
    "IEETek Singo2000 Plus kullanım kılavuzu",
    "IEETek Singo3000 kullanım kılavuzu",
    "IEETek Singo600 kullanım kılavuzu",
    // Güneş paneli
    "IEETek SP100 kullanım kılavuzu",
    "IEETek SP100 Türkçe manuel",
    "IEETek SP200 kullanım kılavuzu",
    "IEETek SP200 Türkçe manuel",
    "IEETek SP400 kullanım kılavuzu",
    "IEETek SP400 Türkçe manuel",
    "IEETek güneş paneli kurulum",
    // Genel anahtar kelimeler
    "taşınabilir güç istasyonu kullanım kılavuzu",
    "taşınabilir şarj istasyonu manuel",
    "power station Türkçe kılavuz",
    "güneş paneli kullanım kılavuzu",
    "solar panel kurulum rehberi",
    "IEETek Türkiye",
    "IEETek datasheet",
    "IEETek teknik özellikler",
    "taşınabilir enerji istasyonu PDF",
    "kamp güç kaynağı kılavuz",
    "outdoor power station manual",
    "FusionMarkt kullanım kılavuzları"
  ],
  openGraph: {
    title: "IEETek Kullanım Kılavuzları PDF İndir | FusionMarkt Türkiye",
    description: "IEETek taşınabilir güç istasyonları ve güneş panelleri için Türkçe kullanım kılavuzları. P800, P1800, P3200, SH4000, Singo serisi ve SP güneş panelleri. Ücretsiz PDF indir.",
    type: "website",
    locale: "tr_TR",
    siteName: "FusionMarkt",
    url: "https://fusionmarkt.com/kullanim-kilavuzlari",
    images: [
      {
        url: "/images/og/kullanim-kilavuzlari.jpg",
        width: 1200,
        height: 630,
        alt: "IEETek Kullanım Kılavuzları - FusionMarkt Türkiye"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "IEETek Kullanım Kılavuzları PDF İndir | FusionMarkt",
    description: "IEETek taşınabilir güç istasyonu ve güneş paneli Türkçe kullanım kılavuzları. Ücretsiz PDF indir.",
    images: ["/images/og/kullanim-kilavuzlari.jpg"]
  },
  alternates: {
    canonical: "https://fusionmarkt.com/kullanim-kilavuzlari"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

// JSON-LD Structured Data - Tüm ürünleri içerir
const generateJsonLd = () => {
  const products = manualsData.products;
  
  // Ürünleri ItemList olarak oluştur
  const itemListElements = products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: `${product.name} Türkçe kullanım kılavuzu ve teknik dökümanlar`,
      image: product.imageUrl,
      brand: {
        "@type": "Brand",
        name: "IEETek"
      },
      ...(product.userManualUrl && {
        documentation: product.userManualUrl
      })
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "IEETek Kullanım Kılavuzları",
    description: "IEETek taşınabilir güç istasyonları ve güneş panelleri için Türkçe kullanım kılavuzları ve teknik dökümanlar. Tüm modeller için ücretsiz PDF indirin.",
    url: "https://fusionmarkt.com/kullanim-kilavuzlari",
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: itemListElements
    },
    publisher: {
      "@type": "Organization",
      name: "FusionMarkt",
      url: "https://fusionmarkt.com",
      logo: {
        "@type": "ImageObject",
        url: "https://fusionmarkt.com/images/logo.png"
      }
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ana Sayfa",
          item: "https://fusionmarkt.com"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Kullanım Kılavuzları",
          item: "https://fusionmarkt.com/kullanim-kilavuzlari"
        }
      ]
    }
  };
};

const jsonLd = generateJsonLd();

export default function KullanimKilavuzlariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KullanimKilavuzlariClient />
    </>
  );
}
