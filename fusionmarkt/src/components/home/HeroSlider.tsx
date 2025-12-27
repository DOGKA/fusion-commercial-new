"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Star, Flame, Gift, Tag, Percent, Truck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/Spotlight";
import Image from "next/image";

// Veritabanindan gelecek slide yapisi
interface Slide {
  id: string;
  badge?: string;
  badgeIcon?: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  button2Text?: string;
  button2Link?: string;
  button2Style?: string;
  desktopImage?: string;
  mobileImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textAlign?: string;
  theme?: string;
  showOnMobile: boolean;
  showOnDesktop: boolean;
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

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Touch/swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLElement>(null);

  // Mobil kontrolu
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // API'den slider verilerini cek
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch("/api/public/sliders");
        if (res.ok) {
          const data = await res.json();
          // Cihaza gore filtrele
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
  }, [isMobile]);

  const nextSlide = useCallback(() => {
    if (!isTransitioning && slides.length > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning && slides.length > 0) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [isTransitioning, slides.length]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum swipe distance to trigger slide change
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - go to next slide
        nextSlide();
      } else {
        // Swiped right - go to previous slide
        prevSlide();
      }
    }
    
    // Reset and resume autoplay after a delay
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </section>
    );
  }

  // Slider yoksa
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-black flex items-center justify-center">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="text-center text-white/50">
          <p>Slider bulunamadi</p>
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];
  const backgroundImage = isMobile ? slide.mobileImage : slide.desktopImage;

  // Buton stilini belirle
  const getButtonClasses = (style?: string, isPrimary = true) => {
    const base = "group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300";
    
    switch (style) {
      case "PRIMARY":
        return cn(base, "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:scale-105");
      case "SECONDARY":
        return cn(base, "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/10");
      case "OUTLINE":
        return cn(base, "bg-transparent text-white border border-white/30 hover:bg-white/10");
      case "GHOST":
        return cn(base, "bg-transparent text-white/80 hover:text-white");
      default:
        return isPrimary 
          ? cn(base, "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:scale-105")
          : cn(base, "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/10");
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
    <section
      ref={sliderRef}
      className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-black touch-pan-y"
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
            className="object-cover"
            style={{ opacity: (100 - (slide.overlayOpacity ?? 50)) / 100 }}
            priority
          />
          {/* Dynamic Overlay */}
          {slide.overlayColor && (
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: slide.overlayColor,
                opacity: (slide.overlayOpacity ?? 50) / 100
              }}
            />
          )}
        </div>
      )}
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className={cn(
        "relative z-10 h-full container flex items-center px-4 md:px-6",
        slide.textAlign === "CENTER" ? "justify-center" : slide.textAlign === "RIGHT" ? "justify-end" : ""
      )}>
        <div className={cn("max-w-4xl pt-20 md:pt-20 flex flex-col gap-0", getAlignClass())}>
          
          {/* ROW 1: Eyebrow Badge */}
          <div className="h-[36px] md:h-[40px] flex items-center animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
            {slide.badge && (
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span style={{ width: '16px', height: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeIcon name={slide.badgeIcon} className="text-white" />
                </span>
                <span className="text-xs md:text-sm font-medium text-white whitespace-nowrap" style={{ lineHeight: '16px' }}>{slide.badge}</span>
              </div>
            )}
          </div>

          {/* GAP */}
          <div className="h-6 md:h-6" />

          {/* ROW 2: Title Line 1 */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
            <span className={cn(
              "block font-bold leading-[1.15] tracking-tight",
              slide.theme === "LIGHT" ? "text-gray-900" : "text-white",
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            )}>
              {slide.title}
            </span>
          </div>

          {/* GAP */}
          <div className="h-1 md:h-2" />

          {/* ROW 3: Title Line 2 (Highlight - Gradient) */}
          {slide.titleHighlight && (
            <div className="animate-fade-in-up opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]">
              <span className={cn(
                "block font-bold leading-[1.15] tracking-tight",
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
                "bg-clip-text text-transparent bg-gradient-to-r from-[var(--fusion-primary)] via-orange-400 to-yellow-400"
              )}>
                {slide.titleHighlight}
              </span>
            </div>
          )}

          {/* GAP */}
          <div className="h-3 md:h-8" />

          {/* ROW 4: Description */}
          {slide.subtitle && (
            <div className="animate-fade-in-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
              <p className={cn(
                "text-sm md:text-lg lg:text-xl max-w-xl md:max-w-2xl leading-relaxed",
                "line-clamp-2 md:line-clamp-3",
                slide.theme === "LIGHT" ? "text-gray-600" : "text-white/70"
              )}>
                {slide.subtitle}
              </p>
            </div>
          )}

          {/* GAP - Mobilde büyük boşluk, desktop'ta normal */}
          <div className="h-16 md:h-10" />

          {/* ROW 5: CTA Buttons */}
          {(slide.buttonText || slide.button2Text) && (
            <div className="flex flex-wrap gap-3 md:gap-4 items-center animate-fade-in-up opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards]">
              {slide.buttonText && slide.buttonLink && (
                <a 
                  href={slide.buttonLink} 
                  className={cn(getButtonClasses(slide.buttonStyle, true), "px-6 py-3 md:px-8 md:py-4 text-sm md:text-base")}
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              )}
              {slide.button2Text && slide.button2Link && (
                <a 
                  href={slide.button2Link} 
                  className={cn(getButtonClasses(slide.button2Style, false), "px-6 py-3 md:px-8 md:py-4 text-sm md:text-base")}
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
        <div className="hidden md:flex absolute left-4 right-4 lg:left-8 lg:right-8 top-1/2 -translate-y-1/2 justify-between pointer-events-none z-20">
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={cn(
              "pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10",
              "flex items-center justify-center text-white/70 hover:text-white",
              "hover:bg-white/10 transition-all duration-300",
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
              "pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10",
              "flex items-center justify-center text-white/70 hover:text-white",
              "hover:bg-white/10 transition-all duration-300",
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className="group relative"
                aria-label={`Slide ${index + 1}`}
              >
                <div
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    index === currentSlide
                      ? "w-12 bg-white"
                      : "w-6 bg-white/20 group-hover:bg-white/40"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-10 z-20 animate-bounce hidden md:block">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </section>
  );
}
