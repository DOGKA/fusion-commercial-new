"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BannerCard {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  buttonText: string | null;
  buttonLink: string;
  icon: string | null;
  gradientFrom: string | null;
  gradientTo: string | null;
  desktopColSpan: number;
  desktopRowSpan: number;
  mobileColSpan: number;
  mobileRowSpan: number;
  order: number;
  isActive?: boolean;
}

interface Banner {
  id: string;
  name: string;
  bannerType: string;
  placement: string;
  isActive: boolean;
  cards: BannerCard[];
}

// Fallback data - veritabanında veri yoksa kullanılır
// Kullanıcı isteğine göre: Aksesuar → Teleskopik Merdiven, Bundle → Eldiven
const fallbackCategories: BannerCard[] = [
  {
    id: "1",
    title: "Taşınabilir Güç Kaynakları",
    subtitle: "256Wh'den 6kWh'e kadar her ihtiyaca uygun çözümler",
    icon: "battery",
    buttonLink: "/kategori/tasinabilir-guc-kaynaklari",
    buttonText: "Keşfet",
    badge: "24 Ürün",
    gradientFrom: "#10B981",
    gradientTo: "#06B6D4",
    desktopColSpan: 2,
    desktopRowSpan: 2,
    mobileColSpan: 1,
    mobileRowSpan: 1,
    order: 0,
  },
  {
    id: "2",
    title: "Güneş Panelleri",
    subtitle: "Katlanabilir, taşınabilir solar paneller",
    icon: "sun",
    buttonLink: "/kategori/gunes-panelleri",
    buttonText: "Keşfet",
    badge: "18 Ürün",
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
    desktopColSpan: 1,
    desktopRowSpan: 1,
    mobileColSpan: 1,
    mobileRowSpan: 1,
    order: 1,
  },
  {
    id: "3",
    title: "Teleskopik Merdivenler",
    subtitle: "Profesyonel alüminyum merdivenler",
    icon: "ladder",
    buttonLink: "/kategori/teleskopik-merdivenler",
    buttonText: "Keşfet",
    badge: "42 Ürün",
    gradientFrom: "#8B5CF6",
    gradientTo: "#EC4899",
    desktopColSpan: 1,
    desktopRowSpan: 1,
    mobileColSpan: 1,
    mobileRowSpan: 1,
    order: 2,
  },
  {
    id: "4",
    title: "Endüstriyel Eldivenler",
    subtitle: "TG1290 serisi profesyonel iş eldivenleri",
    icon: "glove",
    buttonLink: "/urun/tg1290-dokunmatik-antistatik-a-seviye-kesilme-yirtilma-direncli-cok-amacli-is-eldiveni",
    buttonText: "Keşfet",
    badge: "8 Ürün",
    gradientFrom: "#3B82F6",
    gradientTo: "#6366F1",
    desktopColSpan: 2,
    desktopRowSpan: 1,
    mobileColSpan: 1,
    mobileRowSpan: 1,
    order: 3,
  },
];

// Icon SVG components - Admin panel ile birebir aynı
const IconBattery = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
    <line x1="23" y1="13" x2="23" y2="11" />
  </svg>
);

const IconSun = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconPackage = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// Merdiven ikonu
const IconLadder = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="2" x2="8" y2="22" />
    <line x1="16" y1="2" x2="16" y2="22" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
    <line x1="8" y1="18" x2="16" y2="18" />
  </svg>
);

// Eldiven ikonu
const IconGlove = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 14v-3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
    <path d="M10 11V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v5" />
    <path d="M14 9V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v8" />
    <path d="M18 14v-3" />
    <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2" />
    <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
  </svg>
);

// Icon mapping
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  battery: IconBattery,
  sun: IconSun,
  package: IconPackage,
  ladder: IconLadder,
  glove: IconGlove,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function CategoryBento() {
  const [categories, setCategories] = useState<BannerCard[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/public/banners?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const categoryBanner = data.find(
            (b: Banner) => b.placement === "HOME_CATEGORY" && b.cards?.length > 0
          );
          if (categoryBanner?.cards?.length > 0) {
            console.log(`✅ [CategoryBento] Loaded ${categoryBanner.cards.length} cards`);
            setCategories(categoryBanner.cards);
          } else {
            console.log("⚠️  [CategoryBento] No HOME_CATEGORY banner, using fallback");
          }
        }
      } catch (error) {
        console.error("❌ [CategoryBento] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <section className="category-bento-section pt-16 lg:pt-12 pb-16 lg:pb-20 relative overflow-hidden">
      {/* Background - Admin panel ile aynı: #0A0A0A */}
      <div className="absolute inset-0" style={{ background: "#0A0A0A" }} />
      
      {/* Mesh gradient overlay - Admin panel ile birebir aynı */}
      <div 
        className="absolute inset-0 opacity-50" 
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.03) 100%)",
        }} 
      />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6 lg:mb-8"
        >
          <span className="text-eyebrow mb-3 block">Kategoriler</span>
          <h2 className="text-display mb-4">
            İhtiyacınıza Uygun <span className="text-gradient">Enerji Çözümü</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            Kamp, karavan, acil durum veya ev kullanımı - her senaryo için 
            profesyonel enerji depolama sistemleri.
          </p>
        </motion.div>

        {/* Bento Grid - Admin panel ile birebir aynı: 4 kolon, gap-4 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="category-bento-grid grid gap-4 auto-rows-[240px] lg:auto-rows-[260px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category: BannerCard) => {
            const Icon = iconMap[category.icon || "package"] || IconPackage;
            const isLarge = category.desktopColSpan === 2 && category.desktopRowSpan === 2;
            const isWide = category.desktopColSpan === 2 && category.desktopRowSpan === 1;
            const isTall = category.desktopColSpan === 1 && category.desktopRowSpan === 2;
            
            // Grid class belirleme
            let gridClass = "";
            if (isLarge) gridClass = "lg:col-span-2 lg:row-span-2";
            else if (isWide) gridClass = "lg:col-span-2";
            else if (isTall) gridClass = "lg:row-span-2";
            
            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className={`category-bento-card ${gridClass}`}
              >
                <Link
                  href={category.buttonLink || "#"}
                  className="group relative overflow-hidden cursor-pointer flex flex-col h-full w-full transition-all"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.gradientFrom || "#22C55E"} 0%, ${category.gradientTo || "#06B6D4"} 100%)`,
                    backdropFilter: "blur(30px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "24px",
                  }}
                >
                  {/* Dark overlay for contrast - Admin panel ile aynı */}
                  <div className="absolute inset-0 bg-black/25" />
                  
                  {/* Badge - Top Left - Admin panel ile birebir aynı stiller */}
                  {category.badge && (
                    <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 text-[10px] lg:text-xs font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "9999px",
                          color: "rgba(250, 250, 250, 0.75)",
                        }}
                      >
                        {category.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Icon - Top Right - Admin panel ile birebir aynı */}
                  <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
                    <div 
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-[#E31E24]" />
                    </div>
                  </div>
                  
                  {/* Content - Bottom - Admin panel ile birebir aynı */}
                  <div className="relative z-10 mt-auto p-5 lg:p-6">
                    <h3 
                      className={`font-semibold mb-1 line-clamp-2 transition-colors duration-300 group-hover:text-white ${isLarge ? "text-lg lg:text-xl" : "text-base lg:text-lg"}`}
                      style={{ color: "#FAFAFA" }}
                    >
                      {category.title}
                    </h3>
                    {category.subtitle && (
                      <p 
                        className={`mb-2 line-clamp-2 ${isLarge ? "text-sm" : "text-xs"}`}
                        style={{ color: "rgba(250, 250, 250, 0.75)" }}
                      >
                        {category.subtitle}
                      </p>
                    )}
                    
                    {/* CTA - Admin panel ile birebir aynı: #E31E24 rengi */}
                    <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "#E31E24" }}>
                      <span>{category.buttonText || "Keşfet"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(to top, rgba(227, 30, 36, 0.1) 0%, transparent 100%)"
                    }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
