import HeroSlider from "@/components/home/HeroSlider";
import WhyFusionMarkt from "@/components/home/WhyFusionMarkt";
import TrendingCarousel from "@/components/home/TrendingCarousel";
import PromoBanner from "@/components/home/PromoBanner";
import VideoBanner from "@/components/home/VideoBanner";
import VideoGrid from "@/components/home/VideoGrid";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import CategoryBento from "@/components/home/CategoryBento";
import PartnerLogos from "@/components/home/PartnerLogos";
import HomeSeoContent from "@/components/home/HomeSeoContent";
import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.home;
export const revalidate = 60;

const MOCK_BASE = { backgroundVideo: null, isActive: true, showOnMobile: true, showOnDesktop: true, startDate: null, endDate: null };
const mockSliders = [
  { ...MOCK_BASE, id: "mock-1", name: "P800", badge: "Yeni Ürün", badgeIcon: "zap", title: "Kompakt Güç, Sınırsız Özgürlük", titleHighlight: "P800 Power Station", subtitle: "800W çıkış gücü, 768Wh kapasite. Kamp, van life ve acil durumlar için ideal taşınabilir enerji çözümü.", buttonText: "Ürünü İncele", buttonLink: "/urun/p800", buttonStyle: "PRIMARY", button2Text: "Tüm Ürünler", button2Link: "/magaza", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-p800.png", overlayColor: "#000000", overlayOpacity: 40, overlayColorLight: "#FFFFFF", overlayOpacityLight: 30, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(16,185,129,0.2)", badgeTextColor: "#10b981", buttonBgColor: "#FFFFFF", buttonTextColor: "#000000", button2BgColor: "rgba(255,255,255,0.1)", button2TextColor: "#FFFFFF", titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(16,185,129,0.1)", badgeTextColorLight: "#059669", buttonBgColorLight: "#111827", buttonTextColorLight: "#FFFFFF", button2BgColorLight: "rgba(0,0,0,0.05)", button2TextColorLight: "#111827", titleHighlightFrom: "#10b981", titleHighlightTo: "#06b6d4", titleHighlightFromLight: "#059669", titleHighlightToLight: "#0891b2", textAlign: "LEFT", theme: "DARK", order: 0 },
  { ...MOCK_BASE, id: "mock-2", name: "P1800", badge: "En Çok Satan", badgeIcon: "fire", title: "Profesyonel Güç Çözümü", titleHighlight: "P1800 Power Station", subtitle: "1800W saf sinüs dalga inverter, 1440Wh LiFePO4 batarya. Şantiye, etkinlik ve off-grid yaşam için.", buttonText: "Detayları Gör", buttonLink: "/urun/p1800", buttonStyle: "PRIMARY", button2Text: "Karşılaştır", button2Link: "/karsilastir", button2Style: "OUTLINE", desktopImage: "/sliders/slider-yatay-p1800.png", overlayColor: "#000000", overlayOpacity: 35, overlayColorLight: "#FFFFFF", overlayOpacityLight: 25, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(239,68,68,0.2)", badgeTextColor: "#f87171", buttonBgColor: "#10b981", buttonTextColor: "#FFFFFF", button2BgColor: "transparent", button2TextColor: "#FFFFFF", titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(239,68,68,0.1)", badgeTextColorLight: "#dc2626", buttonBgColorLight: "#10b981", buttonTextColorLight: "#FFFFFF", button2BgColorLight: "transparent", button2TextColorLight: "#111827", titleHighlightFrom: "#f59e0b", titleHighlightTo: "#ef4444", titleHighlightFromLight: "#d97706", titleHighlightToLight: "#dc2626", textAlign: "LEFT", theme: "DARK", order: 1 },
  { ...MOCK_BASE, id: "mock-3", name: "P1800 Sahada", badge: "Sahada Güç", badgeIcon: "truck", title: "Sahada Kesintisiz Enerji", titleHighlight: "P1800 ile Çalışın", subtitle: "İnşaat sahası, çiftlik ve açık alan etkinliklerde güvenilir güç kaynağınız. Çift AC çıkışlı, hızlı şarj.", buttonText: "İncele", buttonLink: "/urun/p1800", buttonStyle: "PRIMARY", button2Text: "", button2Link: "", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-p1800-2.png", overlayColor: "#000000", overlayOpacity: 38, overlayColorLight: "#FFFFFF", overlayOpacityLight: 28, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.75)", badgeBgColor: "rgba(59,130,246,0.2)", badgeTextColor: "#60a5fa", buttonBgColor: "#FFFFFF", buttonTextColor: "#000000", button2BgColor: null, button2TextColor: null, titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(59,130,246,0.1)", badgeTextColorLight: "#2563eb", buttonBgColorLight: "#111827", buttonTextColorLight: "#FFFFFF", button2BgColorLight: null, button2TextColorLight: null, titleHighlightFrom: "#3b82f6", titleHighlightTo: "#06b6d4", titleHighlightFromLight: "#2563eb", titleHighlightToLight: "#0891b2", textAlign: "LEFT", theme: "DARK", order: 2 },
  { ...MOCK_BASE, id: "mock-4", name: "P3200", badge: "Flagship", badgeIcon: "star", title: "Endüstriyel Güç, Taşınabilir Boyut", titleHighlight: "P3200 Power Station", subtitle: "3200W çıkış, 3072Wh kapasite, çift AC şarj ile 2 saatte tam dolum. İnşaat ve profesyonel kullanım.", buttonText: "Keşfet", buttonLink: "/urun/p3200", buttonStyle: "PRIMARY", button2Text: "", button2Link: "", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-p3200.png", overlayColor: "#0a0a0a", overlayOpacity: 30, overlayColorLight: "#FFFFFF", overlayOpacityLight: 20, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.75)", badgeBgColor: "rgba(234,179,8,0.2)", badgeTextColor: "#facc15", buttonBgColor: "#FFFFFF", buttonTextColor: "#000000", button2BgColor: null, button2TextColor: null, titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(234,179,8,0.15)", badgeTextColorLight: "#ca8a04", buttonBgColorLight: "#111827", buttonTextColorLight: "#FFFFFF", button2BgColorLight: null, button2TextColorLight: null, titleHighlightFrom: "#eab308", titleHighlightTo: "#f97316", titleHighlightFromLight: "#ca8a04", titleHighlightToLight: "#ea580c", textAlign: "LEFT", theme: "DARK", order: 3 },
  { ...MOCK_BASE, id: "mock-5", name: "P3200 Max", badge: "3200W", badgeIcon: "zap", title: "Maksimum Güç Kapasitesi", titleHighlight: "P3200 ile Sınırları Aşın", subtitle: "3200W anlık çıkış, 6400W surge. Klima, buzdolabı, elektrikli alet — her şeyi çalıştırın.", buttonText: "Detayları Gör", buttonLink: "/urun/p3200", buttonStyle: "PRIMARY", button2Text: "Karşılaştır", button2Link: "/karsilastir", button2Style: "OUTLINE", desktopImage: "/sliders/slider-yatay-p3200-2.png", overlayColor: "#000000", overlayOpacity: 35, overlayColorLight: "#FFFFFF", overlayOpacityLight: 25, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(249,115,22,0.2)", badgeTextColor: "#fb923c", buttonBgColor: "#f97316", buttonTextColor: "#FFFFFF", button2BgColor: "transparent", button2TextColor: "#FFFFFF", titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(249,115,22,0.1)", badgeTextColorLight: "#ea580c", buttonBgColorLight: "#ea580c", buttonTextColorLight: "#FFFFFF", button2BgColorLight: "transparent", button2TextColorLight: "#111827", titleHighlightFrom: "#f97316", titleHighlightTo: "#ef4444", titleHighlightFromLight: "#ea580c", titleHighlightToLight: "#dc2626", textAlign: "LEFT", theme: "DARK", order: 4 },
  { ...MOCK_BASE, id: "mock-6", name: "Singo 2000 Pro", badge: "Outdoor", badgeIcon: "truck", title: "Outdoor Maceralar İçin", titleHighlight: "Singo 2000 Pro", subtitle: "2000W güç, IP65 su geçirmezlik, -20°C'de çalışabilme. Doğanın en zorlu koşullarında yanınızda.", buttonText: "İncele", buttonLink: "/urun/singo-2000-pro", buttonStyle: "PRIMARY", button2Text: "Tüm Outdoor Ürünleri", button2Link: "/kategori/outdoor", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-singo2000pro.png", overlayColor: "#000000", overlayOpacity: 40, overlayColorLight: "#FFFFFF", overlayOpacityLight: 30, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(59,130,246,0.2)", badgeTextColor: "#60a5fa", buttonBgColor: "#3b82f6", buttonTextColor: "#FFFFFF", button2BgColor: "rgba(255,255,255,0.1)", button2TextColor: "#FFFFFF", titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(59,130,246,0.1)", badgeTextColorLight: "#2563eb", buttonBgColorLight: "#2563eb", buttonTextColorLight: "#FFFFFF", button2BgColorLight: "rgba(0,0,0,0.05)", button2TextColorLight: "#111827", titleHighlightFrom: "#3b82f6", titleHighlightTo: "#8b5cf6", titleHighlightFromLight: "#2563eb", titleHighlightToLight: "#7c3aed", textAlign: "LEFT", theme: "DARK", order: 5 },
  { ...MOCK_BASE, id: "mock-7", name: "Solar Panel", badge: "Sürdürülebilir Enerji", badgeIcon: "zap", title: "Güneşin Gücüyle Şarj", titleHighlight: "Taşınabilir Solar Paneller", subtitle: "200W katlanabilir solar panel ile güç istasyonunuzu doğada, kampda veya teknede güneş enerjisiyle şarj edin.", buttonText: "Solar Panelleri Gör", buttonLink: "/kategori/gunes-panelleri", buttonStyle: "PRIMARY", button2Text: "", button2Link: "", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-solarpanel.png", overlayColor: "#000000", overlayOpacity: 35, overlayColorLight: "#FFFFFF", overlayOpacityLight: 25, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(34,197,94,0.2)", badgeTextColor: "#22c55e", buttonBgColor: "#22c55e", buttonTextColor: "#FFFFFF", button2BgColor: null, button2TextColor: null, titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(34,197,94,0.1)", badgeTextColorLight: "#16a34a", buttonBgColorLight: "#16a34a", buttonTextColorLight: "#FFFFFF", button2BgColorLight: null, button2TextColorLight: null, titleHighlightFrom: "#22c55e", titleHighlightTo: "#10b981", titleHighlightFromLight: "#16a34a", titleHighlightToLight: "#059669", textAlign: "LEFT", theme: "DARK", order: 6 },
  { ...MOCK_BASE, id: "mock-8", name: "Solar Sistem", badge: "Off-Grid", badgeIcon: "zap", title: "Bağımsız Enerji Sistemi", titleHighlight: "Solar + Power Station", subtitle: "Solar panel ve güç istasyonu kombinasyonu ile şebekeden bağımsız, sürdürülebilir enerji çözümü.", buttonText: "Sistemleri İncele", buttonLink: "/kategori/gunes-panelleri", buttonStyle: "PRIMARY", button2Text: "Nasıl Çalışır?", button2Link: "/blog", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-solar.png", overlayColor: "#000000", overlayOpacity: 38, overlayColorLight: "#FFFFFF", overlayOpacityLight: 28, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(16,185,129,0.2)", badgeTextColor: "#34d399", buttonBgColor: "#10b981", buttonTextColor: "#FFFFFF", button2BgColor: "rgba(255,255,255,0.1)", button2TextColor: "#FFFFFF", titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(16,185,129,0.1)", badgeTextColorLight: "#059669", buttonBgColorLight: "#059669", buttonTextColorLight: "#FFFFFF", button2BgColorLight: "rgba(0,0,0,0.05)", button2TextColorLight: "#111827", titleHighlightFrom: "#10b981", titleHighlightTo: "#22c55e", titleHighlightFromLight: "#059669", titleHighlightToLight: "#16a34a", textAlign: "LEFT", theme: "DARK", order: 7 },
  { ...MOCK_BASE, id: "mock-9", name: "Eldivenler", badge: "İş Güvenliği", badgeIcon: "heart", title: "Profesyonel Koruma", titleHighlight: "Endüstriyel Eldivenler", subtitle: "Yüksek performanslı iş güvenliği eldivenleri. Kesim dayanımı, ısı direnci ve üstün kavrama gücü.", buttonText: "Ürünleri Gör", buttonLink: "/kategori/endustriyel-eldivenler", buttonStyle: "PRIMARY", button2Text: "", button2Link: "", button2Style: "SECONDARY", desktopImage: "/sliders/slider-yatay-gloves.png", overlayColor: "#000000", overlayOpacity: 45, overlayColorLight: "#FFFFFF", overlayOpacityLight: 35, titleColor: "#FFFFFF", subtitleColor: "rgba(255,255,255,0.8)", badgeBgColor: "rgba(168,85,247,0.2)", badgeTextColor: "#c084fc", buttonBgColor: "#FFFFFF", buttonTextColor: "#000000", button2BgColor: null, button2TextColor: null, titleColorLight: "#111827", subtitleColorLight: "rgba(75,85,99,1)", badgeBgColorLight: "rgba(168,85,247,0.1)", badgeTextColorLight: "#9333ea", buttonBgColorLight: "#111827", buttonTextColorLight: "#FFFFFF", button2BgColorLight: null, button2TextColorLight: null, titleHighlightFrom: "#a855f7", titleHighlightTo: "#ec4899", titleHighlightFromLight: "#9333ea", titleHighlightToLight: "#db2777", textAlign: "LEFT", theme: "DARK", order: 8 },
];

async function getInitialSliders() {
  // TODO: Mock test — S3'e yükleyince kaldır, DB'ye geç
  return mockSliders;
}

export default async function Home() {
  const initialSlides = await getInitialSliders();

  return (
    <main className="flex flex-col">
      <h1 className="sr-only">
        Taşınabilir Güç Kaynağı, Solar Panel ve Portable Power Station - FusionMarkt
      </h1>

      <HeroSlider initialSlides={initialSlides} />

      

      <TrendingCarousel />

      <PromoBanner />

      <VideoBanner />

      <CategoryShowcase index={0} />

      <CategoryShowcase index={1} />
      
      <CategoryBento />

      <VideoGrid />
      <WhyFusionMarkt />
      
      <PartnerLogos />

      <HomeSeoContent />
    </main>
  );
}
