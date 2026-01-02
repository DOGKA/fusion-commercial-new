/**
 * FusionMarkt SEO Configuration
 * Merkezi SEO ayarları - tüm sayfalar için tutarlı meta data
 */

export const siteConfig = {
  name: "FusionMarkt",
  shortName: "FusionMarkt",
  description: "IEETek taşınabilir güç kaynakları, güneş panelleri, Traffi iş eldivenleri ve Kevlar yalıtkan merdivenler. Yetkili distribütör garantisiyle güvenli alışveriş.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com",
  ogImage: "/images/og-default.jpg",
  
  // Şirket bilgileri
  company: {
    name: "FusionMarkt",
    legalName: "ASDTC MÜHENDİSLİK TİCARET A.Ş.",
    foundingDate: "2023",
    email: "info@fusionmarkt.com",
    salesEmail: "sales@fusionmarkt.com",
    phone: "+90 850 840 6160",
    address: {
      streetAddress: "Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler",
      addressLocality: "Çankaya",
      addressRegion: "Ankara",
      postalCode: "06550",
      addressCountry: "TR",
    },
  },
  
  // Sosyal medya
  social: {
    twitter: "@fusionmarkt",
    facebook: "fusionmarkt",
    instagram: "fusionmarkt",
    youtube: "fusionmarkt",
    linkedin: "fusionmarkt",
  },
  
  // SEO defaults
  locale: "tr_TR",
  language: "tr",
  themeColor: "#8B5CF6",
  
  // Keywords
  keywords: [
    "taşınabilir güç kaynağı",
    "power station",
    "güneş paneli",
    "solar panel",
    "ieetek",
    "traffi",
    "kevlar merdiven",
    "iş eldiveni",
    "enerji depolama",
    "portable power",
    "off-grid enerji",
    "yalıtkan merdiven",
  ],
  
  // Creator & Publisher
  creator: "FusionMarkt",
  publisher: "FusionMarkt",
} as const;

// Sayfa başlığı formatları
export const titleTemplates = {
  // Not: Root `app/layout.tsx` zaten `template: "%s | FusionMarkt"` uyguluyor.
  // Buradaki şablonlar marka adını tekrar etmemeli.
  default: "%s",
  product: "%s - Taşınabilir Güç Kaynağı",
  category: "%s Kategorisi",
  brand: "%s Ürünleri",
  blog: "%s | Blog",
} as const;

// Varsayılan meta açıklamaları
export const defaultDescriptions = {
  home: "IEETek taşınabilir güç kaynakları, güneş panelleri, Traffi iş eldivenleri ve Kevlar yalıtkan merdivenler. Yetkili distribütör garantisiyle güvenli alışveriş.",
  shop: "Tüm taşınabilir güç kaynakları, güneş panelleri, iş eldivenleri ve yalıtkan merdivenler. En iyi fiyat garantisi ve hızlı kargo ile kapınızda.",
  blog: "Taşınabilir enerji, iş güvenliği, yalıtkan merdivenler ve ürün incelemeleri. Sektörel gelişmeler hakkında her şey.",
  contact: "FusionMarkt ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için buradayız.",
  about: "FusionMarkt hakkında. Türkiye'nin önde gelen endüstriyel ekipman ve enerji çözümleri distribütörü.",
} as const;

// Kategori SEO açıklamaları
export const categoryDescriptions: Record<string, string> = {
  "power-station": "Taşınabilir güç istasyonları ile her yerde elektrik. Kamp, outdoor, acil durum ve ev kullanımı için ideal çözümler.",
  "solar-panel": "Yüksek verimli güneş panelleri. Taşınabilir ve katlanabilir modeller ile enerjinizi güneşten alın.",
  "aksesuarlar": "Güç istasyonu aksesuarları, kablolar, adaptörler ve yedek parçalar. Sisteminizi genişletin.",
  "bundle": "Özel paket fırsatları. Güç istasyonu + güneş paneli setleri ile maksimum tasarruf.",
};

// Marka SEO açıklamaları
export const brandDescriptions: Record<string, string> = {
  ieetek: "IEETek taşınabilir güç istasyonları ve güneş panelleri. P800, P1800, P2400 serileri ile profesyonel enerji çözümleri.",
  traffi: "Traffi iş eldivenleri. Karbon-nötr, kesim dayanımlı ve dokunmatik ekran uyumlu güvenlik eldivenleri.",
  kevlar: "Kevlar yalıtkan merdivenler. Elektrik işlerinde güvenli çalışma için yüksek gerilim yalıtımlı merdivenler.",
};

