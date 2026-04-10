"use client";

import { useState, useEffect } from "react";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";

interface TrendingProduct {
  id?: string;
  href: string;
  title: string;
  badge: string;
  attributes?: string;
  image?: string | null;
}

interface TrendingApiItem {
  id: string;
  buttonLink: string | null;
  title: string;
  badge: string | null;
  attributes: string | null;
  image: string | null;
}

const MOCK_PRODUCTS: TrendingProduct[] = Array.from({ length: 13 }, (_, i) => ({
  href: "#",
  title: `Ürün Adı ${i + 1}`,
  badge: "Yeni",
  attributes: i === 0 || i >= 11 ? undefined : "Özellik 1 | Özellik 2",
}));

export default function TrendingCarousel() {
  const [products, setProducts] = useState<TrendingProduct[]>(MOCK_PRODUCTS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/trending");
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setProducts(data.items.map((item: TrendingApiItem) => ({
              id: item.id,
              href: item.buttonLink || "#",
              title: item.title,
              badge: item.badge || "",
              attributes: item.attributes || undefined,
              image: item.image || null,
            })));
          }
        }
      } catch { /* fallback to mock */ }
    };
    fetchData();
  }, []);

  const {
    containerRef,
    wrapperRef,
    containerStyle,
    wrapperStyle,
    handlers,
    scrollBy,
  } = useTransformCarousel({ friction: 0.95 });

  return (
    <section className="pt-10 lg:pt-12 pb-6 lg:pb-8">
      <div className="container">
        <div className="flex justify-end mb-3">
          <CarouselNavButtons
            scrollBy={scrollBy}
            scrollAmount={394}
            theme="neutral"
          />
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          style={containerStyle}
        >
          <div
            ref={wrapperRef}
            style={{ ...wrapperStyle, gap: "16px", paddingLeft: "var(--container-padding)", paddingRight: "16px" }}
            {...handlers}
            className="flex items-stretch pb-4"
          >
            {products.map((product, index) => (
              <div key={product.id || index} className="trending-product-card theme-dark">
                <a href={product.href} className="product-card-link">
                  <div
                    className="product-card-background"
                    style={product.image
                      ? { backgroundImage: `url('${product.image}')` }
                      : { backgroundColor: "var(--background-tertiary)" }
                    }
                  >
                    {!product.image && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", zIndex: 1 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground-muted)" }}>370 x 470 px</span>
                        <span style={{ fontSize: "11px", color: "var(--foreground-disabled)" }}>Görsel Eklenecek</span>
                      </div>
                    )}

                    {product.badge && <span className="product-badge-top">{product.badge}</span>}

                    <div className="product-card-content">
                      <div className="product-card-content-inner">
                        <div className="product-card-info">
                          <h3 className="product-card-title">{product.title}</h3>
                          {product.attributes && (
                            <p className="product-card-attributes">{product.attributes}</p>
                          )}
                        </div>
                        <span className="product-card-button product-card-button-1">
                          Daha Fazla
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
