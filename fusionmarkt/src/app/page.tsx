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

async function getInitialSliders() {
  try {
    const sliders = await prisma.slider.findMany({
      where: { isActive: true },
      select: selectSliderPublic,
      orderBy: { order: "asc" },
      take: 5,
    });
    return mapSlidersToPublicDTO(sliders);
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialSlides = await getInitialSliders();
  const firstDesktopImage = initialSlides.find((s) => s.showOnDesktop)?.desktopImage;

  return (
    <main className="flex flex-col">
      {firstDesktopImage && (
        <link
          rel="preload"
          as="image"
          href={`/_next/image?url=${encodeURIComponent(firstDesktopImage)}&w=1920&q=75`}
        />
      )}

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
