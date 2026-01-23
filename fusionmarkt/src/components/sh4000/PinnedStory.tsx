'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface Scene {
  id: string;
  label: string;
  imageLabel: string;
  imageSrc: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  specs: { label: string; value: string }[];
}

const scenes: Scene[] = [
  {
    id: 'expansion',
    label: 'GENİŞLEME',
    imageLabel: 'B5120 Batarya Modülü',
    imageSrc: '/sh4000/b5120-800x800.webp',
    badge: 'MODÜLER GENİŞLEME',
    title: 'B5120',
    highlight: '20kWh',
    description: 'B5120 LiFePO4 batarya modülleri ile sisteminizi 20kWh+ kapasiteye genişletin. Modüler mimari, kolay kurulum.',
    specs: [
      { label: 'Modül', value: '5120Wh' },
      { label: 'Maksimum', value: '20kWh+' },
      { label: 'Bağlantı', value: 'Stack' },
    ],
  },
  {
    id: 'solar',
    label: 'GÜNEŞ',
    imageLabel: 'PV Panel Bağlantısı',
    imageSrc: '/sh4000/pv-800x800.webp',
    badge: 'ÇİFT MPPT GİRİŞ',
    title: '3600W',
    highlight: '%99.9',
    description: 'HV ve LV çift MPPT girişi ile hem çatı panellerinden hem taşınabilir panellerden maksimum verim.',
    specs: [
      { label: 'HV Giriş', value: '70-450V' },
      { label: 'LV Giriş', value: '12-50V' },
      { label: 'MPPT', value: '%99.9' },
    ],
  },
  {
    id: 'lcd',
    label: 'KONTROL',
    imageLabel: 'LCD Kontrol Ekranı',
    imageSrc: '/sh4000/lcd-800x800.webp',
    badge: 'AKILLI KONTROL',
    title: 'LCD',
    highlight: 'Wi-Fi',
    description: '97×48mm LCD ekran ve Wi-Fi bağlantısı ile gerçek zamanlı izleme. iOS ve Android uygulama desteği.',
    specs: [
      { label: 'Ekran', value: '97×48mm' },
      { label: 'Bağlantı', value: 'Wi-Fi' },
      { label: 'App', value: 'iOS/Android' },
    ],
  },
  {
    id: 'mobility',
    label: 'TAŞIMA',
    imageLabel: 'Dayanıklı Tekerlekler',
    imageSrc: '/sh4000/wheel-800x800.webp',
    badge: 'TAŞINABİLİRLİK',
    title: '65kg',
    highlight: 'Mobil',
    description: 'Dayanıklı tekerlekler ve teleskopik çekme kolu ile 65kg ağırlığa rağmen kolay taşınabilirlik.',
    specs: [
      { label: 'Ağırlık', value: '65kg' },
      { label: 'Tekerlek', value: 'Dayanıklı' },
      { label: 'Kol', value: 'Teleskopik' },
    ],
  },
];

export default function PinnedStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentScene = scenes[activeIndex];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'pinned-story',
        trigger: sectionRef.current,
        start: 'top 10%',
        end: `+=${scenes.length * 60}%`,
        pin: true,
        pinSpacing: true,
        scrub: 0.08,
        snap: {
          snapTo: 1 / (scenes.length - 1),
          duration: 0.05,
          ease: 'none',
        },
        fastScrollEnd: true,
        refreshPriority: -1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const nextIndex = Math.min(
            scenes.length - 1,
            Math.floor(self.progress * scenes.length)
          );
          setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background py-16 md:py-24"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}
    >
      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-row items-center gap-10 lg:gap-16">
            
            {/* SOL - Görsel */}
            <div className="flex-shrink-0" style={{ width: '40%' }}>
              <div className="aspect-square w-full max-w-[450px] bg-background-secondary rounded-2xl flex items-center justify-center border border-border/30 transition-all duration-500 relative p-8">
                <Image
                  src={currentScene.imageSrc}
                  alt={currentScene.imageLabel}
                  fill
                  sizes="(min-width: 1024px) 450px, (min-width: 768px) 40vw, 80vw"
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm font-medium text-foreground-muted">
                {currentScene.imageLabel}
              </p>
            </div>

            {/* SAĞ - İçerik + Dots */}
            <div className="flex-1 flex items-center gap-12">
              <div className="flex-1">
                <div className="mb-3">
                <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 rounded-[16px]">
                    {currentScene.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-7xl lg:text-8xl font-bold text-foreground leading-none tracking-tight">
                    {currentScene.title}
                  </span>
                  <span className="text-3xl font-semibold text-primary">
                    {currentScene.highlight}
                  </span>
                </div>
                <p className="text-lg text-foreground-secondary mb-5 max-w-md">
                  {currentScene.description}
                </p>
                <div className="flex gap-3">
                  {currentScene.specs.map((spec) => (
                    <div key={spec.label} className="glass-card-static px-4 py-2.5 rounded-xl">
                      <p className="text-[10px] text-foreground-muted uppercase tracking-wide">{spec.label}</p>
                      <p className="text-base font-semibold text-foreground">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dikey Dots */}
              <div className="flex flex-col items-end gap-6 flex-shrink-0">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => setActiveIndex(index)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <span className={`text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                      index === activeIndex ? 'text-primary opacity-100' : 'text-foreground-muted opacity-40 hover:opacity-70'
                    }`}>
                      {scene.label}
                    </span>
                    <div className={`rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'w-4 h-4 bg-primary shadow-lg shadow-primary/50' : 'w-2.5 h-2.5 bg-foreground-muted/40 hover:bg-foreground-muted/60'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="block md:hidden">
        <div className="px-5">
          {/* Görsel */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-full h-80 bg-background-secondary rounded-2xl flex items-center justify-center border border-border/30 p-6">
              <Image
                src={currentScene.imageSrc}
                alt={currentScene.imageLabel}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <span className="absolute top-3 left-3 inline-block px-3 py-1.5 text-[10px] font-semibold tracking-wider text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 rounded-[16px]">
                {currentScene.badge}
              </span>
            </div>
          </div>

          {/* İçerik + Dots */}
          <div className="flex items-start gap-4 w-full">
            {/* Sol - İçerik */}
            <div className="flex-1 min-w-0 pt-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground leading-none tracking-tight">
                  {currentScene.title}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {currentScene.highlight}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">
                {currentScene.description}
              </p>
              <div className="flex gap-2">
                {currentScene.specs.map((spec) => (
                  <div key={spec.label} className="glass-card-static px-3 py-1.5 rounded-lg">
                    <p className="text-[8px] text-foreground-muted uppercase tracking-wide">{spec.label}</p>
                    <p className="text-[12px] font-semibold text-foreground leading-tight">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ - Dots */}
            <div className="flex flex-col items-center gap-3 pt-2 w-12 shrink-0">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveIndex(index)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className={`text-[8px] font-bold tracking-wider uppercase transition-all duration-300 ${
                    index === activeIndex ? 'text-primary opacity-100' : 'text-foreground-muted opacity-40'
                  }`}>
                    {scene.label}
                  </span>
                  <div className={`rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-3 h-3 bg-primary' : 'w-2 h-2 bg-foreground-muted/40'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
