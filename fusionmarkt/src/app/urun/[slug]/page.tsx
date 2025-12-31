/**
 * Ürün Detay Sayfası - SEO Optimized
 * Dinamik metadata ve JSON-LD structured data ile
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SingleProductView from "@/components/product/SingleProductView";
import { JsonLd } from "@/components/seo";
import { 
  generateProductMetadata, 
  generateProductSchema, 
  generateBreadcrumbSchema,
  siteConfig 
} from "@/lib/seo";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

// Ürün verisini fetch eden yardımcı fonksiyon
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { 
        slug,
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
        reviews: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product for SEO:", error);
    return null;
  }
}

// Dinamik metadata oluşturucu
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı | FusionMarkt",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  // Toplam stok hesapla
  const totalStock = product.variants?.reduce((sum: number, v: { stock: number | null }) => sum + (v.stock || 0), 0) || product.stock || 0;
  
  // Ortalama rating hesapla
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Görsel URL'si
  const imageUrl = product.thumbnail || (product.images as string[])?.[0];
  const fullImageUrl = imageUrl?.startsWith("http") 
    ? imageUrl 
    : imageUrl 
      ? `${siteConfig.url}${imageUrl}` 
      : undefined;

  return generateProductMetadata({
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    price: Number(product.price) || 0,
    discountPrice: product.comparePrice ? Number(product.price) || 0 : undefined,
    image: fullImageUrl,
    brand: product.brand || undefined,
    category: product.category?.name,
    slug: product.slug,
    sku: product.sku || undefined,
    inStock: totalStock > 0,
  });
}

// Sayfa bileşeni
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Toplam stok hesapla
  const totalStock = product.variants?.reduce((sum: number, v: { stock: number | null }) => sum + (v.stock || 0), 0) || product.stock || 0;
  
  // Ortalama rating hesapla
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Görsel URL'leri
  const images = (product.images as string[]) || [];
  const imageUrls = images.map(img => 
    img.startsWith("http") ? img : `${siteConfig.url}${img}`
  );

  // JSON-LD Product Schema
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 500),
    image: imageUrls,
    price: Number(product.comparePrice || product.price) || 0,
    discountPrice: product.comparePrice ? Number(product.price) || 0 : undefined,
    currency: "TRY",
    sku: product.sku || undefined,
    brand: product.brand || undefined,
    category: product.category?.name,
    inStock: totalStock > 0,
    rating: reviews.length > 0 ? {
      value: Math.round(avgRating * 10) / 10,
      count: reviews.length,
    } : undefined,
    url: `/urun/${product.slug}`,
  });

  // Breadcrumb Schema
  const breadcrumbItems = [
    { name: "Mağaza", url: "/magaza" },
  ];
  
  if (product.category) {
    breadcrumbItems.push({
      name: product.category.name,
      url: `/kategori/${product.category.slug}`,
    });
  }
  
  breadcrumbItems.push({
    name: product.name,
    url: `/urun/${product.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    ...breadcrumbItems,
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      
      {/* Product View Component */}
      <SingleProductView slug={slug} />
    </>
  );
}
