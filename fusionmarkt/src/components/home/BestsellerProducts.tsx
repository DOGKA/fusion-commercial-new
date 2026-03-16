"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductsToCards } from "@/lib/mappers";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";

export default function BestsellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  // CSS Transform carousel - manual scroll only
  const { 
    containerRef, 
    wrapperRef, 
    containerStyle, 
    wrapperStyle, 
    handlers,
    scrollBy,
  } = useTransformCarousel({ friction: 0.95 });

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
          setFreeShippingThreshold(2000); // Fallback
        }
      } catch {
        setFreeShippingThreshold(2000); // Fallback
      }
    };
    fetchShippingSettings();
  }, []);

  // Fetch products AFTER shipping threshold is loaded
  useEffect(() => {
    if (freeShippingThreshold === null) return; // Wait for threshold

    const fetchBestsellerProducts = async () => {
      try {
        // Bestseller = en yüksek fiyatlı aktif ürünler
        const res = await fetch("/api/public/products?bestseller=true&limit=6&inStock=true");
        if (res.ok) {
          const data = await res.json();
          setProducts(mapApiProductsToCards(data.products || [], freeShippingThreshold));
        }
      } catch (error) {
        console.error("Error fetching bestseller products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellerProducts();
  }, [freeShippingThreshold]);

  // Show nothing if no products
  if (!loading && products.length === 0) {
    return null;
  }

  // Ürünleri çoğalt (sonsuz döngü için)
  const displayProducts = [...products, ...products, ...products];

  return (
    <section className="pt-16 lg:pt-12 pb-8 lg:pb-10 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent pointer-events-none" />
      
      <div className="container relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 mb-3 lg:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-500/80">
                Trend Ürünler
              </p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Çok Satanlar
            </h2>
          </div>
          
          {/* Navigation Buttons - Only visible on desktop */}
          <CarouselNavButtons
            scrollBy={scrollBy}
            scrollAmount={304}
            theme="amber"
          />
        </div>

        {/* Products Carousel - CSS Transform for ultra-smooth GPU scrolling */}
        <div className="relative">
          {/* Container - viewport */}
          <div
            ref={containerRef}
            style={containerStyle}
            className="pb-4"
          >
            {/* Wrapper - content moves via transform */}
            <div
              ref={wrapperRef}
              style={{ ...wrapperStyle, gap: "24px" }}
              {...handlers}
              className="flex items-stretch"
            >
              {loading ? (
                <div className="flex items-center justify-center py-20 w-full">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : (
                displayProducts.map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px] relative">
                    <ProductCard product={product} priority={false} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
