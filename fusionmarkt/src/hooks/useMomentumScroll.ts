"use client";

import { useRef, useEffect, useCallback } from "react";

interface MomentumScrollOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  pauseOnHover?: boolean;
  friction?: number;
  pauseDuration?: number;
  debug?: boolean; // HUD debug modu
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG HUD - Mobilde gerçek sorunu görmek için
// ═══════════════════════════════════════════════════════════════════════════
function ensureHud(): HTMLPreElement | null {
  if (typeof document === "undefined") return null;
  
  let el = document.getElementById("__as_hud__") as HTMLPreElement | null;
  if (!el) {
    el = document.createElement("pre");
    el.id = "__as_hud__";
    el.style.cssText =
      "position:fixed;bottom:8px;left:8px;z-index:999999;" +
      "max-width:92vw;max-height:40vh;overflow:auto;" +
      "background:rgba(0,0,0,.85);color:#0f0;padding:10px;" +
      "font:11px/1.3 monospace;border-radius:8px;pointer-events:none;" +
      "border:1px solid #0f0;";
    document.body.appendChild(el);
  }
  return el;
}

function writeHud(text: string) {
  const el = ensureHud();
  if (el) el.textContent = text;
}

function removeHud() {
  const el = document.getElementById("__as_hud__");
  if (el) el.remove();
}

export function useMomentumScroll(options: MomentumScrollOptions = {}) {
  const {
    autoScroll = true,
    autoScrollSpeed = 0.5,
    pauseOnHover = true,
    friction = 0.92,
    pauseDuration = 2000,
    debug = true, // Geçici olarak true - sorunu bulduktan sonra false yap
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = useRef(false);
  const retryCount = useRef(0);
  
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

  // autoScroll değerini ref'te sakla (closure sorunu için)
  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBUG TICK - Her frame'de durumu göster
  // ═══════════════════════════════════════════════════════════════════════════
  const debugTick = useCallback(() => {
    if (!debug) return;
    
    const c = containerRef.current;
    if (!c) {
      writeHud("containerRef: NULL ❌");
      return;
    }

    const cs = getComputedStyle(c);
    const canScroll = c.scrollWidth > c.clientWidth + 1;

    // scrollLeft yazınca gerçekten değişiyor mu? (kritik test)
    const before = c.scrollLeft;
    c.scrollLeft = before + 1;
    const after = c.scrollLeft;
    c.scrollLeft = before; // geri al

    const snapType = (cs as CSSStyleDeclaration & { scrollSnapType?: string }).scrollSnapType || "none";
    const writeWorks = after !== before;

    writeHud([
      `══ AUTO-SCROLL DEBUG ══`,
      `TAG: ${c.tagName} class="${(c.className || "").toString().slice(0, 30)}..."`,
      ``,
      `autoScroll: ${autoScrollRef.current} ${autoScrollRef.current ? "✅" : "❌ DISABLED!"}`,
      `overflowX: ${cs.overflowX}`,
      `scrollSnapType: ${snapType} ${snapType.includes("mandatory") ? "⚠️ SNAP!" : "✅"}`,
      ``,
      `scrollWidth: ${c.scrollWidth}`,
      `clientWidth: ${c.clientWidth}`,
      `canScroll: ${canScroll} ${canScroll ? "✅" : "❌ NO SCROLL AREA"}`,
      ``,
      `writeWorks: ${writeWorks} ${writeWorks ? "✅" : "❌ SCROLL BLOCKED!"}`,
      `scrollLeft: ${Math.round(c.scrollLeft)}`,
      ``,
      `isRunning: ${isRunning.current}`,
      `isPaused: ${isPaused.current}`,
      `isDragging: ${isDragging.current}`,
      `retryCount: ${retryCount.current}`,
    ].join("\n"));
  }, [debug]);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    isRunning.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // autoScrollSpeed'i de ref'te sakla
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  autoScrollSpeedRef.current = autoScrollSpeed;

  // Start auto-scroll - SADECE scrollable ise başla
  const startAutoScroll = useCallback(() => {
    // Zaten çalışıyorsa tekrar başlatma
    if (isRunning.current) return false;
    
    // autoScroll ref'ten oku (closure sorunu için)
    if (!autoScrollRef.current) return false;
    
    const container = containerRef.current;
    if (!container) return false;
    
    // ✅ KRİTİK: Kayacak alan yoksa başlama
    const canScroll = container.scrollWidth > container.clientWidth + 1;
    if (!canScroll) return false;
    
    // Önceki interval'i temizle
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    isRunning.current = true;
    isPaused.current = false;
    
    intervalRef.current = setInterval(() => {
      const c = containerRef.current;
      
      if (!c || isPaused.current || isDragging.current) {
        return;
      }
      
      const maxScroll = c.scrollWidth - c.clientWidth;
      if (maxScroll <= 0) return;
      
      if (c.scrollLeft >= maxScroll - 1) {
        c.scrollLeft = 0;
      } else {
        c.scrollLeft += autoScrollSpeedRef.current;
      }
      
      // Debug her tick'te güncelle
      if (debug && retryCount.current < 5) {
        debugTick();
      }
    }, 16);
    
    return true; // Başarıyla başladı
  }, [debug, debugTick]); // autoScroll ve autoScrollSpeed artık ref'ten okunuyor

  // Schedule resume after user interaction
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isDragging.current) {
        isPaused.current = false;
        // Yeniden başlat
        if (!isRunning.current) {
          startAutoScroll();
        }
      }
    }, pauseDuration);
  }, [pauseDuration, startAutoScroll]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN EFFECT - Scrollable olana kadar retry + visibility handlers
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!autoScroll) return;

    // Visibility change handler (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        // Tab aktif olunca yeniden dene
        retryCount.current = 0;
        startAutoScroll();
      }
    };

    // Page show handler (iOS Safari bfcache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        retryCount.current = 0;
        startAutoScroll();
      }
    };

    // Page hide handler
    const handlePageHide = () => {
      stopAutoScroll();
    };

    // ═══════════════════════════════════════════════════════════════════════
    // RETRY LOOP: Scrollable olana kadar dene (async ürün yükleme için)
    // ═══════════════════════════════════════════════════════════════════════
    retryCount.current = 0;
    
    const tryStart = () => {
      retryCount.current++;
      
      // Debug ilk birkaç denemede göster
      if (debug && retryCount.current <= 10) {
        debugTick();
      }
      
      const started = startAutoScroll();
      
      // Başladıysa veya 50 deneme olduysa (~10 saniye) dur
      if (started || retryCount.current > 50) {
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
        
        if (debug) {
          // 5 saniye sonra HUD'u kaldır (sorun yoksa)
          if (started) {
            setTimeout(() => {
              if (isRunning.current) {
                removeHud();
              }
            }, 5000);
          }
        }
      }
    };
    
    // Hemen dene
    tryStart();
    
    // 200ms'de bir dene (ürünler gelene kadar)
    retryIntervalRef.current = setInterval(tryStart, 200);

    // Event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      stopAutoScroll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      if (debug) removeHud();
    };
  }, [autoScroll, startAutoScroll, stopAutoScroll, debug, debugTick]);

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
