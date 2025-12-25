"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt: string;
  category?: string;
  readingTime?: number;
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  publishedAt,
  category,
  readingTime,
}: BlogCardProps) {
  // Format date in Turkish
  const formattedDate = new Date(publishedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Clean excerpt from \r\n
  const cleanExcerpt = excerpt
    ?.replace(/\\r\\n|\\n|\\r/g, " ")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <Link href={`/blog/${slug}`} className="blog-card group">
      {/* Meta - Category & Date */}
      <div className="blog-card__meta">
        {category && <span className="blog-card__category">{category}</span>}
        <span className="blog-card__date">{formattedDate}</span>
      </div>

      {/* Title */}
      <h3 className="blog-card__title">{title}</h3>

      {/* Excerpt */}
      {cleanExcerpt && <p className="blog-card__excerpt">{cleanExcerpt}</p>}

      {/* Footer */}
      <div className="blog-card__footer">
        {/* Reading Time */}
        {readingTime && (
          <div className="blog-card__reading-time">
            <Clock className="w-3.5 h-3.5" />
            <span>{readingTime} dk</span>
          </div>
        )}
        
        {/* Read More Link */}
        <span className="blog-card__link">
          Devamını Oku
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
