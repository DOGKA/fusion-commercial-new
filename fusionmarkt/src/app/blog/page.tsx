import { Metadata } from "next";
import BlogCard from "@/components/blog/BlogCard";
import "@/styles/blog.css";

export const metadata: Metadata = {
  title: "Blog | FusionMarkt",
  description:
    "FusionMarkt blog - Endüstriyel ekipmanlar, taşınabilir enerji çözümleri ve daha fazlası hakkında güncel yazılar.",
  openGraph: {
    title: "Blog | FusionMarkt",
    description:
      "Endüstriyel ekipmanlar, taşınabilir enerji çözümleri ve daha fazlası hakkında güncel yazılar.",
    type: "website",
  },
};

// Blog post type
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
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

// Fetch blog posts from database
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Dynamic import to handle case where table doesn't exist yet
    const { prisma } = await import("@/lib/prisma");
    
    // Check if BlogPost model exists in schema
    if (typeof prisma.blogPost === "undefined") {
      return [];
    }
    
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        publishedAt: "desc",
      },
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
    
    return posts;
  } catch (error) {
    // If table doesn't exist yet, return empty array
    console.log("Blog posts table may not exist yet:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container px-4 md:px-6 lg:px-8 pt-[120px] pb-12 md:pb-16">
        {/* Page Header */}
        <header className="blog-page-header">
          <h1 className="blog-page-header__title">Blog</h1>
          <p className="blog-page-header__description">
            Endüstriyel ekipmanlar, taşınabilir enerji çözümleri, iş güvenliği
            ve sektörel gelişmeler hakkında güncel içerikler.
          </p>
        </header>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt || createExcerpt(post.content)}
                publishedAt={post.publishedAt?.toISOString() || new Date().toISOString()}
                category={post.category || undefined}
                readingTime={calculateReadingTime(post.content)}
              />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <svg 
              className="blog-empty__icon" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h2 className="blog-empty__title">Henüz blog yazısı yok</h2>
            <p className="blog-empty__text">
              Yakında yeni içerikler eklenecek. Takipte kalın!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
