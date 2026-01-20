"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X,
  ChevronDown,
  Zap,
  Calculator,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { ThemeToggle, MobileThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

// Hydration-safe mounted check
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  submenu?: { name: string; href: string; icon?: React.ReactNode }[];
}

const navigation: NavItem[] = [
  { 
    name: "Mağaza", 
    href: "/magaza",
    icon: <Store className="w-4 h-4" />
  },
  {
    name: "Paketler",
    href: "/kategori/bundle-paket-urunler",
    icon: <Zap className="w-4 h-4" />,
  },
  { 
    name: "Kategoriler", 
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>,
    submenu: [
      { name: "Endüstriyel Eldivenler", href: "/kategori/endustriyel-eldivenler" },
      { name: "Taşınabilir Güç Kaynakları", href: "/kategori/tasinabilir-guc-kaynaklari" },
      { name: "Güneş Panelleri", href: "/kategori/gunes-panelleri" },
      { name: "Teleskopik Merdivenler", href: "/kategori/teleskopik-merdivenler" },
    ]
  },
  {
    name: "SH4000",
    href: "/sh4000",
    icon: <Zap className="w-4 h-4" />,
  },
  { 
    name: "Güç Hesaplayıcı", 
    href: "/guc-hesaplayici",
    icon: <Calculator className="w-4 h-4" />
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const prevItemCount = useRef(0);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { itemCount, openCart, isAnimating } = useCart();
  const { itemCount: favoritesCount, isAnimating: favoritesAnimating } = useFavorites();
  
  // Theme detection for logo color
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";
  const logoMainColor = isDark ? "#ffffff" : "#1a1a1a";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Badge animation when item count changes
  useEffect(() => {
    if (itemCount > prevItemCount.current) {
      queueMicrotask(() => {
        setBadgeAnimating(true);
        setTimeout(() => setBadgeAnimating(false), 600);
      });
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);


  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-background/80 backdrop-blur-2xl border-b border-border py-2" 
            : "bg-transparent py-4"
        )}
      >
        {/* Light theme glass needs extra contrast */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500",
            isScrolled && "opacity-100",
            "bg-gradient-to-b from-foreground/[0.06] to-transparent dark:from-transparent"
          )}
        />
        {/* Subtle gradient line at top */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent transition-opacity duration-500",
          isScrolled ? "opacity-100" : "opacity-0"
        )} />

        <div className="container px-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex items-center justify-between" style={{ gap: '30px' }}>
            {/* Left: Logo */}
            <Link href="/" className="flex-shrink-0 relative group">
              <svg 
                width="160"
                height="32"
                viewBox="20 220 890 150" 
                className="transition-all duration-300 group-hover:scale-105"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: logoMainColor }}
              >
                <g id="MAIN-LOGO">
                  <path d="M389.574 274.948C388.319 278.012 387.068 280.622 385.693 283.165C385.3 283.892 384.545 284.426 385.122 283.815C371.257 272.447 358.15 260.623 343.897 250.365C333.004 242.526 320.509 237.084 306.435 237.094C293.475 237.105 286.449 244.313 286.914 257.173C286.986 259.164 287.081 261.282 287.793 263.101C290.844 270.906 289.198 277.361 282.496 282.374C272.264 266.957 270.774 236.288 291.356 227.88C300.932 223.969 310.881 224.317 320.466 226.957C348.969 234.806 371.002 252.206 389.574 274.948Z" fill="#dd0000" />
                  <path d="M401.423 277.653C403.244 269.865 405.812 262.601 406.214 255.221C406.872 243.175 400.465 237.194 388.299 236.972C384.965 236.913 381.296 236.709 378.343 237.919C370.282 241.221 365.37 237.028 359.993 231.657C371.956 225.517 384.229 223.84 396.719 226.059C411.656 228.713 420.11 243.079 418.169 260.429C416.575 274.676 411.561 287.833 403.323 299.289C394.782 311.164 384.993 322.213 375.155 333.095C368.674 340.264 366.824 339.828 358.181 332.606C375.851 317.01 392.044 300.254 401.423 277.653Z" fill={logoMainColor} />
                  <path d="M355.138 358.545C337.818 349.987 323.19 338.681 310.213 325.211C302.39 317.09 302.413 316.932 309.438 307.316C317.202 314.864 324.609 322.777 332.768 329.835C345.91 341.202 360.562 350.181 377.819 354.19C399.273 359.174 410.968 348.288 405.197 327.344C402.858 318.854 406.83 314.688 411.462 308.661C417.445 321.774 420.427 334.491 416.623 347.956C413.61 358.615 402.83 366.038 391.305 366.745C378.549 367.526 366.923 363.951 355.138 358.545Z" fill="#ffcc00" />
                  <path d="M300.575 354.733C305.577 354.657 310.113 354.89 314.465 354.108C324.928 352.226 324.893 352.034 333.802 360.343C319.344 366.487 305.097 370.221 290.307 363.369C278.372 357.841 273.225 344.33 275.772 329.038C278.508 312.614 285.597 298.085 295.49 284.996C302.185 276.136 309.901 267.997 317.554 259.901C325.032 251.994 325.886 252.162 335.051 258.709C328.204 265.839 321.078 272.789 314.493 280.212C301.146 295.257 290.316 311.718 287.217 332.093C285.482 343.508 289.953 351.257 300.575 354.733Z" fill={logoMainColor} />
                </g>
                <g id="LANDMARK" fill={logoMainColor}>
                  <path d="M25.0822 234.364L42.9433 234.364L42.9433 363.74L25.0822 363.74L25.0822 234.364ZM71.2065 292.025L71.2065 306.698L35.0925 306.698L35.0925 292.025L71.2065 292.025ZM78.6643 234.364L78.6643 249.451L34.5037 249.451L34.5037 234.364L78.6643 234.364Z" />
                  <path d="M130.48 342.659L130.48 234.364L148.341 234.364L148.341 345.553C148.341 351.478 146.869 355.99 143.925 359.09C140.981 362.19 136.304 363.74 129.891 363.74L116.938 363.74L116.938 348.653L124.789 348.653C127.144 348.653 128.681 348.239 129.401 347.413C130.121 346.585 130.48 345.002 130.48 342.659ZM107.516 234.364L107.516 342.659C107.516 345.002 107.909 346.585 108.694 347.413C109.479 348.239 111.049 348.653 113.405 348.653L119.489 348.653L119.489 363.74L108.105 363.74C101.694 363.74 97.0157 362.19 94.0715 359.09C91.1286 355.99 89.6565 351.478 89.6565 345.553L89.6565 234.364L107.516 234.364Z" />
                  <path d="M203.494 342.659L203.494 311.038C203.494 308.558 203.133 306.94 202.413 306.182C201.694 305.425 200.157 305.045 197.801 305.045L183.277 305.045C176.997 305.045 172.45 303.461 169.637 300.292C166.823 297.123 165.416 292.577 165.416 286.652L165.416 252.551C165.416 246.626 166.888 242.114 169.833 239.014C172.777 235.914 177.389 234.364 183.67 234.364L202.905 234.364C209.316 234.364 213.961 235.914 216.84 239.014C219.718 242.114 221.158 246.626 221.158 252.551L221.158 271.565L203.297 271.565L203.297 255.444C203.297 252.965 202.937 251.346 202.218 250.587C201.498 249.83 199.895 249.451 197.41 249.451L189.166 249.451C186.81 249.451 185.24 249.83 184.455 250.587C183.67 251.346 183.277 252.965 183.277 255.444L183.277 284.172C183.277 286.514 183.67 288.098 184.455 288.925C185.24 289.752 186.81 290.165 189.166 290.165L203.494 290.165C209.774 290.165 214.354 291.715 217.232 294.815C220.111 297.915 221.551 302.427 221.551 308.352L221.551 345.553C221.551 351.478 220.079 355.99 217.135 359.09C214.19 362.19 209.578 363.74 203.297 363.74L184.062 363.74C177.782 363.74 173.17 362.19 170.226 359.09C167.281 355.99 165.809 351.478 165.809 345.553L165.809 326.539L183.67 326.539L183.67 342.659C183.67 345.002 184.062 346.585 184.848 347.413C185.633 348.239 187.203 348.653 189.558 348.653L197.801 348.653C200.157 348.653 201.694 348.239 202.413 347.413C203.133 346.585 203.494 345.002 203.494 342.659Z" />
                  <path d="M240.786 234.364L258.45 234.364L258.45 363.74L240.786 363.74L240.786 234.364Z" />
                  <path d="M476.175 230.802L492.718 230.802L492.718 360.121L474.581 360.121L448.271 266.954L448.271 360.121L431.728 360.121L431.728 230.802L450.663 230.802L476.175 321.491L476.175 230.802Z" />
                  <path d="M562.677 332.026L546.333 332.026L529.192 265.714L529.192 360.121L513.446 360.121L513.446 230.802L533.179 230.802L554.504 310.955L575.831 230.802L595.564 230.802L595.564 360.121L579.818 360.121L579.818 265.508L562.677 332.026Z" />
                  <path d="M664.526 315.087L664.526 330.168L623.666 330.168L623.666 315.087L664.526 315.087ZM680.271 360.121L662.134 360.121L643.399 246.915L626.457 360.121L608.32 360.121L630.443 230.802L656.553 230.802L680.271 360.121Z" />
                  <path d="M734.484 286.992L734.484 251.874C734.484 249.394 734.118 247.776 733.388 247.019C732.658 246.262 731.03 245.883 728.505 245.883L695.419 245.883L695.419 230.802L733.886 230.802C740.397 230.802 745.148 232.351 748.138 235.45C751.127 238.548 752.621 243.059 752.621 248.981L752.621 289.472C752.621 295.531 751.127 300.11 748.138 303.208C745.148 306.307 740.397 307.857 733.886 307.857L701.797 307.857L701.797 292.983L728.505 292.983C731.03 292.983 732.658 292.57 733.388 291.744C734.118 290.918 734.484 289.333 734.484 286.992ZM693.028 230.802L710.965 230.802L710.965 360.121L693.028 360.121L693.028 230.802ZM718.14 300.42L736.477 300.42L759 360.121L739.467 360.121L718.14 300.42Z" />
                  <path d="M791.089 295.669L810.023 295.669L835.935 360.121L816.402 360.121L791.089 295.669ZM810.023 295.669L791.089 295.669L816.8 230.802L836.333 230.802L810.023 295.669ZM771.955 230.802L789.894 230.802L789.894 360.121L771.955 360.121L771.955 230.802Z" />
                  <path d="M860.052 233.281L877.989 233.281L877.989 360.121L860.052 360.121L860.052 233.281ZM898.918 230.802L898.918 245.883L839.123 245.883L839.123 230.802L898.918 230.802Z" />
                  <path d="M347.648 285.472L347.648 285.472C354.811 285.472 360.618 291.265 360.618 298.412L360.618 298.473C360.618 305.619 354.811 311.412 347.648 311.412L347.648 311.412C340.484 311.412 334.678 305.619 334.678 298.473L334.678 298.412C334.678 291.265 340.484 285.472 347.648 285.472Z" />
                </g>
              </svg>
              <div className="absolute inset-0 blur-xl bg-white/0 group-hover:bg-white/5 transition-all duration-500 -z-10" />
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                item.submenu ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setActiveDropdown(item.name);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
                    }}
                  >
                    <button
                      className={cn(
                        "relative px-3 py-2 text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5",
                        "text-foreground/70 hover:text-foreground",
                        "before:absolute before:inset-0 before:rounded-lg before:bg-foreground/0 before:transition-all before:duration-300",
                        "hover:before:bg-foreground/[0.05]",
                        activeDropdown === item.name && "text-foreground before:bg-foreground/[0.05]"
                      )}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 relative z-10 transition-transform duration-300",
                        activeDropdown === item.name && "rotate-180"
                      )} />
                    </button>
                    
                    {/* Dropdown */}
                    {activeDropdown === item.name && (
                      <div className="absolute top-full left-0 pt-2">
                        <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-xl py-2 min-w-[220px] shadow-2xl">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              prefetch={false}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-4 py-2.5 text-[13px] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] transition-all duration-200"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href!}
                    prefetch={false}
                    className={cn(
                      "relative px-3 py-2 text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5",
                      "text-foreground/70 hover:text-foreground",
                      "before:absolute before:inset-0 before:rounded-lg before:bg-foreground/0 before:transition-all before:duration-300",
                      "hover:before:bg-foreground/[0.05]",
                      item.name === "Güç Hesaplayıcı" && "text-[var(--fusion-primary)] hover:text-[var(--fusion-primary)]"
                    )}
                  >
                    {item.name === "Güç Hesaplayıcı" && (
                      <Zap className="w-3.5 h-3.5 relative z-10" />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                )
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-0.5">
              {/* Theme Toggle - Desktop */}
              <ThemeToggle className="hidden lg:flex" />

              {/* Wishlist / Favorites - Desktop */}
              <Link
                href="/favori"
                className={cn(
                  "hidden lg:flex relative p-2 rounded-xl text-foreground/60 hover:text-foreground transition-all duration-300",
                  "before:absolute before:inset-0 before:rounded-xl before:bg-foreground/0 before:transition-all before:duration-300",
                  "hover:before:bg-foreground/[0.05]",
                  favoritesAnimating && "animate-wiggle"
                )}
                aria-label="Favoriler"
              >
                <Heart className={cn(
                  "w-[18px] h-[18px] relative z-10 transition-all duration-300",
                  favoritesCount > 0 && "text-pink-400 fill-pink-400"
                )} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/hesabim"
                className={cn(
                  "relative flex items-center justify-center p-2.5 rounded-xl text-foreground/60 hover:text-foreground transition-all duration-300",
                  "before:absolute before:inset-0 before:rounded-xl before:bg-foreground/0 before:transition-all before:duration-300",
                  "hover:before:bg-foreground/[0.05]"
                )}
                aria-label="Hesabım"
              >
                <User className="w-5 h-5 relative z-10" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className={cn(
                  "relative flex items-center justify-center p-2.5 rounded-xl text-foreground/60 hover:text-foreground transition-all duration-300",
                  "before:absolute before:inset-0 before:rounded-xl before:bg-foreground/0 before:transition-all before:duration-300",
                  "hover:before:bg-foreground/[0.05]",
                  isAnimating && "animate-wiggle"
                )}
                aria-label="Sepet"
              >
                <ShoppingBag className={cn(
                  "w-5 h-5 relative z-10 transition-transform duration-300",
                  badgeAnimating && "scale-110"
                )} />
                {itemCount > 0 && (
                  <span 
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30",
                      badgeAnimating && "animate-cart-badge-pop"
                    )}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                {badgeAnimating && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full animate-ping opacity-75" />
                )}
              </button>

              {/* Mobile Theme Toggle - sadece mobilde görünür (640px altı) */}
              <MobileThemeToggle className="hidden max-sm:flex" />

              {/* Mobile Menu Toggle - sadece mobilde görünür (640px altı) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "hidden max-sm:flex relative items-center justify-center p-2.5 rounded-xl text-foreground/60 hover:text-foreground transition-all duration-300",
                  "before:absolute before:inset-0 before:rounded-xl before:bg-foreground/0 before:transition-all before:duration-300",
                  "hover:before:bg-foreground/[0.05]",
                  isMobileMenuOpen && "before:bg-foreground/[0.08]"
                )}
                aria-label="Menü"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 relative z-10" />
                ) : (
                  <Menu className="w-5 h-5 relative z-10" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[56px] z-40 lg:hidden mobile-dropdown-menu">
          <div
            className="fixed inset-0 top-[56px] bg-background/70 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative mx-3 mt-3 overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.08] to-foreground/[0.02] backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-background/90" />
            <div className="absolute inset-0 rounded-3xl border border-border" />
            
            <nav className="relative p-4 space-y-1">
              {navigation.map((item) => (
                item.submenu ? (
                  <div key={item.name}>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 text-[15px] font-medium rounded-xl transition-all duration-200",
                        activeDropdown === item.name 
                          ? "text-foreground bg-foreground/[0.06]" 
                          : "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
                      )}
                    >
                      {item.name}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-300 text-foreground/40",
                        activeDropdown === item.name && "rotate-180 text-foreground"
                      )} />
                    </button>
                    
                    {activeDropdown === item.name && (
                      <div className="mt-1 ml-4 space-y-0.5 pb-2">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            prefetch={false}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-[14px] text-foreground/50 hover:text-foreground rounded-lg transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-foreground/30" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href!}
                    prefetch={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 text-[15px] font-medium rounded-xl transition-all duration-200",
                      item.name === "Güç Hesaplayıcı" 
                        ? "text-[var(--fusion-primary)]" 
                        : "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
                    )}
                  >
                    {item.name}
                    {item.name === "Güç Hesaplayıcı" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--fusion-primary)]/20 text-[var(--fusion-primary)] rounded">
                        YENİ
                      </span>
                    )}
                  </Link>
                )
              ))}
              
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/favori"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-medium text-foreground/60 hover:text-foreground bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-xl border border-foreground/[0.05] transition-all"
                >
                  <Heart className="w-4 h-4" />
                  <span>Favorilerim</span>
                  {favoritesCount > 0 && (
                    <span className="w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/hesabim"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-medium text-foreground/60 hover:text-foreground bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-xl border border-foreground/[0.05] transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Hesabım</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
