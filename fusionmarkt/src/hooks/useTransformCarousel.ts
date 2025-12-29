"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CSS TRANSFORM CAROUSEL - Ultra-smooth GPU-accelerated scrolling
// Native touch events with { passive: false } for proper preventDefault
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
    friction = 0.92, // Daha hızlı durma
    pauseDuration = 2000,
  } = options;

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════════════════════
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // State refs
  const translateX = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isRunning = useRef(false);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const lastTickRef = useRef(0);
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslateX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  
  // Direction lock
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 8;
  
  // Listener attached flag - prevents duplicate listeners
  const listenersAttached = useRef(false);

  // Options as refs
  const autoScrollRef = useRef(autoScroll);
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  const frictionRef = useRef(friction);
  const pauseDurationRef = useRef(pauseDuration);
  
  useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);
  useEffect(() => { autoScrollSpeedRef.current = autoScrollSpeed; }, [autoScrollSpeed]);
  useEffect(() => { frictionRef.current = friction; }, [friction]);
  useEffect(() => { pauseDurationRef.current = pauseDuration; }, [pauseDuration]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  const applyTransform = useCallback((x: number) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }, []);

  const getMaxScroll = useCallback(() => {
    if (!containerRef.current || !wrapperRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = wrapperRef.current.scrollWidth;
    return Math.max(0, contentWidth - containerWidth);
  }, []);

  const stopAnimation = useCallback(() => {
    isRunning.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-SCROLL
  // ═══════════════════════════════════════════════════════════════════════════
  const startAutoScroll = useCallback(() => {
    if (isRunning.current || !autoScrollRef.current) return false;
    
    const maxScroll = getMaxScroll();
    if (maxScroll <= 0) return false;
    
    isRunning.current = true;
    lastTickRef.current = performance.now();
    
    const tick = () => {
      if (!isRunning.current) return;
      
      if (isPaused.current || isDragging.current) {
        lastTickRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      
      const now = performance.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      
      translateX.current -= autoScrollSpeedRef.current * dt;
      
      const currentMax = getMaxScroll();
      if (Math.abs(translateX.current) >= currentMax) {
        translateX.current = 0;
      }
      
      applyTransform(translateX.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return true;
  }, [getMaxScroll, applyTransform]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOMENTUM
  // ═══════════════════════════════════════════════════════════════════════════
  const startMomentum = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isRunning.current = false;
    
    const maxScroll = getMaxScroll();
    
    const tick = () => {
      if (isDragging.current) {
        velocity.current = 0;
        return;
      }
      
      if (Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        rafRef.current = null;
        
        // Boundary snap
        if (translateX.current > 0) translateX.current = 0;
        else if (Math.abs(translateX.current) > maxScroll) translateX.current = -maxScroll;
        
        applyTransform(translateX.current);
        
        setTimeout(() => {
          if (!isDragging.current && !isRunning.current) {
            isPaused.current = false;
            startAutoScroll();
          }
        }, pauseDurationRef.current);
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
  }, [getMaxScroll, applyTransform, startAutoScroll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECT 1: TIMERS - Always run, check wrapper inside
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Start auto-scroll with delay
    const startTimer = setTimeout(() => {
      if (autoScrollRef.current && getMaxScroll() > 0 && wrapperRef.current) {
        startAutoScroll();
      }
    }, 300);
    
    // Aggressive retry for dynamic content loading - checks every 150ms
    const retryTimer = setInterval(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return; // Wrapper henüz yok, bekle
      
      if (!isRunning.current && autoScrollRef.current && getMaxScroll() > 0 && !isDragging.current && !isPaused.current) {
        startAutoScroll();
      }
    }, 150);

    // Visibility change handler
    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (!isDragging.current && autoScrollRef.current && wrapperRef.current) {
        setTimeout(() => startAutoScroll(), 100);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(startTimer);
      clearInterval(retryTimer);
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [getMaxScroll, startAutoScroll, stopAnimation, autoScroll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECT 2: NATIVE EVENT LISTENERS - Only when wrapper exists
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return; // Wrapper yok, listener ekleme

    // GPU hints
    wrapper.style.willChange = "transform";
    wrapper.style.backfaceVisibility = "hidden";
    wrapper.style.transform = "translate3d(0, 0, 0)";
    wrapper.style.cursor = "grab";
    wrapper.style.touchAction = "pan-y pinch-zoom";

    // ─────────────────────────────────────────────────────────────────────────
    // TOUCH START
    // ─────────────────────────────────────────────────────────────────────────
    const handleTouchStart = (e: TouchEvent) => {
      isRunning.current = false;
      isPaused.current = true;
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

    // ─────────────────────────────────────────────────────────────────────────
    // TOUCH MOVE
    // ─────────────────────────────────────────────────────────────────────────
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaX = Math.abs(currentX - startX.current);
      const deltaY = Math.abs(currentY - startY.current);
      
      // Direction lock
      if (scrollDirection.current === null) {
        if (deltaX > directionLockThreshold || deltaY > directionLockThreshold) {
          if (deltaX > deltaY * 1.2) {
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
      
      const now = performance.now();
      const timeDelta = now - lastTime.current;
      
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.4 + newVelocity * 0.6;
      }
      
      const dragDelta = currentX - startX.current;
      translateX.current = startTranslateX.current + dragDelta;
      
      const maxScroll = getMaxScroll();
      if (translateX.current > 0) {
        translateX.current = translateX.current * 0.3;
      } else if (Math.abs(translateX.current) > maxScroll) {
        const overflow = Math.abs(translateX.current) - maxScroll;
        translateX.current = -(maxScroll + overflow * 0.3);
      }
      
      applyTransform(translateX.current);
      lastX.current = currentX;
      lastTime.current = now;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // TOUCH END
    // ─────────────────────────────────────────────────────────────────────────
    const handleTouchEnd = () => {
      if (scrollDirection.current === "horizontal") {
        isDragging.current = false;
        
        if (Math.abs(velocity.current) > 0.5) {
          startMomentum();
        } else {
          const maxScroll = getMaxScroll();
          if (translateX.current > 0) translateX.current = 0;
          else if (Math.abs(translateX.current) > maxScroll) translateX.current = -maxScroll;
          
          applyTransform(translateX.current);
          
          setTimeout(() => {
            if (!isDragging.current && !isRunning.current) {
              isPaused.current = false;
              startAutoScroll();
            }
          }, pauseDurationRef.current);
        }
      }
      scrollDirection.current = null;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // MOUSE HANDLERS
    // ─────────────────────────────────────────────────────────────────────────
    const handleMouseDown = (e: MouseEvent) => {
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
      lastTime.current = performance.now();
      wrapper.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      
      const currentX = e.clientX;
      const now = performance.now();
      const timeDelta = now - lastTime.current;
      
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.4 + newVelocity * 0.6;
      }
      
      const dragDelta = currentX - startX.current;
      translateX.current = startTranslateX.current + dragDelta;
      
      const maxScroll = getMaxScroll();
      if (translateX.current > 0) {
        translateX.current = translateX.current * 0.3;
      } else if (Math.abs(translateX.current) > maxScroll) {
        const overflow = Math.abs(translateX.current) - maxScroll;
        translateX.current = -(maxScroll + overflow * 0.3);
      }
      
      applyTransform(translateX.current);
      lastX.current = currentX;
      lastTime.current = now;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      wrapper.style.cursor = "grab";
      
      if (Math.abs(velocity.current) > 0.5) {
        startMomentum();
      } else {
        const maxScroll = getMaxScroll();
        if (translateX.current > 0) translateX.current = 0;
        else if (Math.abs(translateX.current) > maxScroll) translateX.current = -maxScroll;
        
        applyTransform(translateX.current);
        
        setTimeout(() => {
          if (!isDragging.current && !isRunning.current) {
            isPaused.current = false;
            startAutoScroll();
          }
        }, pauseDurationRef.current);
      }
    };

    const handleMouseEnter = () => {
      if (pauseOnHover) isPaused.current = true;
    };

    const handleMouseLeave = () => {
      if (isDragging.current) handleMouseUp();
      isPaused.current = false;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ADD EVENT LISTENERS
    // ─────────────────────────────────────────────────────────────────────────
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: true });
    wrapper.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    
    wrapper.addEventListener("mousedown", handleMouseDown);
    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseup", handleMouseUp);
    wrapper.addEventListener("mouseleave", handleMouseLeave);
    wrapper.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
      wrapper.removeEventListener("touchcancel", handleTouchEnd);
      
      wrapper.removeEventListener("mousedown", handleMouseDown);
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseup", handleMouseUp);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      wrapper.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [getMaxScroll, applyTransform, startAutoScroll, startMomentum, pauseOnHover, autoScroll]);

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
      gap: "16px",
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
      cursor: "grab",
      touchAction: "pan-y pinch-zoom", // Allow vertical scroll
    },
    // Empty handlers - all handled via native listeners
    handlers: {},
  };
}
