import Link from "next/link";
import { CalendarDays, Clock, Eye, TrendingUp } from "lucide-react";
import { blogCover } from "@/lib/blog/cover";

export interface PopularPost {
  slug: string;
  title: string;
  category: string | null;
  viewCount: number;
  featuredImage?: string | null;
  publishedAt?: string;
}

interface BlogPopularListProps {
  posts: PopularPost[];
  /** "popular": görüntülenmeye göre; "recent": yayın tarihine göre. */
  mode?: "popular" | "recent";
  heading?: string;
  limit?: number;
  excludeSlug?: string;
  className?: string;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export default function BlogPopularList({
  posts,
  mode = "popular",
  heading,
  limit = 5,
  excludeSlug,
  className = "",
}: BlogPopularListProps) {
  const recent = mode === "recent";
  const ranked = [...posts]
    .filter((post) => post.slug !== excludeSlug && (recent || post.viewCount > 0))
    .sort((a, b) =>
      recent
        ? Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? "")
        : b.viewCount - a.viewCount
    )
    .slice(0, limit);

  if (ranked.length === 0) return null;

  const HeadingIcon = recent ? Clock : TrendingUp;

  return (
    <section className={`blog-popular ${className}`.trim()}>
      <h2 className="blog-popular__heading">
        <HeadingIcon aria-hidden="true" />
        {heading ?? (recent ? "En Yeniler" : "En Çok Okunanlar")}
      </h2>
      <ol className="blog-popular__list">
        {ranked.map((post, index) => {
          const cover = blogCover(post.featuredImage);
          return (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="blog-popular__item">
                <span className="blog-popular__rank">{index + 1}</span>
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="blog-popular__thumb"
                    src={cover.src}
                    width={800}
                    height={450}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="blog-popular__body">
                  <span className="blog-popular__title">{post.title}</span>
                  <span className="blog-popular__meta">
                    {post.category && (
                      <span className="blog-popular__category">{post.category}</span>
                    )}
                    {recent ? (
                      post.publishedAt && (
                        <time className="blog-popular__views" dateTime={post.publishedAt}>
                          <CalendarDays aria-hidden="true" />
                          {new Date(post.publishedAt).toLocaleDateString("tr-TR", DATE_FORMAT)}
                        </time>
                      )
                    ) : (
                      <span className="blog-popular__views">
                        <Eye aria-hidden="true" />
                        {post.viewCount.toLocaleString("tr-TR")} görüntülenme
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
