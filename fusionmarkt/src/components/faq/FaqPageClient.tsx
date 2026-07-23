"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  X,
  Battery,
  Gauge,
  Zap,
  ShieldCheck,
  Smartphone,
  RefreshCcw,
  CreditCard,
  Truck,
  User,
} from "lucide-react";
import FaqItem, { FaqItemData } from "./FaqItem";
import FaqSidebar from "./FaqSidebar";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  RefreshCcw,
  CreditCard,
  Truck,
  User,
  HelpCircle,
  Battery,
  Gauge,
  Zap,
  ShieldCheck,
  Smartphone,
};

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface FaqPageClientProps {
  categories: FaqCategory[];
  faqs: FaqItemData[];
  initialCategory: string | null;
}

export default function FaqPageClient({
  categories,
  faqs,
  initialCategory,
}: FaqPageClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const setCategory = useCallback(
    (slug: string | null) => {
      setActiveCategory(slug);
      if (slug) {
        router.replace(`/sikca-sorulan-sorular?cat=${encodeURIComponent(slug)}`, {
          scroll: false,
        });
      } else {
        router.replace("/sikca-sorulan-sorular", { scroll: false });
      }
    },
    [router],
  );

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === null || faq.category.slug === activeCategory;
      const matchesSearch =
        q === "" ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const groupedFAQs = useMemo(() => {
    if (activeCategory !== null) return null;
    const groups: Record<string, FaqItemData[]> = {};
    filteredFAQs.forEach((faq) => {
      const slug = faq.category.slug;
      if (!groups[slug]) groups[slug] = [];
      groups[slug].push(faq);
    });
    return groups;
  }, [filteredFAQs, activeCategory]);

  const sidebarCategories = useMemo(
    () =>
      categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        count: faqs.filter((f) => f.category.slug === c.slug).length,
      })),
    [categories, faqs],
  );

  const sidebarPopular = useMemo(
    () =>
      faqs.map((f) => {
        const cleaned = f.answer.replace(/\s+/g, " ").trim();
        const excerpt =
          cleaned.length > 110 ? `${cleaned.slice(0, 110).trimEnd()}…` : cleaned;
        return {
          id: f.id,
          question: f.question,
          excerpt,
          viewCount: f.viewCount,
        };
      }),
    [faqs],
  );

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setOpenItems(new Set(filteredFAQs.map((f) => f.id)));
  }, [filteredFAQs]);

  const collapseAll = useCallback(() => {
    setOpenItems(new Set());
  }, []);

  const handlePopularSelect = useCallback(
    (id: string) => {
      const target = faqs.find((f) => f.id === id);
      if (!target) return;

      if (activeCategory !== null && activeCategory !== target.category.slug) {
        setCategory(null);
      }
      setSearchQuery("");
      setOpenItems((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      // DOM güncellenmesini beklemek için iki rAF (state commit + paint sonrası scroll)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(`faq-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      });
    },
    [faqs, activeCategory, setCategory],
  );

  const activeCategoryName = useMemo(
    () => categories.find((c) => c.slug === activeCategory)?.name ?? null,
    [categories, activeCategory],
  );

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section
        className="relative pb-8 md:pb-14 overflow-hidden"
        style={{ paddingTop: "120px" }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[var(--fusion-primary)]/10 rounded-full blur-[100px] md:blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[var(--fusion-secondary)]/10 rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[var(--fusion-primary)]/10 mb-4 md:mb-6"
            >
              <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-[var(--fusion-primary)]" />
            </motion.div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-sm md:text-lg text-[var(--foreground-secondary)] mb-6 md:mb-8 px-2">
              En çok merak edilen soruların yanıtlarını burada bulabilirsiniz
            </p>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--foreground-tertiary)]" />
                <input
                  type="text"
                  placeholder="Soru ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--glass-bg-active)] flex items-center justify-center hover:bg-[var(--foreground-muted)] transition-colors"
                    aria-label="Aramayı temizle"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="blog-layout">
            <div className="blog-layout__main">
              <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 mb-4 md:mb-6">
                {/* Tek badge — mobilde kendi satırında content-width, web'de count yanında inline */}
                {activeCategoryName && (
                  <div
                    className="blog-filter-badge self-start md:order-2"
                    style={{ marginBottom: 0 }}
                  >
                    <span>{activeCategoryName}</span>
                    <button
                      onClick={() => setCategory(null)}
                      aria-label="Kategori filtresini kaldır"
                      className="faq-action-btn"
                    >
                      &times;
                    </button>
                  </div>
                )}
                {/* Mobil: count + aksiyonlar tek satır (justify-between). Desktop: contents ile flatten */}
                <div className="flex items-center justify-between gap-3 md:contents">
                  <p className="text-xs md:text-sm text-[var(--foreground-tertiary)] flex-shrink-0 md:order-1">
                    {filteredFAQs.length} soru bulundu
                  </p>
                  <div className="flex gap-2 items-center md:ml-auto md:order-3">
                    <button
                      onClick={expandAll}
                      className="faq-action-btn text-xs md:text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors"
                    >
                      Tümünü Aç
                    </button>
                    <span className="text-[var(--foreground-muted)]">|</span>
                    <button
                      onClick={collapseAll}
                      className="faq-action-btn text-xs md:text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors"
                    >
                      Tümünü Kapat
                    </button>
                  </div>
                </div>
              </div>

              {filteredFAQs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-[var(--foreground-muted)]" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Sonuç bulunamadı</h2>
                  <p className="text-[var(--foreground-tertiary)]">
                    Farklı anahtar kelimelerle tekrar deneyin
                  </p>
                </motion.div>
              ) : activeCategory === null && groupedFAQs ? (
                <div className="space-y-10">
                  {categories.map((category) => {
                    const categoryFaqs = groupedFAQs[category.slug];
                    if (!categoryFaqs || categoryFaqs.length === 0) return null;

                    const IconComponent = category.icon
                      ? iconMap[category.icon] || HelpCircle
                      : HelpCircle;
                    const color = category.color || "var(--fusion-primary)";

                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-3 mb-4">
                          <IconComponent
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                            style={{ color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h2 className="text-base sm:text-xl font-bold leading-tight">
                              {category.name}
                            </h2>
                            <span className="text-xs sm:text-sm text-[var(--foreground-tertiary)]">
                              {categoryFaqs.length} soru
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {categoryFaqs.map((faq, index) => (
                            <FaqItem
                              key={faq.id}
                              item={faq}
                              isOpen={openItems.has(faq.id)}
                              onToggle={() => toggleItem(faq.id)}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map((faq, index) => (
                    <FaqItem
                      key={faq.id}
                      item={faq}
                      isOpen={openItems.has(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            <FaqSidebar
              categories={sidebarCategories}
              popular={sidebarPopular}
              totalCount={faqs.length}
              activeCategory={activeCategory}
              onCategoryChange={setCategory}
              onPopularSelect={handlePopularSelect}
            />
          </div>
        </div>
      </section>

      <section className="py-10 md:py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card p-6 md:p-12 rounded-2xl md:rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--fusion-primary)]/10 via-transparent to-[var(--fusion-secondary)]/10" />

              <div className="relative z-10 text-center">
                <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-[var(--fusion-primary)] mx-auto mb-4 md:mb-6" />
                <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
                  Sorunuza cevap bulamadınız mı?
                </h2>
                <p className="text-sm md:text-base text-[var(--foreground-secondary)] mb-6 md:mb-8 max-w-xl mx-auto">
                  Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar. Bize
                  ulaşmak için aşağıdaki kanalları kullanabilirsiniz.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-xl bg-[var(--fusion-primary)] text-white text-sm md:text-base font-semibold hover:bg-[var(--fusion-primary-light)] transition-colors"
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    İletişim Formu
                  </Link>
                  <a
                    href="tel:+908508406160"
                    className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm md:text-base font-semibold hover:bg-[var(--glass-bg-hover)] transition-colors"
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                    +90 850 840 6160
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
