import HeroSlider from "@/components/home/HeroSlider";
import CategoryBento from "@/components/home/CategoryBento";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestsellerProducts from "@/components/home/BestsellerProducts";
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

export default async function Home() {
  const initialSlides = await getInitialSliders();

  return (
    <main className="flex flex-col">
      <h1 className="sr-only">
        Taşınabilir Güç Kaynağı, Solar Panel ve Portable Power Station - FusionMarkt
      </h1>

      <HeroSlider initialSlides={initialSlides} />
      
      <FeaturedProducts />
      
      <BestsellerProducts />
      
      <CategoryBento />
      
      <PartnerLogos />

      <HomeSeoContent />
    </main>
  );
}
