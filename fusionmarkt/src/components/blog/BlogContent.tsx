"use client";

import { useMemo } from "react";

interface BlogContentProps {
  content: string;
  title?: string;
}

// Basic HTML sanitizer - removes dangerous tags and attributes
function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove style tags and their content
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove inline style attributes
  clean = clean.replace(/\s*style\s*=\s*["'][^"']*["']/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, "");
  
  return clean;
}

export default function BlogContent({ content, title }: BlogContentProps) {
  // Sanitize and process HTML content
  const sanitizedContent = useMemo(() => {
    if (!content) return "";

    let processedContent = content;

    // Remove the duplicate title at the beginning if it matches
    if (title) {
      // Create regex pattern to match title at start with various wrappers
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titlePatterns = [
        // Match title in heading tags at the start
        new RegExp(`^\\s*<h[1-6][^>]*>\\s*${escapedTitle}\\s*<\\/h[1-6]>\\s*`, 'i'),
        // Match title in strong/bold at the start
        new RegExp(`^\\s*<(strong|b)[^>]*>\\s*${escapedTitle}\\s*<\\/(strong|b)>\\s*`, 'i'),
        // Match plain title at the start
        new RegExp(`^\\s*${escapedTitle}\\s*`, 'i'),
      ];
      
      for (const pattern of titlePatterns) {
        processedContent = processedContent.replace(pattern, '');
      }
    }

    // Clean up WordPress-specific markup and escaped characters
    processedContent = processedContent
      // Remove escaped newlines (literal \r\n, \n, \r)
      .replace(/\\r\\n/g, "<br />")
      .replace(/\\n/g, "<br />")
      .replace(/\\r/g, "<br />")
      // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/gi, "")
      // Clean up multiple line breaks
      .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
      // Remove leading line breaks
      .replace(/^(\s*<br\s*\/?>\s*)+/i, "")
      // Remove leading whitespace-only paragraphs
      .replace(/^(<p>\s*<br\s*\/?>\s*<\/p>\s*)+/gi, "");

    // Sanitize HTML
    return sanitizeHtml(processedContent);
  }, [content, title]);

  if (!sanitizedContent) {
    return (
      <div className="blog-content">
        <p className="text-[var(--foreground-tertiary)] italic">
          İçerik yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
