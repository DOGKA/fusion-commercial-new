"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductsToCards } from "@/lib/mappers";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
  
  // Use CSS Transform carousel hook for ultra-smooth scrolling
  const { containerRef, wrapperRef, containerStyle, wrapperStyle, handlers } = useTransformCarousel({
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

  const scroll = (direction: "left" | "right") => {
    if (!wrapperRef.current || !containerRef.current) return;
    
    const scrollAmount = 260;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = wrapperRef.current.scrollWidth;
    const maxScroll = Math.max(0, contentWidth - containerWidth);
    
    // Parse current translateX
    const currentTransform = wrapperRef.current.style.transform;
    const match = currentTransform.match(/translateX\((-?\d+\.?\d*)px\)/);
    let currentX = match ? parseFloat(match[1]) : 0;
    
    // Calculate new position
    if (direction === "left") {
      currentX = Math.min(0, currentX + scrollAmount);
    } else {
      currentX = Math.max(-maxScroll, currentX - scrollAmount);
    }
    
    // Apply smooth transition
    wrapperRef.current.style.transition = "transform 0.3s ease-out";
    wrapperRef.current.style.transform = `translateX(${currentX}px)`;
    
    // Remove transition after animation
    setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = "";
      }
    }, 300);
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
            <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/30 mb-3">
              Seçili Koleksiyon
            </p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Öne Çıkan Ürünler
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-foreground/[0.03] border border-border flex items-center justify-center text-foreground/40 transition-all duration-200 [&:hover]:text-foreground [&:hover]:bg-foreground/10 [&:hover]:border-foreground/20"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-foreground/[0.03] border border-border flex items-center justify-center text-foreground/40 transition-all duration-200 [&:hover]:text-foreground [&:hover]:bg-foreground/10 [&:hover]:border-foreground/20"
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
