import HeroSlider from "@/components/home/HeroSlider";
import CategoryBento from "@/components/home/CategoryBento";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestsellerProducts from "@/components/home/BestsellerProducts";
import PartnerLogos from "@/components/home/PartnerLogos";

export default function Home() {
  return (
    <main className="flex flex-col">
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
    </main>
  );
}
