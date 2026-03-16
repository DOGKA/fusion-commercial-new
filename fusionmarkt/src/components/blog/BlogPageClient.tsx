"use client";

import { useState, useMemo } from "react";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string | null;
  readingTime: number;
  viewCount: number;
}

interface BlogPageClientProps {
  posts: BlogPost[];
  categories: { name: string; count: number }[];
}

export default function BlogPageClient({ posts, categories }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const sidebarPosts = useMemo(() =>
    posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      viewCount: p.viewCount,
    })),
    [posts]
  );

  return (
    <div className="blog-layout">
      {/* Main Content */}
      <div className="blog-layout__main">
        {/* Active filter indicator */}
        {activeCategory && (
          <div className="blog-filter-badge">
            <span>{activeCategory}</span>
            <button onClick={() => setActiveCategory(null)} aria-label="Filtreyi kaldır">
              &times;
            </button>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                publishedAt={post.publishedAt}
                category={post.category || undefined}
                readingTime={post.readingTime}
              />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <svg className="blog-empty__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="blog-empty__title">Bu kategoride yazı yok</h2>
            <p className="blog-empty__text">
              Başka bir kategori seçin veya tüm yazılara göz atın.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <BlogSidebar
        categories={categories}
        allPosts={sidebarPosts}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
}
