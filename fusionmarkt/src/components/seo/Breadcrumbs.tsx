/**
 * SEO-Friendly Breadcrumbs Component
 * Hem görsel hem de JSON-LD desteği
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { generateBreadcrumbSchema, type BreadcrumbItem } from "@/lib/seo";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, showHome = true, className = "" }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ name: "Ana Sayfa", url: "/" }, ...items]
    : items;

  const schema = generateBreadcrumbSchema(allItems);

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <div key={item.url} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-white/90 font-medium truncate max-w-[200px]" title={item.name}>
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  {isHome && <Home className="w-4 h-4" />}
                  <span className={isHome ? "sr-only sm:not-sr-only" : ""}>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default Breadcrumbs;

