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

interface TrendingCardRow {
  id: string;
  buttonLink: string | null;
  title: string;
  badge: string | null;
  attributes: string | null;
  image: string | null;
}

interface CategorySectionProductRow {
  title: string;
  badge: string | null;
  spec1: string | null;
  spec2: string | null;
  price: string | null;
  image: string | null;
  link: string | null;
}

interface CategorySectionRow {
  sectionTitle: string;
  bannerImage: string | null;
  bannerEyebrow: string | null;
  bannerTitle: string | null;
  bannerDesc: string | null;
  bannerBtnText: string | null;
  bannerBtnLink: string | null;
  seeMoreImage: string | null;
  seeMoreLink: string | null;
  accessoryText: string | null;
  accessoryLink: string | null;
  products: CategorySectionProductRow[];
}

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
    return items.map((item: TrendingCardRow) => ({
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

async function getInitialCategorySections() {
  try {
    const sections = await prisma.homepageCategorySection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        products: {
          orderBy: { order: "asc" },
        },
      },
    });
    return sections.map((s: CategorySectionRow) => ({
      sectionTitle: s.sectionTitle,
      bannerImage: s.bannerImage,
      bannerEyebrow: s.bannerEyebrow,
      bannerTitle: s.bannerTitle,
      bannerDesc: s.bannerDesc,
      bannerBtnText: s.bannerBtnText,
      bannerBtnLink: s.bannerBtnLink,
      seeMoreImage: s.seeMoreImage,
      seeMoreLink: s.seeMoreLink,
      accessoryText: s.accessoryText,
      accessoryLink: s.accessoryLink,
      products: s.products.map((p: CategorySectionProductRow) => ({
        title: p.title,
        badge: p.badge,
        spec1: p.spec1,
        spec2: p.spec2,
        price: p.price,
        image: p.image,
        link: p.link,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [initialSlides, initialTrending, initialCategorySections] = await Promise.all([
    getInitialSliders(),
    getInitialTrending(),
    getInitialCategorySections(),
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

      <CategoryShowcase index={0} initialSection={initialCategorySections[0] || null} />

      <CategoryShowcase index={1} initialSection={initialCategorySections[1] || null} />
      
      <CategoryBento />

      <VideoGrid />
      <WhyFusionMarkt />
      
      <PartnerLogos />

      <HomeSeoContent />
    </main>
  );
}
