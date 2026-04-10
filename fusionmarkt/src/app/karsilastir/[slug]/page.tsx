"use client";

import { useState, useEffect, useCallback, use } from "react";
import { ChevronDown, Loader2, Battery, Shield, RefreshCw, Zap, ZapOff, Plug, Usb, Wifi, Rocket, Activity, PlugZap, Clock, Sun, SunMedium, Weight, Ruler, ShieldCheck, Lightbulb, Smartphone, Droplets, Volume2, Package } from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Battery, Shield, RefreshCw, Zap, ZapOff, Plug, Usb, Wifi, Rocket, Activity, PlugZap, Clock, Sun, SunMedium, Weight, Ruler, ShieldCheck, Lightbulb, Smartphone, Droplets, Volume2, Package,
};

interface SpecValue { specId: string; value: string; }
interface Spec { id: string; label: string; unit: string | null; icon: string | null; order: number; }
interface SpecGroup { id: string; name: string; order: number; specs: Spec[]; }
interface CompareProduct {
  id: string; name: string; image: string | null;
  price: number | null; comparePrice: number | null;
  buyLink: string | null; specValues: SpecValue[];
  product?: { slug: string; price: number; comparePrice: number | null; thumbnail: string | null; images: string[] } | null;
}
interface CompareData {
  id: string; name: string; slug: string;
  specGroups: SpecGroup[]; products: CompareProduct[];
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p);
}

export default function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<(string | null)[]>([null, null, null]);

  const isMobile = useCallback(() => typeof window !== "undefined" && window.innerWidth <= 768, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/compare/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          const count = isMobile() ? 2 : 3;
          const initial = json.products.slice(0, count).map((p: CompareProduct) => p.id);
          while (initial.length < 3) initial.push(null);
          setSelected(initial);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [slug, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setSelected(prev => prev[2] ? [prev[0], prev[1], null] : prev);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-28"><Loader2 className="w-8 h-8 animate-spin text-foreground-muted" /></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center pt-28 text-foreground-muted">Karsilastirma bulunamadi</div>;

  const getProduct = (id: string | null) => data.products.find(p => p.id === id) || null;
  const getSpecValue = (product: CompareProduct | null, specId: string) => {
    if (!product) return "";
    return product.specValues.find(sv => sv.specId === specId)?.value || "—";
  };
  const getImage = (p: CompareProduct) => p.image || p.product?.thumbnail || p.product?.images?.[0] || null;
  const getPrice = (p: CompareProduct) => p.price ? Number(p.price) : p.product?.price ? Number(p.product.price) : null;
  const getComparePrice = (p: CompareProduct) => p.comparePrice ? Number(p.comparePrice) : p.product?.comparePrice ? Number(p.product.comparePrice) : null;
  const getBuyLink = (p: CompareProduct) => p.buyLink || (p.product?.slug ? `/urun/${p.product.slug}` : "#");

  const selectedProducts = selected.map(s => getProduct(s));

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="compare-container">
        {/* Product Selectors */}
        <div className="compare-selector-row">
          {selected.map((selId, idx) => (
            <div key={idx} className={`compare-selector-col ${idx === 2 ? "compare-hide-mobile" : ""}`}>
              <div className="compare-select-wrapper">
                <select
                  value={selId || ""}
                  onChange={(e) => { const s = [...selected]; s[idx] = e.target.value || null; setSelected(s); }}
                  className="compare-select"
                >
                  <option value="">Ürün seç...</option>
                  {data.products.map(p => {
                    const visibleSelected = isMobile() ? selected.slice(0, 2) : selected;
                    const taken = visibleSelected.includes(p.id) && selected[idx] !== p.id;
                    return (
                      <option key={p.id} value={p.id} disabled={taken}>
                        {p.name}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={16} className="compare-select-icon" />
              </div>
            </div>
          ))}
        </div>

        {/* Product Cards */}
        <div className="compare-products-row">
          {selectedProducts.map((p, idx) => (
            <div key={idx} className={`compare-product-col ${idx === 2 ? "compare-hide-mobile" : ""}`}>
              {p ? (
                <div className="compare-product-card">
                  {getImage(p) && <div className="compare-product-img-wrapper"><img src={getImage(p)!} alt={p.name} className="compare-product-img" /></div>}
                  <div className="compare-product-info">
                    <h3 className="compare-product-name">{p.name}</h3>
                    <div className="compare-price-buy-block">
                      {getPrice(p) && (
                        <div className="compare-product-price-row">
                          <span className="compare-current-price">{formatPrice(getPrice(p)!)} TL</span>
                          {getComparePrice(p) && getComparePrice(p)! > getPrice(p)! && (
                            <span className="compare-old-price">{formatPrice(getComparePrice(p)!)} TL</span>
                          )}
                        </div>
                      )}
                      <Link href={getBuyLink(p)} className="compare-buy-btn">Satın Al</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="compare-product-empty">Ürün seçin</div>
              )}
            </div>
          ))}
        </div>

        {/* Spec Groups - Icon Card Layout */}
        {data.specGroups.map((group) => (
          <div key={group.id} className="compare-group">
            <h2 className="compare-group-title">{group.name}</h2>

            {group.specs.map((spec) => (
              <div key={spec.id} className="compare-spec-block">
                <div className="compare-spec-cards">
                  {selectedProducts.map((p, idx) => {
                    const val = p ? getSpecValue(p, spec.id) : "";
                    const Icon = spec.icon && ICON_MAP[spec.icon] ? ICON_MAP[spec.icon] : null;
                    return (
                      <div key={idx} className={`compare-spec-card ${idx === 2 ? "compare-hide-mobile" : ""}`}>
                        {Icon && <Icon size={28} className="compare-spec-card-icon" />}
                        <span className="compare-spec-card-label">{spec.label}</span>
                        <span className="compare-spec-card-value">{val || "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
