import { Suspense } from "react";
import Link from "next/link";
import BlogPageClient from "@/components/blog/BlogPageClient";
import BlogIndexSkeleton from "@/components/blog/BlogIndexSkeleton";
import { staticPageMetadata, generateBreadcrumbSchema, generateItemListSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";
import { calculateReadingTime, createExcerpt } from "@/lib/blog/content";

export const metadata = staticPageMetadata.blog;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: Date | null;
  category: string | null;
  viewCount: number;
  featuredImage: string | null;
}

/** `null`: sorgu başarısız; boş dizi: henüz yayımlanmış yazı yok. */
async function getBlogPosts(): Promise<BlogPost[] | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return [];

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, slug: true, title: true, content: true,
        excerpt: true, publishedAt: true, category: true, viewCount: true,
        featuredImage: true,
      },
    }) as unknown as BlogPost[];
    return posts;
  } catch (error) {
    console.error("Blog yazıları alınamadı:", error);
    return null;
  }
}

type BlogSearchParams = { cat?: string; page?: string; q?: string; sort?: string };

type BlogPageProps = {
  searchParams: Promise<BlogSearchParams>;
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Ana Sayfa", url: "/" },
  { name: "Blog", url: "/blog" },
]);

async function BlogIndex({ searchParams }: BlogPageProps) {
  const [posts, sp] = await Promise.all([getBlogPosts(), searchParams]);

  if (!posts) {
    return (
      <>
        <JsonLd data={breadcrumbSchema} />
        <div className="blog-empty blog-empty--error" role="alert">
          <h2 className="blog-empty__title">Yazılar yüklenemedi, yeniden deneyin.</h2>
          <Link href="/blog" prefetch={false} className="blog-empty__reset">
            Yeniden dene
          </Link>
        </div>
      </>
    );
  }

  // Categories with counts
  const categoryMap = new Map<string, number>();
  posts.forEach((p) => {
    if (p.category) categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
  });
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const rawCat = typeof sp.cat === "string" ? sp.cat : null;
  const decodedCat = rawCat ? decodeURIComponent(rawCat) : null;
  const initialCategory =
    decodedCat && categories.some((c) => c.name === decodedCat) ? decodedCat : null;

  const initialQuery = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const initialSort = sp.sort === "popular" ? "popular" : "recent";

  const parsedPage = Number.parseInt(sp.page ?? "", 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Serialize posts for client
  const clientPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || createExcerpt(p.content),
    publishedAt: p.publishedAt?.toISOString() || new Date().toISOString(),
    category: p.category,
    readingTime: calculateReadingTime(p.content),
    viewCount: p.viewCount,
    featuredImage: p.featuredImage,
  }));

  const schemas: Record<string, unknown>[] = [breadcrumbSchema];
  if (clientPosts.length > 0) {
    schemas.push(generateItemListSchema({
      name: "FusionMarkt Blog Yazıları",
      url: "/blog",
      itemType: "BlogPosting",
      items: clientPosts.map((post) => ({
        name: post.title,
        url: `/blog/${post.slug}`,
        image: post.featuredImage ?? undefined,
        description: post.excerpt,
      })),
    }));
  }

  return (
    <>
      <JsonLd data={schemas} />
      <BlogPageClient
        posts={clientPosts}
        categories={categories}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
        initialSort={initialSort}
        initialPage={initialPage}
      />
    </>
  );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <div data-page-root className="min-h-screen bg-[var(--background)]">
      <div className="container px-4 md:px-6 lg:px-8 pt-[110px] pb-16 md:pb-24">
        <header className="blog-masthead">
          <span className="blog-masthead__eyebrow">FusionMarkt Blog</span>
          <h1 className="blog-masthead__title">
            Enerji, ekipman ve saha bilgisi
          </h1>
          <p className="blog-masthead__description">
            Taşınabilir enerji çözümleri, endüstriyel ekipmanlar ve iş güvenliği
            üzerine uygulamaya dönük yazılar.
          </p>
        </header>

        <Suspense fallback={<BlogIndexSkeleton />}>
          <BlogIndex searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
