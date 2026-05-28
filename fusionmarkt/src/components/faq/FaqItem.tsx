"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  RefreshCcw,
  CreditCard,
  Truck,
  User,
  Battery,
  Gauge,
  Zap,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef } from "react";

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

export interface FaqItemCategory {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  viewCount: number;
  category: FaqItemCategory;
}

interface FaqItemProps {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export default function FaqItem({ item, isOpen, onToggle, index }: FaqItemProps) {
  const IconComponent = item.category.icon
    ? iconMap[item.category.icon] || HelpCircle
    : HelpCircle;
  const color = item.category.color || "var(--fusion-primary)";
  const tracked = useRef(false);

  useEffect(() => {
    if (!isOpen || tracked.current) return;
    if (typeof window === "undefined") return;

    const storageKey = `faq-viewed:${item.id}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        tracked.current = true;
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage erişilemezse yine de bir kez track et
    }

    tracked.current = true;
    fetch("/api/faqs/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
      keepalive: true,
    }).catch(() => {});
  }, [isOpen, item.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
      className="glass-card overflow-hidden"
      style={{ borderRadius: "16px" }}
      id={`faq-${item.id}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 md:gap-4 p-4 md:p-5 text-left hover:bg-[var(--glass-bg-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        <div
          className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <IconComponent className="w-5 h-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[14px] md:text-[15px] leading-snug pr-2">
            {item.question}
          </h3>
          {!isOpen && (
            <p className="text-xs md:text-sm text-[var(--foreground-tertiary)] mt-1 line-clamp-1">
              {item.answer}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 mt-0.5">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--foreground-tertiary)]" />
          </motion.div>
        </div>
      </button>

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
                <p className="text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-line">
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
