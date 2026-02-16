import HeroSlider from "@/components/home/HeroSlider";
import CategoryBento from "@/components/home/CategoryBento";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestsellerProducts from "@/components/home/BestsellerProducts";
import PartnerLogos from "@/components/home/PartnerLogos";
import HomeSeoContent from "@/components/home/HomeSeoContent";
import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.home;

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* SEO: Visually hidden h1 for search engines + visible intro text */}
      <h1 className="sr-only">
        Taşınabilir Güç Kaynağı, Solar Panel ve Portable Power Station - FusionMarkt
      </h1>

      {/* Hero Slider - 2400x800 */}
      <HeroSlider />
      
      {/* Featured Products - Öne Çıkan Ürünler (admin panelden seçilen) */}
      <FeaturedProducts />
      
      {/* Bestseller Products - Çok Satanlar (6 ürün) */}
      <BestsellerProducts />
      
      {/* Category Bento Grid */}
      <CategoryBento />
      
      {/* Partner Logos - Çözüm Ortakları */}
      <PartnerLogos />

      {/* SEO Content Section - Keyword-rich text for search engines */}
      <HomeSeoContent />
    </main>
  );
}
