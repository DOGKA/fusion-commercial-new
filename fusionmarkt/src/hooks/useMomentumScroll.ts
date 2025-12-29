"use client";

import { useRef, useEffect, useCallback } from "react";

interface MomentumScrollOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  pauseOnHover?: boolean;
  friction?: number;
  pauseDuration?: number;
}

export function useMomentumScroll(options: MomentumScrollOptions = {}) {
  const {
    autoScroll = true,
    autoScrollSpeed = 0.5,
    pauseOnHover = true,
    friction = 0.92,
    pauseDuration = 2000,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunning = useRef(false); // Çoğalmayı önlemek için flag
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const startScrollLeft = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumAnimationRef = useRef<number | null>(null);
  
  // Direction lock
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 10;

  // Stop auto-scroll - useCallback ile memoize
  const stopAutoScroll = useCallback(() => {
    isRunning.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-scroll - useCallback ile memoize
  const startAutoScroll = useCallback(() => {
    // Zaten çalışıyorsa tekrar başlatma (çoğalmayı önle)
    if (isRunning.current || !autoScroll) return;
    
    // Önceki interval'i temizle (garanti)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    isRunning.current = true;
    isPaused.current = false;
    
    intervalRef.current = setInterval(() => {
      const container = containerRef.current;
      
      if (!container || isPaused.current || isDragging.current) {
        return;
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      
      if (container.scrollLeft >= maxScroll - 1) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += autoScrollSpeed;
      }
    }, 16);
  }, [autoScroll, autoScrollSpeed]);

  // Schedule resume after user interaction
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isDragging.current) {
        isPaused.current = false;
      }
    }, pauseDuration);
  }, [pauseDuration]);

  // Main effect - start auto-scroll and handle visibility/bfcache
  useEffect(() => {
    if (!autoScroll) return;

    // Visibility change handler (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    };

    // Page show handler (iOS Safari bfcache)
    const handlePageShow = (e: PageTransitionEvent) => {
      // persisted = sayfa bfcache'ten geldi
      if (e.persisted) {
        startAutoScroll();
      }
    };

    // Page hide handler (iOS Safari bfcache)
    const handlePageHide = () => {
      stopAutoScroll();
    };

    // Start after delay
    const startTimer = setTimeout(() => {
      startAutoScroll();
    }, 300);

    // Event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    
    return () => {
      clearTimeout(startTimer);
      stopAutoScroll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [autoScroll, startAutoScroll, stopAutoScroll]);

  // Momentum animation for swipe
  const startMomentumScroll = useCallback(() => {
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }

    const animateMomentum = () => {
      if (!containerRef.current || Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        scheduleResume();
        return;
      }

      containerRef.current.scrollLeft -= velocity.current;
      velocity.current *= friction;

      momentumAnimationRef.current = requestAnimationFrame(animateMomentum);
    };

    momentumAnimationRef.current = requestAnimationFrame(animateMomentum);
  }, [friction, scheduleResume]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    isPaused.current = true;
    scrollDirection.current = null;
    
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }
    velocity.current = 0;
    
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startScrollLeft.current = containerRef.current.scrollLeft;
    lastX.current = e.touches[0].clientX;
    lastTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - startX.current);
    const deltaY = Math.abs(currentY - startY.current);
    
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
      velocity.current = (currentX - lastX.current) / timeDelta * 15;
    }
    
    containerRef.current.scrollLeft = startScrollLeft.current - (currentX - startX.current);
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (scrollDirection.current === "horizontal") {
      isDragging.current = false;
      
      if (Math.abs(velocity.current) > 1) {
        startMomentumScroll();
      } else {
        scheduleResume();
      }
    } else {
      scheduleResume();
    }
    
    scrollDirection.current = null;
  }, [startMomentumScroll, scheduleResume]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    isDragging.current = true;
    isPaused.current = true;
    
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }
    velocity.current = 0;
    
    startX.current = e.clientX;
    startScrollLeft.current = containerRef.current.scrollLeft;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    
    containerRef.current.style.cursor = "grabbing";
    containerRef.current.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTime.current;
    
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) / timeDelta * 15;
    }
    
    containerRef.current.scrollLeft = startScrollLeft.current - (currentX - startX.current);
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!containerRef.current) return;
    
    isDragging.current = false;
    containerRef.current.style.cursor = "grab";
    containerRef.current.style.userSelect = "";
    
    if (Math.abs(velocity.current) > 1) {
      startMomentumScroll();
    } else {
      scheduleResume();
    }
  }, [startMomentumScroll, scheduleResume]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      isPaused.current = true;
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current && containerRef.current) {
      isDragging.current = false;
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "";
    }
    isPaused.current = false;
  }, []);

  const handleWheel = useCallback(() => {
    isPaused.current = true;
    scheduleResume();
  }, [scheduleResume]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAutoScroll();
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [stopAutoScroll]);

  return {
    containerRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
      onWheel: handleWheel,
    },
  };
}
