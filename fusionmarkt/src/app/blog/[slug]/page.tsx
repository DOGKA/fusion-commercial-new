import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogContent from "@/components/blog/BlogContent";
import BlogShare from "@/components/blog/BlogShare";
import BlogViewTracker from "@/components/blog/BlogViewTracker";
import BlogToc from "@/components/blog/BlogToc";
import BlogReadingProgress from "@/components/blog/BlogReadingProgress";
import BlogPostNav, { type AdjacentPost } from "@/components/blog/BlogPostNav";
import BlogPostRow from "@/components/blog/BlogPostRow";
import BlogPopularList from "@/components/blog/BlogPopularList";
import { JsonLd } from "@/components/seo";
import {
  generateBlogMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
  siteConfig,
} from "@/lib/seo";
import {
  prepareBlogContent,
  calculateReadingTime,
  createExcerpt,
} from "@/lib/blog/content";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: Date | null;
  updatedAt: Date | null;
  category: string | null;
  status: string;
  viewCount: number;
}

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: Date | null;
  category: string | null;
  viewCount: number;
}

const SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  content: true,
  excerpt: true,
  publishedAt: true,
  category: true,
  viewCount: true,
} as const;

async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return null;
    return await prisma.blogPost.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getRelatedPosts(
  postId: string,
  category: string | null
): Promise<BlogPostSummary[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return [];

    let relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: postId },
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: SUMMARY_SELECT,
    });

    // Aynı kategoride yeterli yazı yoksa en yeni yazılarla tamamla.
    if (relatedPosts.length < 3) {
      const additionalPosts = await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          id: { notIn: [postId, ...relatedPosts.map((p: BlogPostSummary) => p.id)] },
        },
        orderBy: { publishedAt: "desc" },
        take: 3 - relatedPosts.length,
        select: SUMMARY_SELECT,
      });
      relatedPosts = [...relatedPosts, ...additionalPosts];
    }

    return relatedPosts;
  } catch (error) {
    console.log("Error fetching related posts:", error);
    return [];
  }
}

/** Yayın tarihine göre komşu yazılar ve en çok okunanlar. */
async function getNavigationData(
  slug: string,
  publishedAt: Date | null
): Promise<{
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
  popular: { slug: string; title: string; category: string | null; viewCount: number }[];
}> {
  const empty = { previous: null, next: null, popular: [] };
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return empty;

    const adjacentSelect = { slug: true, title: true, category: true } as const;
    const [previous, next, popular] = await Promise.all([
      publishedAt
        ? prisma.blogPost.findFirst({
            where: { status: "PUBLISHED", slug: { not: slug }, publishedAt: { lt: publishedAt } },
            orderBy: { publishedAt: "desc" },
            select: adjacentSelect,
          })
        : null,
      publishedAt
        ? prisma.blogPost.findFirst({
            where: { status: "PUBLISHED", slug: { not: slug }, publishedAt: { gt: publishedAt } },
            orderBy: { publishedAt: "asc" },
            select: adjacentSelect,
          })
        : null,
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", slug: { not: slug } },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { slug: true, title: true, category: true, viewCount: true },
      }),
    ]);

    return { previous, next, popular };
  } catch (error) {
    console.log("Error fetching blog navigation data:", error);
    return empty;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPost(slug);

    if (!post) {
      return { title: "Blog Yazısı Bulunamadı | FusionMarkt" };
    }

    return generateBlogMetadata({
      title: post.title,
      excerpt: post.excerpt || createExcerpt(post.content, 155),
      slug: post.slug,
      // Yazılarda görsel kullanılmadığından paylaşım kartı başlıktan üretilir.
      image: `${siteConfig.url}/blog/${slug}/opengraph-image`,
      publishedAt: post.publishedAt?.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      tags: post.category ? [post.category] : undefined,
    });
  } catch {
    return { title: "Blog | FusionMarkt" };
  }
}

export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    if (typeof prisma.blogPost === "undefined") return [];

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });

    return posts.map((post: { slug: string }) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await getBlogPost(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const [relatedPosts, navigation] = await Promise.all([
    getRelatedPosts(post.id, post.category),
    getNavigationData(post.slug, post.publishedAt),
  ]);

  const { html, headings } = prepareBlogContent(post.content, post.title);
  const readingTime = calculateReadingTime(post.content);
  const publishedAt = post.publishedAt?.toISOString() || new Date().toISOString();
  const pageUrl = `${siteConfig.url}/blog/${slug}`;

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt || createExcerpt(post.content, 155),
    publishedAt,
    updatedAt: post.updatedAt?.toISOString(),
    url: `/blog/${slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  return (
    <>
      <BlogViewTracker slug={post.slug} />
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      <div data-page-root className="min-h-screen bg-[var(--background)]">
        <div className="container px-4 md:px-6 lg:px-8 pt-[110px] pb-16 md:pb-24">
          <div className="blog-detail">
            <article className="blog-article">
              <BlogHeader
                title={post.title}
                publishedAt={publishedAt}
                updatedAt={post.updatedAt?.toISOString()}
                category={post.category || undefined}
                readingTime={readingTime}
                viewCount={post.viewCount}
              />

              {/* İçindekiler rayı gövdeyle aynı satırda: masaüstünde metnin
                  başladığı hizada, mobilde başlığın hemen altında görünür. */}
              <div className="blog-article__layout">
                <div className="blog-article__body">
                  <BlogContent html={html} />

                  <BlogShare title={post.title} url={pageUrl} />
                </div>

                <aside className="blog-article__rail">
                  <BlogToc headings={headings} />
                </aside>
              </div>
            </article>

            <BlogPostNav previous={navigation.previous} next={navigation.next} />

            {relatedPosts.length > 0 && (
              <section className="blog-related">
                <h2 className="blog-related__title">İlgili Yazılar</h2>
                <div className="blog-rows blog-rows--compact">
                  {relatedPosts.map((relatedPost) => (
                    <BlogPostRow
                      key={relatedPost.id}
                      slug={relatedPost.slug}
                      title={relatedPost.title}
                      excerpt={relatedPost.excerpt || createExcerpt(relatedPost.content, 140)}
                      publishedAt={
                        relatedPost.publishedAt?.toISOString() || new Date().toISOString()
                      }
                      category={relatedPost.category}
                      readingTime={calculateReadingTime(relatedPost.content)}
                    />
                  ))}
                </div>
              </section>
            )}

            <BlogPopularList
              posts={navigation.popular}
              className="blog-detail__popular"
            />
          </div>
        </div>
      </div>

      {/* Fixed konumlu olduğu için en sonda: Next.js'in auto-scroll'u segmentin
          ilk elemanını hedeflediğinden başta durursa uyarı üretiyor. */}
      <BlogReadingProgress />
    </>
  );
}
