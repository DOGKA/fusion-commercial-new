"use client";

import { useState, useMemo } from "react";
import { X, Layers, TrendingUp, ChevronRight, Eye } from "lucide-react";

export interface FaqSidebarCategory {
  slug: string;
  name: string;
  count: number;
}

export interface FaqSidebarPopularItem {
  id: string;
  question: string;
  excerpt: string;
  viewCount: number;
}

interface FaqSidebarProps {
  categories: FaqSidebarCategory[];
  popular: FaqSidebarPopularItem[];
  totalCount: number;
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  onPopularSelect: (id: string) => void;
}

export default function FaqSidebar({
  categories,
  popular,
  totalCount,
  activeCategory,
  onCategoryChange,
  onPopularSelect,
}: FaqSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedPopular = useMemo(
    () =>
      [...popular].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
    [popular],
  );

  function handleCategoryClick(slug: string | null) {
    onCategoryChange(slug);
    setIsOpen(false);
  }

  function handlePopularClick(id: string) {
    onPopularSelect(id);
    setIsOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="blog-sidebar__section">
        <h3 className="blog-sidebar__heading">
          <Layers className="w-4 h-4" />
          Kategoriler
        </h3>
        <ul className="blog-sidebar__list">
          <li>
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`blog-sidebar__link ${activeCategory === null ? "blog-sidebar__link--active" : ""}`}
            >
              <span>Tümünü Göster</span>
              <span className="blog-sidebar__count">{totalCount}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`blog-sidebar__link ${activeCategory === cat.slug ? "blog-sidebar__link--active" : ""}`}
              >
                <span>{cat.name}</span>
                <span className="blog-sidebar__count">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {sortedPopular.length > 0 && (
        <div className="blog-sidebar__section">
          <h3 className="blog-sidebar__heading">
            <TrendingUp className="w-4 h-4" />
            En Çok Okunanlar
          </h3>
          <ul className="blog-sidebar__posts">
            {sortedPopular.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handlePopularClick(item.id)}
                  className="blog-sidebar__post faq-sidebar__post group w-full text-left"
                >
                  <span className="blog-sidebar__post-number">{i + 1}</span>
                  <div className="blog-sidebar__post-info">
                    <span className="blog-sidebar__post-title">{item.question}</span>
                    <span className="faq-sidebar__post-excerpt">{item.excerpt}</span>
                    {item.viewCount > 0 && (
                      <span className="faq-sidebar__post-views">
                        <Eye className="w-3 h-3" />
                        {item.viewCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className="blog-sidebar blog-sidebar--desktop faq-sidebar">{sidebarContent}</aside>

      <button
        className="blog-sidebar-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="SSS menüsünü aç"
      >
        <Layers className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="blog-sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`blog-sidebar blog-sidebar--mobile ${isOpen ? "blog-sidebar--open" : ""}`}
      >
        <div className="blog-sidebar__mobile-header">
          <h2 className="blog-sidebar__mobile-title">SSS Menü</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="blog-sidebar__close"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
