"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductsToCards } from "@/lib/mappers";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
  
  // Use CSS Transform carousel hook for ultra-smooth scrolling
  const { 
    containerRef, 
    wrapperRef, 
    containerStyle, 
    wrapperStyle, 
    handlers,
    scrollBy,
    pauseAutoScroll,
    resumeAutoScroll,
  } = useTransformCarousel({
    autoScroll: !loading && products.length > 0,
    autoScrollSpeed: 40, // px/sn - yavaş & akıcı
    pauseOnHover: true,
    friction: 0.95,
  });

  // Fetch shipping threshold first
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await fetch("/api/public/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [] }),
        });
        if (res.ok) {
          const data = await res.json();
          setFreeShippingThreshold(data.freeShippingThreshold || 2000);
        } else {
          setFreeShippingThreshold(2000);
        }
      } catch (error) {
        setFreeShippingThreshold(2000);
      }
    };
    fetchShippingSettings();
  }, []);

  // Fetch products AFTER shipping threshold is loaded
  useEffect(() => {
    if (freeShippingThreshold === null) return; // Wait for threshold

    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/public/products?featured=true&limit=12");
        if (res.ok) {
          const data = await res.json();
          setProducts(mapApiProductsToCards(data.products || [], freeShippingThreshold));
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [freeShippingThreshold]);

  // Show nothing if no featured products
  if (!loading && products.length === 0) {
    return null;
  }

  // Ürünleri çoğalt (sonsuz döngü efekti için)
  const displayProducts = [...products, ...products];

  return (
    <section className="pt-16 lg:pt-12 pb-8 lg:pb-10">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 mb-3 lg:mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/30 mb-3">
              Seçili Koleksiyon
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Öne Çıkan Ürünler
            </h2>
          </div>
          
          {/* Navigation Buttons - Only visible on desktop */}
          <CarouselNavButtons
            scrollBy={scrollBy}
            pauseAutoScroll={pauseAutoScroll}
            resumeAutoScroll={resumeAutoScroll}
            scrollAmount={300}
            theme="neutral"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          /* Products Carousel - CSS Transform for ultra-smooth GPU scrolling */
          <div className="relative -mx-4 px-4">
            {/* Container - viewport */}
            <div
              ref={containerRef}
              style={containerStyle}
              className="pb-4"
            >
              {/* Wrapper - content moves via transform */}
              <div
                ref={wrapperRef}
                style={{ ...wrapperStyle, gap: "20px" }}
                {...handlers}
                className="flex items-stretch"
              >
                {displayProducts.map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px]">
                    <ProductCard product={product} priority={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
