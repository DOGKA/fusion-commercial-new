import BlogPageClient from "@/components/blog/BlogPageClient";
import { staticPageMetadata, generateBreadcrumbSchema, generateItemListSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";
import "@/styles/blog.css";

export const metadata = staticPageMetadata.blog;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  category: string | null;
  viewCount: number;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function createExcerpt(content: string, maxLength: number = 200): string {
  const text = content
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\\r\\n|\\n|\\r/g, " ")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return [];
    
    // viewCount alanı yeni eklendi - Prisma type cache eski olabilir
    const posts = await (prisma.blogPost.findMany as Function)({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, slug: true, title: true, content: true,
        excerpt: true, featuredImage: true, publishedAt: true,
        category: true, viewCount: true,
      },
    }) as BlogPost[];
    return posts;
  } catch (error) {
    console.log("Blog posts table may not exist yet:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Categories with counts
  const categoryMap = new Map<string, number>();
  posts.forEach((p) => {
    if (p.category) categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
  });
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

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
  }));

  // SEO schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);
  const schemas: Record<string, unknown>[] = [breadcrumbSchema];
  if (posts.length > 0) {
    schemas.push(generateItemListSchema({
      name: "FusionMarkt Blog Yazıları",
      url: "/blog",
      items: posts.map((post) => ({
        name: post.title,
        url: `/blog/${post.slug}`,
        image: post.featuredImage || undefined,
      })),
    }));
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <JsonLd data={schemas} />
      <div className="container px-4 md:px-6 lg:px-8 pt-[120px] pb-12 md:pb-16">
        {/* Page Header */}
        <header className="blog-page-header">
          <h1 className="blog-page-header__title">Blog</h1>
          <p className="blog-page-header__description">
            Endüstriyel ekipmanlar, taşınabilir enerji çözümleri, iş güvenliği
            ve sektörel gelişmeler hakkında güncel içerikler.
          </p>
        </header>

        {/* Blog Content + Sidebar */}
        <BlogPageClient posts={clientPosts} categories={categories} />
      </div>
    </main>
  );
}
