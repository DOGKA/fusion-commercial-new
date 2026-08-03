/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, type CSSProperties } from "react";
import { 
  Building2,
  Heart,
  Cpu,
  Globe,
  Shield,
  MessageCircle,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  Play,
  Terminal,
  RotateCcw,
  ShoppingBag,
  Recycle,
  HandHeart
} from "lucide-react";

// Office Image URL
const OFFICE_IMAGE = "https://cdn.fusionmarkt.com/general/1766565047088-jw7p3r-fusionmarkt-office.png";

// ASCII Art Lines
const asciiLines = [
  " ███████╗██╗   ██╗███████╗██╗ ██████╗ ███╗   ██╗",
  " ██╔════╝██║   ██║██╔════╝██║██╔═══██╗████╗  ██║",
  " █████╗  ██║   ██║███████╗██║██║   ██║██╔██╗ ██║",
  " ██╔══╝  ██║   ██║╚════██║██║██║   ██║██║╚██╗██║",
  " ██║     ╚██████╔╝███████║██║╚██████╔╝██║ ╚████║",
  " ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
];

// Terminal penceresi başlık çubuğu dahil her iki temada da koyu kalır. Palet
// değişkenleri burada yerel olarak ezilmezse light temada başlık yazısı koyu
// zeminde koyu, altın ASCII ve yeşil prompt ise beyaz zeminde okunmaz oluyor.
const TERMINAL_PALETTE = {
  backgroundColor: "#121212",
  "--foreground": "#FAFAFA",
  "--foreground-secondary": "rgba(250, 250, 250, 0.78)",
  "--foreground-tertiary": "rgba(250, 250, 250, 0.55)",
  "--fusion-primary": "#FF4449",
  "--fusion-success": "#4ADE80",
  "--glass-bg": "rgba(255, 255, 255, 0.06)",
  "--glass-bg-hover": "rgba(255, 255, 255, 0.12)",
  "--glass-border": "rgba(255, 255, 255, 0.12)",
} as CSSProperties;

// Interactive Terminal Component
function InteractiveTerminal() {
  const [isRunning, setIsRunning] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showTagline, setShowTagline] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  const runAnimation = () => {
    // Reset state
    setIsRunning(true);
    setShowCommand(false);
    setShowTitle(false);
    setVisibleLines([]);
    setShowTagline(false);
    setCursorBlink(true);

    // Step 1: Show command being typed
    setTimeout(() => setShowCommand(true), 300);
    
    // Step 2: Show title
    setTimeout(() => setShowTitle(true), 800);
    
    // Step 3: Animate each ASCII line
    asciiLines.forEach((_, index) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, 1000 + (index * 120));
    });

    // Step 4: Show tagline
    setTimeout(() => {
      setShowTagline(true);
      setCursorBlink(false);
      setIsRunning(false);
    }, 1000 + (asciiLines.length * 120) + 300);
  };

  const resetTerminal = () => {
    setShowCommand(false);
    setShowTitle(false);
    setVisibleLines([]);
    setShowTagline(false);
    setCursorBlink(true);
    setIsRunning(false);
  };

  return (
    <section className="py-8 md:py-12 relative">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl overflow-hidden" style={TERMINAL_PALETTE}>
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-[var(--glass-border)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-[var(--foreground-tertiary)]">fusionmarkt — bash — 80×24</span>
              </div>
              <Terminal className="w-4 h-4 text-[var(--foreground-tertiary)]" />
            </div>

            {/* Terminal Content */}
            <div className="p-6 md:p-8 font-mono text-sm min-h-[320px] relative">
              {/* Initial State - Run Button */}
              {!showCommand && !isRunning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[260px] gap-6"
                >
                  <div className="text-center">
                    <p className="text-[var(--foreground-tertiary)] mb-2">$ _</p>
                    <p className="text-[var(--foreground-secondary)] text-base">Terminali çalıştırmak için butona tıklayın</p>
                  </div>
                  <button
                    onClick={runAnimation}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--fusion-primary)] to-[var(--fusion-primary-light)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--fusion-primary)]/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5" />
                    Run innovation.js
                  </button>
                </motion.div>
              )}

              {/* Running State */}
              {(showCommand || isRunning) && (
                <div className="space-y-1">
                  {/* Command Line */}
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fusion-success)]">$</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[var(--foreground-secondary)]"
                    >
                      node innovation.js
                    </motion.span>
                    {!showTitle && cursorBlink && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-4 bg-[var(--foreground-secondary)] inline-block"
                      />
                    )}
                  </div>

                  {/* Title */}
                  {showTitle && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[var(--fusion-primary)] text-lg font-bold mt-4 mb-4"
                    >
                      Innovation is Our Language
                    </motion.div>
                  )}

                  {/* ASCII Art - Line by Line */}
                  <div className="overflow-x-auto mt-2">
                    <pre className="text-[var(--fusion-secondary)] text-xs md:text-sm leading-tight">
                      {asciiLines.map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: visibleLines.includes(index) ? 1 : 0,
                            x: visibleLines.includes(index) ? 0 : -20
                          }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </pre>
                  </div>

                  {/* Tagline */}
                  {showTagline && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center mt-6"
                    >
                      <span className="text-[var(--foreground-secondary)] text-lg font-semibold">
                        Your Shopping Landmark
                      </span>
                    </motion.div>
                  )}

                  {/* Reset Button */}
                  {showTagline && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center mt-6"
                    >
                      <button
                        onClick={resetTerminal}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground-tertiary)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--foreground)] transition-all text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Tekrar Çalıştır
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HakkimizdaPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax sadece desktop'ta. Mobile Safari'de useScroll her frame'de
  // state update tetikleyip scroll FPS'ini düşürüyor — bu sayfanın takılma
  // sebebinin başında bu geliyor.
  const [enableParallax, setEnableParallax] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => setEnableParallax(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Console.log for developer easter egg
  useEffect(() => {
    console.log('%c Innovation is Our Language', 'color: #E31E24; font-size: 16px; font-weight: bold;');
    console.log(`%c
 ███████╗██╗   ██╗███████╗██╗ ██████╗ ███╗   ██╗
 ██╔════╝██║   ██║██╔════╝██║██╔═══██╗████╗  ██║
 █████╗  ██║   ██║███████╗██║██║   ██║██╔██╗ ██║
 ██╔══╝  ██║   ██║╚════██║██║██║   ██║██║╚██╗██║
 ██║     ╚██████╔╝███████║██║╚██████╔╝██║ ╚████║
 ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
              Your Shopping Landmark
    `, 'color: #FFB800; font-family: monospace;');
  }, []);

  const values = [
    {
      icon: Cpu,
      title: "Mühendislik",
      description: "Havacılık, elektrik ara bağlantı, ağ ve elektronik bileşen çözümlerinde kaliteli hizmet.",
      color: "var(--fusion-primary)"
    },
    {
      icon: ShoppingBag,
      title: "E-Ticaret",
      description: "Elektronik, batarya ve güç grupları, LiFePO4 piller, soğutucu sistemler ve taşınabilir buzdolapları.",
      color: "var(--fusion-secondary)"
    },
    {
      icon: Shield,
      title: "Güvenlik",
      description: "3D Secure ve SSL ile güvenli alışveriş garantisi.",
      color: "var(--fusion-success)"
    },
    {
      icon: Heart,
      title: "Müşteri Odaklılık",
      description: "Her müşterimizin deneyimi bizim için önceliktir.",
      color: "var(--fusion-info)"
    }
  ];

  const stats = [
    { value: "1K+", label: "Müşteri" },
    { value: "+100", label: "Ürün Çeşidi" },
    { value: "24/7", label: "Destek" },
    { value: "99%", label: "Memnuniyet" }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[var(--background)]">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION - Parallax Office Image
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Background Image with Parallax — sadece desktop'ta parallax aktif */}
        <motion.div
          className="absolute inset-0"
          style={enableParallax ? { opacity: heroOpacity, scale: heroScale } : undefined}
        >
          <Image
            src={OFFICE_IMAGE}
            alt="FusionMarkt Office"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1440px"
            quality={75}
          />
          {/* Gradient Overlays — üzerindeki metin her iki temada da beyaz olduğu
              için karartma tema değişkenine bağlanamaz; --background ile biten bir
              gradient light temada metnin arkasını aydınlatıp okunmaz hale getiriyor. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          {/* Sayfa arka planına geçiş yalnızca metnin bittiği en alt şeritte */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--background)]" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              FusionMarkt
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--fusion-primary)] via-[var(--fusion-secondary)] to-[var(--fusion-primary)]">
                Mühendislik & Alışveriş
              </span>
            </h1>

            {/* typography.css'teki katmansız `p` kuralı Tailwind utility'lerini
                ezdiği için burada `!` gerekiyor; aksi halde fotoğrafın üzerinde
                koyu metin kalıyor. */}
            <p className="text-lg md:text-xl text-white/90! max-w-2xl mx-auto mb-8">
              ASDTC Mühendislik Ticaret ve FusionMarkt LLC bünyesinde; 
              mühendislik çözümleri ile online alışverişi bir arada sunuyoruz.
            </p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 md:gap-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/85">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BIZ KIMIZ SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--fusion-primary)]/5 to-transparent" />
        
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--fusion-primary)]/10 mb-6">
                <Building2 className="w-8 h-8 text-[var(--fusion-primary)]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Biz Kimiz
              </h2>
              <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto leading-relaxed">
                ASDTC Mühendislik Ticaret Ltd. Şti. / FusionMarkt LLC
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8 md:p-12 rounded-3xl"
            >
              <div className="prose max-w-none">
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed mb-6">
                  ASDTC Mühendislik Ticaret Ltd. Şti veya FusionMarkt LLC (www.fusionmarkt.com), 
                  Türkiye'de <span className="text-[var(--foreground)] font-medium">havacılık ve mühendislik teknolojisinin</span> gelişmesinde, 
                  kritik parçaların ve elektrik ara bağlantı çözümlerinin, ağ çözümünün, elektronik 
                  bileşen çözümünün tedariki ve üretiminde en son yenilikleri destekleyen kaliteli 
                  hizmetler sunma konusunda büyük bir kapasiteye sahiptir.
                </p>
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed mb-6">
                  Mühendislik parçalarının yanı sıra <span className="text-[var(--fusion-primary)] font-semibold">son kullanıcıya yönelik elektronik ürünler, batarya ve güç grupları, LiFePO4 piller, soğutucu sistemler ve taşınabilir buzdolapları</span> üzerine 
                  kurulmuş bir online alışveriş platformudur.
                </p>
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed">
                  Perakende ve e-ticaret işinin doğası gereği, FusionMarkt tüketicilerine, kurumsal 
                  satış müşterilerine, bağlı kuruluşlarına ve satıcılarına kaliteli ürün ve hizmet 
                  sunmayı temel alır. Kalite, güvenilirlik ve müşteri memnuniyeti bizim için önceliktir.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VALUES SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          {/* Values Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card p-6 rounded-2xl text-center group hover:scale-105 transition-transform duration-300"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${value.color}15` }}
                >
                  <value.icon className="w-7 h-7" style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--foreground-tertiary)]">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-[var(--foreground-secondary)] max-w-3xl mx-auto leading-relaxed">
              Kalitemizi her zaman ön planda tutarak, mühendislik çözümlerinden perakende ürünlere 
              kadar titizlikle seçilmiş bir yelpaze sunuyoruz. Bu sayede müşterilerimize bir ürün değil, 
              <span className="text-[var(--foreground)] font-medium"> güvenilir bir deneyim sunmayı garanti ediyoruz.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAALIYET ALANLARI
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 hidden lg:block pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--fusion-primary)]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--fusion-secondary)]/20 rounded-full blur-[120px]" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Engineering */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                <h3 className="text-2xl font-bold">Mühendislik & Teknoloji</h3>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Türkiye'de havacılık ve mühendislik teknolojisinin gelişmesine katkı sağlıyoruz. 
                Kritik parçalar, elektrik ara bağlantı çözümleri, ağ çözümleri ve elektronik 
                bileşenlerin tedariki ile üretiminde yenilikçi hizmetler sunuyoruz.
              </p>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Kurumsal satış müşterilerimiz ve iş ortaklarımız için yüksek standartlarda 
                mühendislik altyapısı ve teknik destek sağlıyoruz.
              </p>
            </motion.div>

            {/* E-commerce */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-[var(--fusion-secondary)] flex-shrink-0" />
                <h3 className="text-2xl font-bold">Online Alışveriş Platformu</h3>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                FusionMarkt, mühendislik parçalarının yanı sıra son kullanıcıya yönelik 
                elektronik ürünler, batarya ve güç grupları, LiFePO4 piller, soğutucu 
                sistemler ve taşınabilir buzdolapları kategorilerinde online alışveriş 
                imkânı sunar. Geniş ürün yelpazemizle farklı ihtiyaçlara tek platformdan 
                yanıt veriyoruz.
              </p>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-8">
                Dijital platformlarda müşterilerimizle kesintisiz iletişim halindeyiz; 
                görüş ve önerilerinizi değerlendirerek hizmet kalitemizi sürekli geliştiriyoruz.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-bg-hover)] hover:border-[var(--fusion-primary)] transition-all group">
                  <Instagram className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:text-[var(--fusion-primary)]" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-bg-hover)] hover:border-[var(--fusion-primary)] transition-all group">
                  <Twitter className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:text-[var(--fusion-primary)]" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-bg-hover)] hover:border-[var(--fusion-primary)] transition-all group">
                  <Linkedin className="w-5 h-5 text-[var(--foreground-tertiary)] group-hover:text-[var(--fusion-primary)]" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SOSYAL SORUMLULUK & ÇEVRE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--fusion-success)]/10 mb-6">
              <HandHeart className="w-8 h-8 text-[var(--fusion-success)]" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Sosyal Sorumluluk &amp; Çevre
            </h2>
            <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto leading-relaxed">
              Topluma ve doğaya katkı, işimizin ayrılmaz bir parçasıdır.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                <h3 className="text-2xl font-bold">Sorumluluklarımızın Farkındayız</h3>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Ticari faaliyetimizin ötesinde topluma karşı sorumluluklarımızın
                farkındayız. Eğitim, çevre, gaziler ve hayvan hakları alanlarında
                çalışan{" "}
                <span className="text-[var(--foreground)] font-medium">AÇEV</span>,{" "}
                <span className="text-[var(--foreground)] font-medium">TEMA</span>,{" "}
                <span className="text-[var(--foreground)] font-medium">TSKGV</span> ve{" "}
                <span className="text-[var(--foreground)] font-medium">HAYTAP</span>{" "}
                derneklerine düzenli olarak destek veriyoruz.
              </p>
              <div className="flex flex-wrap gap-2">
                {["AÇEV", "TEMA", "TSKGV", "HAYTAP"].map((org) => (
                  <span
                    key={org}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)]"
                  >
                    {org}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Recycle className="w-6 h-6 text-[var(--fusion-success)] flex-shrink-0" />
                <h3 className="text-2xl font-bold">Atık Pil &amp; Çevre Uyumluluğu</h3>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Batarya ve güç sistemleri sunan bir platform olarak çevresel etkimizin
                sorumluluğunu taşıyoruz. Her yıl{" "}
                <span className="text-[var(--foreground)] font-medium">TAP Derneği</span>{" "}
                iş birliğiyle, çevre uyumluluğu kapsamında atık pil toplama ve geri
                dönüşüm süreçlerine katkı sağlıyoruz.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Kullanım ömrünü tamamlayan pil ve bataryaların doğru şekilde geri
                kazanılması için yasal ve çevresel yükümlülüklerimizi eksiksiz yerine
                getiriyoruz.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE TERMINAL - Console Art
      ═══════════════════════════════════════════════════════════════════ */}
      <InteractiveTerminal />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--fusion-primary)]/10 via-transparent to-[var(--fusion-secondary)]/10" />
              
              <div className="relative z-10">
                <MessageCircle className="w-12 h-12 text-[var(--fusion-primary)] mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Bizimle İletişime Geçin
                </h2>
                <p className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-xl mx-auto">
                  Sorularınız, önerileriniz veya iş birliği fırsatları için 
                  bize ulaşmaktan çekinmeyin.
                </p>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-colors group"
                >
                  İletişim Sayfası
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
