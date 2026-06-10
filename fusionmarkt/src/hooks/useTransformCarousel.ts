"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// HYBRID CAROUSEL - Mobile native scroll + Desktop transform drag
//
// MOBİL / TOUCH (pointer: coarse):
//   → Native yatay scroll (overflow-x). Kaydırma compositor thread'inde çalışır,
//     main-thread JS'e takılmaz → iOS Safari / Android Chrome'da titremesiz akış.
//
// DESKTOP (pointer: fine):
//   → CSS transform drag + momentum (fare ile sürükleme + ok butonları).
//   → rAF-batched render, cache'lenmiş maxScroll, kalıcı will-change,
//     delta-time momentum.
// ═══════════════════════════════════════════════════════════════════════════

interface TransformCarouselOptions {
  friction?: number; // Momentum friction (0-1, lower = faster stop)
}

export function useTransformCarousel(options: TransformCarouselOptions = {}) {
  const { friction = 0.88 } = options;

  // Mode: false = transform drag (desktop), true = native scroll (touch)
  // İlk render'da false (SSR/hydration uyumu); mount sonrası touch ise true olur.
  const [nativeScroll, setNativeScroll] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const translateX = useRef(0);
  const isDragging = useRef(false);

  // Render scheduling (rAF-batched)
  const renderRaf = useRef<number | null>(null);
  const momentumRaf = useRef<number | null>(null);

  // Cached max scroll - her move'da hesaplanmaz
  const maxScroll = useRef(0);

  // Touch/Mouse tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslateX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  // Direction lock
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 3;

  // Touch cihaz tespiti (mount sonrası — hydration mismatch önlenir)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    setNativeScroll(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setNativeScroll(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Clamp helper
  const clampTranslate = useCallback((x: number, max: number) => {
    if (x > 0) return 0;
    if (Math.abs(x) > max) return -max;
    return x;
  }, []);

  const recomputeMaxScroll = useCallback(() => {
    if (!containerRef.current || !wrapperRef.current) {
      maxScroll.current = 0;
      return;
    }
    maxScroll.current = Math.max(
      0,
      wrapperRef.current.scrollWidth - containerRef.current.clientWidth
    );
  }, []);

  const scheduleRender = useCallback(() => {
    if (renderRaf.current != null) return;
    renderRaf.current = requestAnimationFrame(() => {
      renderRaf.current = null;
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${translateX.current}px, 0, 0)`;
      }
    });
  }, []);

  const startMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }

    const max = maxScroll.current;
    let lastT = performance.now();

    const tick = (now: number) => {
      if (isDragging.current) {
        velocity.current = 0;
        momentumRaf.current = null;
        return;
      }

      const dt = Math.min(32, now - lastT) || 16;
      lastT = now;
      const frameScale = dt / 16;

      if (Math.abs(velocity.current) < 0.3) {
        velocity.current = 0;
        momentumRaf.current = null;
        translateX.current = clampTranslate(translateX.current, max);
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = `translate3d(${translateX.current}px, 0, 0)`;
        }
        return;
      }

      translateX.current += velocity.current * frameScale;
      velocity.current *= Math.pow(friction, frameScale);

      const clamped = clampTranslate(translateX.current, max);
      if (clamped !== translateX.current) {
        translateX.current = clamped;
        velocity.current = 0;
      }

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${translateX.current}px, 0, 0)`;
      }
      momentumRaf.current = requestAnimationFrame(tick);
    };

    momentumRaf.current = requestAnimationFrame(tick);
  }, [clampTranslate, friction]);

  // ───────────────────────────────────────────────────────────────────────
  // NATIVE SCROLL MODE (touch)
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!nativeScroll) return;
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container) return;

    container.classList.add("carousel-native-scroll");
    // transform mod kalıntılarını temizle
    if (wrapper) {
      wrapper.style.transform = "";
      wrapper.style.willChange = "";
      wrapper.style.cursor = "";
    }

    return () => {
      container.classList.remove("carousel-native-scroll");
    };
  }, [nativeScroll]);

  // ───────────────────────────────────────────────────────────────────────
  // TRANSFORM DRAG MODE (desktop)
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (nativeScroll) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.style.backfaceVisibility = "hidden";
    wrapper.style.transform = "translate3d(0, 0, 0)";
    wrapper.style.cursor = "grab";
    wrapper.style.touchAction = "pan-y";
    wrapper.style.willChange = "transform";

    recomputeMaxScroll();
    const ro = new ResizeObserver(() => recomputeMaxScroll());
    ro.observe(wrapper);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recomputeMaxScroll);

    const handleTouchStart = (e: TouchEvent) => {
      scrollDirection.current = null;
      velocity.current = 0;
      if (momentumRaf.current) {
        cancelAnimationFrame(momentumRaf.current);
        momentumRaf.current = null;
      }
      recomputeMaxScroll();
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

      if (scrollDirection.current === null) {
        if (absDeltaX > directionLockThreshold || absDeltaY > directionLockThreshold) {
          if (absDeltaX > absDeltaY) {
            scrollDirection.current = "horizontal";
            isDragging.current = true;
            wrapper.style.touchAction = "none";
            wrapper.classList.add("carousel-dragging");
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
        velocity.current = velocity.current * 0.7 + newVelocity * 0.3;
      }

      const newTranslate = startTranslateX.current + deltaX;
      translateX.current = clampTranslate(newTranslate, maxScroll.current);

      scheduleRender();
      lastX.current = currentX;
      lastTime.current = now;
    };

    const handleTouchEnd = () => {
      wrapper.style.touchAction = "pan-y";
      wrapper.classList.remove("carousel-dragging");
      if (scrollDirection.current === "horizontal") {
        isDragging.current = false;
        if (Math.abs(velocity.current) > 0.3) {
          startMomentum();
        } else {
          translateX.current = clampTranslate(translateX.current, maxScroll.current);
          scheduleRender();
        }
      }
      scrollDirection.current = null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      velocity.current = 0;
      if (momentumRaf.current) {
        cancelAnimationFrame(momentumRaf.current);
        momentumRaf.current = null;
      }
      recomputeMaxScroll();
      startX.current = e.clientX;
      startTranslateX.current = translateX.current;
      lastX.current = e.clientX;
      lastTime.current = performance.now();
      wrapper.style.cursor = "grabbing";
      wrapper.classList.add("carousel-dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const currentX = e.clientX;
      const now = performance.now();
      const timeDelta = now - lastTime.current;
      if (timeDelta > 0) {
        const newVelocity = (currentX - lastX.current) / timeDelta * 16;
        velocity.current = velocity.current * 0.7 + newVelocity * 0.3;
      }
      const dragDelta = currentX - startX.current;
      const newTranslate = startTranslateX.current + dragDelta;
      translateX.current = clampTranslate(newTranslate, maxScroll.current);
      scheduleRender();
      lastX.current = currentX;
      lastTime.current = now;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      wrapper.style.cursor = "grab";
      wrapper.classList.remove("carousel-dragging");
      if (Math.abs(velocity.current) > 0.3) {
        startMomentum();
      } else {
        translateX.current = clampTranslate(translateX.current, maxScroll.current);
        scheduleRender();
      }
    };

    const handleMouseLeave = () => {
      if (isDragging.current) handleMouseUp();
    };

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
      window.removeEventListener("resize", recomputeMaxScroll);
      ro.disconnect();
      if (renderRaf.current) cancelAnimationFrame(renderRaf.current);
      if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    };
  }, [nativeScroll, recomputeMaxScroll, scheduleRender, clampTranslate, startMomentum]);

  // Navigation method for buttons (desktop = transform, touch = native scrollLeft)
  const scrollBy = useCallback((amount: number, smooth = true) => {
    if (nativeScroll) {
      containerRef.current?.scrollBy({ left: amount, behavior: smooth ? "smooth" : "auto" });
      return;
    }

    if (!wrapperRef.current || !containerRef.current) return;
    velocity.current = 0;
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
    recomputeMaxScroll();
    const newX = clampTranslate(translateX.current + amount, maxScroll.current);
    translateX.current = newX;

    if (smooth && wrapperRef.current) {
      wrapperRef.current.style.transition = "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";
      wrapperRef.current.style.transform = `translate3d(${newX}px, 0, 0)`;
      setTimeout(() => {
        if (wrapperRef.current) wrapperRef.current.style.transition = "";
      }, 300);
    } else {
      wrapperRef.current.style.transform = `translate3d(${newX}px, 0, 0)`;
    }
  }, [nativeScroll, recomputeMaxScroll, clampTranslate]);

  // Mode'a göre stiller — bileşenler aynı kalır, sadece davranış değişir
  const containerStyle = nativeScroll
    ? {
        position: "relative" as const,
        overflowX: "auto" as const,
        overflowY: "hidden" as const,
        WebkitOverflowScrolling: "touch" as const,
        scrollbarWidth: "none" as const,
      }
    : {
        overflow: "hidden" as const,
        position: "relative" as const,
      };

  const wrapperStyle = nativeScroll
    ? {
        display: "flex",
        gap: "16px",
        width: "max-content" as const,
      }
    : {
        display: "flex",
        gap: "16px",
        backfaceVisibility: "hidden" as const,
        cursor: "grab",
        touchAction: "pan-y",
        willChange: "transform" as const,
      };

  return {
    containerRef,
    wrapperRef,
    containerStyle,
    wrapperStyle,
    handlers: {},
    scrollBy,
  };
}
