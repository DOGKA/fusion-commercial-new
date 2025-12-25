import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPartnerBySlug, getAllPartnerSlugs } from "@/lib/partners-data";
import BrandPageClient from "@/components/brand/BrandPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPartnerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);
  
  if (!partner) {
    return { title: "Marka Bulunamadı" };
  }
  
  return {
    title: `${partner.name} | FusionMarkt`,
    description: partner.tagline,
  };
}

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  return <BrandPageClient partner={partner} />;
}
