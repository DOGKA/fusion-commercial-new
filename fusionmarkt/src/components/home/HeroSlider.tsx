"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Star, Flame, Gift, Tag, Percent, Truck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/Spotlight";
import Image from "next/image";
import { useTheme } from "next-themes";

type Maybe<T> = T | null | undefined;

interface Slide {
  id: string;
  badge?: Maybe<string>;
  badgeIcon?: Maybe<string>;
  title: string;
  titleHighlight?: Maybe<string>;
  subtitle?: Maybe<string>;
  buttonText?: Maybe<string>;
  buttonLink?: Maybe<string>;
  buttonStyle?: Maybe<string>;
  button2Text?: Maybe<string>;
  button2Link?: Maybe<string>;
  button2Style?: Maybe<string>;
  desktopImage?: Maybe<string>;
  overlayColor?: Maybe<string>;
  overlayOpacity?: Maybe<number>;
  overlayColorLight?: Maybe<string>;
  overlayOpacityLight?: Maybe<number>;
  titleColor?: Maybe<string>;
  subtitleColor?: Maybe<string>;
  badgeBgColor?: Maybe<string>;
  badgeTextColor?: Maybe<string>;
  buttonBgColor?: Maybe<string>;
  buttonTextColor?: Maybe<string>;
  button2BgColor?: Maybe<string>;
  button2TextColor?: Maybe<string>;
  titleColorLight?: Maybe<string>;
  subtitleColorLight?: Maybe<string>;
  badgeBgColorLight?: Maybe<string>;
  badgeTextColorLight?: Maybe<string>;
  buttonBgColorLight?: Maybe<string>;
  buttonTextColorLight?: Maybe<string>;
  button2BgColorLight?: Maybe<string>;
  button2TextColorLight?: Maybe<string>;
  titleHighlightFrom?: Maybe<string>;
  titleHighlightTo?: Maybe<string>;
  titleHighlightFromLight?: Maybe<string>;
  titleHighlightToLight?: Maybe<string>;
  textAlign?: Maybe<string>;
  theme?: Maybe<string>;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  [key: string]: unknown;
}

// Badge icon component
const BadgeIcon = ({ name, className = "w-4 h-4" }: { name?: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    zap: <Zap className={className} />,
    star: <Star className={className} />,
    fire: <Flame className={className} />,
    gift: <Gift className={className} />,
    tag: <Tag className={className} />,
    percent: <Percent className={className} />,
    truck: <Truck className={className} />,
    heart: <Heart className={className} />,
  };
  return <>{icons[name || "zap"] || icons.zap}</>;
};

interface HeroSliderProps {
  initialSlides?: Slide[];
}

export default function HeroSlider({ initialSlides }: HeroSliderProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(!initialSlides?.length);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Mount state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // İlk girişte dark tema, kullanıcı değiştirirse ona göre
  const isDarkMode = mounted ? resolvedTheme === "dark" : true;
  
  // Touch/swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLElement>(null);
  const isAutoPlayingRef = useRef(true);

  // Mobil kontrolu
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // API'den slider verilerini cek (SSR'dan geldiyse atla)
  useEffect(() => {
    if (initialSlides?.length) {
      const filteredSlides = initialSlides.filter((slide: Slide) =>
        isMobile ? slide.showOnMobile : slide.showOnDesktop
      );
      setSlides(filteredSlides.length > 0 ? filteredSlides : initialSlides);
      setLoading(false);
      return;
    }

    const fetchSliders = async () => {
      try {
        const res = await fetch("/api/public/sliders");
        if (res.ok) {
          const data = await res.json();
          const filteredSlides = data.filter((slide: Slide) => 
            isMobile ? slide.showOnMobile : slide.showOnDesktop
          );
          setSlides(filteredSlides.length > 0 ? filteredSlides : data);
        }
      } catch (error) {
        console.error("Error fetching sliders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, [isMobile, initialSlides]);

  const nextSlide = useCallback(() => {
    if (!isTransitioning && slides.length > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 400); // Faster transition
    }
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning && slides.length > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 400); // Faster transition
    }
  }, [isTransitioning, slides.length]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 400); // Faster transition
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  // Publish active slide colors as CSS variables for the Header gradient bar
  useEffect(() => {
    if (!mounted || slides.length === 0) return;
    const s = slides[currentSlide];
    const dark = resolvedTheme === "dark";

    const from = (dark ? s.titleHighlightFrom : s.titleHighlightFromLight) || s.titleHighlightFrom || "#10b981";
    const to = (dark ? s.titleHighlightTo : s.titleHighlightToLight) || s.titleHighlightTo || "#06b6d4";
    const overlay = (dark ? s.overlayColor : s.overlayColorLight) || s.overlayColor || (dark ? "#000000" : "#ffffff");
    const btnBg = (dark ? s.buttonBgColor : s.buttonBgColorLight) || s.buttonBgColor || "";

    const titleHex = ((dark ? s.titleColor : s.titleColorLight) || s.titleColor || "#FFFFFF").replace("#", "");
    const tR = parseInt(titleHex.substring(0, 2), 16) || 0;
    const tG = parseInt(titleHex.substring(2, 4), 16) || 0;
    const tB = parseInt(titleHex.substring(4, 6), 16) || 0;
    const titleLuminance = (0.299 * tR + 0.587 * tG + 0.114 * tB) / 255;
    const slideTheme = titleLuminance > 0.5 ? "dark" : "light";

    const rafId = requestAnimationFrame(() => {
      const root = document.documentElement;
      root.style.setProperty("--slider-color-from", from);
      root.style.setProperty("--slider-color-to", to);
      root.style.setProperty("--slider-color-overlay", overlay);
      root.style.setProperty("--slider-color-btn", btnBg || from);
      root.setAttribute("data-slider-theme", slideTheme);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.removeAttribute("data-slider-theme");
    };
  }, [currentSlide, slides, mounted, resolvedTheme]);

  // Touch/swipe handlers for mobile - improved for responsiveness
  const velocityRef = useRef(0);
  const lastTouchTime = useRef(0);
  const lastTouchX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
    lastTouchTime.current = Date.now();
    velocityRef.current = 0;
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime.current;
    
    // Calculate velocity for better swipe detection
    if (timeDelta > 0) {
      velocityRef.current = (currentX - lastTouchX.current) / timeDelta;
    }
    
    lastTouchX.current = currentX;
    lastTouchTime.current = currentTime;
    touchEndX.current = currentX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    // Use velocity for more responsive swipe - lower threshold when swiping fast
    const velocityThreshold = Math.abs(velocityRef.current) > 0.3;
    const distanceThreshold = Math.abs(diff) > 30; // Lower threshold for fast swipes
    
    if (velocityThreshold || (distanceThreshold && Math.abs(diff) > 50)) {
      if (diff > 0 || velocityRef.current < -0.3) {
        // Swiped left - go to next slide
        nextSlide();
      } else if (diff < 0 || velocityRef.current > 0.3) {
        // Swiped right - go to previous slide
        prevSlide();
      }
    }
    
    setTimeout(() => {
      isAutoPlayingRef.current = true;
      setIsAutoPlaying(true);
    }, 3000);
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative w-full md:h-screen md:min-h-[600px] md:max-h-[900px] overflow-hidden bg-background flex items-center justify-center hero-slider-mobile">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </section>
    );
  }

  // Slider yoksa
  if (slides.length === 0) {
    return (
      <section className="relative w-full md:h-screen md:min-h-[600px] md:max-h-[900px] overflow-hidden bg-background flex items-center justify-center hero-slider-mobile">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="text-center text-foreground-muted">
          <p>Slider bulunamadi</p>
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];
  const backgroundImage = slide.desktopImage;
  
  // Theme-aware color resolution - uses light variant if available and theme is light
  const getThemedColor = (darkValue?: Maybe<string>, lightValue?: Maybe<string>, defaultDark?: string, defaultLight?: string) => {
    if (isDarkMode) {
      return darkValue || defaultDark || undefined;
    } else {
      return lightValue || darkValue || defaultLight || defaultDark || undefined;
    }
  };
  
  // Theme-aware overlay settings
  const overlayColor = getThemedColor(slide.overlayColor, slide.overlayColorLight, "#000000", "#FFFFFF");
  const overlayOpacity = isDarkMode 
    ? (slide.overlayOpacity ?? 50) 
    : (slide.overlayOpacityLight ?? slide.overlayOpacity ?? 50);
  
  // Theme-aware content colors
  const titleColor = getThemedColor(slide.titleColor, slide.titleColorLight, "#FFFFFF", "#111827");
  const subtitleColor = getThemedColor(slide.subtitleColor, slide.subtitleColorLight, "rgba(255,255,255,0.7)", "rgba(75,85,99,1)");
  const badgeBgColor = getThemedColor(slide.badgeBgColor, slide.badgeBgColorLight);
  const badgeTextColor = getThemedColor(slide.badgeTextColor, slide.badgeTextColorLight);
  const buttonBgColor = getThemedColor(slide.buttonBgColor, slide.buttonBgColorLight);
  const buttonTextColor = getThemedColor(slide.buttonTextColor, slide.buttonTextColorLight);
  const button2BgColor = getThemedColor(slide.button2BgColor, slide.button2BgColorLight);
  const button2TextColor = getThemedColor(slide.button2TextColor, slide.button2TextColorLight);
  // Title Highlight Gradient
  const titleHighlightFrom = getThemedColor(slide.titleHighlightFrom, slide.titleHighlightFromLight, "#10b981", "#10b981");
  const titleHighlightTo = getThemedColor(slide.titleHighlightTo, slide.titleHighlightToLight, "#06b6d4", "#06b6d4");

  // Buton stilini belirle
  const getButtonClasses = (style?: string, isPrimary = true) => {
    const base = "group inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap gap-1 md:gap-2 px-2.5 py-1 md:px-8 md:py-4 rounded-full text-[9px] md:text-base font-semibold transition-[color,background-color,box-shadow,transform] duration-300";
    
    switch (style) {
      case "PRIMARY":
        return cn(base, "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:scale-105");
      case "SECONDARY":
        return cn(base, "bg-glass-bg text-foreground dark:text-white backdrop-blur-sm hover:bg-glass-bg-hover border border-glass-border");
      case "OUTLINE":
        return cn(base, "bg-transparent text-foreground dark:text-white border border-border hover:bg-foreground/[0.05] dark:hover:bg-white/10");
      case "GHOST":
        return cn(base, "bg-transparent text-foreground-secondary dark:text-white/80 hover:text-foreground dark:hover:text-white");
      default:
        return isPrimary 
          ? cn(base, "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:scale-105")
          : cn(base, "bg-glass-bg text-foreground dark:text-white backdrop-blur-sm hover:bg-glass-bg-hover border border-glass-border");
    }
  };

  // Text align class
  const getAlignClass = () => {
    switch (slide.textAlign) {
      case "CENTER":
        return "items-center text-center";
      case "RIGHT":
        return "items-end text-right";
      default:
        return "items-start text-left";
    }
  };

  return (
    <>
    <section
      ref={sliderRef}
      className="relative w-full md:h-screen md:min-h-[600px] md:max-h-[900px] overflow-hidden bg-background dark:bg-black touch-pan-y hero-slider-mobile"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Spotlight Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image 
            src={backgroundImage} 
            alt={slide.title} 
            fill 
            sizes="100vw"
            className="object-cover object-center"
            priority={currentSlide === 0}
            fetchPriority={currentSlide === 0 ? "high" : "auto"}
          />
          {/* Dynamic Overlay - Theme-aware (Admin panelden renk ve opaklık ayarlanır) */}
          {overlayColor && overlayOpacity > 0 && (
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: overlayColor,
                opacity: overlayOpacity / 100
              }}
            />
          )}
        </div>
      )}
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className={cn(
        "relative z-10 h-full container flex items-center px-4 md:px-6",
        slide.textAlign === "CENTER" ? "justify-center" : slide.textAlign === "RIGHT" ? "justify-end" : ""
      )}>
        <div className={cn("max-w-4xl pt-16 md:pt-20 flex flex-col gap-0", getAlignClass())}>
          
          {/* ROW 1: Badge */}
          {slide.badge && (
            <div className="h-[24px] md:h-[40px] flex items-center animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
              <div 
                className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1 md:py-2 rounded-full backdrop-blur-sm border border-glass-border"
                style={{ 
                  backgroundColor: badgeBgColor || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                }}
              >
                <span className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 flex items-center justify-center" style={{ color: badgeTextColor || (isDarkMode ? '#FFFFFF' : '#111827') }}>
                  <BadgeIcon name={slide.badgeIcon ?? undefined} className="" />
                </span>
                <span 
                  className="text-[10px] md:text-sm font-medium whitespace-nowrap" 
                  style={{ lineHeight: '14px', color: badgeTextColor || (isDarkMode ? '#FFFFFF' : '#111827') }}
                >
                  {slide.badge}
                </span>
              </div>
            </div>
          )}

          {/* GAP - only if badge exists */}
          {slide.badge && <div className="h-0 md:h-6" />}

          {/* ROW 2: Title Line 1 */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
            <span 
              className={cn(
                "block font-bold leading-[1.15] tracking-tight",
                "text-lg sm:text-xl md:text-4xl lg:text-5xl xl:text-6xl"
              )}
              style={{ color: titleColor }}
            >
              {slide.title}
            </span>
          </div>

          {/* ROW 3: Title Line 2 (Highlight - Gradient) */}
          {slide.titleHighlight && (
            <>
              <div className="h-0 md:h-2" />
              <div className="animate-fade-in-up opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]">
                <span 
                  className={cn(
                    "block font-bold leading-[1.15] tracking-tight",
                    "text-lg sm:text-xl md:text-4xl lg:text-5xl xl:text-6xl"
                  )}
                  style={{
                    backgroundImage: `linear-gradient(to right, ${titleHighlightFrom}, ${titleHighlightTo})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {slide.titleHighlight}
                </span>
              </div>
            </>
          )}

          {/* ROW 4: Description */}
          {slide.subtitle && (
            <>
              <div className="h-0 md:h-8" />
              <div className="animate-fade-in-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
                <p 
                  className="text-[11px] md:text-lg lg:text-xl max-w-[260px] md:max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-3"
                  style={{ color: subtitleColor }}
                >
                  {slide.subtitle}
                </p>
              </div>
            </>
          )}

          {/* GAP before buttons */}
          <div className={cn("h-1", slide.subtitle || slide.titleHighlight ? "md:h-10" : "md:h-6")} />

          {/* ROW 5: CTA Buttons */}
          {(slide.buttonText || slide.button2Text) && (
            <div className="flex flex-wrap gap-1.5 md:gap-4 items-center animate-fade-in-up opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards]">
              {slide.buttonText && slide.buttonLink && (
                <a 
                  href={slide.buttonLink} 
                  className={cn(getButtonClasses(slide.buttonStyle ?? undefined, true), "touch-manipulation")}
                  style={{ 
                    backgroundColor: buttonBgColor || undefined,
                    color: buttonTextColor || undefined,
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-2.5 h-2.5 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              )}
              {slide.button2Text && slide.button2Link && (
                <a 
                  href={slide.button2Link} 
                  className={cn(getButtonClasses(slide.button2Style ?? undefined, false), "touch-manipulation")}
                  style={{ 
                    backgroundColor: button2BgColor || undefined,
                    color: button2TextColor || undefined,
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <span>{slide.button2Text}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, visible on md+ */}
      {slides.length > 1 && (
        <div className="hidden lg:flex absolute left-4 right-4 lg:left-8 lg:right-8 top-1/2 -translate-y-1/2 justify-between pointer-events-none z-20">
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={cn(
              "pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-glass-bg backdrop-blur-md border border-glass-border",
              "flex items-center justify-center text-foreground-secondary dark:text-white/70 hover:text-foreground dark:hover:text-white",
              "hover:bg-glass-bg-hover transition-colors duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Onceki"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={cn(
              "pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-glass-bg backdrop-blur-md border border-glass-border",
              "flex items-center justify-center text-foreground-secondary dark:text-white/70 hover:text-foreground dark:hover:text-white",
              "hover:bg-glass-bg-hover transition-colors duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Sonraki"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className="p-0"
                aria-label={`Slide ${index + 1}`}
              >
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-6 md:w-8 bg-white"
                      : "w-1.5 md:w-[6px] bg-white/30"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-10 z-20 animate-bounce hidden lg:block">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </section>
    </>
  );
}
