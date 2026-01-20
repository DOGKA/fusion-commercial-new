'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type FlowMode = 'normal' | 'emergency';

export default function SystemDiagram() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FlowMode>('normal');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'system-diagram',
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => setIsVisible(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const isNormal = mode === 'normal';
  const activeColor = isNormal ? '#10b981' : '#ef4444';
  const lineColor = '#374151';

  return (
    <section ref={sectionRef} className="py-8 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-primary border border-primary/30 bg-primary/10 mb-3">
            Sistem Diyagramı
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
            Akıllı <span className="text-primary">Enerji Akışı</span>
          </h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="glass-card-static p-1.5 rounded-full inline-flex gap-1">
            <button
              onClick={() => setMode('normal')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isNormal 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Normal Mod
            </button>
            <button
              onClick={() => setMode('emergency')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !isNormal 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Acil Durum
            </button>
          </div>
        </div>

        {/* SVG Diagram - Özenli tasarım */}
        <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          
          <svg viewBox="0 0 1000 650" className="w-full h-auto" style={{ maxHeight: '600px' }}>
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* ==================== SOL ÜST - GÜNEŞ PANELLERİ (ev yok) ==================== */}
            <g className={isNormal ? 'opacity-100' : 'opacity-40'}>
              {/* Panel çerçeve */}
              <rect x="80" y="100" width="100" height="70" rx="4" fill="none" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="2.5" />
              {/* Panel grid çizgileri */}
              <line x1="80" y1="123" x2="180" y2="123" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="1.5" />
              <line x1="80" y1="147" x2="180" y2="147" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="1.5" />
              <line x1="113" y1="100" x2="113" y2="170" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="1.5" />
              <line x1="147" y1="100" x2="147" y2="170" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="1.5" />
              {/* Güneş */}
              <circle cx="165" cy="70" r="20" fill="none" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="2" />
              <circle cx="165" cy="70" r="10" fill={isNormal ? '#fbbf24' : lineColor}>
                {isNormal && <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />}
              </circle>
              {/* Güneş ışınları */}
              <line x1="165" y1="42" x2="165" y2="35" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="2" />
              <line x1="190" y1="70" x2="197" y2="70" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="2" />
              <line x1="183" y1="52" x2="188" y2="47" stroke={isNormal ? '#fbbf24' : lineColor} strokeWidth="2" />
              {/* Label */}
              <text x="130" y="205" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>GÜNEŞ PANELLERİ</text>
            </g>

            {/* ==================== SOL ALT - ACİL YÜK ==================== */}
            <g className={!isNormal ? 'opacity-100' : 'opacity-40'}>
              {/* Server rack */}
              <rect x="80" y="420" width="100" height="80" rx="5" fill="none" stroke={!isNormal ? activeColor : lineColor} strokeWidth="2.5" />
              {/* Rack çizgileri */}
              <line x1="80" y1="447" x2="180" y2="447" stroke={!isNormal ? activeColor : lineColor} strokeWidth="1.5" />
              <line x1="80" y1="473" x2="180" y2="473" stroke={!isNormal ? activeColor : lineColor} strokeWidth="1.5" />
              {/* LED'ler */}
              <circle cx="95" cy="433" r="5" fill={!isNormal ? activeColor : lineColor}>
                {!isNormal && <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />}
              </circle>
              <circle cx="95" cy="460" r="5" fill={!isNormal ? activeColor : lineColor}>
                {!isNormal && <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" begin="0.15s" />}
              </circle>
              <circle cx="95" cy="487" r="5" fill={!isNormal ? activeColor : lineColor}>
                {!isNormal && <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" begin="0.3s" />}
              </circle>
              {/* Uyarı ikonu */}
              {!isNormal && (
                <g transform="translate(60, 405)">
                  <circle r="14" fill="#ef4444" />
                  <text x="0" y="5" textAnchor="middle" fill="white" style={{ fontSize: '16px', fontWeight: 'bold' }}>!</text>
                </g>
              )}
              {/* Label */}
              <text x="130" y="530" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>ACİL YÜK</text>
            </g>

            {/* ==================== SAĞ ÜST - MONİTÖR ==================== */}
            <g className="opacity-90">
              {/* Telefon/Tablet */}
              <rect x="820" y="80" width="60" height="90" rx="8" fill="none" stroke={activeColor} strokeWidth="2.5" />
              {/* Ekran */}
              <rect x="828" y="92" width="44" height="60" rx="3" fill={activeColor} fillOpacity="0.1" />
              {/* Ekran içeriği */}
              <line x1="835" y1="105" x2="865" y2="105" stroke={activeColor} strokeWidth="2" opacity="0.7" />
              <line x1="835" y1="118" x2="855" y2="118" stroke={activeColor} strokeWidth="2" opacity="0.5" />
              <line x1="835" y1="131" x2="860" y2="131" stroke={activeColor} strokeWidth="2" opacity="0.3" />
              {/* Home button */}
              <circle cx="850" cy="160" r="5" fill="none" stroke={activeColor} strokeWidth="1.5" />
              {/* WiFi sinyalleri */}
              <circle cx="850" cy="55" r="4" fill={activeColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <path d="M838 48 Q850 35 862 48" fill="none" stroke={activeColor} strokeWidth="2" opacity="0.7" />
              <path d="M830 42 Q850 25 870 42" fill="none" stroke={activeColor} strokeWidth="2" opacity="0.5" />
              {/* Label */}
              <text x="850" y="200" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>MONİTÖR</text>
            </g>

            {/* ==================== SAĞ - ŞEBEKE ==================== */}
            <g className={isNormal ? 'opacity-100' : 'opacity-40'}>
              {/* Elektrik direği */}
              <line x1="900" y1="270" x2="900" y2="420" stroke={isNormal ? activeColor : lineColor} strokeWidth="5" />
              {/* Çapraz kol - üst */}
              <line x1="860" y1="290" x2="940" y2="290" stroke={isNormal ? activeColor : lineColor} strokeWidth="3" />
              {/* Çapraz kol - orta */}
              <line x1="870" y1="330" x2="930" y2="330" stroke={isNormal ? activeColor : lineColor} strokeWidth="2.5" />
              {/* Çapraz kol - alt */}
              <line x1="880" y1="370" x2="920" y2="370" stroke={isNormal ? activeColor : lineColor} strokeWidth="2" />
              {/* İzolatörler */}
              <circle cx="870" cy="290" r="4" fill={isNormal ? activeColor : lineColor} />
              <circle cx="930" cy="290" r="4" fill={isNormal ? activeColor : lineColor} />
              {/* Label */}
              <text x="900" y="450" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>ŞEBEKE</text>
            </g>

            {/* ==================== ALT ORTA SOL - NORMAL YÜK ==================== */}
            <g className={isNormal ? 'opacity-100' : 'opacity-40'}>
              {/* Çamaşır makinesi gövde - çizgi x=420'de, çizim de ortalı */}
              <rect x="385" y="510" width="70" height="80" rx="5" fill="none" stroke={isNormal ? activeColor : lineColor} strokeWidth="2.5" />
              {/* Tambur */}
              <circle cx="420" cy="560" r="24" fill="none" stroke={isNormal ? activeColor : lineColor} strokeWidth="2" />
              <circle cx="420" cy="560" r="12" fill="none" stroke={isNormal ? activeColor : lineColor} strokeWidth="1.5">
                {isNormal && <animateTransform attributeName="transform" type="rotate" from="0 420 560" to="360 420 560" dur="2s" repeatCount="indefinite" />}
              </circle>
              {/* Kontrol paneli */}
              <rect x="393" y="518" width="50" height="14" rx="2" fill={isNormal ? activeColor : lineColor} fillOpacity="0.15" />
              <circle cx="435" cy="525" r="3" fill={isNormal ? activeColor : lineColor} />
              {/* Onay - sol üstte, ayrı */}
              {isNormal && (
                <g transform="translate(365, 495)">
                  <circle r="14" fill="#10b981" />
                  <path d="M-6 0 L-2 4 L6 -5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}
              {/* Label - çizginin ortasına hizalı (x=420) */}
              <text x="420" y="620" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>NORMAL YÜK</text>
            </g>

            {/* ==================== ALT ORTA SAĞ - ARAÇ ŞARJI ==================== */}
            <g className={isNormal ? 'opacity-100' : 'opacity-40'}>
              {/* Araç ikonu - scale 20x, centered at 700, 540 */}
              <g transform="translate(700, 540) scale(20) translate(-3.4, -3.4)">
                <path 
                  d="M4.595 3.228c-.366-.22-.708-.34-1.102-.37-.402-.03-.862.034-1.46.182a1.93 1.93 0 0 1-.205.031 2.183 2.183 0 0 0-.155.022l-.017.002a.672.672 0 0 0-.293.076.393.393 0 0 0-.141.123.235.235 0 0 0-.007.256l.02.039-.012.042c-.012.043-.008.07.01.085.029.024.084.04.16.047a.43.43 0 0 0 .02.215c-.138-.009-.246-.04-.317-.099-.078-.065-.11-.152-.087-.266a.444.444 0 0 1 .036-.436.605.605 0 0 1 .215-.193.882.882 0 0 1 .377-.101c.044-.01.104-.016.166-.023.07-.009.143-.017.18-.026.62-.154 1.1-.22 1.525-.188.42.03.781.155 1.164.38.194-.022.438.038.652.133.259.114.483.285.536.431v.075l-.048.12a.24.24 0 0 1 .048.12c.005.103-.05.159-.205.14l-.454-.008a.425.425 0 0 0 .052-.212l.325.006-.008-.01.022-.058.052-.132c-.057-.087-.218-.195-.406-.277-.196-.087-.415-.14-.57-.112l-.073-.014zm-.149.797L2.21 3.991a.425.425 0 0 0 .027-.212l2.163.033a.435.435 0 0 0 .046.213z"
                  fill={isNormal ? activeColor : lineColor}
                />
                <path 
                  d="M4.826 3.405a.425.425 0 0 1 .302.729.425.425 0 0 1-.728-.302.425.425 0 0 1 .426-.427zm.151.276a.213.213 0 0 0-.364.151.213.213 0 0 0 .364.15.213.213 0 0 0 0-.3z"
                  fill={isNormal ? activeColor : lineColor}
                />
                <path 
                  d="M1.813 3.405a.425.425 0 0 1 .302.729.425.425 0 0 1-.728-.302.425.425 0 0 1 .426-.427zm.151.276a.213.213 0 0 0-.364.151.213.213 0 0 0 .364.15.213.213 0 0 0 0-.3z"
                  fill={isNormal ? activeColor : lineColor}
                />
                <path 
                  d="m2.543 2.753.276.24 1.53.203.245-.15.111.182-.276.17-.07.014-1.6-.213-.055-.025-.3-.26z"
                  fill={isNormal ? activeColor : lineColor}
                />
              </g>
              {/* Label */}
              <text x="700" y="600" textAnchor="middle" fill="currentColor" style={{ fontSize: '12px', fontWeight: '600' }}>ARAÇ ŞARJI</text>
            </g>

            {/* ==================== ORTA - ÜRÜN GÖRSELİ ALANI ==================== */}
            <g>
              <rect x="350" y="120" width="300" height="350" rx="16" fill="transparent" stroke={activeColor} strokeWidth="3" />
              <image
                href="/sh4000/diagram-300x400.png"
                x="350"
                y="120"
                width="300"
                height="350"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {/* ==================== ENERJİ AKIŞ ÇİZGİLERİ (ok işareti yok) ==================== */}

            {/* Güneş → SH4000 (dirsekli) */}
            <g className={isNormal ? 'opacity-100' : 'opacity-30'}>
              <path d="M180 135 L265 135 L265 295 L350 295" fill="none" stroke={lineColor} strokeWidth="3" />
              {isNormal && (
                <circle r="7" fill={activeColor} filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M180 135 L265 135 L265 295 L350 295" />
                </circle>
              )}
            </g>

            {/* Şebeke → SH4000 (düz çizgi) */}
            <g className={isNormal ? 'opacity-100' : 'opacity-30'}>
              <path d="M860 345 L650 345" fill="none" stroke={lineColor} strokeWidth="3" />
              {isNormal && (
                <circle r="7" fill={activeColor} filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M860 345 L650 345" />
                </circle>
              )}
            </g>

            {/* SH4000 → Normal Yük */}
            <g className={isNormal ? 'opacity-100' : 'opacity-30'}>
              <path d="M420 470 L420 510" fill="none" stroke={lineColor} strokeWidth="3" />
              {isNormal && (
                <circle r="7" fill={activeColor} filter="url(#glow)">
                  <animateMotion dur="1.2s" repeatCount="indefinite" path="M420 470 L420 510" />
                </circle>
              )}
            </g>

            {/* SH4000 → Araç Şarjı */}
            <g className={isNormal ? 'opacity-100' : 'opacity-30'}>
              <path d="M580 470 L580 540 L632 540" fill="none" stroke={lineColor} strokeWidth="3" />
              {isNormal && (
                <circle r="7" fill={activeColor} filter="url(#glow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path="M580 470 L580 540 L632 540" />
                </circle>
              )}
            </g>

            {/* SH4000 → Monitör (90 derece dirsek, kesikli) */}
            <g className="opacity-70">
              <path d="M650 200 L750 200 L750 125 L820 125" fill="none" stroke={lineColor} strokeWidth="2.5" strokeDasharray="10 5" />
            </g>

            {/* SH4000 → Acil Yük */}
            <g className={!isNormal ? 'opacity-100' : 'opacity-30'}>
              <path d="M350 400 L265 400 L265 460 L180 460" fill="none" stroke={lineColor} strokeWidth="3" />
              {!isNormal && (
                <circle r="7" fill={activeColor} filter="url(#glow)">
                  <animateMotion dur="1.2s" repeatCount="indefinite" path="M350 400 L265 400 L265 460 L180 460" />
                </circle>
              )}
            </g>

          </svg>

          {/* Alt Açıklama */}
          <div className="text-center mt-4">
            <p className="text-foreground-secondary text-sm mb-4">
              {isNormal 
                ? 'Normal modda güneş ve şebekeden enerji alarak tüm yükleri besler.'
                : 'Acil durumda bataryadan kritik yükler öncelikli beslenir.'
              }
            </p>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-1 rounded-full ${isNormal ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs text-foreground-muted">Enerji Akışı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isNormal ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs text-foreground-muted">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
