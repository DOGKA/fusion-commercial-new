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
import { prisma } from "@/lib/prisma";
import {
  selectSliderPublic,
  mapSlidersToPublicDTO,
} from "@/server/dto";

export const metadata = staticPageMetadata.home;
export const revalidate = 60;

async function getInitialSliders() {
  try {
    const sliders = await prisma.slider.findMany({
      where: { isActive: true },
      select: selectSliderPublic,
      orderBy: { order: "asc" },
    });
    return mapSlidersToPublicDTO(sliders);
  } catch {
    return [];
  }
}

async function getInitialTrending() {
  try {
    const items = await prisma.homepageTrendingCard.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return items.map((item) => ({
      id: item.id,
      href: item.buttonLink || "#",
      title: item.title,
      badge: item.badge || "",
      attributes: item.attributes || undefined,
      image: item.image || null,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [initialSlides, initialTrending] = await Promise.all([
    getInitialSliders(),
    getInitialTrending(),
  ]);

  return (
    <main className="flex flex-col">
      <h1 className="sr-only">
        Taşınabilir Güç Kaynağı, Solar Panel ve Portable Power Station - FusionMarkt
      </h1>

      <HeroSlider initialSlides={initialSlides} />

      

      <TrendingCarousel initialProducts={initialTrending} />

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
