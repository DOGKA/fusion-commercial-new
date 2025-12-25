import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogHeader, BlogContent, BlogShare, BlogCard } from "@/components/blog";
import "@/styles/blog.css";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Blog post types
interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date;
  updatedAt: Date | null;
  category: string | null;
  status: string;
}

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date;
  category: string | null;
}

// Calculate reading time from content
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Strip HTML tags and clean content for excerpt
function createExcerpt(content: string, maxLength: number = 140): string {
  const text = content
    .replace(/<[^>]+>/g, "")           // Remove HTML tags
    .replace(/\\r\\n|\\n|\\r/g, " ")   // Remove escaped newlines
    .replace(/\r\n|\n|\r/g, " ")       // Remove actual newlines
    .replace(/\s+/g, " ")              // Normalize whitespace
    .trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// Fetch a single blog post
async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    if (typeof prisma.blogPost === "undefined") {
      return null;
    }
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    
    return post;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// Fetch related posts
async function getRelatedPosts(
  postId: string,
  category: string | null
): Promise<BlogPostSummary[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    if (typeof prisma.blogPost === "undefined") {
      return [];
    }
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    let relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: postId },
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        category: true,
      },
    });

    // If not enough related posts in same category, get recent posts
    if (relatedPosts.length < 3) {
      // @ts-expect-error - BlogPost may not exist in schema yet
      const additionalPosts = await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          id: {
            notIn: [postId, ...relatedPosts.map((p: BlogPostSummary) => p.id)],
          },
        },
        orderBy: { publishedAt: "desc" },
        take: 3 - relatedPosts.length,
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
          category: true,
        },
      });
      relatedPosts = [...relatedPosts, ...additionalPosts];
    }

    return relatedPosts;
  } catch (error) {
    console.log("Error fetching related posts:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPost(slug);

    if (!post) {
      return {
        title: "Blog Yazısı Bulunamadı | FusionMarkt",
      };
    }

    const description = post.excerpt || createExcerpt(post.content);

    return {
      title: `${post.title} | FusionMarkt Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
        images: post.featuredImage ? [post.featuredImage] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch {
    return {
      title: "Blog | FusionMarkt",
    };
  }
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    if (typeof prisma.blogPost === "undefined") {
      return [];
    }
    
    // @ts-expect-error - BlogPost may not exist in schema yet
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });

    return posts.map((post: { slug: string }) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Fetch the blog post
  const post = await getBlogPost(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post.id, post.category);

  const readingTime = calculateReadingTime(post.content);
  const pageUrl = `https://fusionmarkt.com/blog/${slug}`;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container px-4 md:px-6 lg:px-8 pt-[120px] pb-12 md:pb-16">
        <article className="blog-article">
          {/* Header */}
          <BlogHeader
            title={post.title}
            publishedAt={post.publishedAt.toISOString()}
            updatedAt={post.updatedAt?.toISOString()}
            category={post.category || undefined}
            readingTime={readingTime}
          />

          {/* Content */}
          <BlogContent content={post.content} title={post.title} />

          {/* Share */}
          <BlogShare title={post.title} url={pageUrl} />
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="blog-related">
            <h2 className="blog-related__title">İlgili Yazılar</h2>
            <div className="blog-grid">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost.id}
                  slug={relatedPost.slug}
                  title={relatedPost.title}
                  excerpt={
                    relatedPost.excerpt || createExcerpt(relatedPost.content)
                  }
                  publishedAt={relatedPost.publishedAt.toISOString()}
                  category={relatedPost.category || undefined}
                  readingTime={calculateReadingTime(relatedPost.content)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
