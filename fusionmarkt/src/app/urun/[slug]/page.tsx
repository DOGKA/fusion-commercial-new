/**
 * Ürün Detay Sayfası - SEO Optimized
 * Hem tekil ürünler hem de bundle/paket ürünler desteklenir
 * Dinamik metadata ve JSON-LD structured data ile
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SingleProductView from "@/components/product/SingleProductView";
import BundleProductView from "@/components/product/BundleProductView";
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

// Bundle verisini fetch eden yardımcı fonksiyon
async function getBundle(slug: string) {
  try {
    const bundle = await (prisma.bundle as any).findFirst({
      where: { 
        slug,
        isActive: true,
      },
      include: {
        categories: {
          include: { category: true },
          where: { isPrimary: true },
          take: 1,
        },
        items: {
          include: {
            product: {
              select: { id: true, price: true, stock: true },
            },
          },
        },
      },
    });

    if (!bundle) return null;

    // Stok ve toplam değer hesapla
    const minStock = bundle.items.length > 0
      ? Math.min(...bundle.items.map((item: any) =>
          Math.floor((item.product?.stock || 0) / item.quantity)
        ))
      : 0;

    const totalValue = bundle.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.product?.price || 0) * item.quantity);
    }, 0);

    return {
      ...bundle,
      stock: minStock,
      totalValue,
      category: bundle.categories[0]?.category || null,
      isBundle: true as const,
    };
  } catch (error) {
    console.error("Error fetching bundle for SEO:", error);
    return null;
  }
}

// Dinamik metadata oluşturucu
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Önce ürün kontrol et, yoksa bundle kontrol et
  const product = await getProduct(slug);
  
  if (product) {
    // Toplam stok hesapla
    const totalStock = product.variants?.reduce((sum: number, v: { stock: number | null }) => sum + (v.stock || 0), 0) || product.stock || 0;
    
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

  // Bundle kontrol et
  const bundle = await getBundle(slug);
  
  if (bundle) {
    const imageUrl = bundle.thumbnail || (bundle.images as string[])?.[0];
    const fullImageUrl = imageUrl?.startsWith("http") 
      ? imageUrl 
      : imageUrl 
        ? `${siteConfig.url}${imageUrl}` 
        : undefined;

    return generateProductMetadata({
      name: `${bundle.name} (Paket)`,
      description: bundle.shortDescription || bundle.description?.slice(0, 160),
      price: Number(bundle.price) || 0,
      discountPrice: bundle.totalValue > Number(bundle.price) ? Number(bundle.price) : undefined,
      image: fullImageUrl,
      brand: bundle.brand || undefined,
      category: bundle.category?.name,
      slug: bundle.slug,
      sku: bundle.sku || undefined,
      inStock: bundle.stock > 0,
    });
  }

  return {
    title: "Ürün Bulunamadı | FusionMarkt",
    description: "Aradığınız ürün bulunamadı.",
  };
}

// Sayfa bileşeni
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  
  // Önce ürün kontrol et
  const product = await getProduct(slug);

  if (product) {
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

  // Bundle kontrol et
  const bundle = await getBundle(slug);

  if (bundle) {
    // Görsel URL'leri
    const images = (bundle.images as string[]) || [];
    const imageUrls = images.map((img: string) => 
      img.startsWith("http") ? img : `${siteConfig.url}${img}`
    );

    // JSON-LD Product Schema (bundle için)
    const productSchema = generateProductSchema({
      name: `${bundle.name} (Paket)`,
      description: bundle.shortDescription || bundle.description?.slice(0, 500),
      image: imageUrls,
      price: bundle.totalValue,
      discountPrice: Number(bundle.price),
      currency: "TRY",
      sku: bundle.sku || undefined,
      brand: bundle.brand || undefined,
      category: bundle.category?.name,
      inStock: bundle.stock > 0,
      url: `/urun/${bundle.slug}`,
    });

    // Breadcrumb Schema
    const breadcrumbItems = [
      { name: "Mağaza", url: "/magaza" },
    ];
    
    if (bundle.category) {
      breadcrumbItems.push({
        name: bundle.category.name,
        url: `/kategori/${bundle.category.slug}`,
      });
    }
    
    breadcrumbItems.push({
      name: bundle.name,
      url: `/urun/${bundle.slug}`,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Ana Sayfa", url: "/" },
      ...breadcrumbItems,
    ]);

    return (
      <>
        {/* JSON-LD Structured Data */}
        <JsonLd data={[productSchema, breadcrumbSchema]} />
        
        {/* Bundle View Component */}
        <BundleProductView slug={slug} />
      </>
    );
  }

  // Ne ürün ne de bundle bulunamadı
  notFound();
}
