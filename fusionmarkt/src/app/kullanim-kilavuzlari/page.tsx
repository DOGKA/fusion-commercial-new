import { Metadata } from "next";
import KullanimKilavuzlariClient from "./KullanimKilavuzlariClient";

export const metadata: Metadata = {
  title: "Kullanım Kılavuzları | FusionMarkt - Taşınabilir Güç İstasyonu ve Güneş Paneli Dökümanları",
  description: "IEETek taşınabilir güç istasyonları ve güneş panelleri için kullanım kılavuzları, teknik veri sayfaları ve kurulum rehberleri. P800, P1800, P2400, P3200 modelleri için PDF dökümanlarını indirin.",
  keywords: [
    "kullanım kılavuzu",
    "taşınabilir güç istasyonu kılavuz",
    "güneş paneli kurulum",
    "IEETek kılavuz",
    "power station manual",
    "solar panel guide",
    "P800 kılavuz",
    "P1800 kılavuz",
    "P2400 kılavuz",
    "P3200 kılavuz",
    "teknik veri sayfası",
    "datasheet",
    "PDF indirme",
    "FusionMarkt dökümanlar"
  ],
  openGraph: {
    title: "Kullanım Kılavuzları | FusionMarkt",
    description: "IEETek taşınabilir güç istasyonları ve güneş panelleri için kullanım kılavuzları ve teknik dökümanlar. Tüm modeller için PDF indirin.",
    type: "website",
    locale: "tr_TR",
    siteName: "FusionMarkt",
    url: "https://fusionmarkt.com.tr/kullanim-kilavuzlari",
    images: [
      {
        url: "/images/og/kullanim-kilavuzlari.jpg",
        width: 1200,
        height: 630,
        alt: "FusionMarkt Kullanım Kılavuzları"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Kullanım Kılavuzları | FusionMarkt",
    description: "IEETek ürünleri için kullanım kılavuzları ve teknik dökümanlar.",
    images: ["/images/og/kullanim-kilavuzlari.jpg"]
  },
  alternates: {
    canonical: "https://fusionmarkt.com.tr/kullanim-kilavuzlari"
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

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Kullanım Kılavuzları",
  description: "IEETek taşınabilir güç istasyonları ve güneş panelleri için kullanım kılavuzları ve teknik dökümanlar",
  url: "https://fusionmarkt.com.tr/kullanim-kilavuzlari",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Taşınabilir Güç İstasyonu Kılavuzları",
        description: "IEETek P800, P1800, P2400, P3200 modelleri için kullanım kılavuzları"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Güneş Paneli Kılavuzları",
        description: "IEETek güneş panelleri için kurulum ve kullanım rehberleri"
      }
    ]
  },
  publisher: {
    "@type": "Organization",
    name: "FusionMarkt",
    url: "https://fusionmarkt.com.tr"
  }
};

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
