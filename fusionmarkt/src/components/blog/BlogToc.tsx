"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import type { BlogHeading } from "@/lib/blog/content";

interface BlogTocProps {
  headings: BlogHeading[];
}

export default function BlogToc({ headings }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    // Üst şeridi görünür alanın tepesine yakın tutarak "şu an okunan başlık"
    // hissini yakalar; alt sınır ekranın ortasında.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
          return;
        }

        // Hiçbiri bantta değilse, tepenin üstünde kalan son başlık aktiftir.
        const above = elements.filter((element) => element.getBoundingClientRect().top < 140);
        if (above.length > 0) setActiveId(above[above.length - 1].id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="blog-toc" aria-label="İçindekiler">
      <button
        type="button"
        className="blog-toc__toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <List aria-hidden="true" />
        <span>İçindekiler</span>
        <span className="blog-toc__count">{headings.length}</span>
        <ChevronDown className="blog-toc__chevron" aria-hidden="true" />
      </button>

      <p className="blog-toc__heading">İçindekiler</p>

      <ol className={`blog-toc__list ${isOpen ? "is-open" : ""}`}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`blog-toc__item blog-toc__item--h${heading.level}`}
          >
            <a
              href={`#${heading.id}`}
              className={`blog-toc__link ${activeId === heading.id ? "is-active" : ""}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
