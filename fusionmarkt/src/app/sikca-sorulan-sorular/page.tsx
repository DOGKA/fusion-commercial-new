"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  HelpCircle,
  ChevronDown,
  Search,
  RefreshCcw,
  CreditCard,
  Truck,
  User,
  MessageCircle,
  Phone,
  Mail,
  X,
  Loader2
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  RefreshCcw,
  CreditCard,
  Truck,
  User,
  HelpCircle,
};

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

// FAQ Item Component
function FAQItem({ item, isOpen, onToggle, index }: { 
  item: Faq; 
  isOpen: boolean; 
  onToggle: () => void;
  index: number;
}) {
  const IconComponent = item.category.icon ? iconMap[item.category.icon] || HelpCircle : HelpCircle;
  const color = item.category.color || "var(--fusion-primary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="glass-card overflow-hidden"
      style={{ borderRadius: '16px' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 md:gap-4 p-4 md:p-5 text-left hover:bg-[var(--glass-bg-hover)] transition-colors"
      >
        {/* Category Icon - Hidden on mobile for cleaner look */}
        <div 
          className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <IconComponent className="w-5 h-5" style={{ color }} />
        </div>

        {/* Question */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[14px] md:text-[15px] leading-snug pr-2">{item.question}</h3>
          {!isOpen && (
            <p className="text-xs md:text-sm text-[var(--foreground-tertiary)] mt-1 line-clamp-1">
              {item.answer}
            </p>
          )}
        </div>

        {/* Toggle Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--foreground-tertiary)]" />
          </motion.div>
        </div>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
              <div className="sm:pl-14">
                <p className="text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SikcaSorulanSorularPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch FAQs from API
  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setFaqs(data.faqs || []);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  // All categories including "all"
  const allCategories = useMemo(() => {
    return [
      { id: "all", name: "Tümünü Göster", slug: "all", icon: "HelpCircle", color: "var(--fusion-primary)" },
      ...categories
    ];
  }, [categories]);

  // Filter FAQs based on category and search query
  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = activeCategory === "all" || faq.category.slug === activeCategory;
      const matchesSearch = searchQuery === "" || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    if (activeCategory !== "all") return null;
    
    const groups: { [key: string]: Faq[] } = {};
    filteredFAQs.forEach(faq => {
      const slug = faq.category.slug;
      if (!groups[slug]) {
        groups[slug] = [];
      }
      groups[slug].push(faq);
    });
    return groups;
  }, [filteredFAQs, activeCategory]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setOpenItems(new Set(filteredFAQs.map(faq => faq.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--fusion-primary)]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pb-12 md:pb-20 overflow-hidden" style={{ paddingTop: "120px" }}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[var(--fusion-primary)]/10 rounded-full blur-[100px] md:blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-[var(--fusion-secondary)]/10 rounded-full blur-[80px] md:blur-[120px]" />
        </div>
        
        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
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

            {/* Search Bar */}
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
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORY TABS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-4 lg:pt-8 pb-6 md:pb-8 relative z-10">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Mobile: Horizontal Scroll */}
            <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-2 min-w-max pr-4">
                {allCategories.map((category) => {
                  const isActive = activeCategory === category.slug;
                  const IconComponent = category.icon ? iconMap[category.icon] || HelpCircle : HelpCircle;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.slug)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-[var(--fusion-primary)] text-white' 
                          : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground-secondary)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {category.slug === "all" ? "Tümü" : category.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-3">
              {allCategories.map((category) => {
                const isActive = activeCategory === category.slug;
                const IconComponent = category.icon ? iconMap[category.icon] || HelpCircle : HelpCircle;
                const count = category.slug === "all" 
                  ? faqs.length 
                  : faqs.filter(f => f.category.slug === category.slug).length;
                const color = category.color || "var(--fusion-primary)";

                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.slug)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all ${
                      isActive 
                        ? 'bg-[var(--fusion-primary)] text-white shadow-lg shadow-[var(--fusion-primary)]/25' 
                        : 'glass-card hover:border-[var(--glass-border-hover)]'
                    }`}
                  >
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-white/20' : ''
                      }`}
                      style={!isActive ? { backgroundColor: `${color}15` } : {}}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={!isActive ? { color } : { color: 'white' }} 
                      />
                    </div>
                    <span className="text-sm font-medium leading-tight">
                      {category.slug === "all" ? "Tümünü Göster" : category.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                    <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--foreground-tertiary)]'}`}>
                      {count} soru
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ LIST
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-[var(--foreground-tertiary)]">
                {filteredFAQs.length} soru bulundu
              </p>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs md:text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors"
                >
                  Tümünü Aç
                </button>
                <span className="text-[var(--foreground-muted)]">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs md:text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors"
                >
                  Tümünü Kapat
                </button>
              </div>
            </div>

            {/* FAQ Items */}
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-[var(--foreground-muted)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sonuç bulunamadı</h3>
                <p className="text-[var(--foreground-tertiary)]">
                  Farklı anahtar kelimelerle tekrar deneyin
                </p>
              </motion.div>
            ) : activeCategory === "all" && groupedFAQs ? (
              // Grouped View
              <div className="space-y-10">
                {categories.map((category) => {
                  const categoryFaqs = groupedFAQs[category.slug];
                  if (!categoryFaqs || categoryFaqs.length === 0) return null;
                  
                  const IconComponent = category.icon ? iconMap[category.icon] || HelpCircle : HelpCircle;
                  const color = category.color || "var(--fusion-primary)";

                  return (
                    <div key={category.id}>
                      <div className="flex items-start sm:items-center gap-3 mb-4">
                        <div 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base sm:text-xl font-bold leading-tight">{category.name}</h2>
                          <span className="text-xs sm:text-sm text-[var(--foreground-tertiary)]">
                            {categoryFaqs.length} soru
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {categoryFaqs.map((faq, index) => (
                          <FAQItem
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
              // Filtered View
              <div className="space-y-3">
                {filteredFAQs.map((faq, index) => (
                  <FAQItem
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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTACT CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card p-6 md:p-12 rounded-2xl md:rounded-3xl relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--fusion-primary)]/10 via-transparent to-[var(--fusion-secondary)]/10" />
              
              <div className="relative z-10 text-center">
                <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-[var(--fusion-primary)] mx-auto mb-4 md:mb-6" />
                <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
                  Sorunuza cevap bulamadınız mı?
                </h2>
                <p className="text-sm md:text-base text-[var(--foreground-secondary)] mb-6 md:mb-8 max-w-xl mx-auto">
                  Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar. 
                  Bize ulaşmak için aşağıdaki kanalları kullanabilirsiniz.
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
