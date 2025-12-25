'use client';

import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN BACKGROUND
// Premium canvas/scene hissi veren arka plan - parallax, glow, grain efektleri
// Performans için lazy load ve intersection observer ile optimize
// ═══════════════════════════════════════════════════════════════════════════

interface FloatingOrbProps {
  delay: number;
  duration: number;
  size: number;
  color: string;
  initialX: string;
  initialY: string;
}

const FloatingOrb = memo(function FloatingOrb({
  delay,
  duration,
  size,
  color,
  initialX,
  initialY,
}: FloatingOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: initialX,
        top: initialY,
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -40, 20, -30, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
});

// Grain overlay - SVG noise texture
const GrainOverlay = memo(function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
});

// Grid overlay - subtle grid pattern
const GridOverlay = memo(function GridOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.02] z-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
});

function CampaignBackground() {
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load - sayfa yüklenince animasyonları başlat
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    // İlk render - basit gradient arka plan
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />

      {/* Radial glow - center */}
      <motion.div
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating orbs */}
      <FloatingOrb
        delay={0}
        duration={20}
        size={400}
        color="rgba(16, 185, 129, 0.15)"
        initialX="10%"
        initialY="20%"
      />
      <FloatingOrb
        delay={2}
        duration={25}
        size={300}
        color="rgba(59, 130, 246, 0.1)"
        initialX="70%"
        initialY="60%"
      />
      <FloatingOrb
        delay={4}
        duration={18}
        size={350}
        color="rgba(168, 85, 247, 0.08)"
        initialX="80%"
        initialY="10%"
      />
      <FloatingOrb
        delay={1}
        duration={22}
        size={250}
        color="rgba(236, 72, 153, 0.06)"
        initialX="20%"
        initialY="70%"
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Grid overlay */}
      <GridOverlay />

      {/* Grain texture */}
      <GrainOverlay />
    </div>
  );
}

export default memo(CampaignBackground);
