/**
 * FusionMarkt Dynamic Sitemap
 * Otomatik olarak tüm sayfaları, ürünleri, kategorileri ve blog yazılarını içerir
 * Google Image Sitemap desteği ile ürün görselleri de dahil
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

// Sabit tarihler - her build'de değişmemeli (SEO best practice)
const STATIC_LAST_MODIFIED = new Date("2026-01-15");
const LEGAL_LAST_MODIFIED = new Date("2025-12-20");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/magaza`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sh4000`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sikca-sorulan-sorular`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guc-hesaplayici`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kullanim-kilavuzlari`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gonderim-yerleri`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/odeme-secenekleri`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Yasal sayfalar
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cerez-politikasi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/iade-politikasi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mesafeli-satis-sozlesmesi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanici-sozlesmesi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/ucretlendirme-politikasi`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dinamik sayfalar - Ürünler (görseller dahil - Google Image Sitemap)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        thumbnail: true,
        images: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    productPages = products.map((product) => ({
      url: `${baseUrl}/urun/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [
        ...(product.thumbnail ? [product.thumbnail] : []),
        ...(Array.isArray(product.images) ? (product.images as string[]).slice(0, 4) : []),
      ].filter(Boolean),
    }));
  } catch (error) {
    console.error("Sitemap: Error fetching products", error);
  }

  // Dinamik sayfalar - Kategoriler
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    categoryPages = categories.map((category: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/kategori/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap: Error fetching categories", error);
  }

  // Markalar - Sabit liste
  const brandPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/marka/ieetek`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${baseUrl}/marka/traffi`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/marka/telesteps`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/marka/rgp-balls`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly" as const, priority: 0.65 },
  ];

  // Dinamik sayfalar - Bundle / Paket Ürünler
  let bundlePages: MetadataRoute.Sitemap = [];
  try {
    const bundles = await prisma.bundle.findMany({
      where: { 
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    bundlePages = bundles.map((bundle: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/urun/${bundle.slug}`,
      lastModified: bundle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error("Sitemap: Error fetching bundles", error);
  }

  // Dinamik sayfalar - Blog yazıları
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: { 
        publishedAt: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    blogPages = blogPosts.map((post: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: Error fetching blog posts", error);
  }

  return [
    ...staticPages,
    ...productPages,
    ...bundlePages,
    ...categoryPages,
    ...brandPages,
    ...blogPages,
  ];
}
