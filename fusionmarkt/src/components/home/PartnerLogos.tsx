"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tagline: string;
}

const partners: Partner[] = [
  {
    id: "ieetek",
    name: "IEETek",
    slug: "ieetek",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303842-jrbbwi-ieetek-logo-white.png",
    tagline: "Enerji Depolama Lideri",
  },
  {
    id: "rgp",
    name: "RGP Balls",
    slug: "rgp-balls",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303622-oblcj-rgp-logo-white.svg",
    tagline: "Hassas Bilya Üreticisi",
  },
  {
    id: "telesteps",
    name: "Telesteps",
    slug: "telesteps",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898302743-wbcw3c-telescopics-white.png",
    tagline: "Teleskopik Merdiven",
  },
  {
    id: "traffi",
    name: "Traffi Gloves",
    slug: "traffi",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765962257332-0dpfvn-traffi-black-logo.svg",
    tagline: "El Koruma Uzmanı",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// 3D Flip Card Component
function PartnerCard({ partner }: { partner: Partner }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      variants={itemVariants}
      className="perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <Link href={`/marka/${partner.slug}`} className="block">
        <motion.div
          className="relative w-full h-32 sm:h-36 lg:h-40"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Face - Logo */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
            <div className="absolute inset-0 border border-white/[0.1] rounded-2xl" />
            
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50 animate-gradient-x" />
            </div>
            
            {/* Glow Effect */}
            <motion.div 
              className="absolute inset-0 rounded-2xl"
              animate={{ 
                boxShadow: isFlipped 
                  ? "0 0 40px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)" 
                  : "0 0 0px rgba(16, 185, 129, 0), inset 0 0 0px rgba(16, 185, 129, 0)"
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Logo Container */}
            <div className="relative w-full h-full flex items-center justify-center p-6">
              <div className="relative w-full h-full max-w-[160px] max-h-[60px]">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  sizes="160px"
                  className="object-contain brightness-0 invert opacity-70 transition-all duration-300"
                  style={{ 
                    filter: isFlipped 
                      ? "brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.5))" 
                      : "brightness(0) invert(1)"
                  }}
                />
              </div>
            </div>
            
            {/* Floating Particles */}
            {isFlipped && (
              <>
                <motion.div
                  className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                  initial={{ x: "50%", y: "100%", opacity: 0 }}
                  animate={{ y: "-20%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  style={{ left: "20%" }}
                />
                <motion.div
                  className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  initial={{ x: "50%", y: "100%", opacity: 0 }}
                  animate={{ y: "-30%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                  style={{ left: "60%" }}
                />
                <motion.div
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ x: "50%", y: "100%", opacity: 0 }}
                  animate={{ y: "-25%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: 0.6 }}
                  style={{ left: "80%" }}
                />
              </>
            )}
          </div>

          {/* Back Face - Info */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-emerald-500/30 rounded-2xl" />
            
            {/* Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-lg font-bold text-white mb-1">{partner.name}</h3>
              <p className="text-xs text-white/70 mb-3">{partner.tagline}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 group">
                Keşfet
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function PartnerLogos() {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/5 to-black pointer-events-none" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.span 
            className="inline-block text-[11px] uppercase tracking-[0.3em] text-emerald-400/80 mb-4"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Güvenilir Markalar
          </motion.span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Çözüm Ortaklarımız
          </h2>
          <p className="mt-4 text-white/50 max-w-md mx-auto">
            Dünya lideri markalarla iş birliği yapıyoruz
          </p>
        </motion.div>

        {/* Partner Logos Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
