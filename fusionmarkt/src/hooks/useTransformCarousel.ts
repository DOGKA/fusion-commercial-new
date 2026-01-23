"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CSS TRANSFORM CAROUSEL - Manual scroll only (no auto-scroll)
// GPU-accelerated with momentum physics
// ═══════════════════════════════════════════════════════════════════════════

interface TransformCarouselOptions {
  friction?: number; // Momentum friction (0-1, higher = less friction)
  horizontalAngleThreshold?: number; // Angle threshold for horizontal swipe detection (degrees)
}

export function useTransformCarousel(options: TransformCarouselOptions = {}) {
  const {
    friction = 0.92,
    horizontalAngleThreshold = 40,
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
  
  // Direction lock
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 6;

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

  // Momentum animation
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
      
      if (Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        rafRef.current = null;
        
        // Boundary snap
        if (translateX.current > 0) translateX.current = 0;
        else if (Math.abs(translateX.current) > maxScroll) translateX.current = -maxScroll;
        
        applyTransform(translateX.current);
        return;
      }
      
      translateX.current += velocity.current;
      velocity.current *= friction;
      
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
  }, [getMaxScroll, applyTransform, friction]);

  // Event listeners effect
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // GPU hints
    wrapper.style.willChange = "transform";
    wrapper.style.backfaceVisibility = "hidden";
    wrapper.style.transform = "translate3d(0, 0, 0)";
    wrapper.style.cursor = "grab";
    wrapper.style.touchAction = "pan-y pinch-zoom";

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
      
      // Direction lock
      if (scrollDirection.current === null) {
        if (absDeltaX > directionLockThreshold || absDeltaY > directionLockThreshold) {
          const angleDeg = Math.atan2(absDeltaY, absDeltaX) * (180 / Math.PI);
          
          if (angleDeg <= horizontalAngleThreshold) {
            scrollDirection.current = "horizontal";
            isDragging.current = true;
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
      
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.4 + newVelocity * 0.6;
      }
      
      translateX.current = startTranslateX.current + deltaX;
      
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
  }, [getMaxScroll, applyTransform, startMomentum, horizontalAngleThreshold]);

  // Navigation method for buttons
  const scrollBy = useCallback((amount: number, smooth = true) => {
    if (!wrapperRef.current || !containerRef.current) return;
    
    velocity.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    const maxScroll = getMaxScroll();
    let newX = translateX.current + amount;
    
    if (newX > 0) newX = 0;
    if (Math.abs(newX) > maxScroll) newX = -maxScroll;
    
    translateX.current = newX;
    
    if (smooth && wrapperRef.current) {
      wrapperRef.current.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      applyTransform(newX);
      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.transition = "";
        }
      }, 350);
    } else {
      applyTransform(newX);
    }
  }, [getMaxScroll, applyTransform]);

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
      touchAction: "pan-y pinch-zoom",
    },
    handlers: {},
    scrollBy,
  };
}
