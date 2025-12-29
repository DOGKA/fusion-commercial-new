"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface MomentumScrollOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number; // pixels per frame
  pauseOnHover?: boolean;
  friction?: number; // momentum friction (0-1, higher = less friction)
  pauseDuration?: number; // ms to pause after manual interaction
}

export function useMomentumScroll(options: MomentumScrollOptions = {}) {
  const {
    autoScroll = true,
    autoScrollSpeed = 0.5,
    pauseOnHover = true,
    friction = 0.92,
    pauseDuration = 3000,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const isManuallyScrolling = useRef(false);
  const animationRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const startScrollLeft = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumAnimationRef = useRef<number | null>(null);
  
  // Determine if horizontal or vertical scroll (set on touch start)
  const scrollDirection = useRef<"horizontal" | "vertical" | null>(null);
  const directionLockThreshold = 10; // pixels to determine direction

  // Visibility Observer - Only auto-scroll when visible
  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoScroll]);

  // Auto-scroll logic - improved for mobile
  useEffect(() => {
    if (!autoScroll) return;

    let lastAnimTime = 0;
    
    const animate = (currentTime: number) => {
      // Skip if paused, dragging, or not visible
      if (!containerRef.current || isPaused.current || isDragging.current || isManuallyScrolling.current || !isVisible) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Throttle to ~60fps
      if (currentTime - lastAnimTime < 16.67) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastAnimTime = currentTime;
      
      const container = containerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Only scroll if there's content to scroll
      if (maxScroll <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Seamless loop
      if (container.scrollLeft >= maxScroll - 1) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += autoScrollSpeed;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoScroll, autoScrollSpeed, isVisible]);

  // Schedule resume of auto-scroll
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isDragging.current) {
        isPaused.current = false;
        isManuallyScrolling.current = false;
      }
    }, pauseDuration);
  }, [pauseDuration]);

  // Momentum animation
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

  // Touch handlers - with direction detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    // Reset direction lock
    scrollDirection.current = null;
    
    // Cancel any ongoing momentum
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
    
    // Determine scroll direction if not yet determined
    if (scrollDirection.current === null) {
      if (deltaX > directionLockThreshold || deltaY > directionLockThreshold) {
        if (deltaX > deltaY) {
          // Horizontal scroll - we handle it
          scrollDirection.current = "horizontal";
          isDragging.current = true;
          isPaused.current = true;
          isManuallyScrolling.current = true;
        } else {
          // Vertical scroll - let browser handle it
          scrollDirection.current = "vertical";
          return;
        }
      } else {
        // Not enough movement yet
        return;
      }
    }
    
    // Only handle horizontal scrolling
    if (scrollDirection.current !== "horizontal") {
      return;
    }
    
    // Prevent vertical scroll while horizontal scrolling
    e.preventDefault();
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTime.current;
    
    // Calculate velocity for momentum
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) / timeDelta * 15;
    }
    
    const deltaScroll = currentX - startX.current;
    containerRef.current.scrollLeft = startScrollLeft.current - deltaScroll;
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Only process if we were horizontal scrolling
    if (scrollDirection.current === "horizontal") {
      isDragging.current = false;
      
      // Start momentum scroll if velocity is significant
      if (Math.abs(velocity.current) > 1) {
        startMomentumScroll();
      } else {
        scheduleResume();
      }
    }
    
    // Reset direction
    scrollDirection.current = null;
  }, [startMomentumScroll, scheduleResume]);

  // Mouse handlers (for desktop drag)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    isDragging.current = true;
    isPaused.current = true;
    isManuallyScrolling.current = true;
    
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
    const deltaX = currentX - startX.current;
    const timeDelta = currentTime - lastTime.current;
    
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) / timeDelta * 15;
    }
    
    containerRef.current.scrollLeft = startScrollLeft.current - deltaX;
    
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
    
    if (!isManuallyScrolling.current) {
      isPaused.current = false;
    } else {
      scheduleResume();
    }
  }, [scheduleResume]);

  // Handle wheel scroll - pause auto-scroll temporarily
  const handleWheel = useCallback(() => {
    isPaused.current = true;
    isManuallyScrolling.current = true;
    scheduleResume();
  }, [scheduleResume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

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
