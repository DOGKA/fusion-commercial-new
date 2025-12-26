/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { 
  Target, 
  Heart,
  Leaf,
  Users,
  Sparkles,
  Globe,
  Shield,
  Zap,
  MessageCircle,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  Play,
  Terminal,
  RotateCcw
} from "lucide-react";

// Office Image URL
const OFFICE_IMAGE = "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1766565047088-jw7p3r-fusionmarkt-office.png";

// ASCII Art Lines
const asciiLines = [
  " ███████╗██╗   ██╗███████╗██╗ ██████╗ ███╗   ██╗",
  " ██╔════╝██║   ██║██╔════╝██║██╔═══██╗████╗  ██║",
  " █████╗  ██║   ██║███████╗██║██║   ██║██╔██╗ ██║",
  " ██╔══╝  ██║   ██║╚════██║██║██║   ██║██║╚██╗██║",
  " ██║     ╚██████╔╝███████║██║╚██████╔╝██║ ╚████║",
  " ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
];

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
          <div className="glass-card rounded-3xl overflow-hidden">
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
      icon: Sparkles,
      title: "Yüksek Kalite",
      description: "Titizlikle seçilmiş, uluslararası standartlarda ürünler sunuyoruz.",
      color: "var(--fusion-primary)"
    },
    {
      icon: Heart,
      title: "Müşteri Memnuniyeti",
      description: "Her müşterimizin deneyimi bizim için önceliktir.",
      color: "var(--fusion-secondary)"
    },
    {
      icon: Shield,
      title: "Güvenlik",
      description: "3D Secure ve SSL ile güvenli alışveriş garantisi.",
      color: "var(--fusion-success)"
    },
    {
      icon: Globe,
      title: "Küresel Erişim",
      description: "Dünya genelinden benzersiz ürünleri sizlerle buluşturuyoruz.",
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
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <Image
            src={OFFICE_IMAGE}
            alt="FusionMarkt Office"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[var(--background)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Target className="w-4 h-4 text-[var(--fusion-primary)]" />
              <span className="text-sm font-medium text-white/90">Hikayemiz</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Kültürlerin Buluştuğu
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--fusion-primary)] via-[var(--fusion-secondary)] to-[var(--fusion-primary)]">
                Alışveriş Deneyimi
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              FusionMarkt, benzersiz ürünleri ve müşteri odaklı hizmetleriyle 
              bir alışveriş platformundan daha fazlasını sunar.
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
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
            >
              <div className="w-1.5 h-3 rounded-full bg-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MISSION SECTION
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
                <Target className="w-8 h-8 text-[var(--fusion-primary)]" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Misyonumuz
              </h2>
              <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto leading-relaxed">
                Geleneksel e-ticaretin ötesine geçiyor
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8 md:p-12 rounded-3xl"
            >
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed mb-6">
                  FusionMarkt'ta alışveriş yapmak, sadece bir ürün satın almak anlamına gelmez. 
                  <span className="text-white font-medium"> Her parça, bir hikâyeyi, bir kültürü ve zanaatkârlığın zarafetini taşır.</span> 
                  Her alışveriş deneyimi, küresel anlatıya bir bağlantı kurmanızı sağlar.
                </p>
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed mb-6">
                  Sürdürülebilirlik ilkesine bağlı kalarak, sadece bugünün değil, geleceğin de 
                  ihtiyaçlarına yönelik çözümler sunmayı hedefliyoruz.
                </p>
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed">
                  FusionMarkt, benzersiz ürünleri ve müşteri odaklı hizmetleriyle bir alışveriş 
                  platformundan daha fazlasını sunar. <span className="text-[var(--fusion-primary)] font-semibold">Kalite, sürdürülebilirlik ve müşteri 
                  memnuniyeti</span> bizim için önceliktir. FusionMarkt ile alışveriş yapmak, kültürlerin 
                  buluştuğu bu yolculuğa katılmak demektir.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VALUES SECTION - Bento Grid
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--fusion-secondary)]/10 mb-6">
              <Zap className="w-8 h-8 text-[var(--fusion-secondary)]" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Vizyon ve Değerlerimiz
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              FusionMarkt olarak, müşterilerimize sadece bir pazar yeri değil, 
              aynı zamanda unutulmaz bir alışveriş deneyimi sunmayı hedefliyoruz.
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
              Kalitemizi her zaman ön planda tutarak, titizlikle seçilmiş ürünleri sunarken 
              uluslararası markalarla iş birliği yapıyoruz. Bu sayede müşterilerimize bir ürün değil, 
              <span className="text-white font-medium"> bir deneyim sunmayı garanti ediyoruz.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SOCIAL & CLIMATE SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--fusion-primary)]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--fusion-secondary)]/20 rounded-full blur-[120px]" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Social Section */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E1306C] to-[#F77737] flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Sosyal Etkileşim ve Takip</h3>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                FusionMarkt olarak dijital platformlarda etkin varlık göstererek müşterilerimizle 
                kesintisiz iletişim halindeyiz. Takipçilerimize özel avantajlar sunuyor, düzenli 
                içerik paylaşımlarıyla sektörel gelişmeleri ve ürün yeniliklerini anlık olarak aktarıyoruz.
              </p>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-8">
                Müşterilerimizin görüş ve önerilerini değerlendiriyor, bu doğrultuda hizmet 
                kalitemizi sürekli geliştiriyoruz.
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

            {/* Climate Section */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--fusion-success)] to-emerald-600 flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold">İklim Hareketi</h3>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                FusionMarkt olarak, ticari başarının ötesinde küresel sürdürülebilirlik hedeflerine 
                katkıda bulunmayı temel sorumluluğumuz olarak görüyoruz. Çevresel ayak izimizi 
                minimize etmek ve gelecek nesillere daha yaşanabilir bir dünya bırakmak için 
                kapsamlı bir sürdürülebilirlik stratejisi uyguluyoruz.
              </p>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                FusionMarkt olarak, sürdürülebilir bir gelecek için <span className="text-[var(--fusion-success)] font-semibold">teknoloji ve inovasyonu 
                birleştirerek</span>, çevresel sorumluluklarımızı yerine getirmeye ve toplumsal değer 
                yaratmaya devam edeceğiz.
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

