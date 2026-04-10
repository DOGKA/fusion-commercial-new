"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PromoData {
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: string | null;
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<PromoData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/promos");
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setPromo(data.items[0]);
          }
        }
      } catch { /* fallback to mockup */ }
    };
    fetchData();
  }, []);

  return (
    <section className="py-6 lg:py-8">
      <div className="container">
        <div className="promo-banner-wrapper">
          <div
            className="promo-banner-section"
            style={promo?.image
              ? { backgroundImage: `url('${promo.image}')` }
              : { backgroundColor: "var(--background-tertiary)" }
            }
          >
            <div className="banner-content">
              {promo?.image ? (
                <>
                  {promo.title && <h2 className="banner-main-title">{promo.title}</h2>}
                  {promo.subtitle && <p className="banner-subtitle">{promo.subtitle}</p>}
                  {promo.buttonLink && promo.buttonText && (
                    <Link href={promo.buttonLink} className="banner-button">{promo.buttonText}</Link>
                  )}
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground-muted)", marginTop: "8px" }}>1440 x 228 px</p>
                  <p style={{ fontSize: "12px", color: "var(--foreground-disabled)" }}>Banner Görseli Eklenecek</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
