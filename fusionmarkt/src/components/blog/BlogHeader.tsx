"use client";

import Link from "next/link";
import { Clock, Calendar, ChevronRight } from "lucide-react";

interface BlogHeaderProps {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  category?: string;
  readingTime?: number;
  author?: string;
}

export default function BlogHeader({
  title,
  publishedAt,
  updatedAt,
  category,
  readingTime,
  author = "FusionMarkt",
}: BlogHeaderProps) {
  // Format dates in Turkish
  const formattedDate = new Date(publishedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedUpdateDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <header className="blog-article__header">
      {/* Breadcrumb */}
      <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--foreground-tertiary)' }}>Ana Sayfa</Link>
        <span style={{ opacity: 0.4, margin: '0 6px' }}>/</span>
        <Link href="/blog" style={{ color: 'var(--foreground-tertiary)' }}>Blog</Link>
        {category && (
          <>
            <span style={{ opacity: 0.4, margin: '0 6px' }}>/</span>
            <span>{category}</span>
          </>
        )}
      </p>

      {/* Title */}
      <h1 className="blog-article__title">{title}</h1>

      {/* Meta */}
      <div className="blog-article__meta">
        {/* Author */}
        <div className="blog-article__meta-item">
          <span className="blog-article__author">{author}</span>
        </div>

        <div className="blog-article__meta-divider" />

        {/* Date */}
        <div className="blog-article__meta-item">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        {/* Reading Time */}
        {readingTime && (
          <>
            <div className="blog-article__meta-divider" />
            <div className="blog-article__meta-item">
              <Clock className="w-4 h-4" />
              <span>{readingTime} dakika okuma</span>
            </div>
          </>
        )}

        {/* Updated Date */}
        {formattedUpdateDate && formattedUpdateDate !== formattedDate && (
          <>
            <div className="blog-article__meta-divider" />
            <div className="blog-article__meta-item" style={{ color: 'var(--foreground-tertiary)' }}>
              <span>Güncelleme: {formattedUpdateDate}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
