"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// LERP (Linear Interpolation) - Profesyonel smooth animasyon
// Apple, Stripe, Vercel gibi sitelerde kullanılır
// ═══════════════════════════════════════════════════════════════════════════
function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

interface MomentumScrollOptions {
  autoScroll?: boolean;
  autoScrollSpeed?: number; // px/saniye (ör: 50 = saniyede 50px)
  smoothness?: number; // Lerp faktörü (0.05-0.15 arası, düşük = daha yumuşak)
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
    autoScrollSpeed = 40, // px/saniye - otomatik scroll (yavaş & akıcı)
    smoothness = 0.06, // Lerp faktörü - düşük = daha yumuşak
    pauseOnHover = true,
    friction = 0.92,
    pauseDuration = 2000,
    debug = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoScrollRafRef = useRef<number | null>(null); // requestAnimationFrame ref
  const isRunning = useRef(false);
  const retryCount = useRef(0);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LERP SCROLL - Profesyonel smooth animasyon (Apple-quality)
  // targetScroll: Hedef pozisyon (dt ile artırılır)
  // currentScroll: Mevcut görüntülenen pozisyon (lerp ile hedefe yaklaşır)
  // ═══════════════════════════════════════════════════════════════════════════
  const targetScrollRef = useRef(0);   // Hedef scroll pozisyonu
  const currentScrollRef = useRef(0);  // Mevcut (lerp ile yumuşatılmış) pozisyon
  const lastTickRef = useRef(0);       // Son tick zamanı (performance.now)
  
  // GPU Hızlandırma ref'i
  const gpuHintApplied = useRef(false);
  
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
  
  // Ref'leri useEffect içinde güncelle (React 19 kuralı)
  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

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
    // requestAnimationFrame iptal et
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    // Eski interval varsa temizle (fallback)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // autoScrollSpeed'i de ref'te sakla (px/saniye)
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  
  // Ref'i useEffect içinde güncelle (React 19 kuralı)
  useEffect(() => {
    autoScrollSpeedRef.current = autoScrollSpeed;
  }, [autoScrollSpeed]);

  // Smoothness ref
  const smoothnessRef = useRef(smoothness);
  useEffect(() => {
    smoothnessRef.current = smoothness;
  }, [smoothness]);

  // ═══════════════════════════════════════════════════════════════════════════
  // GPU HİNT UYGULA - Container mount olunca
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const c = containerRef.current;
    if (c && !gpuHintApplied.current) {
      // GPU hızlandırma için CSS hint'ler
      c.style.willChange = "scroll-position";
      c.style.transform = "translateZ(0)"; // GPU layer oluştur
      c.style.backfaceVisibility = "hidden";
      gpuHintApplied.current = true;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // START AUTO-SCROLL - LERP ile profesyonel smooth scroll (Apple-quality)
  // ═══════════════════════════════════════════════════════════════════════════
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
    
    isRunning.current = true;
    isPaused.current = false;
    
    // Lerp scroll başlat - mevcut pozisyondan başla
    const initialScroll = container.scrollLeft;
    targetScrollRef.current = initialScroll;
    currentScrollRef.current = initialScroll;
    lastTickRef.current = performance.now();
    
    // ═══════════════════════════════════════════════════════════════════════
    // LERP ANIMATION LOOP - Profesyonel smooth scroll
    // 1. Target pozisyonu dt ile artır (hedef)
    // 2. Current pozisyonu lerp ile target'a yaklaştır (yumuşak geçiş)
    // 3. scrollLeft'e current'ı yaz
    // ═══════════════════════════════════════════════════════════════════════
    const tick = () => {
      if (!isRunning.current) return;
      
      const c = containerRef.current;
      
      if (!c) {
        autoScrollRafRef.current = requestAnimationFrame(tick);
        return;
      }
      
      // Pause veya drag durumunda: current'ı actual scroll'a senkronize et
      if (isPaused.current || isDragging.current) {
        currentScrollRef.current = c.scrollLeft;
        targetScrollRef.current = c.scrollLeft;
        lastTickRef.current = performance.now();
        autoScrollRafRef.current = requestAnimationFrame(tick);
        return;
      }
      
      const maxScroll = c.scrollWidth - c.clientWidth;
      if (maxScroll <= 0) {
        autoScrollRafRef.current = requestAnimationFrame(tick);
        return;
      }
      
      // DT hesapla - frame-rate bağımsız
      const now = performance.now();
      const dt = (now - lastTickRef.current) / 1000; // saniye cinsinden
      lastTickRef.current = now;
      
      // 1️⃣ TARGET güncelle (hedef pozisyon - dt ile linear artış)
      targetScrollRef.current += autoScrollSpeedRef.current * dt;
      
      // Loop - başa dön
      if (targetScrollRef.current >= maxScroll) {
        targetScrollRef.current = 0;
        currentScrollRef.current = 0; // Reset için current'ı da sıfırla
      }
      
      // 2️⃣ CURRENT güncelle - LERP ile yumuşak geçiş
      currentScrollRef.current = lerp(
        currentScrollRef.current,
        targetScrollRef.current,
        smoothnessRef.current
      );
      
      // 3️⃣ scrollLeft'e yaz - Math.round ile integer (iOS Safari fix)
      const nextScrollLeft = Math.round(currentScrollRef.current);
      
      // Sadece değiştiyse set et (gereksiz DOM güncellemelerini önle)
      if (c.scrollLeft !== nextScrollLeft) {
        c.scrollLeft = nextScrollLeft;
      }
      
      // Debug (ilk birkaç frame)
      if (debug && retryCount.current < 5) {
        debugTick();
      }
      
      // Sonraki frame
      autoScrollRafRef.current = requestAnimationFrame(tick);
    };
    
    // İlk frame'i başlat
    autoScrollRafRef.current = requestAnimationFrame(tick);
    
    return true; // Başarıyla başladı
  }, [debug, debugTick]); // autoScroll, autoScrollSpeed, smoothness artık ref'ten okunuyor

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
        // Lerp ref'leri senkronize et (auto-scroll kaldığı yerden devam etsin)
        if (containerRef.current) {
          const pos = containerRef.current.scrollLeft;
          currentScrollRef.current = pos;
          targetScrollRef.current = pos;
        }
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
      velocity.current = (currentX - lastX.current) / timeDelta * 25; // El ile sürüklemede daha hızlı momentum
    }
    
    containerRef.current.scrollLeft = startScrollLeft.current - (currentX - startX.current);
    
    lastX.current = currentX;
    lastTime.current = currentTime;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (scrollDirection.current === "horizontal") {
      isDragging.current = false;
      
      // Lerp ref'leri senkronize et (auto-scroll kaldığı yerden devam etsin)
      if (containerRef.current) {
        const pos = containerRef.current.scrollLeft;
        currentScrollRef.current = pos;
        targetScrollRef.current = pos;
      }
      
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
      velocity.current = (currentX - lastX.current) / timeDelta * 25; // El ile sürüklemede daha hızlı momentum
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
    
    // Lerp ref'leri senkronize et (auto-scroll kaldığı yerden devam etsin)
    const pos = containerRef.current.scrollLeft;
    currentScrollRef.current = pos;
    targetScrollRef.current = pos;
    
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
