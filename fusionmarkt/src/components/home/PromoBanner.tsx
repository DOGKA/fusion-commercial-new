"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface PromoData {
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: string | null;
}

interface PromoBannerProps {
  /** SSR'dan gelen promo verisi (page.tsx). undefined = SSR verisi yok, client fetch yapılır */
  initialPromo?: PromoData | null;
}

export default function PromoBanner({ initialPromo }: PromoBannerProps) {
  const hasInitialData = initialPromo !== undefined;
  const [promo, setPromo] = useState<PromoData | null>(initialPromo ?? null);
  // resolved: veri kaynağından (SSR veya API) kesin cevap alındı mı?
  // Admin'e yönelik "Banner Görseli Eklenecek" yer tutucusu ancak cevap
  // "gerçekten banner yok" ise gösterilir; yükleme sırasında asla görünmez.
  const [resolved, setResolved] = useState(hasInitialData);

  useEffect(() => {
    if (hasInitialData) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/promos");
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setPromo(data.items[0]);
          }
        }
      } catch { /* fallback below */ }
      setResolved(true);
    };
    fetchData();
  }, [hasInitialData]);

  return (
    <section className="py-6 lg:py-8">
      <div className="container">
        <div className="promo-banner-wrapper">
          <div
            className="promo-banner-section"
            style={promo?.image ? undefined : { backgroundColor: "var(--background-tertiary)" }}
          >
            {promo?.image && (
              <Image
                src={promo.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1024px) 100vw, 1440px"
                // next.config.ts images.qualities allowlist'inde olmalı, aksi
                // halde optimizer 400 döner
                quality={75}
                className="object-cover object-center"
              />
            )}
            <div className="banner-content">
              {promo?.image ? (
                <>
                  {promo.title && <h2 className="banner-main-title">{promo.title}</h2>}
                  {promo.subtitle && <p className="banner-subtitle">{promo.subtitle}</p>}
                  {promo.buttonLink && promo.buttonText && (
                    <Link href={promo.buttonLink} className="banner-button">{promo.buttonText}</Link>
                  )}
                </>
              ) : resolved ? (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground-muted)", marginTop: "8px" }}>1440 x 228 px</p>
                  <p style={{ fontSize: "12px", color: "var(--foreground-disabled)" }}>Banner Görseli Eklenecek</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
