"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { X, Layers, TrendingUp, ChevronRight, Eye } from "lucide-react";

interface SidebarPost {
  slug: string;
  title: string;
  category: string | null;
  viewCount: number;
}

interface BlogSidebarProps {
  categories: { name: string; count: number }[];
  allPosts: SidebarPost[];
  activeCategory?: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function BlogSidebar({
  categories,
  allPosts,
  activeCategory,
  onCategoryChange,
}: BlogSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const popularPosts = useMemo(() => {
    const filtered = activeCategory
      ? allPosts.filter((p) => p.category === activeCategory)
      : allPosts;
    return [...filtered]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);
  }, [allPosts, activeCategory]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  function handleCategoryClick(cat: string | null) {
    onCategoryChange(cat);
    setIsOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Kategoriler */}
      <div className="blog-sidebar__section">
        <h3 className="blog-sidebar__heading">
          <Layers className="w-4 h-4" />
          Kategoriler
        </h3>
        <ul className="blog-sidebar__list">
          <li>
            <button
              onClick={() => handleCategoryClick(null)}
              className={`blog-sidebar__link ${!activeCategory ? "blog-sidebar__link--active" : ""}`}
            >
              <span>Tümü</span>
              <span className="blog-sidebar__count">{totalCount}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className={`blog-sidebar__link ${activeCategory === cat.name ? "blog-sidebar__link--active" : ""}`}
              >
                <span>{cat.name}</span>
                <span className="blog-sidebar__count">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* En Çok Okunanlar */}
      {popularPosts.length > 0 && (
        <div className="blog-sidebar__section">
          <h3 className="blog-sidebar__heading">
            <TrendingUp className="w-4 h-4" />
            {activeCategory ? `${activeCategory} - En Çok Okunanlar` : "En Çok Okunanlar"}
          </h3>
          <ul className="blog-sidebar__posts">
            {popularPosts.map((post, i) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="blog-sidebar__post group"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="blog-sidebar__post-number">{i + 1}</span>
                  <div className="blog-sidebar__post-info">
                    <span className="blog-sidebar__post-title">{post.title}</span>
                    <div className="blog-sidebar__post-meta">
                      {post.category && (
                        <span className="blog-sidebar__post-cat">{post.category}</span>
                      )}
                      {post.viewCount > 0 && (
                        <span className="blog-sidebar__post-views">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="blog-sidebar blog-sidebar--desktop">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        className="blog-sidebar-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Blog menüsünü aç"
      >
        <Layers className="w-4 h-4" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="blog-sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Panel */}
      <aside className={`blog-sidebar blog-sidebar--mobile ${isOpen ? "blog-sidebar--open" : ""}`}>
        <div className="blog-sidebar__mobile-header">
          <h2 className="blog-sidebar__mobile-title">Blog Menü</h2>
          <button onClick={() => setIsOpen(false)} className="blog-sidebar__close" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
