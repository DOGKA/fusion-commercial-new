'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface UseCase {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  shadowColor: string;
}

const useCases: UseCase[] = [
  {
    id: 'home',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Ev Kullanımı',
    subtitle: 'Akıllı Enerji Yönetimi',
    description: 'Güneş enerjinizi depolayın, gece kullanın.',
    features: ['Kesintisiz güç', 'Fatura tasarrufu', 'Akıllı optimizasyon'],
    gradient: 'from-blue-500 to-cyan-500',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 'business',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'İşletme & Ofis',
    subtitle: 'Kesintisiz İş Sürekliliği',
    description: 'Kritik sistemlerinizi her zaman koruyun.',
    features: ['Anında geçiş', 'Veri koruma', 'Maliyet düşürme'],
    gradient: 'from-purple-500 to-pink-500',
    shadowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    id: 'factory',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 21V11l-5 4V21h5zm0 0h8m0 0V7l-4 3-4-3v14m8 0h5V11l-5-4v14z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Üretimhane',
    subtitle: 'Üretim Sürekliliği',
    description: 'Üretim hattınızı durmadan çalıştırın.',
    features: ['Yüksek surge', 'Ağır ekipman', 'Modüler kapasite'],
    gradient: 'from-orange-500 to-red-500',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
  },
  {
    id: 'yacht',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17h18M5 17l2-9 5 2 4-5 3 12M7 21h10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Yat & Tekne',
    subtitle: 'Denizde Özgürlük',
    description: 'Açık denizde tam enerji özgürlüğü.',
    features: ['Su dayanıklı', 'Kompakt', 'Solar uyumlu'],
    gradient: 'from-teal-500 to-blue-500',
    shadowColor: 'rgba(20, 184, 166, 0.3)',
  },
  {
    id: 'cabin',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21l9-18 9 18H3z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12v5m-2 0h4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Bağ Evi & Yazlık',
    subtitle: 'Mevsimlik Konfor',
    description: 'Şehirden uzakta, konfordan ödün vermeyin.',
    features: ['Kolay taşıma', 'Hızlı kurulum', 'Düşük bakım'],
    gradient: 'from-green-500 to-emerald-500',
    shadowColor: 'rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'offgrid',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 20l5.5-8.5L12 17l4-6 5 9H3z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="17" cy="6" r="2"/>
      </svg>
    ),
    title: 'Off-Grid Yaşam',
    subtitle: 'Tam Bağımsızlık',
    description: 'Şebekeden tamamen bağımsız yaşayın.',
    features: ['Genişleyebilir', 'Uzun ömür', 'Otonom'],
    gradient: 'from-amber-500 to-yellow-500',
    shadowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'construction',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 6l-3.5 7H9a2 2 0 00-2 2v0a2 2 0 002 2h.5l.5 3h4l.5-3h.5a2 2 0 002-2v0a2 2 0 00-2-2h-1.5L14 6z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Şantiye',
    subtitle: 'Portatif Güç Merkezi',
    description: 'Jeneratöre veda edin, sessiz enerji.',
    features: ['Tekerlekli', 'Sıfır emisyon', 'Sessiz'],
    gradient: 'from-slate-500 to-zinc-500',
    shadowColor: 'rgba(100, 116, 139, 0.3)',
  },
  {
    id: 'event',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8v8m-3-4h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Etkinlik & Festival',
    subtitle: 'Geçici Güç Çözümü',
    description: 'Açık hava etkinlikleri için ideal.',
    features: ['Sessiz', 'Hızlı şarj', 'Çoklu çıkış'],
    gradient: 'from-rose-500 to-pink-500',
    shadowColor: 'rgba(244, 63, 94, 0.3)',
  },
];

export default function UseCases() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0); // "Ev Kullanımı" ile başla
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const activeIndexRef = useRef(0);
  const loopRef = useRef<gsap.core.Tween | null>(null);

  // IntersectionObserver ile görünürlük kontrolü
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Loop pause/play kontrolü
  useEffect(() => {
    if (!loopRef.current) return;
    if (isInView) {
      loopRef.current.play();
    } else {
      loopRef.current.pause();
    }
  }, [isInView]);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Basit görünürlük animasyonu
      gsap.to(sectionRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => setIsVisible(true),
      });

      const container = containerRef.current;
      if (!container) return;

      const cardWidth = 280;
      const gap = 24;
      const singleSetWidth = (cardWidth + gap) * useCases.length;
      const wrapX = gsap.utils.wrap(-singleSetWidth, 0);

      loopRef.current = gsap.to(container, {
        x: -singleSetWidth,
        duration: 24,
        ease: 'none',
        repeat: -1,
        paused: true, // Başlangıçta durdur, isInView ile kontrol et
        modifiers: {
          x: (x) => `${wrapX(parseFloat(x))}px`,
        },
        onUpdate: () => {
          const currentX = Math.abs(gsap.getProperty(container, 'x') as number);
          const newIndex = Math.round(currentX / (cardWidth + gap)) % useCases.length;
          if (newIndex !== activeIndexRef.current) {
            activeIndexRef.current = newIndex;
            setActiveIndex(newIndex);
          }
        },
      });
    }, sectionRef);

    return () => {
      loopRef.current?.kill();
      ctx.revert();
    };
  }, []);


  return (
    <section ref={sectionRef} className="bg-background overflow-hidden py-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
      {/* Header */}
      <div className={`text-center mb-6 px-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-primary border border-primary/30 bg-primary/10 mb-3">
          Kullanım Alanları
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Her İhtiyaca <span className="text-primary">Uygun</span>
        </h2>
      </div>

      {/* Horizontal Cards - Daha geniş container */}
      <div className="relative overflow-hidden py-6">
        <div 
          ref={containerRef}
          className="flex gap-6 px-[calc(50vw-140px)]"
          style={{ willChange: 'transform' }}
        >
          {[...useCases, ...useCases].map((uc, i) => {
            const normalizedIndex = i % useCases.length;
            const isActive = normalizedIndex === activeIndex;
            const distance = Math.abs(normalizedIndex - activeIndex);
            
            return (
              <div
                key={`${uc.id}-${i}`}
                className={`use-case-card flex-shrink-0 w-[280px] transition-all duration-500 ease-out ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${i * 40}ms`,
                  transform: isActive ? 'scale(1.05)' : `scale(${1 - distance * 0.03})`,
                  zIndex: isActive ? 10 : 5 - distance,
                }}
              >
                {/* Glassmorphism Card - border yok, çizgi yok */}
                <div 
                  className={`relative h-full p-5 rounded-2xl backdrop-blur-md transition-all duration-500 ${
                    isActive 
                      ? 'bg-background-secondary/90' 
                      : 'bg-background-secondary/60'
                  }`}
                  style={{
                    opacity: Math.max(0.4, 1 - distance * 0.2),
                    boxShadow: isActive ? `0 8px 32px ${uc.shadowColor}` : 'none',
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
                        isActive 
                          ? `bg-gradient-to-r ${uc.gradient} text-white` 
                          : 'bg-foreground/5 text-foreground-muted'
                      }`}
                      style={{
                        boxShadow: isActive ? `0 4px 20px ${uc.shadowColor}` : 'none',
                      }}
                    >
                      {uc.icon}
                    </div>

                    {/* Subtitle */}
                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-500 ${
                      isActive ? 'text-primary' : 'text-foreground-muted/60'
                    }`}>
                      {uc.subtitle}
                    </p>

                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-500 ${
                      isActive ? 'text-foreground' : 'text-foreground/80'
                    }`}>
                      {uc.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm mb-3 transition-colors duration-500 ${
                      isActive ? 'text-foreground-secondary' : 'text-foreground-muted/50'
                    }`}>
                      {uc.description}
                    </p>

                    {/* Features - sadece aktif olunca görünür */}
                    <ul className={`space-y-1.5 transition-all duration-500 overflow-hidden ${
                      isActive ? 'max-h-28 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}>
                      {uc.features.map((feature, fi) => (
                        <li 
                          key={fi} 
                          className="flex items-center gap-2 text-xs text-foreground-secondary"
                        >
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card number - daha subtle */}
                  <div className={`absolute top-4 right-4 text-3xl font-bold transition-all duration-500 ${
                    isActive ? 'text-foreground/10' : 'text-foreground/5'
                  }`}>
                    {String(normalizedIndex + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {useCases.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex 
                ? 'w-5 bg-primary' 
                : 'w-1.5 bg-foreground-muted/20'
            }`}
          />
        ))}
      </div>

    </section>
  );
}
