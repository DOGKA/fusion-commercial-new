'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI COMPONENT
// Canvas-based konfeti patlaması - kutunun merkezinden fırlar, etrafa saçılır
// Inspired by confettis-p5-js - intense burst effect
// ═══════════════════════════════════════════════════════════════════════════

interface ConfettiProps {
  isActive: boolean;
  originX?: number; // 0-1 relative position
  originY?: number; // 0-1 relative position
  particleCount?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'triangle';
  opacity: number;
  gravity: number;
  friction: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleFactor: number;
  scale: number;
}

// Theme colors - Fusionmarkt brand colors + festive colors
const CONFETTI_COLORS = [
  '#E31E24', // Fusion red
  '#FFB800', // Fusion gold
  '#FF4449', // Light red
  '#FFC933', // Light gold
  '#22C55E', // Success green
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#A855F7', // Purple
  '#F97316', // Orange
  '#FBBF24', // Yellow
  '#FFFFFF', // White
  '#10B981', // Emerald
];

export default function Confetti({
  isActive,
  originX = 0.5,
  originY = 0.4, // Slightly above center for box opening
  particleCount = 350, // Much more particles!
  onComplete,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Create initial particles with explosive burst from center
  const createParticles = useCallback((canvas: HTMLCanvasElement) => {
    const particles: Particle[] = [];
    const centerX = canvas.width * originX;
    const centerY = canvas.height * originY;

    for (let i = 0; i < particleCount; i++) {
      // Full 360° burst with emphasis on upward and outward
      const angle = Math.random() * Math.PI * 2;
      // Strong initial burst speed - varies for natural look
      const speed = Math.random() * 20 + 8;
      
      // Extra upward bias for initial burst
      const upwardBias = -Math.random() * 15;

      particles.push({
        x: centerX + (Math.random() - 0.5) * 30,
        y: centerY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed + upwardBias,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        shape: ['rect', 'circle', 'triangle'][Math.floor(Math.random() * 3)] as 'rect' | 'circle' | 'triangle',
        opacity: 1,
        gravity: 0.12 + Math.random() * 0.08,
        friction: 0.985 + Math.random() * 0.01,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        wobbleFactor: Math.random() * 0.08 + 0.02,
        scale: 0.5 + Math.random() * 0.5,
      });
    }

    return particles;
  }, [originX, originY, particleCount]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const elapsed = timestamp - startTimeRef.current;
    let activeParticles = 0;

    particlesRef.current.forEach((p) => {
      // Apply physics
      p.vy += p.gravity; // Gravity pulls down
      p.vx *= p.friction;
      p.vy *= p.friction;

      // Wobble effect (like p5.js - air resistance simulation)
      p.wobble += p.wobbleSpeed;
      const wobbleX = Math.sin(p.wobble) * p.wobbleFactor * Math.abs(p.vy);
      p.vx += wobbleX;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Rotation based on velocity
      p.rotation += p.rotationSpeed;

      // Scale oscillation (like p5.js etape effect)
      p.scale = 0.5 + Math.sin(p.vy * 20) * 0.3;

      // Fade out gradually after initial burst
      if (elapsed > 1500) {
        p.opacity = Math.max(0, p.opacity - 0.015);
      }

      // Draw particle if still visible
      if (p.opacity > 0 && p.y < canvas.height + 100 && p.y > -100 && p.x > -100 && p.x < canvas.width + 100) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(1, p.scale);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          // Stretched rectangle (ribbon-like confetti)
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // Continue animation if particles are still active
    if (activeParticles > 0 && elapsed < 5000) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }, [onComplete]);

  // Start/stop animation based on isActive
  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to cover the entire viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    particlesRef.current = createParticles(canvas);
    startTimeRef.current = performance.now();

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, createParticles, animate]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-[100]"
          style={{ width: '100vw', height: '100vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </AnimatePresence>
  );
}
