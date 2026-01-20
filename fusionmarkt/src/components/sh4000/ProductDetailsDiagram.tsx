'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductDetailsDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'product-details',
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => setIsVisible(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-8 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase">
            Ürün Detayları
          </h2>
        </div>

        {/* Mobile - 3 Satır layout (çizgilerle) */}
        <div className="md:hidden space-y-10">
          {/* Sol Görünüm */}
          <div className="relative mx-auto max-w-[360px]">
            {/* Sol taraf labels - sol kenara hizalı */}
            <div className="absolute left-0 top-[18%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium leading-tight bg-background/80 px-1 rounded">
                Taşınabilir Güneş Paneli Girişi<br/>Araç Girişi / DC Çıkış Portu
              </p>
            </div>
            <div className="absolute left-0 top-[70%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Gösterge Işıkları</p>
            </div>
            <div className="absolute left-0 top-[86%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Soğutma Fanı</p>
            </div>

            {/* Çizgiler */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <line x1="0" y1="18%" x2="14%" y2="18%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="14%" cy="18%" r="3" fill="#f97316" />
              <line x1="0" y1="70%" x2="12%" y2="70%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="12%" cy="70%" r="3" fill="#f97316" />
              <line x1="0" y1="86%" x2="16%" y2="86%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="16%" cy="86%" r="3" fill="#f97316" />
            </svg>

            {/* Görsel */}
            <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
              <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center h-[300px]">
                <Image
                  src="/sh4000/sol-gorunum-200x260.png"
                  alt="Sol Görünüm"
                  width={200}
                  height={260}
                  sizes="200px"
                  className="w-full h-full object-contain p-1"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* Ön Görünüm */}
          <div className="relative mx-auto max-w-[420px] overflow-hidden">
            {/* Sol taraf labels - sol kenara hizalı, çizgi başlangıcında başlar */}
            <div className="absolute left-0 top-[10%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">AC Çıkış Anahtarı</p>
            </div>
            <div className="absolute left-0 top-[20%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">DC Çıkış Anahtarı</p>
            </div>
            <div className="absolute left-0 top-[30%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Ana Güç Anahtarı</p>
            </div>
            <div className="absolute left-0 top-[40%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">IoT Reset Butonu</p>
            </div>
            <div className="absolute left-0 top-[72%] -translate-y-full -mt-1 text-left">
              <p className="text-[9px] text-cyan-400 font-medium bg-background/80 px-1 rounded">Batarya Modülü</p>
            </div>

            {/* Sağ taraf labels - sağ kenara hizalı, çizgi başlangıcında biter */}
            <div className="absolute right-0 top-[8%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Çekme Kolu</p>
            </div>
            <div className="absolute right-0 top-[18%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-cyan-400 font-medium bg-background/80 px-1 rounded">Hibrit İnvertör Modülü</p>
            </div>
            <div className="absolute right-0 top-[30%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">AC Çıkış Portları</p>
            </div>
            <div className="absolute right-0 top-[40%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">LCD Ekran</p>
            </div>
            <div className="absolute right-0 top-[50%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">DC Çıkış Portları*</p>
            </div>
            <div className="absolute right-0 top-[60%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Gösterge Işıkları</p>
            </div>
            <div className="absolute right-0 top-[92%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">4&apos;lü Teker Grubu</p>
            </div>

            {/* Çizgiler */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {/* Sol çizgiler */}
              <line x1="0" y1="10%" x2="18%" y2="10%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="18%" cy="10%" r="3" fill="#f97316" />
              <line x1="0" y1="20%" x2="22%" y2="20%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="22%" cy="20%" r="3" fill="#f97316" />
              <line x1="0" y1="30%" x2="26%" y2="30%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="26%" cy="30%" r="3" fill="#f97316" />
              <line x1="0" y1="40%" x2="30%" y2="40%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="30%" cy="40%" r="3" fill="#f97316" />
              <line x1="0" y1="72%" x2="32%" y2="72%" stroke="#22d3ee" strokeWidth="1.5" />
              <circle cx="32%" cy="72%" r="3" fill="#22d3ee" />

              {/* Sağ çizgiler */}
              <line x1="100%" y1="8%" x2="74%" y2="8%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="74%" cy="8%" r="3" fill="#f97316" />
              <line x1="100%" y1="18%" x2="76%" y2="18%" stroke="#22d3ee" strokeWidth="1.5" />
              <circle cx="76%" cy="18%" r="3" fill="#22d3ee" />
              <line x1="100%" y1="30%" x2="82%" y2="30%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="82%" cy="30%" r="3" fill="#f97316" />
              <line x1="100%" y1="40%" x2="78%" y2="40%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="78%" cy="40%" r="3" fill="#f97316" />
              <line x1="100%" y1="50%" x2="84%" y2="50%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="84%" cy="50%" r="3" fill="#f97316" />
              <line x1="100%" y1="60%" x2="80%" y2="60%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="80%" cy="60%" r="3" fill="#f97316" />
              <line x1="100%" y1="92%" x2="62%" y2="92%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="62%" cy="92%" r="3" fill="#f97316" />
            </svg>

            {/* Görsel */}
            <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
              <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center h-[420px]">
                <Image
                  src="/sh4000/on-gorunum-280x360.png"
                  alt="Ön Görünüm"
                  width={280}
                  height={360}
                  sizes="280px"
                  className="w-full h-full object-contain p-1"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* Sağ Görünüm */}
          <div className="relative mx-auto max-w-[360px]">
            {/* Sağ taraf labels - sağ kenara hizalı */}
            <div className="absolute right-0 top-[16%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Güneş Paneli Bağlantıları</p>
            </div>
            <div className="absolute right-0 top-[32%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Güneş Paneli Anahtarı</p>
            </div>
            <div className="absolute right-0 top-[52%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">Şebeke AC Şarj Girişi</p>
            </div>
            <div className="absolute right-0 top-[69%] -translate-y-full -mt-1 text-right">
              <p className="text-[9px] text-secondary font-medium bg-background/80 px-1 rounded">AC Çıkış</p>
            </div>

            {/* Çizgiler */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <line x1="100%" y1="16%" x2="74%" y2="16%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="74%" cy="16%" r="3" fill="#f97316" />
              <line x1="100%" y1="32%" x2="70%" y2="32%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="70%" cy="32%" r="3" fill="#f97316" />
              <line x1="100%" y1="52%" x2="66%" y2="52%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="66%" cy="52%" r="3" fill="#f97316" />
              <line x1="100%" y1="69%" x2="60%" y2="69%" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="60%" cy="69%" r="3" fill="#f97316" />
            </svg>

            {/* Görsel */}
            <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
              <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center h-[300px]">
                <Image
                  src="/sh4000/sag-gorunum-200x260.png"
                  alt="Sağ Görünüm"
                  width={200}
                  height={260}
                  sizes="200px"
                  className="w-full h-full object-contain p-1"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3-View Diagram (Desktop) */}
        <div className={`relative transition-all duration-1000 hidden md:block ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          
          <div className="flex items-end justify-center gap-24 lg:gap-32">
            
            {/* ========== SOL GÖRÜNÜM ========== */}
            <div className="relative flex-shrink-0" style={{ width: '200px' }}>
              
              {/* Sol taraf labels */}
              <div className="absolute right-full top-[12%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium leading-tight">Taşınabilir Güneş Paneli Girişi<br/>Araç Girişi / DC Çıkış Portu</p>
              </div>
              <div className="absolute right-full top-[65%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Gösterge Işıkları</p>
              </div>
              <div className="absolute right-full top-[82%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Soğutma Fanı</p>
              </div>

              {/* Çizgiler */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <line x1="0" y1="15%" x2="25%" y2="15%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="25%" cy="15%" r="3" fill="#f97316" />
                
                <line x1="0" y1="67%" x2="20%" y2="67%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="20%" cy="67%" r="3" fill="#f97316" />
                
                <line x1="0" y1="84%" x2="30%" y2="84%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="30%" cy="84%" r="3" fill="#f97316" />
              </svg>

              {/* Görsel */}
              <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
                <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center" style={{ width: '100%', height: '300px' }}>
                  <Image
                    src="/sh4000/sol-gorunum-200x260.png"
                    alt="Sol Görünüm"
                    width={200}
                    height={260}
                    sizes="200px"
                    className="w-full h-full object-contain p-1"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
            </div>

            {/* ========== ORTA GÖRÜNÜM ========== */}
            <div className="relative flex-shrink-0" style={{ width: '280px' }}>
              
              {/* Sol taraf labels */}
              <div className="absolute right-full top-[8%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">AC Çıkış Anahtarı</p>
              </div>
              <div className="absolute right-full top-[18%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">DC Çıkış Anahtarı</p>
              </div>
              <div className="absolute right-full top-[28%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Ana Güç Anahtarı</p>
              </div>
              <div className="absolute right-full top-[38%] pr-4 text-right whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">IoT Reset Butonu</p>
              </div>
              <div className="absolute right-full top-[68%] pr-4 text-right whitespace-nowrap">
                <p className="text-xs text-cyan-400 font-medium">Batarya Modülü</p>
              </div>

              {/* Sağ taraf labels */}
              <div className="absolute left-full top-[5%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Çekme Kolu</p>
              </div>
              <div className="absolute left-full top-[14%] pl-4 text-left whitespace-nowrap">
                <p className="text-xs text-cyan-400 font-medium">Hibrit İnvertör Modülü</p>
              </div>
              <div className="absolute left-full top-[26%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">AC Çıkış Portları</p>
              </div>
              <div className="absolute left-full top-[35%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">LCD Ekran</p>
              </div>
              <div className="absolute left-full top-[44%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">DC Çıkış Portları*</p>
              </div>
              <div className="absolute left-full top-[53%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Gösterge Işıkları</p>
              </div>
              <div className="absolute left-full top-[88%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">4&apos;lü Teker Grubu</p>
              </div>

              {/* Çizgiler */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                {/* Sol çizgiler */}
                <line x1="0" y1="10%" x2="18%" y2="10%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="18%" cy="10%" r="3" fill="#f97316" />
                
                <line x1="0" y1="20%" x2="22%" y2="20%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="22%" cy="20%" r="3" fill="#f97316" />
                
                <line x1="0" y1="30%" x2="26%" y2="30%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="26%" cy="30%" r="3" fill="#f97316" />
                
                <line x1="0" y1="40%" x2="30%" y2="40%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="30%" cy="40%" r="3" fill="#f97316" />
                
                <line x1="0" y1="70%" x2="32%" y2="70%" stroke="#22d3ee" strokeWidth="1.5" />
                <circle cx="32%" cy="70%" r="3" fill="#22d3ee" />

                {/* Sağ çizgiler */}
                <line x1="100%" y1="7%" x2="70%" y2="7%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="70%" cy="7%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="16%" x2="75%" y2="16%" stroke="#22d3ee" strokeWidth="1.5" />
                <circle cx="75%" cy="16%" r="3" fill="#22d3ee" />
                
                <line x1="100%" y1="28%" x2="82%" y2="28%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="82%" cy="28%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="37%" x2="78%" y2="37%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="78%" cy="37%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="46%" x2="85%" y2="46%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="85%" cy="46%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="55%" x2="80%" y2="55%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="80%" cy="55%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="90%" x2="60%" y2="90%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="60%" cy="90%" r="3" fill="#f97316" />
              </svg>

              {/* Görsel */}
              <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
                <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center" style={{ width: '100%', height: '420px' }}>
                  <Image
                    src="/sh4000/on-gorunum-280x360.png"
                    alt="Ön Görünüm"
                    width={280}
                    height={360}
                    sizes="280px"
                    className="w-full h-full object-contain p-1"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
            </div>

            {/* ========== SAĞ GÖRÜNÜM ========== */}
            <div className="relative flex-shrink-0" style={{ width: '200px' }}>
              
              {/* Sağ taraf labels */}
              <div className="absolute left-full top-[12%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Güneş Paneli Bağlantıları</p>
              </div>
              <div className="absolute left-full top-[28%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Güneş Paneli Anahtarı</p>
              </div>
              <div className="absolute left-full top-[48%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">Şebeke AC Şarj Girişi</p>
              </div>
              <div className="absolute left-full top-[65%] pl-4 text-left whitespace-nowrap">
                <p className="text-[10px] text-secondary font-medium">AC Çıkış</p>
              </div>

              {/* Çizgiler */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <line x1="100%" y1="14%" x2="70%" y2="14%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="70%" cy="14%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="30%" x2="65%" y2="30%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="65%" cy="30%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="50%" x2="60%" y2="50%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="60%" cy="50%" r="3" fill="#f97316" />
                
                <line x1="100%" y1="67%" x2="55%" y2="67%" stroke="#f97316" strokeWidth="1.5" />
                <circle cx="55%" cy="67%" r="3" fill="#f97316" />
              </svg>

              {/* Görsel */}
              <div className="border border-dashed border-foreground-muted/30 rounded-xl p-2">
                <div className="bg-background-secondary/30 rounded-lg flex items-center justify-center" style={{ width: '100%', height: '300px' }}>
                  <Image
                    src="/sh4000/sag-gorunum-200x260.png"
                    alt="Sağ Görünüm"
                    width={200}
                    height={260}
                    sizes="200px"
                    className="w-full h-full object-contain p-1"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-foreground-muted text-sm mt-8">
            * DC çıkış portları özelleştirilebilir.
          </p>
        </div>
      </div>
    </section>
  );
}
