"use client";

import { useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// CAROUSEL NAV BUTTONS - Professional navigation for transform carousels
// Supports: single click, hold-to-scroll, theme variants, dark/light mode
// ═══════════════════════════════════════════════════════════════════════════

interface CarouselNavButtonsProps {
  /** scrollBy method from useTransformCarousel hook */
  scrollBy: (amount: number, smooth?: boolean) => void;
  /** pauseAutoScroll method from useTransformCarousel hook */
  pauseAutoScroll: () => void;
  /** resumeAutoScroll method from useTransformCarousel hook */
  resumeAutoScroll?: (delay?: number) => void;
  /** Scroll amount per click (default: 300 = 280px card + 20px gap) */
  scrollAmount?: number;
  /** Delay before resuming auto-scroll after interaction (default: 3000ms) */
  resumeDelay?: number;
  /** Hold-to-scroll interval (default: 120ms) */
  holdInterval?: number;
  /** Theme variant */
  theme?: "neutral" | "amber" | "emerald" | "dynamic";
  /** Dynamic theme color (hex) - used when theme="dynamic" */
  themeColor?: string;
  /** Additional className for container */
  className?: string;
}

// Theme color configurations
const THEME_STYLES = {
  neutral: {
    bg: "bg-foreground/[0.03]",
    border: "border-border",
    text: "text-foreground/40",
    hoverBg: "hover:bg-foreground/10",
    hoverBorder: "hover:border-foreground/20",
    hoverText: "hover:text-foreground",
  },
  amber: {
    bg: "bg-amber-500/[0.05]",
    border: "border-amber-500/[0.15]",
    text: "text-amber-500/50",
    hoverBg: "hover:bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/30",
    hoverText: "hover:text-amber-400",
  },
  emerald: {
    bg: "bg-emerald-500/[0.05]",
    border: "border-emerald-500/[0.15]",
    text: "text-emerald-500/50",
    hoverBg: "hover:bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-500/30",
    hoverText: "hover:text-emerald-400",
  },
};

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(16, 185, 129, ${alpha})`; // fallback emerald
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CarouselNavButtons({
  scrollBy,
  pauseAutoScroll,
  resumeAutoScroll,
  scrollAmount = 300,
  resumeDelay = 3000,
  holdInterval = 120,
  theme = "neutral",
  themeColor,
  className,
}: CarouselNavButtonsProps) {
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  // Cleanup on unmount - prevent memory leak
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  // Get theme styles
  const getButtonClasses = useCallback(() => {
    if (theme === "dynamic") {
      // Dynamic theme uses inline styles
      return "transition-all duration-200";
    }
    
    const styles = THEME_STYLES[theme as keyof typeof THEME_STYLES] || THEME_STYLES.neutral;
    return cn(
      styles.bg,
      styles.border,
      styles.text,
      styles.hoverBg,
      styles.hoverBorder,
      styles.hoverText,
      "transition-all duration-200"
    );
  }, [theme]);

  // Get dynamic inline styles
  const getDynamicStyles = useCallback((isHovered: boolean) => {
    if (theme !== "dynamic" || !themeColor) return {};
    
    return {
      backgroundColor: hexToRgba(themeColor, isHovered ? 0.1 : 0.05),
      borderColor: hexToRgba(themeColor, isHovered ? 0.3 : 0.15),
      color: hexToRgba(themeColor, isHovered ? 0.9 : 0.5),
    };
  }, [theme, themeColor]);

  // Handle single click
  const handleClick = useCallback((direction: "left" | "right") => {
    pauseAutoScroll();
    const amount = direction === "left" ? scrollAmount : -scrollAmount;
    scrollBy(amount, true);
    
    // Resume auto-scroll after delay
    if (resumeAutoScroll) {
      resumeAutoScroll(resumeDelay);
    }
  }, [scrollBy, pauseAutoScroll, resumeAutoScroll, scrollAmount, resumeDelay]);

  // Handle hold start (mouse down / touch start)
  const handleHoldStart = useCallback((direction: "left" | "right") => {
    pauseAutoScroll();
    isHoldingRef.current = true;
    
    // First scroll immediately
    const amount = direction === "left" ? scrollAmount : -scrollAmount;
    scrollBy(amount, true);
    
    // Then scroll repeatedly while holding
    holdTimerRef.current = setInterval(() => {
      if (isHoldingRef.current) {
        scrollBy(amount, true);
      }
    }, holdInterval);
  }, [scrollBy, pauseAutoScroll, scrollAmount, holdInterval]);

  // Handle hold end (mouse up / touch end / mouse leave)
  const handleHoldEnd = useCallback(() => {
    isHoldingRef.current = false;
    
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    // Resume auto-scroll after delay
    if (resumeAutoScroll) {
      resumeAutoScroll(resumeDelay);
    }
  }, [resumeAutoScroll, resumeDelay]);

  // Button base classes
  const buttonBase = cn(
    "w-10 h-10 rounded-full border flex items-center justify-center",
    "active:scale-95",
    getButtonClasses()
  );

  return (
    <div className={cn("hidden md:flex items-center gap-3", className)}>
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => handleClick("left")}
        onMouseDown={() => handleHoldStart("left")}
        onMouseUp={handleHoldEnd}
        onTouchStart={() => handleHoldStart("left")}
        onTouchEnd={handleHoldEnd}
        className={buttonBase}
        style={theme === "dynamic" ? getDynamicStyles(false) : undefined}
        onMouseEnter={(e) => {
          if (theme === "dynamic" && themeColor) {
            const styles = getDynamicStyles(true);
            Object.assign(e.currentTarget.style, styles);
          }
        }}
        onMouseLeave={(e) => {
          handleHoldEnd();
          if (theme === "dynamic" && themeColor) {
            const styles = getDynamicStyles(false);
            Object.assign(e.currentTarget.style, styles);
          }
        }}
        aria-label="Önceki"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handleClick("right")}
        onMouseDown={() => handleHoldStart("right")}
        onMouseUp={handleHoldEnd}
        onTouchStart={() => handleHoldStart("right")}
        onTouchEnd={handleHoldEnd}
        className={buttonBase}
        style={theme === "dynamic" ? getDynamicStyles(false) : undefined}
        onMouseEnter={(e) => {
          if (theme === "dynamic" && themeColor) {
            const styles = getDynamicStyles(true);
            Object.assign(e.currentTarget.style, styles);
          }
        }}
        onMouseLeave={(e) => {
          handleHoldEnd();
          if (theme === "dynamic" && themeColor) {
            const styles = getDynamicStyles(false);
            Object.assign(e.currentTarget.style, styles);
          }
        }}
        aria-label="Sonraki"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

