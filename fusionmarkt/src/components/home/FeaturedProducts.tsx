"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductsToCards } from "@/lib/mappers";

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/public/products?featured=true&limit=12");
        if (res.ok) {
          const data = await res.json();
          setProducts(mapApiProductsToCards(data.products || []));
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto scroll - 360 derece sonsuz döngü
  useEffect(() => {
    if (loading || products.length === 0 || isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 1; // piksel/frame
    const scrollInterval = 30; // ms

    const autoScroll = setInterval(() => {
      if (!scrollContainer) return;
      
      // Scroll sağa doğru
      scrollContainer.scrollLeft += scrollSpeed;
      
      // Eğer sona yaklaştıysak başa dön (sonsuz döngü)
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      if (scrollContainer.scrollLeft >= maxScroll - 10) {
        scrollContainer.scrollLeft = 0;
      }
    }, scrollInterval);

    return () => clearInterval(autoScroll);
  }, [loading, products, isPaused]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-3">
              Seçili Koleksiyon
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
              Öne Çıkan Ürünler
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 transition-all duration-200 [&:hover]:text-white [&:hover]:bg-white/10 [&:hover]:border-white/20"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 transition-all duration-200 [&:hover]:text-white [&:hover]:bg-white/10 [&:hover]:border-white/20"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          /* Products Carousel */
          <div className="relative -mx-4 px-4">
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[280px]">
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
