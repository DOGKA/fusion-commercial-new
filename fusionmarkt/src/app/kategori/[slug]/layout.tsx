/**
 * Kategori Layout - Dinamik SEO Metadata
 */

import { Metadata } from "next";
import { generateCategoryMetadata, generateBreadcrumbSchema, siteConfig } from "@/lib/seo";
import { JsonLd } from "@/components/seo";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CategoryData = any;

// Kategori verisini getir
async function getCategory(slug: string): Promise<CategoryData | null> {
  try {
    const category = await (prisma as any).category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
      },
    });
    return category;
  } catch (error) {
    console.error("Error fetching category for SEO:", error);
    return null;
  }
}

// Dinamik metadata oluşturucu
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Kategori Bulunamadı",
      description: "Aradığınız kategori bulunamadı.",
    };
  }

  return generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    image: category.image || undefined,
  });
}

export default async function KategoriLayout({ params, children }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  // Breadcrumb Schema
  const breadcrumbSchema = category 
    ? generateBreadcrumbSchema([
        { name: "Ana Sayfa", url: "/" },
        { name: "Mağaza", url: "/magaza" },
        { name: category.name, url: `/kategori/${slug}` },
      ])
    : null;

  // Category ItemList Schema
  const categorySchema = category 
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/kategori/${slug}#category`,
        name: category.name,
        description: category.description || `${category.name} kategorisindeki ürünler`,
        url: `${siteConfig.url}/kategori/${slug}`,
      }
    : null;

  return (
    <>
      {breadcrumbSchema && categorySchema && (
        <JsonLd data={[categorySchema, breadcrumbSchema]} />
      )}
      {children}
    </>
  );
}

