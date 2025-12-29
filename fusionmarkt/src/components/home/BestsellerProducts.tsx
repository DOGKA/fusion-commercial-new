"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductsToCards } from "@/lib/mappers";
import { useMomentumScroll } from "@/hooks/useMomentumScroll";

export default function BestsellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Use momentum scroll hook for smooth touch/drag interaction
  const { containerRef: scrollRef, handlers } = useMomentumScroll({
    autoScroll: !loading && products.length > 0,
    // autoScrollSpeed: default 80 px/sn kullanılıyor
    pauseOnHover: true,
    friction: 0.94,
  });

  useEffect(() => {
    const fetchBestsellerProducts = async () => {
      try {
        // Bestseller = en yüksek fiyatlı aktif ürünler
        const res = await fetch("/api/public/products?bestseller=true&limit=6&inStock=true");
        if (res.ok) {
          const data = await res.json();
          setProducts(mapApiProductsToCards(data.products || []));
        }
      } catch (error) {
        console.error("Error fetching bestseller products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellerProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
            <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
              Çok Satanlar
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-amber-500/[0.05] border border-amber-500/[0.15] flex items-center justify-center text-amber-500/50 transition-all duration-200 [&:hover]:text-amber-400 [&:hover]:bg-amber-500/10 [&:hover]:border-amber-500/30"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-amber-500/[0.05] border border-amber-500/[0.15] flex items-center justify-center text-amber-500/50 transition-all duration-200 [&:hover]:text-amber-400 [&:hover]:bg-amber-500/10 [&:hover]:border-amber-500/30"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          /* Products Carousel - Momentum scroll enabled */
          <div className="relative">
            <div
              ref={scrollRef}
              {...handlers}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
              style={{ 
                scrollbarWidth: "none", 
                msOverflowStyle: "none",
                cursor: "grab",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {displayProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px] relative">
                  <ProductCard product={product} priority={index < 4} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
