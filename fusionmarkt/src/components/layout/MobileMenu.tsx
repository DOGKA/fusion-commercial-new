"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  X,
  Store,
  Zap,
  Calculator,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Newspaper,
  Sun,
  Moon,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useCart } from "@/context/CartContext";
import type { MenuCategory } from "@/lib/menu-categories";

// Hydration-safe mounted check (same approach as MiniCart / ThemeToggle)
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE MENU - Right Side Panel (MiniCart ile aynı premium tasarım dili)
// ═══════════════════════════════════════════════════════════════════════════

interface MenuEntry {
  name: string;
  href?: string;
  icon: React.ReactNode;
  badge?: { label: string; className: string };
  submenu?: { name: string; href: string }[];
}

function buildMenuItems(menuCategories: MenuCategory[]): MenuEntry[] {
  return [
  {
    name: "Mağaza",
    href: "/magaza",
    icon: <Store className="w-[18px] h-[18px]" strokeWidth={1.8} />,
  },
  {
    name: "Paketler",
    href: "/kategori/bundle-paket-urunler",
    icon: <Sparkles className="w-[18px] h-[18px]" strokeWidth={1.8} />,
  },
  // Masaüstü menüyle aynı kural: işaretli kategori yoksa sekme hiç çıkmıyor.
  ...(menuCategories.length > 0
    ? [{
        name: "Kategoriler",
        icon: <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={1.8} />,
        submenu: menuCategories,
      }]
    : []),
  {
    name: "SH4000",
    href: "/sh4000",
    icon: <Zap className="w-[18px] h-[18px]" strokeWidth={1.8} />,
    badge: {
      label: "Enerji Çözümü",
      className: "text-[color:var(--fusion-success-text)] border border-[color:var(--fusion-success-border-soft)]",
    },
  },
  {
    name: "Güç Hesaplayıcı",
    href: "/guc-hesaplayici",
    icon: <Calculator className="w-[18px] h-[18px]" strokeWidth={1.8} />,
    badge: {
      label: "Simulator",
      className:
        "text-[var(--fusion-primary)] border border-[var(--fusion-primary)]/25",
    },
  },
  {
    name: "Blog",
    href: "/blog",
    icon: <Newspaper className="w-[18px] h-[18px]" strokeWidth={1.8} />,
    badge: {
      label: "Rehber",
      className: "text-cyan-400 border border-cyan-500/25",
    },
  },
  ];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuCategories: MenuCategory[];
}

export default function MobileMenu({ isOpen, onClose, menuCategories }: MobileMenuProps) {
  const menuItems = useMemo(() => buildMenuItems(menuCategories), [menuCategories]);
  const panelRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  const { itemCount, subtotal, openCart } = useCart();

  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

  // Close on ESC key + body scroll lock (MiniCart ile aynı davranış)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  useBodyScrollLock(isOpen);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Menü kapanınca akordiyonu sıfırla (MiniCart ile aynı kalıp: senkron
  // setState yerine microtask'a ertele - react-hooks/set-state-in-effect)
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => setExpanded(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isActive = (href?: string) =>
    !!href && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md animate-in fade-in duration-300" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[400px]",
          isDark ? "bg-gradient-to-b from-[#0d0d0d] to-[#080808]" : "bg-white",
          "border-l border-border",
          "flex flex-col shadow-2xl shadow-black/60",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER / HERO SECTION - MiniCart ile aynı stil
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Animated gradient mesh background - dark temada daha sönük */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={cn("absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl animate-pulse", isDark ? "bg-emerald-500/[0.08]" : "bg-emerald-500/20")} />
            <div className={cn("absolute -top-4 right-12 w-20 h-20 rounded-full blur-2xl animate-pulse", isDark ? "bg-cyan-500/[0.05]" : "bg-cyan-500/10")} style={{ animationDelay: "1s" }} />
            <div className={cn("absolute top-8 right-0 w-16 h-16 rounded-full blur-xl animate-pulse", isDark ? "bg-emerald-400/[0.05]" : "bg-emerald-400/10")} style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Grid Header */}
          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5">
            {/* Menu Icon - Glassmorphism */}
            <div className="relative group">
              <div
                className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/25 flex items-center justify-center transition-[transform,border-color] duration-300 group-hover:scale-105 group-hover:border-emerald-500/40"
                style={{ borderRadius: "16px" }}
              >
                <LayoutGrid className="w-[22px] h-[22px] text-emerald-400" strokeWidth={1.8} />
              </div>
            </div>

            {/* Title Block */}
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-foreground tracking-tight">Menü</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-foreground-muted font-medium">FusionMarkt</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span className="text-[13px] text-[color:var(--fusion-success-text)] font-medium tracking-tight">Enerjini keşfet</span>
              </div>
            </div>

            {/* Close Button - Minimal */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors duration-200"
              aria-label="Kapat"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Subtle divider */}
          <div
            className={cn(
              "h-px bg-gradient-to-r from-transparent to-transparent mx-4",
              isDark ? "via-white/[0.06]" : "via-black/[0.08]"
            )}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SCROLLABLE CONTENT: Navigasyon kartları
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <nav className="px-3 py-3 space-y-2">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              const iconBox = (
                <div
                  className={cn(
                    "w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-colors duration-200",
                    active
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-border text-foreground-muted group-hover:text-foreground group-hover:border-border-hover"
                  )}
                  style={{ borderRadius: "12px" }}
                >
                  {item.icon}
                </div>
              );

              if (item.submenu) {
                const open = expanded === item.name;
                return (
                  <div
                    key={item.name}
                    className={cn(
                      "bg-glass-bg border transition-colors duration-200 animate-in fade-in slide-in-from-right-4 fill-mode-backwards",
                      open
                        ? "border-emerald-500/25"
                        : "border-border hover:border-border-hover hover:bg-glass-bg-hover"
                    )}
                    style={{ borderRadius: "14px", overflow: "hidden", animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : item.name)}
                      className="group w-full flex items-center gap-3 p-3 text-left"
                    >
                      {iconBox}
                      <span className="flex-1 text-[15px] font-medium text-foreground">{item.name}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-foreground-muted transition-transform duration-300",
                          open && "rotate-180 text-emerald-400"
                        )}
                      />
                    </button>

                    {/* Accordion - smooth grid-rows animasyonu */}
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 pt-1 space-y-1">
                          {item.submenu.map((sub) => {
                            const subActive = isActive(sub.href);
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                prefetch={false}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2.5 text-[13.5px] transition-colors duration-200 no-underline",
                                  subActive
                                    ? "text-emerald-400 font-medium"
                                    : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.04]"
                                )}
                                style={{ borderRadius: "10px" }}
                              >
                                {sub.name}
                                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  prefetch={false}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 p-3 bg-glass-bg border transition-colors duration-200 no-underline animate-in fade-in slide-in-from-right-4 fill-mode-backwards",
                    active
                      ? "border-emerald-500/30"
                      : "border-border hover:border-border-hover hover:bg-glass-bg-hover"
                  )}
                  style={{ borderRadius: "14px", animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
                >
                  {iconBox}
                  <span
                    className={cn(
                      "flex-1 text-[15px] font-medium",
                      active ? "text-emerald-400" : "text-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap",
                        item.badge.className
                      )}
                    >
                      {item.badge.label}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-[color,transform] duration-200",
                      active
                        ? "text-emerald-400"
                        : "text-foreground/25 group-hover:text-foreground-muted group-hover:translate-x-0.5"
                    )}
                  />
                </Link>
              );
            })}

            {/* "Beğendiklerim + Hesabım" hızlı erişim ızgarası BURADAN KALDIRILDI.
                İkisi de hesap çekmecesine taşındı (AccountDrawer): alt barda
                kendi "Hesabım" butonu var ve oradan siparişler, adresler,
                kuponlar dahil tüm hesap sayfalarına tek dokunuşla gidiliyor.
                Menüde durmaları aynı bağlantıyı iki ayrı çekmeceye koyuyordu. */}

            {/* Tema anahtarı - mobilde header'dan buraya taşındı */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
              className="w-full flex items-center gap-3 p-3 bg-glass-bg border border-border hover:border-border-hover hover:bg-glass-bg-hover transition-colors duration-200 animate-in fade-in slide-in-from-right-4 fill-mode-backwards"
              style={{
                borderRadius: "14px",
                animationDelay: `${(menuItems.length + 1) * 50}ms`,
                animationDuration: "400ms",
              }}
            >
              <span
                className={cn(
                  "w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-colors duration-200",
                  isDark ? "border-blue-500/25 text-blue-400" : "border-amber-500/30 text-amber-500"
                )}
                style={{ borderRadius: "12px" }}
              >
                {isDark ? (
                  <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                ) : (
                  <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} />
                )}
              </span>

              <span className="flex-1 min-w-0 text-left">
                <span className="block text-[15px] font-medium text-foreground leading-tight">Tema</span>
                <span className="block text-[12px] text-foreground-muted leading-tight mt-0.5">
                  {isDark ? "Koyu mod" : "Açık mod"}
                </span>
              </span>

              {/* Toggle Track - header'daki anahtarla aynı görsel dil */}
              <span
                className="relative w-[46px] h-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex-shrink-0"
                style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200 ease-out flex items-center justify-center"
                  style={{
                    left: isDark ? "auto" : "3px",
                    right: isDark ? "3px" : "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  {isDark ? (
                    <Moon className="w-2.5 h-2.5 text-blue-500" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-amber-500" />
                  )}
                </span>
              </span>
            </button>
          </nav>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER - Sepet durumu / CTA (MiniCart alt çubuğu stili)
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "border-t",
            isDark
              ? "border-white/[0.06] bg-[#0a0a0a] shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.6)]"
              : "border-gray-200 bg-white shadow-[0_-12px_24px_-8px_rgba(0,0,0,0.12)]"
          )}
        >
          <div className="p-4">
            {itemCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openCart();
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 py-3 px-4 text-white transition-colors duration-300 cursor-pointer",
                  isDark
                    ? "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-900/30"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
                )}
                style={{ borderRadius: "14px" }}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <ShoppingBag className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
                  <span className="text-left">
                    <span className="block text-[14px] font-semibold leading-tight">Sepetim</span>
                    <span className="block text-[11px] text-white/75 leading-tight">{itemCount} ürün</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[15px] font-bold whitespace-nowrap">{formatPrice(subtotal)} ₺</span>
                  <ArrowRight size={16} />
                </span>
              </button>
            ) : (
              <Link
                href="/magaza"
                prefetch={false}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-[color:var(--fusion-success-border-soft)] hover:border-[color:var(--fusion-success-border)] text-[color:var(--fusion-success-text)] text-[14px] font-semibold transition-colors duration-300 no-underline"
                style={{ borderRadius: "14px" }}
              >
                <Sparkles size={15} />
                Ürünleri Keşfet
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
