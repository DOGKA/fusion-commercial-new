"use client";

import { useRef, useEffect, useCallback } from "react";

interface MomentumScrollOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number; // pixels per frame
  pauseOnHover?: boolean;
  friction?: number; // momentum friction (0-1, higher = less friction)
}

export function useMomentumScroll(options: MomentumScrollOptions = {}) {
  const {
    autoScroll = true,
    autoScrollSpeed = 0.5,
    pauseOnHover = true,
    friction = 0.92, // Higher = smoother momentum
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const animationRef = useRef<number | null>(null);
  
  // Touch/Mouse tracking
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumAnimationRef = useRef<number | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (!autoScroll) return;

    let lastAnimTime = 0;
    
    const animate = (currentTime: number) => {
      if (!containerRef.current || isPaused.current || isDragging.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Throttle to ~60fps
      if (currentTime - lastAnimTime < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastAnimTime = currentTime;
      
      const container = containerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
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
  }, [autoScroll, autoScrollSpeed]);

  // Momentum animation
  const startMomentumScroll = useCallback(() => {
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }

    const animateMomentum = () => {
      if (!containerRef.current || Math.abs(velocity.current) < 0.1) {
        velocity.current = 0;
        return;
      }

      containerRef.current.scrollLeft -= velocity.current;
      velocity.current *= friction;

      momentumAnimationRef.current = requestAnimationFrame(animateMomentum);
    };

    momentumAnimationRef.current = requestAnimationFrame(animateMomentum);
  }, [friction]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    isDragging.current = true;
    isPaused.current = true;
    
    // Cancel any ongoing momentum
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }
    velocity.current = 0;
    
    startX.current = e.touches[0].clientX;
    startScrollLeft.current = containerRef.current.scrollLeft;
    lastX.current = e.touches[0].clientX;
    lastTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentTime = Date.now();
    const deltaX = currentX - startX.current;
    const timeDelta = currentTime - lastTime.current;
    
    // Calculate velocity for momentum
    if (timeDelta > 0) {
      velocity.current = (currentX - lastX.current) / timeDelta * 15; // Multiply for more momentum
    }
    
    containerRef.current.scrollLeft = startScrollLeft.current - deltaX;
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    
    // Start momentum scroll
    startMomentumScroll();
    
    // Resume auto-scroll after momentum ends + delay
    setTimeout(() => {
      if (!isDragging.current) {
        isPaused.current = false;
      }
    }, 2000);
  }, [startMomentumScroll]);

  // Mouse handlers (for desktop drag)
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
    
    startMomentumScroll();
    
    setTimeout(() => {
      if (!isDragging.current) {
        isPaused.current = false;
      }
    }, 2000);
  }, [startMomentumScroll]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      isPaused.current = true;
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    isPaused.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "";
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
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
    },
  };
}

