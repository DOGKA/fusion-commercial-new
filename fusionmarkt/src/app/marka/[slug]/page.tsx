import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPartnerBySlug, getAllPartnerSlugs } from "@/lib/partners-data";
import BrandPageClient from "@/components/brand/BrandPageClient";
import { JsonLd } from "@/components/seo";
import { generateBrandMetadata, generateBreadcrumbSchema, siteConfig } from "@/lib/seo";

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
    return { title: "Marka Bulunamadı | FusionMarkt" };
  }
  
  return generateBrandMetadata({
    name: partner.name,
    slug,
    description: partner.tagline,
    logo: partner.logo,
  });
}

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  // Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Mağaza", url: "/magaza" },
    { name: partner.name, url: `/marka/${slug}` },
  ]);

  // Brand Organization Schema
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${siteConfig.url}/marka/${slug}#brand`,
    name: partner.name,
    description: partner.tagline,
    logo: partner.logo,
    url: `${siteConfig.url}/marka/${slug}`,
  };

  return (
    <>
      <JsonLd data={[brandSchema, breadcrumbSchema]} />
      <BrandPageClient partner={partner} />
    </>
  );
}
