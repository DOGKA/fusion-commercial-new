"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronRight,
  Headphones,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  RotateCcw,
  User,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { ACCOUNT_NAV } from "@/app/hesabim/_lib/account-nav";

/**
 * Hesap çekmecesi — header'daki "Hesabım" butonunun mobil ve masaüstü paneli.
 *
 * Kabuk (backdrop, sağdan giren 400px panel, ESC/dışarı tıklama, gövde scroll
 * kilidi) MobileMenu ve MiniCart ile birebir aynı; üç çekmecenin de aynı
 * ölçüde açılması isteniyor.
 *
 * İçerik oturuma göre TAMAMEN değişiyor. Oturumluda liste `ACCOUNT_NAV`den
 * üretiliyor, elle yazılmıyor: sidebar ve /hesabim'in mobil menüsü de o
 * kayıttan besleniyor, buraya ikinci bir kopya konsaydı yeni bir hesap sayfası
 * eklendiğinde üç yerden ikisi güncellenip burası geride kalırdı.
 *
 * `account-*` CSS sınıfları BİLEREK kullanılmıyor: account.css yalnızca
 * /hesabim ve /sozlesmeler layout'larından yükleniyor, bu çekmece ise her
 * rotada açılabiliyor. Stiller o yüzden MobileMenu'nün Tailwind diliyle.
 */

/**
 * `/hesabim` (kontrol paneli) satırı listeden çıkarılıyor: çekmecenin kendisi
 * zaten o panelin yerini tutuyor, kullanıcıyı aynı içeriğin sayfa hâline
 * göndermek bir adım fazla.
 */
const HIDDEN_HREFS = new Set(["/hesabim"]);
const FAVORITES_HREFS = new Set(["/favori", "/hesabim/favorilerim"]);

interface DrawerRow {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Sağda sayı rozeti */
  badge?: number;
  badgeClassName?: string;
}

interface DrawerGroup {
  id: string;
  heading: string | null;
  rows: DrawerRow[];
}

/**
 * Oturumsuz kullanıcıya gösterilen yardım bağlantıları.
 *
 * Hepsi herkese açık sayfalar. "Sipariş Takibi" BİLEREK yok: footer'daki
 * bağlantısı `/hesabim`e gidiyor, yani misafirin sipariş sorgulayabileceği bir
 * ekran hiç yok — buraya konsaydı kullanıcı giriş duvarına çarpardı.
 */
const GUEST_HELP_ROWS: DrawerRow[] = [
  { key: "faq", label: "Sıkça Sorulan Sorular", icon: HelpCircle, href: "/sikca-sorulan-sorular" },
  { key: "returns", label: "İade ve Değişim", icon: RotateCcw, href: "/iade-politikasi" },
  { key: "service", label: "Servis Formu", icon: Wrench, href: "/servis-formu" },
  { key: "support", label: "Müşteri Hizmetleri", icon: Headphones, href: "/iletisim" },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFavoritesSeen: () => void;
}

export default function AccountDrawer({
  isOpen,
  onClose,
  onFavoritesSeen,
}: AccountDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { itemCount: favoritesCount } = useFavorites();

  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Hesabım";
  const initial = displayName.charAt(0).toLocaleUpperCase("tr-TR");

  const groups: DrawerGroup[] = isAuthenticated
    ? ACCOUNT_NAV.map((group) => ({
        id: group.id,
        // Açılır grup mobilde düz listeleniyor: tek dokunuşluk bir sayfayı
        // akordeon yüzünden iki dokunuşa çıkarmamak için /hesabim'in mobil
        // menüsü de aynı kararı veriyor.
        heading: group.heading ?? group.toggleLabel ?? null,
        rows: group.items
          .filter((item) => !HIDDEN_HREFS.has(item.href))
          .map((item) => ({
            key: item.href,
            label: item.label,
            icon: item.icon,
            href: item.href,
            badge: item.href === "/hesabim/favorilerim" ? favoritesCount : undefined,
            badgeClassName:
              item.href === "/hesabim/favorilerim"
                ? "bg-pink-500/15 text-pink-400"
                : undefined,
          })),
      })).filter((group) => group.rows.length > 0)
    : [
        {
          id: "guest-quick",
          heading: null,
          rows: [
            // Misafirin de favorisi var (localStorage'da), bu yüzden bu satır
            // giriş duvarına çarpmıyor. `/favori` oturum açıksa sunucu
            // tarafındaki listeye yönlendiriyor. Sepet burada tekrarlanmıyor:
            // header'da kendi butonu ve çekmecesi zaten var.
            {
              key: "favorites",
              label: "Beğendiklerim",
              icon: Heart,
              href: "/favori",
              badge: favoritesCount,
              badgeClassName: "bg-pink-500/15 text-pink-400",
            },
          ],
        },
        { id: "guest-help", heading: "Yardım", rows: GUEST_HELP_ROWS },
      ];

  let rowIndex = 0;

  const rowClass = (active: boolean) =>
    cn(
      "group w-full flex items-center gap-3 p-3 bg-glass-bg border transition-colors duration-200 no-underline text-left animate-in fade-in slide-in-from-right-4 fill-mode-backwards",
      active ? "border-emerald-500/30" : "border-border hover:border-border-hover hover:bg-glass-bg-hover"
    );

  const renderRowContent = (row: DrawerRow, active: boolean) => (
    <>
      <span
        className={cn(
          "w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-colors duration-200",
          active
            ? "border-emerald-500/30 text-emerald-400"
            : "border-border text-foreground-muted group-hover:text-foreground group-hover:border-border-hover"
        )}
        style={{ borderRadius: "12px" }}
      >
        <row.icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>

      <span
        className={cn(
          "flex-1 text-[15px] font-medium truncate",
          active ? "text-emerald-400" : "text-foreground"
        )}
      >
        {row.label}
      </span>

      {!!row.badge && row.badge > 0 && (
        <span
          className={cn(
            "min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full flex items-center justify-center",
            row.badgeClassName ?? "bg-emerald-500/15 text-emerald-400"
          )}
        >
          {row.badge > 99 ? "99+" : row.badge}
        </span>
      )}

      <ChevronRight
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-[color,transform] duration-200",
          active
            ? "text-emerald-400"
            : "text-foreground/25 group-hover:text-foreground-muted group-hover:translate-x-0.5"
        )}
      />
    </>
  );

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md animate-in fade-in duration-300" />

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
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={cn("absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl animate-pulse", isDark ? "bg-emerald-500/[0.08]" : "bg-emerald-500/20")} />
            <div className={cn("absolute -top-4 right-12 w-20 h-20 rounded-full blur-2xl animate-pulse", isDark ? "bg-emerald-500/[0.05]" : "bg-emerald-500/10")} style={{ animationDelay: "1s" }} />
            <div className={cn("absolute top-8 right-0 w-16 h-16 rounded-full blur-xl animate-pulse", isDark ? "bg-emerald-400/[0.05]" : "bg-emerald-400/10")} style={{ animationDelay: "0.5s" }} />
          </div>

          <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5">
            <div
              className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/25 flex items-center justify-center"
              style={{ borderRadius: "16px" }}
            >
              {isAuthenticated ? (
                <span className="text-[18px] font-semibold text-emerald-400 leading-none">{initial}</span>
              ) : (
                <User className="w-[22px] h-[22px] text-emerald-400" strokeWidth={1.8} />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-foreground tracking-tight truncate">
                {isAuthenticated ? displayName : "Hesabım"}
              </h2>
              <div className="mt-1 min-w-0">
                {isAuthenticated && user?.email ? (
                  <span className="block text-[13px] text-foreground-muted font-medium truncate">
                    {user.email}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-foreground-muted font-medium">FusionMarkt</span>
                    <span className="w-1 h-1 rounded-full bg-foreground/20" />
                    <span className="text-[13px] text-emerald-400 font-medium tracking-tight">Hızlı erişim</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-colors duration-200"
              aria-label="Kapat"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          <div
            className={cn(
              "h-px bg-gradient-to-r from-transparent to-transparent mx-4",
              isDark ? "via-white/[0.06]" : "via-black/[0.08]"
            )}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            LİSTE — oturuma göre hesap sayfaları ya da misafir kısayolları
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <nav className="px-3 py-3 space-y-3" aria-label="Hesap menüsü">
            {/* Oturum durumu okunana kadar iskelet: iki liste birbirinden
                tamamen farklı, doğrudan basılsaydı oturumlu kullanıcı bir kare
                misafir listesini görürdü. */}
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="h-[64px] bg-foreground/[0.04] border border-border"
                    style={{ borderRadius: "14px" }}
                    aria-hidden="true"
                  />
                ))
              : groups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    {group.heading && (
                      <div className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                        {group.heading}
                      </div>
                    )}

                    {group.rows.map((row) => {
                      const active = isActive(row.href);
                      const style = {
                        borderRadius: "14px",
                        animationDelay: `${rowIndex++ * 40}ms`,
                        animationDuration: "400ms",
                      };

                      return (
                        <Link
                          key={row.key}
                          href={row.href}
                          prefetch={false}
                          onClick={() => {
                            if (FAVORITES_HREFS.has(row.href)) {
                              onFavoritesSeen();
                            }
                            onClose();
                          }}
                          className={rowClass(active)}
                          style={style}
                        >
                          {renderRowContent(row, active)}
                        </Link>
                      );
                    })}
                  </div>
                ))}
          </nav>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER — oturum durumuna göre çıkış ya da giriş
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
            {isLoading ? (
              <div className="h-[50px] rounded-[14px] bg-foreground/[0.04]" aria-hidden="true" />
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-red-500/25 hover:bg-red-500/10 hover:border-red-500/35 text-red-400 text-[14px] font-semibold transition-colors duration-300"
                style={{ borderRadius: "14px" }}
              >
                <LogOut size={15} />
                Çıkış Yap
              </button>
            ) : (
              <Link
                href="/hesabim"
                prefetch={false}
                onClick={onClose}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white text-[14px] font-semibold transition-colors duration-300 no-underline",
                  isDark
                    ? "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-900/30"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
                )}
                style={{ borderRadius: "14px" }}
              >
                <LogIn size={15} />
                Giriş Yap veya Üye Ol
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
