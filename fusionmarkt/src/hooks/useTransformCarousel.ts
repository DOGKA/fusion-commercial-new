"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CSS TRANSFORM CAROUSEL - Ultra-smooth GPU-accelerated scrolling
// Apple, Stripe, Vercel kalitesinde animasyon
// ═══════════════════════════════════════════════════════════════════════════

interface TransformCarouselOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number; // px/saniye
  pauseOnHover?: boolean;
  friction?: number; // Momentum friction (0-1, yüksek = daha az sürtünme)
  pauseDuration?: number; // ms - interaction sonrası bekleme
  loop?: boolean; // Sonsuz döngü
}

export function useTransformCarousel(options: TransformCarouselOptions = {}) {
  const {
    autoScroll = true,
    autoScrollSpeed = 40, // px/saniye - yavaş & akıcı
    pauseOnHover = true,
    friction = 0.95,
    pauseDuration = 2000,
    loop = true,
  } = options;

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const containerRef = useRef<HTMLDivElement>(null); // Viewport (overflow: hidden)
  const wrapperRef = useRef<HTMLDivElement>(null);   // Content (transform: translateX)
  
  // State refs
  const translateX = useRef(0);          // Mevcut X pozisyonu (negatif değer)
  const targetX = useRef(0);             // Hedef X pozisyonu
  const rafRef = useRef<number | null>(null);
  const isRunning = useRef(false);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const lastTickRef = useRef(0);
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startTranslateX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  
  // Direction lock
  const startY = useRef(0);
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 10;

  // Options as refs (React 19 uyumlu)
  const autoScrollRef = useRef(autoScroll);
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  const frictionRef = useRef(friction);
  
  useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);
  useEffect(() => { autoScrollSpeedRef.current = autoScrollSpeed; }, [autoScrollSpeed]);
  useEffect(() => { frictionRef.current = friction; }, [friction]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Apply transform to wrapper
  // ═══════════════════════════════════════════════════════════════════════════
  const applyTransform = useCallback((x: number) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateX(${x}px)`;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get max scroll distance
  // ═══════════════════════════════════════════════════════════════════════════
  const getMaxScroll = useCallback(() => {
    if (!containerRef.current || !wrapperRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = wrapperRef.current.scrollWidth;
    return Math.max(0, contentWidth - containerWidth);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // STOP ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  const stopAnimation = useCallback(() => {
    isRunning.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // START AUTO-SCROLL ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  const startAutoScroll = useCallback(() => {
    if (isRunning.current || !autoScrollRef.current) return false;
    
    const maxScroll = getMaxScroll();
    if (maxScroll <= 0) return false;
    
    isRunning.current = true;
    lastTickRef.current = performance.now();
    
    const tick = () => {
      if (!isRunning.current) return;
      
      // Pause veya drag durumunda bekle
      if (isPaused.current || isDragging.current) {
        lastTickRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      
      const now = performance.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      
      // TranslateX güncelle (negatif yönde ilerle)
      translateX.current -= autoScrollSpeedRef.current * dt;
      
      // Loop: başa dön
      const currentMax = getMaxScroll();
      if (Math.abs(translateX.current) >= currentMax) {
        translateX.current = 0;
      }
      
      // GPU Transform uygula - BUTTERY SMOOTH!
      applyTransform(translateX.current);
      
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return true;
  }, [getMaxScroll, applyTransform]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOMENTUM ANIMATION (after drag)
  // ═══════════════════════════════════════════════════════════════════════════
  const startMomentum = useCallback(() => {
    // Önceki animation'ı temizle
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isRunning.current = false;
    
    const maxScroll = getMaxScroll();
    
    const tick = () => {
      // Drag başladıysa momentum'u durdur
      if (isDragging.current) {
        velocity.current = 0;
        return;
      }
      
      if (Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        rafRef.current = null;
        
        // Boundary check
        if (translateX.current > 0) {
          translateX.current = 0;
        } else if (Math.abs(translateX.current) > maxScroll) {
          translateX.current = -maxScroll;
        }
        applyTransform(translateX.current);
        
        // Resume auto-scroll after pause
        setTimeout(() => {
          if (!isDragging.current && !isRunning.current) {
            isPaused.current = false;
            startAutoScroll();
          }
        }, pauseDuration);
        return;
      }
      
      translateX.current += velocity.current;
      velocity.current *= frictionRef.current;
      
      // Boundary clamp
      if (translateX.current > 0) {
        translateX.current = 0;
        velocity.current = 0;
      } else if (Math.abs(translateX.current) > maxScroll) {
        translateX.current = -maxScroll;
        velocity.current = 0;
      }
      
      applyTransform(translateX.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
  }, [getMaxScroll, applyTransform, pauseDuration, startAutoScroll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUCH HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // CRITICAL: Animation'ı tamamen durdur
    isRunning.current = false;
    isPaused.current = true;
    scrollDirection.current = null;
    velocity.current = 0;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTranslateX.current = translateX.current;
    lastX.current = e.touches[0].clientX;
    lastTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - startX.current);
    const deltaY = Math.abs(currentY - startY.current);
    
    // Direction lock
    if (scrollDirection.current === null) {
      if (deltaX > directionLockThreshold || deltaY > directionLockThreshold) {
        if (deltaX > deltaY) {
          scrollDirection.current = "horizontal";
          isDragging.current = true;
        } else {
          scrollDirection.current = "vertical";
          return;
        }
      } else {
        return;
      }
    }
    
    if (scrollDirection.current !== "horizontal") return;
    
    e.preventDefault();
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTime.current;
    
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) * 0.5; // Smooth velocity
    }
    
    // Direct transform update - INSTANT RESPONSE
    const dragDelta = currentX - startX.current;
    translateX.current = startTranslateX.current + dragDelta;
    
    // Boundary resistance (rubber band effect)
    const maxScroll = getMaxScroll();
    if (translateX.current > 0) {
      translateX.current *= 0.3; // Resistance
    } else if (Math.abs(translateX.current) > maxScroll) {
      const overflow = Math.abs(translateX.current) - maxScroll;
      translateX.current = -(maxScroll + overflow * 0.3);
    }
    
    applyTransform(translateX.current);
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, [getMaxScroll, applyTransform]);

  const handleTouchEnd = useCallback(() => {
    if (scrollDirection.current === "horizontal") {
      isDragging.current = false;
      
      if (Math.abs(velocity.current) > 1) {
        startMomentum();
      } else {
        // Boundary snap
        const maxScroll = getMaxScroll();
        if (translateX.current > 0) {
          translateX.current = 0;
        } else if (Math.abs(translateX.current) > maxScroll) {
          translateX.current = -maxScroll;
        }
        applyTransform(translateX.current);
        
        // Resume auto-scroll - temiz başlat
        setTimeout(() => {
          if (!isDragging.current && !isRunning.current) {
            isPaused.current = false;
            startAutoScroll();
          }
        }, pauseDuration);
      }
    }
    
    scrollDirection.current = null;
  }, [startMomentum, getMaxScroll, applyTransform, pauseDuration, startAutoScroll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOUSE HANDLERS (Desktop drag)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // CRITICAL: Animation'ı tamamen durdur
    isRunning.current = false;
    isDragging.current = true;
    isPaused.current = true;
    velocity.current = 0;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    startX.current = e.clientX;
    startTranslateX.current = translateX.current;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = "grabbing";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTime.current;
    
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) * 0.5;
    }
    
    const dragDelta = currentX - startX.current;
    translateX.current = startTranslateX.current + dragDelta;
    
    // Boundary resistance
    const maxScroll = getMaxScroll();
    if (translateX.current > 0) {
      translateX.current *= 0.3;
    } else if (Math.abs(translateX.current) > maxScroll) {
      const overflow = Math.abs(translateX.current) - maxScroll;
      translateX.current = -(maxScroll + overflow * 0.3);
    }
    
    applyTransform(translateX.current);
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, [getMaxScroll, applyTransform]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = "grab";
    }
    
    if (Math.abs(velocity.current) > 1) {
      startMomentum();
    } else {
      const maxScroll = getMaxScroll();
      if (translateX.current > 0) {
        translateX.current = 0;
      } else if (Math.abs(translateX.current) > maxScroll) {
        translateX.current = -maxScroll;
      }
      applyTransform(translateX.current);
      
      // Resume auto-scroll - temiz başlat
      setTimeout(() => {
        if (!isDragging.current && !isRunning.current) {
          isPaused.current = false;
          startAutoScroll();
        }
      }, pauseDuration);
    }
  }, [startMomentum, getMaxScroll, applyTransform, pauseDuration, startAutoScroll]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      isPaused.current = true;
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      handleMouseUp();
    }
    isPaused.current = false;
  }, [handleMouseUp]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION & CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // GPU hints for wrapper
    if (wrapperRef.current) {
      wrapperRef.current.style.willChange = "transform";
      wrapperRef.current.style.backfaceVisibility = "hidden";
      wrapperRef.current.style.transform = "translateX(0)";
      wrapperRef.current.style.cursor = "grab";
    }
    
    // Start auto-scroll with delay
    const timer = setTimeout(() => {
      if (autoScrollRef.current && getMaxScroll() > 0) {
        startAutoScroll();
      }
    }, 500);
    
    // Retry if content not loaded
    const retryTimer = setInterval(() => {
      if (!isRunning.current && autoScrollRef.current && getMaxScroll() > 0) {
        startAutoScroll();
      }
    }, 200);
    
    // Visibility change handler
    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAutoScroll();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      clearTimeout(timer);
      clearInterval(retryTimer);
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [getMaxScroll, startAutoScroll, stopAnimation]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    containerRef,
    wrapperRef,
    containerStyle: {
      overflow: "hidden",
      position: "relative" as const,
    },
    wrapperStyle: {
      display: "flex",
      gap: "16px", // Default gap, override edilebilir
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
      cursor: "grab",
    },
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
}

