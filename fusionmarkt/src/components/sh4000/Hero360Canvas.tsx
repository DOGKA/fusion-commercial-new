'use client';

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import NextImage from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Hero360CanvasProps {
  frames: string[];
}

const TOTAL_FRAMES_FALLBACK = 12;

// Ürün özellikleri
const features = [
  { text: '5120Wh', subtext: 'KAPASİTE' },
  { text: '4000W', subtext: 'SÜREKLİ GÜÇ' },
  { text: '8000W', subtext: 'SURGE GÜÇ' },
  { text: '3600W', subtext: 'AC ŞARJ' },
  { text: '3000W', subtext: 'PV GİRİŞ' },
  { text: '10ms', subtext: 'UPS GEÇİŞ' },
];

export default function Hero360Canvas({ frames }: Hero360CanvasProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const posterSrc = frames[0] || '/sh4000/frame_01.webp';

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameBoundsRef = useRef<{ scale: number } | null>(null);
  const currentFrameRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  type QuickSetter = (value: gsap.TweenValue) => void;
  const mobileFeatureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const desktopFeatureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileXSettersRef = useRef<QuickSetter[]>([]);
  const mobileOpacitySettersRef = useRef<QuickSetter[]>([]);
  const desktopXSettersRef = useRef<QuickSetter[]>([]);
  const desktopOpacitySettersRef = useRef<QuickSetter[]>([]);

  // Frame çiz
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    const ctx = canvas?.getContext('2d');
    const images = imagesRef.current;

    if (!canvas || !ctx || !container || images.length === 0) return;

    const img = images[frameIndex];
    const firstImg = images[0];
    if (!img || !firstImg) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = width < 768;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const baseScale = isMobile ? 0.52 : 0.4;
    const maxHeightFactor = isMobile ? 0.5 : 0.55;

    if (!frameBoundsRef.current) {
      const maxWidth = width * baseScale;
      const maxHeight = height * maxHeightFactor;
      const scale = Math.min(maxWidth / firstImg.width, maxHeight / firstImg.height);
      frameBoundsRef.current = { scale };
    }

    const { scale } = frameBoundsRef.current;
    const finalWidth = img.width * scale;
    const finalHeight = img.height * scale;

    const offsetX = (width - finalWidth) / 2;
    const offsetY = isMobile 
      ? (height - finalHeight) / 2 + 40 
      : (height - finalHeight) / 2 - 20;

    ctx.drawImage(img, offsetX, offsetY, finalWidth, finalHeight);
  }, []);

  // Görselleri yükle
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const preloadImages = async () => {
      try {
        const [firstSrc, ...rest] = frames;
        if (!firstSrc) return;

        const firstImg = await loadImage(firstSrc);
        imagesRef.current[0] = firstImg;
        setFirstFrameLoaded(true);
        drawFrame(0);

        if (rest.length === 0) {
          setImagesLoaded(true);
          return;
        }

        const restImages = await Promise.all(rest.map((src) => loadImage(src)));
        imagesRef.current = [firstImg, ...restImages];
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    if (frames.length > 0) preloadImages();
  }, [frames, drawFrame]);

  const updateFeatureStyles = useCallback((progress: number) => {
    features.forEach((_, index) => {
      const featureStart = index / features.length;
      const featureEnd = (index + 1) / features.length;

      let relativeProgress = (progress - featureStart) / (featureEnd - featureStart);
      relativeProgress = Math.max(0, Math.min(1, relativeProgress));

      let translateX: number;
      let opacity: number;

      if (progress < featureStart) {
        translateX = 80;
        opacity = 0;
      } else if (progress >= featureStart && progress < featureEnd) {
        if (relativeProgress < 0.2) {
          translateX = 80 - (relativeProgress / 0.2) * 80;
          opacity = relativeProgress / 0.2;
        } else if (relativeProgress < 0.8) {
          translateX = 0;
          opacity = 1;
        } else {
          const exitProgress = (relativeProgress - 0.8) / 0.2;
          translateX = -exitProgress * 80;
          opacity = 1 - exitProgress;
        }
      } else {
        translateX = -80;
        opacity = 0;
      }

      const setMobileX = mobileXSettersRef.current[index];
      const setMobileOpacity = mobileOpacitySettersRef.current[index];
      if (setMobileX && setMobileOpacity) {
        setMobileX(translateX);
        setMobileOpacity(opacity);
      }

      // Desktop animasyonu - 2 scroll adımı / feature
      const setDesktopX = desktopXSettersRef.current[index];
      const setDesktopOpacity = desktopOpacitySettersRef.current[index];
      if (setDesktopX && setDesktopOpacity) {
        const RIGHT_POS = 4;   // vw - ürünün sağı (daha yakın)
        const LEFT_POS = -56;  // vw - ürünün solu (daha sola)
        const ENTRY_POS = 29;  // vw - sağdan belirme noktası
        const EXIT_POS = -86;  // vw - soldan çıkış noktası (daha sola)

        const numFeatures = features.length;
        const totalSteps = numFeatures * 2;
        const safeStep = Math.min(progress * totalSteps, totalSteps - 0.0001);
        const stepIndex = Math.floor(safeStep);
        const stepProgress = safeStep - stepIndex;

        let desktopTranslate = EXIT_POS;
        let desktopOpacity = 0;

        if (stepIndex === 0) {
          if (index === 0) {
            desktopTranslate = RIGHT_POS;
            desktopOpacity = 1;
          }
        } else if (stepIndex % 2 === 1) {
          const currentIndex = (stepIndex - 1) / 2;
          const nextIndex = currentIndex + 1;
          const prevIndex = currentIndex - 1;

          if (index === currentIndex) {
            desktopTranslate =
              RIGHT_POS - stepProgress * (RIGHT_POS - LEFT_POS);
            desktopOpacity = 1;
          } else if (index === nextIndex) {
            desktopTranslate = ENTRY_POS;
            desktopOpacity = 1;
          } else if (index === prevIndex) {
            desktopTranslate = LEFT_POS - stepProgress * (LEFT_POS - EXIT_POS);
            desktopOpacity = 1 - stepProgress;
          }
        } else {
          const leftIndex = stepIndex / 2 - 1;
          const rightIndex = leftIndex + 1;

          if (index === leftIndex) {
            desktopTranslate = LEFT_POS;
            desktopOpacity = 1;
          } else if (index === rightIndex) {
            desktopTranslate =
              ENTRY_POS - stepProgress * (ENTRY_POS - RIGHT_POS);
            desktopOpacity = 1;
          }
        }

        setDesktopX(`${desktopTranslate}vw`);
        setDesktopOpacity(desktopOpacity);
      }
    });
  }, []);

  const applyProgress = useCallback(() => {
    const progress = progressRef.current;
    updateFeatureStyles(progress);

    const totalFrames = frames.length || TOTAL_FRAMES_FALLBACK;
    const rawIndex = Math.floor(progress * totalFrames);
    const frameIndex = rawIndex >= totalFrames ? totalFrames - 1 : rawIndex;
    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    }
  }, [drawFrame, frames.length, updateFeatureStyles]);

  const scheduleUpdate = useCallback((progress: number) => {
    progressRef.current = progress;
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      applyProgress();
    });
  }, [applyProgress]);

  const resetToStart = useCallback(() => {
    currentFrameRef.current = 0;
    progressRef.current = 0;
    updateFeatureStyles(0);
    drawFrame(0);
  }, [drawFrame, updateFeatureStyles]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      frameBoundsRef.current = null;
      if (firstFrameLoaded) drawFrame(currentFrameRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [firstFrameLoaded, drawFrame]);

  useEffect(() => {
    if (!sectionRef.current || !imagesLoaded) return;

    let ctx: gsap.Context | null = null;
    let rafId: number | null = null;

    const startAnimation = () => {
      if (!sectionRef.current) return;
      ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          id: 'hero-pin',
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=120%`,
          pin: true,
          pinSpacing: true,
          pinType: 'transform',
          scrub: 0.6,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            frameBoundsRef.current = null;
          },
          onRefresh: () => {
            frameBoundsRef.current = null;
            drawFrame(currentFrameRef.current);
          },
          onUpdate: (self) => {
            scheduleUpdate(self.progress);
          },
          onLeave: () => {
            resetToStart();
          },
          onLeaveBack: () => {
            resetToStart();
          },
        });

        trigger.refresh();
        window.requestAnimationFrame(() => {
          frameBoundsRef.current = null;
          drawFrame(currentFrameRef.current);
          setCanvasReady(true);
        });
      }, sectionRef);
    };

    rafId = window.requestAnimationFrame(startAnimation);

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, [imagesLoaded, scheduleUpdate, resetToStart]);

  useLayoutEffect(() => {
    if (!firstFrameLoaded) return;

    const noopSetter: QuickSetter = () => {};
    const toSetter = (el: HTMLDivElement | null, prop: string): QuickSetter =>
      el ? (gsap.quickSetter(el, prop) as QuickSetter) : noopSetter;

    mobileXSettersRef.current = mobileFeatureRefs.current.map((el) =>
      toSetter(el, 'xPercent')
    );
    mobileOpacitySettersRef.current = mobileFeatureRefs.current.map((el) =>
      toSetter(el, 'opacity')
    );
    desktopXSettersRef.current = desktopFeatureRefs.current.map((el) =>
      toSetter(el, 'x')
    );
    desktopOpacitySettersRef.current = desktopFeatureRefs.current.map((el) =>
      toSetter(el, 'opacity')
    );

    if (mobileFeatureRefs.current.length > 0) {
      gsap.set(mobileFeatureRefs.current, { xPercent: 80, opacity: 0 });
    }
    scheduleUpdate(0);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [firstFrameLoaded, scheduleUpdate]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full bg-background overflow-hidden"
    >
      {/* Feature texts - Mobile */}
      {features.map((feature, index) => (
        <div
          key={`mobile-${index}`}
          ref={(el) => {
            mobileFeatureRefs.current[index] = el;
          }}
          className="absolute inset-0 md:hidden pointer-events-none z-20 opacity-0"
        >
          <div className="absolute top-[24%] left-1/2 -translate-x-1/2 text-center">
            <p className="text-[20vw] font-black text-foreground leading-none tracking-tighter select-none whitespace-nowrap">
              {feature.text}
            </p>
          </div>
          <div className="absolute top-[74%] left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs font-semibold text-foreground tracking-[0.25em] uppercase">
              {feature.subtext}
            </p>
          </div>
        </div>
      ))}

      {/* Feature texts - Desktop */}
      {features.map((feature, index) => (
        <div
          key={`desktop-${index}`}
          ref={(el) => {
            desktopFeatureRefs.current[index] = el;
          }}
          className={`absolute inset-0 hidden md:flex items-center justify-end pointer-events-none z-0 ${
            index === 0 ? 'translate-x-[4vw] opacity-100' : 'translate-x-[25vw] opacity-0'
          }`}
        >
          <div className="text-left mr-16 lg:mr-24">
            <p className="text-[9vw] lg:text-[7vw] font-black text-foreground/[0.08] leading-none tracking-tighter select-none whitespace-nowrap">
              {feature.text}
            </p>
            <p className="text-lg lg:text-xl font-semibold text-foreground/[0.15] tracking-[0.2em] uppercase">
              {feature.subtext}
            </p>
          </div>
        </div>
      ))}

      {/* Canvas */}
      <div ref={canvasContainerRef} className="absolute inset-0 flex items-center justify-center z-10">
        {/* Poster - Mobile (canvas ölçeğine uygun boyut) */}
        <div
          className={`absolute md:hidden w-[52%] h-[50%] flex items-center justify-center translate-y-10 transition-opacity duration-300 ${
            firstFrameLoaded ? "opacity-0" : "opacity-100"
          }`}
        >
          <NextImage
            src={posterSrc}
            alt="IEETek SH4000"
            priority
            fetchPriority="high"
            fill
            sizes="(max-width: 768px) 52vw"
            className="object-contain pointer-events-none"
          />
        </div>
        {/* Desktop poster kaldırıldı - canvas direkt gösteriliyor */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Top badge */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <span className="glass-badge glass-badge-accent text-xs font-semibold tracking-wider">
          INITIAL ENTROPY ENERGY
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 text-center z-20 pt-6 md:pt-0">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">SH4000</h1>
        <p className="text-foreground-secondary mb-8">All-in-one Hibrit Enerji Depolama</p>
        <div className="w-6 h-10 mx-auto rounded-full border border-foreground-muted/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-foreground-muted/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
