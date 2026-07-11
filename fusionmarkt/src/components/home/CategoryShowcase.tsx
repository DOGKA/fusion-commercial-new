"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ImagePlaceholderIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function PlaceholderLabel({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground-muted)", textAlign: "center", lineHeight: 1.3 }}>{primary}</span>
      <span style={{ fontSize: "11px", color: "var(--foreground-disabled)" }}>{secondary}</span>
    </>
  );
}

export interface SectionProduct {
  title: string;
  badge: string | null;
  spec1: string | null;
  spec2: string | null;
  price: string | null;
  image: string | null;
  link: string | null;
}

export interface SectionData {
  sectionTitle: string;
  bannerImage: string | null;
  bannerEyebrow: string | null;
  bannerTitle: string | null;
  bannerDesc: string | null;
  bannerBtnText: string | null;
  bannerBtnLink: string | null;
  seeMoreImage: string | null;
  seeMoreLink: string | null;
  accessoryText: string | null;
  accessoryLink: string | null;
  products: SectionProduct[];
}

function formatPrice(price: string): string {
  return price.replace(/[.,]00$/, "");
}

const MOCK_PRODUCTS: SectionProduct[] = [
  { title: "Ürün Adı 1", badge: "Yeni", spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000", image: null, link: "#" },
  { title: "Ürün Adı 2", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000", image: null, link: "#" },
  { title: "Ürün Adı 3", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000", image: null, link: "#" },
  { title: "Ürün Adı 4", badge: null, spec1: "Özellik 1", spec2: "Özellik 2", price: "0,000", image: null, link: "#" },
];

const MOCK_SECTION: SectionData = {
  sectionTitle: "Kategori Başlığı",
  bannerImage: null,
  bannerEyebrow: "YENİ",
  bannerTitle: "Ürün Adı Buraya",
  bannerDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  bannerBtnText: "Daha Fazla",
  bannerBtnLink: "#",
  seeMoreImage: null,
  seeMoreLink: "#",
  accessoryText: "Hangi Ürün Bana Uygun?",
  accessoryLink: "#",
  products: MOCK_PRODUCTS,
};

interface CategoryShowcaseProps {
  index?: number;
  /** SSR'dan gelen bölüm verisi - CLS'yi önlemek için sunucuda çekilir */
  initialSection?: SectionData | null;
}

export default function CategoryShowcase({ index = 0, initialSection }: CategoryShowcaseProps) {
  const hasInitialData = Boolean(initialSection);
  const [section, setSection] = useState<SectionData>(initialSection || MOCK_SECTION);

  useEffect(() => {
    // SSR'dan veri geldiyse tekrar fetch etmeye gerek yok (mock -> gerçek
    // veri takası kaynaklı layout shift'i önler)
    if (hasInitialData) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items[index]) {
            setSection(data.items[index]);
          }
        }
      } catch { /* fallback to mock */ }
    };
    fetchData();
  }, [index, hasInitialData]);

  const products = section.products?.length > 0 ? section.products : MOCK_PRODUCTS;

  return (
    <section className="showcase-section">
      <div className="container">
        <h2 className="showcase-title-text">{section.sectionTitle}</h2>

        {/* Banner */}
        <div className="showcase-banner-mockup">
          {section.bannerImage && (
            <Image
              src={section.bannerImage}
              alt={section.bannerTitle || section.sectionTitle}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          )}
          <div className="showcase-banner-overlay" style={{ position: "relative", zIndex: 1 }}>
            {section.bannerEyebrow && <span className="showcase-banner-eyebrow">{section.bannerEyebrow}</span>}
            {section.bannerTitle && <h3 className="showcase-banner-title">{section.bannerTitle}</h3>}
            {section.bannerDesc && <p className="showcase-banner-desc">{section.bannerDesc}</p>}
            {section.bannerBtnText && (
              <Link href={section.bannerBtnLink || "#"} className="showcase-banner-btn">{section.bannerBtnText}</Link>
            )}
          </div>
          {!section.bannerImage && (
            <div className="showcase-banner-size">
              <ImagePlaceholderIcon size={36} />
              <PlaceholderLabel primary="1440 x 470 px" secondary="Banner Görseli Eklenecek" />
            </div>
          )}
        </div>

        {/* Grid Wrapper */}
        <div className="showcase-grid-wrapper">
          <div className="showcase-products-grid">
            {products.map((product, idx) => (
              <Link key={idx} href={product.link || "#"} className="showcase-product-mockup" style={{ textDecoration: "none" }}>
                <div className="showcase-product-image">
                  {product.badge && <span className="showcase-product-badge-top">{product.badge}</span>}
                  {product.image ? (
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 50vw, 200px" style={{ objectFit: "cover" }} />
                  ) : (
                    <>
                      <ImagePlaceholderIcon size={32} />
                      <PlaceholderLabel primary="280 x 280 px" secondary="Ürün Görseli Eklenecek" />
                    </>
                  )}
                </div>
                <div className="showcase-product-info">
                  <h4 className="showcase-product-title">{product.title}</h4>
                  <div className="showcase-product-specs">
                    {product.spec1 && <span>{product.spec1}</span>}
                    {product.spec2 && <span>{product.spec2}</span>}
                  </div>
                  {product.price && (
                    <div className="showcase-product-price">
                      {formatPrice(product.price)} <span className="currency">₺</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="showcase-see-more-wrapper">
            <Link href={section.seeMoreLink || "#"} className="showcase-see-more-card showcase-see-more-primary" style={{ textDecoration: "none" }}>
              <div className="showcase-see-more-image">
                {section.seeMoreImage ? (
                  <Image src={section.seeMoreImage} alt="Tümünü Gör" fill sizes="200px" style={{ objectFit: "cover" }} />
                ) : (
                  <>
                    <ImagePlaceholderIcon size={28} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--foreground-muted)" }}>200 x 200 px</span>
                    <span style={{ fontSize: "10px", color: "var(--foreground-disabled)" }}>Görsel Eklenecek</span>
                  </>
                )}
              </div>
              <div className="showcase-see-more-content">
                <span className="showcase-see-more-text">Tümünü Gör</span>
                <span className="showcase-see-more-arrow">
                  <ChevronRight size={16} style={{ color: "var(--foreground-muted)" }} />
                </span>
              </div>
            </Link>

            <Link href={section.accessoryLink || "#"} className="showcase-see-more-card" style={{ textDecoration: "none" }}>
              <div className="showcase-see-more-secondary">
                <span className="showcase-see-more-text">{section.accessoryText || "Hangi Ürün Bana Uygun?"}</span>
                <span className="showcase-see-more-arrow">
                  <ChevronRight size={16} style={{ color: "var(--foreground-muted)" }} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
