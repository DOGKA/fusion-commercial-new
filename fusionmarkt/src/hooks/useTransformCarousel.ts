"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CSS TRANSFORM CAROUSEL - Mobile Safari Optimized
// GPU-accelerated with smooth momentum physics, no bounce effect
// ═══════════════════════════════════════════════════════════════════════════

interface TransformCarouselOptions {
  friction?: number; // Momentum friction (0-1, lower = faster stop)
}

export function useTransformCarousel(options: TransformCarouselOptions = {}) {
  const {
    friction = 0.88, // Daha hızlı durma, daha kontrollü
  } = options;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const translateX = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslateX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  
  // Direction lock - düşük eşik, hızlı karar
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 3; // 6'dan 3'e düşürüldü

  // Helpers
  const applyTransform = useCallback((x: number) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }, []);

  const getMaxScroll = useCallback(() => {
    if (!containerRef.current || !wrapperRef.current) return 0;
    return Math.max(0, wrapperRef.current.scrollWidth - containerRef.current.clientWidth);
  }, []);

  // Clamp helper - sert sınır, bounce yok
  const clampTranslate = useCallback((x: number, maxScroll: number) => {
    if (x > 0) return 0;
    if (Math.abs(x) > maxScroll) return -maxScroll;
    return x;
  }, []);

  // Momentum animation - smooth, no bounce
  const startMomentum = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    const maxScroll = getMaxScroll();
    
    const tick = () => {
      if (isDragging.current) {
        velocity.current = 0;
        return;
      }
      
      // Daha düşük eşik - daha hızlı durma
      if (Math.abs(velocity.current) < 0.3) {
        velocity.current = 0;
        rafRef.current = null;
        translateX.current = clampTranslate(translateX.current, maxScroll);
        applyTransform(translateX.current);
        return;
      }
      
      translateX.current += velocity.current;
      velocity.current *= friction;
      
      // Sert sınır - bounce yok
      const clamped = clampTranslate(translateX.current, maxScroll);
      if (clamped !== translateX.current) {
        translateX.current = clamped;
        velocity.current = 0; // Sınıra ulaşınca hemen dur
      }
      
      applyTransform(translateX.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
  }, [getMaxScroll, applyTransform, clampTranslate, friction]);

  // Event listeners effect
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Initial styles - Safari optimized
    wrapper.style.backfaceVisibility = "hidden";
    wrapper.style.transform = "translate3d(0, 0, 0)";
    wrapper.style.cursor = "grab";
    // touch-action başlangıçta pan-y, horizontal drag'de değişecek
    wrapper.style.touchAction = "pan-y";
    // will-change sadece gerektiğinde aktif olacak (Safari optimizasyon)

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      scrollDirection.current = null;
      velocity.current = 0;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      startTranslateX.current = translateX.current;
      lastX.current = touch.clientX;
      lastTime.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaX = currentX - startX.current;
      const deltaY = currentY - startY.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Direction lock - basitleştirilmiş
      if (scrollDirection.current === null) {
        if (absDeltaX > directionLockThreshold || absDeltaY > directionLockThreshold) {
          // Basit kontrol: deltaX > deltaY ise horizontal
          if (absDeltaX > absDeltaY) {
            scrollDirection.current = "horizontal";
            isDragging.current = true;
            // Horizontal drag başladı - touch-action'ı kapat
            wrapper.style.touchAction = "none";
            wrapper.style.willChange = "transform";
            if (e.cancelable) e.preventDefault();
          } else {
            scrollDirection.current = "vertical";
            return;
          }
        } else {
          return;
        }
      }
      
      if (scrollDirection.current !== "horizontal") return;
      if (e.cancelable) e.preventDefault();
      
      const now = performance.now();
      const timeDelta = now - lastTime.current;
      
      // Velocity smoothing - daha yumuşak (0.7/0.3)
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.7 + newVelocity * 0.3;
      }
      
      // Sert sınır - bounce yok
      const maxScroll = getMaxScroll();
      const newTranslate = startTranslateX.current + deltaX;
      translateX.current = clampTranslate(newTranslate, maxScroll);
      
      applyTransform(translateX.current);
      lastX.current = currentX;
      lastTime.current = now;
    };

    const handleTouchEnd = () => {
      // Touch-action'ı geri aç
      wrapper.style.touchAction = "pan-y";
      wrapper.style.willChange = "auto";
      
      if (scrollDirection.current === "horizontal") {
        isDragging.current = false;
        
        if (Math.abs(velocity.current) > 0.3) {
          wrapper.style.willChange = "transform"; // Momentum için tekrar aç
          startMomentum();
        } else {
          const maxScroll = getMaxScroll();
          translateX.current = clampTranslate(translateX.current, maxScroll);
          applyTransform(translateX.current);
        }
      }
      scrollDirection.current = null;
    };

    // Mouse handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      velocity.current = 0;
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      startX.current = e.clientX;
      startTranslateX.current = translateX.current;
      lastX.current = e.clientX;
      lastTime.current = performance.now();
      wrapper.style.cursor = "grabbing";
      wrapper.style.willChange = "transform";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      
      const currentX = e.clientX;
      const now = performance.now();
      const timeDelta = now - lastTime.current;
      
      // Velocity smoothing - daha yumuşak (0.7/0.3)
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.7 + newVelocity * 0.3;
      }
      
      // Sert sınır - bounce yok
      const maxScroll = getMaxScroll();
      const dragDelta = currentX - startX.current;
      const newTranslate = startTranslateX.current + dragDelta;
      translateX.current = clampTranslate(newTranslate, maxScroll);
      
      applyTransform(translateX.current);
      lastX.current = currentX;
      lastTime.current = now;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      wrapper.style.cursor = "grab";
      
      if (Math.abs(velocity.current) > 0.3) {
        startMomentum();
      } else {
        wrapper.style.willChange = "auto";
        const maxScroll = getMaxScroll();
        translateX.current = clampTranslate(translateX.current, maxScroll);
        applyTransform(translateX.current);
      }
    };

    const handleMouseLeave = () => {
      if (isDragging.current) handleMouseUp();
    };

    // Add listeners
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: true });
    wrapper.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    wrapper.addEventListener("mousedown", handleMouseDown);
    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseup", handleMouseUp);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
      wrapper.removeEventListener("mousedown", handleMouseDown);
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseup", handleMouseUp);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [getMaxScroll, applyTransform, clampTranslate, startMomentum]);

  // Navigation method for buttons
  const scrollBy = useCallback((amount: number, smooth = true) => {
    if (!wrapperRef.current || !containerRef.current) return;
    
    velocity.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    const maxScroll = getMaxScroll();
    const newX = clampTranslate(translateX.current + amount, maxScroll);
    translateX.current = newX;
    
    if (smooth && wrapperRef.current) {
      wrapperRef.current.style.transition = "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";
      applyTransform(newX);
      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.transition = "";
        }
      }, 300);
    } else {
      applyTransform(newX);
    }
  }, [getMaxScroll, applyTransform, clampTranslate]);

  return {
    containerRef,
    wrapperRef,
    containerStyle: {
      overflow: "hidden",
      position: "relative" as const,
    },
    wrapperStyle: {
      display: "flex",
      gap: "16px",
      backfaceVisibility: "hidden" as const,
      cursor: "grab",
      touchAction: "pan-y",
    },
    handlers: {},
    scrollBy,
  };
}
