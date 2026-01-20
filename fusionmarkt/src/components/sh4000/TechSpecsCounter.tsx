'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from './hooks/useGSAP';

// Detaylı teknik özellikler - Hero'da olmayan bilgiler
const specCategories = [
  { 
    category: 'Batarya Sistemi', 
    items: [
      { label: 'Batarya Tipi', value: 'LiFePO4 (LFP)' },
      { label: 'Nominal Voltaj', value: '51.2V (40-60V)' },
      { label: 'Şarj Akımı', value: '65A' },
      { label: 'Deşarj Akımı', value: '90A (Max 100A)' },
      { label: 'Döngü Ömrü', value: '4000+ (@80% DOD)' },
    ]
  },
  { 
    category: 'İnverter Çıkışı', 
    items: [
      { label: 'AC Voltaj', value: '220/230/240Vac' },
      { label: 'Frekans', value: '50Hz' },
      { label: 'Dalga Formu', value: 'Saf Sinüs' },
      { label: 'THD', value: '<1.5%' },
      { label: 'Maks. Akım', value: '17.5A' },
    ]
  },
  { 
    category: 'Solar Giriş', 
    items: [
      { label: 'PV HV Aralık', value: '70-450Vdc' },
      { label: 'PV HV Akım', value: '16A' },
      { label: 'PV LV Aralık', value: '12-50Vdc' },
      { label: 'Araç Şarj', value: '120W' },
      { label: 'MPPT Verim', value: '%99.9' },
    ]
  },
  { 
    category: 'Verimlilik', 
    items: [
      { label: 'Batarya→AC', value: '%93' },
      { label: 'AC→Batarya', value: '%93' },
      { label: 'PV→AC', value: '%97.5' },
      { label: 'PV→Batarya', value: '%95' },
      { label: 'UPS Geçişi', value: '≈10ms' },
    ]
  },
  { 
    category: 'DC Çıkışlar', 
    items: [
      { label: 'XT60 12V', value: '30A' },
      { label: 'XT60 24V', value: '25A' },
      { label: 'XT60 36V', value: '20A' },
      { label: 'USB-C (x2)', value: 'PD 100W' },
      { label: 'Araç Soketi', value: '12V' },
    ]
  },
  { 
    category: 'Fiziksel', 
    items: [
      { label: 'Boyutlar', value: '510×673×266mm' },
      { label: 'Ağırlık', value: '≈65kg' },
      { label: 'Koruma', value: 'IP54 (opt. IP65)' },
      { label: 'Gürültü', value: '<40dB' },
      { label: 'Ekran', value: 'LCD 97×48mm' },
    ]
  },
];

export default function TechSpecsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'tech-specs',
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => setIsVisible(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="pt-10 pb-6 sm:pt-16 sm:pb-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <span className="glass-badge text-[10px] sm:text-xs font-medium tracking-wider uppercase mb-3 sm:mb-4 inline-block">
            Teknik Özellikler
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Detaylı <span className="text-primary">Spesifikasyonlar</span>
          </h2>
          <p className="text-foreground-secondary mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            IEETek SH4000'in tüm teknik detayları
          </p>
        </div>

        {/* Specs Grid */}
        <div className={`grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-700 sh4000-tech-grid ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {specCategories.map((cat, catIndex) => (
            <div 
              key={cat.category} 
              className="glass-card-static rounded-xl overflow-hidden"
              style={{ transitionDelay: `${catIndex * 100}ms` }}
            >
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border bg-background-secondary/30">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">{cat.category}</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                {cat.items.map((item) => (
                  <div key={item.label} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-foreground-muted">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-foreground-muted text-sm mt-6">
          * Performans değerleri ortam koşullarına göre değişiklik gösterebilir.
        </p>
      </div>
    </section>
  );
}
