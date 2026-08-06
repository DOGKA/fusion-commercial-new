import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPartnerBySlug, getAllPartnerSlugs } from "@/lib/partners-data";
import { getBrandProducts } from "@/lib/brand-products";
import BrandPageClient from "@/components/brand/BrandPageClient";
import { JsonLd } from "@/components/seo";
import {
  generateBrandMetadata,
  generateBreadcrumbSchema,
  generateItemListSchema,
  siteConfig,
} from "@/lib/seo";
import BrandProductList from "./_components/BrandProductList";

/** Ürün fiyat ve stokları listede göründüğü için sayfa 5 dakikada tazeleniyor. */
export const revalidate = 300;

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

  const products = await getBrandProducts(partner);

  const listSchema =
    products.length > 0
      ? generateItemListSchema({
          name: `${partner.name} ürünleri`,
          description: partner.tagline,
          url: `/marka/${slug}`,
          items: products.map((product) => ({
            name: product.name,
            url: `/urun/${product.slug}`,
            image: product.thumbnail ?? undefined,
            price: product.price,
            brand: partner.name,
            sku: product.sku ?? undefined,
            inStock: product.inStock,
            description: product.shortDescription ?? undefined,
          })),
        })
      : null;

  return (
    <>
      <JsonLd
        data={listSchema ? [brandSchema, breadcrumbSchema, listSchema] : [brandSchema, breadcrumbSchema]}
      />
      <h1 className="sr-only">{partner.name} Ürünleri - FusionMarkt Yetkili Distribütör</h1>
      <BrandPageClient
        partner={partner}
        productsSlot={<BrandProductList brandName={partner.name} products={products} />}
      />
    </>
  );
}
