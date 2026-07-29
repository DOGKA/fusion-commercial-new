import dynamic from "next/dynamic";
import HeroSlider from "@/components/home/HeroSlider";
import TrendingCarousel from "@/components/home/TrendingCarousel";
import HomeSeoContent from "@/components/home/HomeSeoContent";

// Ekran altı bölümler ayrı chunk'lara bölünür (SSR açık kalır):
// tek seferde inen JS/hydration yükünü azaltarak INP'yi iyileştirir.
const PromoBanner = dynamic(() => import("@/components/home/PromoBanner"));
const VideoBanner = dynamic(() => import("@/components/home/VideoBanner"));
const VideoGrid = dynamic(() => import("@/components/home/VideoGrid"));
const CategoryShowcase = dynamic(() => import("@/components/home/CategoryShowcase"));
const CategoryBento = dynamic(() => import("@/components/home/CategoryBento"));
const WhyFusionMarkt = dynamic(() => import("@/components/home/WhyFusionMarkt"));
const PartnerLogos = dynamic(() => import("@/components/home/PartnerLogos"));
import { staticPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { applyLiveShowcasePrices } from "@/server/showcase-live-prices";
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
    // Vitrin fiyatlarını güncel ürün/bundle fiyatlarıyla değiştir
    await applyLiveShowcasePrices(sections);
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

async function getInitialPromo() {
  try {
    const item = await prisma.homepagePromo.findFirst({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    if (!item) return null;
    return {
      title: item.title,
      subtitle: item.subtitle,
      buttonText: item.buttonText,
      buttonLink: item.buttonLink,
      image: item.image,
    };
  } catch {
    return null;
  }
}

async function getInitialVideoBanner() {
  try {
    const item = await prisma.homepageVideoBanner.findFirst({
      where: { isActive: true },
    });
    if (!item) return null;
    return {
      videoType: item.videoType,
      videoUrl: item.videoUrl,
      title: item.title,
      subtitle: item.subtitle,
      btnText: item.btnText,
      btnLink: item.btnLink,
    };
  } catch {
    return null;
  }
}

async function getInitialVideos() {
  try {
    const items = await prisma.homepageVideo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return items.map((v: { id: string; title: string; youtubeUrl: string; thumbnail: string | null }) => ({
      id: v.id,
      title: v.title,
      youtubeUrl: v.youtubeUrl,
      thumbnail: v.thumbnail,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [
    initialSlides,
    initialTrending,
    initialCategorySections,
    initialPromo,
    initialVideoBanner,
    initialVideos,
  ] = await Promise.all([
    getInitialSliders(),
    getInitialTrending(),
    getInitialCategorySections(),
    getInitialPromo(),
    getInitialVideoBanner(),
    getInitialVideos(),
  ]);

  return (
    <div data-page-root className="flex flex-col">
      <h1 className="sr-only">
        Taşınabilir Güç Kaynağı, Solar Panel ve Portable Power Station - FusionMarkt
      </h1>

      <HeroSlider initialSlides={initialSlides} />

      

      <TrendingCarousel initialProducts={initialTrending} />

      <PromoBanner initialPromo={initialPromo} />

      <VideoBanner initialItem={initialVideoBanner} />

      <CategoryShowcase index={0} initialSection={initialCategorySections[0] || null} />

      <CategoryShowcase index={1} initialSection={initialCategorySections[1] || null} />
      
      <CategoryBento />

      <VideoGrid initialVideos={initialVideos} />
      <WhyFusionMarkt />
      
      <PartnerLogos />

      <HomeSeoContent />
    </div>
  );
}
