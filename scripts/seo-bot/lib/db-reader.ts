/**
 * Database Reader
 * Prisma ile ürün, kategori, blog, teknik spec verilerini okur
 */
import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";

let prisma: PrismaClient | null = null;

function loadEnv(): void {
  const envPath = path.resolve(__dirname, "../../../fusionmarkt/.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

export function getDb(): PrismaClient {
  if (!prisma) {
    loadEnv();
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export interface ProductWithSpecs {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  brand: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  technicalSpecs: { label: string; value: string; group: string | null; order: number }[];
  keyFeatures: { title: string; icon: string | null; order: number }[];
}

export async function getProductsWithSpecs(): Promise<ProductWithSpecs[]> {
  const db = getDb();
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      technicalSpecs: { orderBy: { order: "asc" } },
      keyFeatures: { orderBy: { order: "asc" } },
    },
  });

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  })) as unknown as ProductWithSpecs[];
}

export async function getProductBySlugKeyword(keyword: string): Promise<ProductWithSpecs | null> {
  const db = getDb();
  const product = await db.product.findFirst({
    where: {
      isActive: true,
      slug: { contains: keyword.toLowerCase() },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      technicalSpecs: { orderBy: { order: "asc" } },
      keyFeatures: { orderBy: { order: "asc" } },
    },
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  } as unknown as ProductWithSpecs;
}

export interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

export async function getCategoriesWithCounts(): Promise<CategoryWithProducts[]> {
  const db = getDb();
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: (c as Record<string, unknown>).description as string | null ?? null,
    productCount: c._count.products,
  }));
}

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  status: string;
}

export async function getBlogPosts(): Promise<BlogPostData[]> {
  const db = getDb();
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return posts as unknown as BlogPostData[];
}

export async function getAllProducts(): Promise<ProductWithSpecs[]> {
  return getProductsWithSpecs();
}
