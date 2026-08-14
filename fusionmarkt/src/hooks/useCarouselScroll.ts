"use client";

import { useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CAROUSEL SCROLL - Tek yol: native yatay kaydırma
//
// Kaydırmayı tarayıcının kendi scroll konteyneri yapıyor (overflow-x: auto).
// Bu sayede bedavaya geliyor:
//   • trackpad'de iki parmakla yana kaydırma, Shift + fare tekerleği
//   • konteyner odaklandığında klavye ok tuşları
//   • ekran okuyucular için kaydırılabilir bölge semantiği
//   • compositor thread'inde çalışan, main-thread JS'e takılmayan akış
//     (eskiden her karede transform yazılıyordu; iOS Safari'de kartların
//      yarım boyanmasının kaynağı buydu)
//
// JS'in üstlendiği tek iş, masaüstünde fareyle sürükleyerek kaydırma ve
// bırakınca devam eden momentum. Dokunmatik/kalem girdisi hiç ellenmiyor.
// ═══════════════════════════════════════════════════════════════════════════

interface CarouselScrollOptions {
  friction?: number; // Momentum sürtünmesi (0-1, küçük değer = daha çabuk durur)
}

// Sürükleme sayılması için gereken en küçük hareket. Altında kalan hareketler
// tıklama kabul edilir, üstündekiler kartın linkini tetiklemez.
const DRAG_CLICK_THRESHOLD = 5;

export function useCarouselScroll(options: CarouselScrollOptions = {}) {
  const { friction = 0.88 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const momentumRaf = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragDistance = useRef(0);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  const stopMomentum = useCallback(() => {
    if (momentumRaf.current != null) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
  }, []);

  const startMomentum = useCallback(() => {
    stopMomentum();
    const container = containerRef.current;
    if (!container) return;

    let lastT = performance.now();

    const tick = (now: number) => {
      if (isDragging.current) {
        momentumRaf.current = null;
        return;
      }

      const dt = Math.min(32, now - lastT) || 16;
      lastT = now;
      const frameScale = dt / 16;

      if (Math.abs(velocity.current) < 0.3) {
        velocity.current = 0;
        momentumRaf.current = null;
        return;
      }

      const before = container.scrollLeft;
      container.scrollLeft = before - velocity.current * frameScale;

      // Uca dayandık: tarayıcı scrollLeft'i kırptı, momentumu sürdürmenin
      // anlamı yok.
      if (container.scrollLeft === before) {
        velocity.current = 0;
        momentumRaf.current = null;
        return;
      }

      velocity.current *= Math.pow(friction, frameScale);
      momentumRaf.current = requestAnimationFrame(tick);
    };

    momentumRaf.current = requestAnimationFrame(tick);
  }, [friction, stopMomentum]);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    container.classList.add("carousel-native-scroll");

    const handlePointerDown = (e: PointerEvent) => {
      // Dokunmatik ve kalem native kaydırmaya bırakılıyor; yalnızca farede
      // sürükleme taklit ediliyor.
      if (e.pointerType !== "mouse" || e.button !== 0) return;

      stopMomentum();
      isDragging.current = true;
      dragDistance.current = 0;
      startX.current = e.clientX;
      startScrollLeft.current = container.scrollLeft;
      lastX.current = e.clientX;
      lastTime.current = performance.now();
      velocity.current = 0;
      wrapper.classList.add("carousel-dragging");
      wrapper.style.cursor = "grabbing";
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - startX.current;
      dragDistance.current = Math.max(dragDistance.current, Math.abs(deltaX));
      container.scrollLeft = startScrollLeft.current - deltaX;

      const now = performance.now();
      const timeDelta = now - lastTime.current;
      if (timeDelta > 0) {
        const newVelocity = ((e.clientX - lastX.current) / timeDelta) * 16;
        velocity.current = velocity.current * 0.7 + newVelocity * 0.3;
      }
      lastX.current = e.clientX;
      lastTime.current = now;
      e.preventDefault();
    };

    const handlePointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      wrapper.classList.remove("carousel-dragging");
      wrapper.style.cursor = "grab";
      if (Math.abs(velocity.current) > 0.3) startMomentum();
    };

    // Sürükleme bir kartın üzerinde bittiğinde tarayıcı ayrıca tıklama üretip
    // ürün sayfasına gidiyordu. Kayda değer hareket olduysa tıklamayı yutuyoruz.
    const handleClickCapture = (e: MouseEvent) => {
      if (dragDistance.current > DRAG_CLICK_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
      }
      dragDistance.current = 0;
    };

    // Fare carousel dışına çıksa da sürükleme sürsün diye move/up window'da.
    wrapper.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    wrapper.addEventListener("click", handleClickCapture, true);

    return () => {
      container.classList.remove("carousel-native-scroll");
      wrapper.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      wrapper.removeEventListener("click", handleClickCapture, true);
      stopMomentum();
    };
  }, [startMomentum, stopMomentum]);

  // Ok butonları. Çağıranlar pozitif değeri "önceki" olarak gönderiyor;
  // scrollLeft ters yönde arttığı için işareti çeviriyoruz.
  const scrollBy = useCallback(
    (amount: number, smooth = true) => {
      stopMomentum();
      containerRef.current?.scrollBy({
        left: -amount,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [stopMomentum]
  );

  const containerStyle = {
    position: "relative" as const,
    overflowX: "auto" as const,
    overflowY: "hidden" as const,
    scrollbarWidth: "none" as const,
  };

  const wrapperStyle = {
    display: "flex",
    gap: "16px",
    width: "max-content" as const,
    cursor: "grab",
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
