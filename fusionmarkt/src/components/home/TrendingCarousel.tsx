"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCarouselScroll } from "@/hooks/useCarouselScroll";
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

interface TrendingCarouselProps {
  initialProducts?: TrendingProduct[];
}

export default function TrendingCarousel({ initialProducts }: TrendingCarouselProps) {
  const hasInitialData = Boolean(initialProducts && initialProducts.length > 0);
  const [products, setProducts] = useState<TrendingProduct[]>(
    hasInitialData ? (initialProducts as TrendingProduct[]) : MOCK_PRODUCTS
  );

  useEffect(() => {
    // SSR'dan veri geldiyse tekrar fetch etmeye gerek yok (LCP'yi hızlandırır)
    if (hasInitialData) return;

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
  }, [hasInitialData]);

  const {
    containerRef,
    wrapperRef,
    containerStyle,
    wrapperStyle,
    handlers,
    scrollBy,
  } = useCarouselScroll({ friction: 0.95 });

  // Safari'nin yatay lazy-load ön yükleme mesafesi çok dar: parmak hızlıysa kart
  // görsel inmeden ekrana giriyor ve boş/yarım boyanmış görünüyor. Sayfa
  // yüklendikten sonra kalan görselleri arka planda indirip decode ediyoruz;
  // böylece kaydırma anında ne ağ ne decode işi kalıyor. LCP ile yarışmaması
  // için ilk boyama bitene kadar bekliyor.
  const [imagesWarmed, setImagesWarmed] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(() => setImagesWarmed(true), 600);
    };

    if (document.readyState === "complete") {
      schedule();
      return () => window.clearTimeout(timer);
    }

    window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!imagesWarmed) return;
    // loading="lazy" → "eager" geçişi indirmeyi başlatır; decode() ise bitmap'i
    // kaydırma öncesinde hazırlar (Safari aksi halde ilk boyamada decode eder).
    wrapperRef.current?.querySelectorAll("img").forEach((img) => {
      img.decode?.().catch(() => {});
    });
  }, [imagesWarmed, wrapperRef, products]);

  return (
    <section className="pt-10 lg:pt-12 pb-6 lg:pb-8" aria-labelledby="trending-heading">
      <div className="container">
        {/* Kartlardaki h3'ler h1'den sonra geliyordu; bölüm başlığı hiyerarşiyi tamamlıyor */}
        <h2 id="trending-heading" className="sr-only">
          Öne Çıkan Ürünler
        </h2>
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
                <Link href={product.href} className="product-card-link" draggable={false}>
                  <div
                    className="product-card-background"
                    style={product.image ? undefined : { backgroundColor: "var(--background-tertiary)" }}
                  >
                    {product.image && (
                      <Image
                        src={product.image}
                        // Link'in erişilebilir adını h3 veriyor; alt'ta tekrarlamak
                        // ekran okuyucuda başlığı iki kez okutuyordu
                        alt=""
                        fill
                        // Kart mobilde 280px, masaüstünde 370px. Bildirilen
                        // değeri kasten biraz düşük tutuyoruz: 3x ekranlarda
                        // srcset 1080w yerine 640w adayını seçiyor. Fotoğraf
                        // koyu gradient altında olduğu için fark görünmezken
                        // decode + rasterize maliyeti ~2.5x düşüyor.
                        sizes="(max-width: 1023px) 210px, 380px"
                        className="product-card-image"
                        loading={index < 3 || imagesWarmed ? "eager" : "lazy"}
                        // Mobilde LCP elemanı hero değil bu kart oluyor: kart
                        // 280x360, hero ise 16/10 oranıyla daha küçük alan
                        // kaplıyor. `loading="eager"` yalnızca lazy'den çıkarıyor,
                        // ağ önceliğini yükseltmiyordu; bu yüzden asıl LCP
                        // görseli hero'nun iki yüksek öncelikli preload'unun
                        // arkasına kuyruklanıyordu. Yalnızca ilk kart yüksek:
                        // dosya ~20KB olduğu için hero'yu geciktirmiyor.
                        fetchPriority={index === 0 ? "high" : index < 3 ? "auto" : "low"}
                        draggable={false}
                      />
                    )}

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
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
