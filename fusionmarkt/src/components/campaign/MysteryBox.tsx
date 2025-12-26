/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import Confetti from './Confetti';
import CouponCard from './CouponCard';
import { Coupon } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MYSTERY BOX COMPONENT
// Premium kutu animasyonu - ışıltı, glow, perspektif efektleri
// ═══════════════════════════════════════════════════════════════════════════

interface MysteryBoxProps {
  id: string;
  coupon: Coupon;
  delay?: number;
  onOpen?: () => void; // Kutu açıldığında çağrılacak callback
}

type BoxState = 'idle' | 'shaking' | 'opening' | 'confetti' | 'reveal';

// Frame animation sequence
const ROTATION_FRAMES = [1, 2, 3, 4, 1, 2, 3, 4, 1];
const ROTATION_DURATIONS = [60, 70, 85, 100, 80, 95, 115, 140, 180];
const OPEN_FRAMES = [5, 6, 7, 8, 9];
const OPEN_FRAME_DURATIONS = [100, 120, 150, 180, 200];

// Sparkle positions for decoration
const SPARKLES = [
  { x: '10%', y: '15%', size: 4, delay: 0 },
  { x: '85%', y: '20%', size: 6, delay: 0.5 },
  { x: '15%', y: '75%', size: 5, delay: 1 },
  { x: '90%', y: '70%', size: 4, delay: 1.5 },
  { x: '50%', y: '5%', size: 5, delay: 0.3 },
  { x: '5%', y: '45%', size: 3, delay: 0.8 },
  { x: '95%', y: '50%', size: 4, delay: 1.2 },
];

export default function MysteryBox({ id, coupon, delay = 0, onOpen }: MysteryBoxProps) {
  const [state, setState] = useState<BoxState>('idle');
  const [currentFrame, setCurrentFrame] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse position for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  // Handle mouse move for 3D effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state !== 'idle' || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [state, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Handle box click - start animation sequence
  const handleClick = useCallback(() => {
    if (state !== 'idle') return;

    setState('shaking');
    let frameIndex = 0;

    const rotationAnimation = () => {
      if (frameIndex < ROTATION_FRAMES.length) {
        setCurrentFrame(ROTATION_FRAMES[frameIndex]);
        const duration = ROTATION_DURATIONS[frameIndex];
        frameIndex++;
        animationRef.current = setTimeout(rotationAnimation, duration);
      } else {
        setState('opening');
        frameIndex = 0;
        openAnimation();
      }
    };

    const openAnimation = () => {
      if (frameIndex < OPEN_FRAMES.length) {
        setCurrentFrame(OPEN_FRAMES[frameIndex]);
        const duration = OPEN_FRAME_DURATIONS[frameIndex];
        frameIndex++;
        animationRef.current = setTimeout(openAnimation, duration);
      } else {
        // Konfeti patla ve hemen kupon göster
        setShowConfetti(true);
        setState('reveal');
        setShowCoupon(true);
        
        // Claim API'sini çağır (context üzerinden)
        if (onOpen) {
          onOpen();
        }
      }
    };

    rotationAnimation();
  }, [state]);

  // Reset box to initial state
  const handleReset = useCallback(() => {
    setState('idle');
    setCurrentFrame(1);
    setShowConfetti(false);
    setShowCoupon(false);
  }, []);

  return (
    <div 
      className="relative w-full mx-auto"
      style={{ aspectRatio: '1' }}
    >
      {/* Outer glow - pulsing */}
      <motion.div
        className="absolute inset-[-20%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 184, 0, 0.15) 0%, rgba(227, 30, 36, 0.1) 30%, transparent 60%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner golden glow */}
      <motion.div
        className="absolute inset-[10%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 200, 50, 0.3) 0%, transparent 60%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isHovered ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isHovered ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Sparkle particles */}
      {state === 'idle' && SPARKLES.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: delay * 0.1 + sparkle.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="rgba(255, 220, 100, 0.9)"
            />
          </svg>
        </motion.div>
      ))}


      {/* Mystery Box */}
      <AnimatePresence mode="wait">
        {state !== 'reveal' ? (
          <motion.div
            ref={boxRef}
            key="box"
            className="relative w-full h-full cursor-pointer"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: [0, -8, 0], // Floating animation
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.3,
              y: -50,
              transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            }}
            transition={{ 
              delay: delay * 0.1,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              y: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            }}
            style={{
              perspective: 1000,
              transformStyle: 'preserve-3d',
              rotateX: state === 'idle' ? rotateX : 0,
              rotateY: state === 'idle' ? rotateY : 0,
            }}
            whileHover={state === 'idle' ? {
              scale: 1.08,
              transition: { duration: 0.3 }
            } : {}}
          >
            {/* 3D Shadow */}
            <motion.div
              className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[15px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
              animate={{
                scaleX: isHovered ? 0.7 : [1, 0.9, 1],
                opacity: isHovered ? 0.2 : [0.4, 0.3, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* BACK half of ring - z-index -1, behind the box */}
            {state === 'shaking' && (
              <motion.div
                className="absolute inset-[-50%] pointer-events-none"
                style={{ 
                  zIndex: -1,
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    transformStyle: 'preserve-3d',
                    rotateX: 72,
                  }}
                  animate={{ rotateZ: [0, 360] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                >
                  {/* Outer glow ring - back */}
                  <div 
                    className="absolute inset-[15%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderBottom: '8px solid rgba(255, 180, 0, 0.15)',
                      borderLeft: '8px solid rgba(255, 180, 0, 0.08)',
                      borderRight: '8px solid rgba(255, 180, 0, 0.08)',
                      borderTop: '8px solid transparent',
                      filter: 'blur(4px)',
                    }}
                  />
                  {/* Main ring - back */}
                  <div 
                    className="absolute inset-[18%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderBottom: '5px solid rgba(255, 200, 50, 0.35)',
                      borderLeft: '5px solid rgba(255, 200, 50, 0.15)',
                      borderRight: '5px solid rgba(255, 200, 50, 0.15)',
                      borderTop: '5px solid transparent',
                      boxShadow: '0 0 20px 4px rgba(255, 180, 0, 0.1)',
                      filter: 'blur(1px)',
                    }}
                  />
                  {/* Inner detail ring - back */}
                  <div 
                    className="absolute inset-[21%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderBottom: '2px solid rgba(255, 220, 100, 0.25)',
                      borderLeft: '2px solid rgba(255, 220, 100, 0.1)',
                      borderRight: '2px solid rgba(255, 220, 100, 0.1)',
                      borderTop: '2px solid transparent',
                    }}
                  />
                  {/* Back sparkles - scattered */}
                  {[...Array(10)].map((_, i) => {
                    const angle = (160 + i * 22) * (Math.PI / 180);
                    const radius = 32 + (i % 3) * 3;
                    return (
                      <motion.div
                        key={`back-${i}`}
                        className="absolute rounded-full"
                        style={{
                          width: 4 + (i % 2) * 2,
                          height: 4 + (i % 2) * 2,
                          left: `${50 + Math.cos(angle) * radius}%`,
                          top: `${50 + Math.sin(angle) * radius}%`,
                          transform: 'translate(-50%, -50%)',
                          background: 'radial-gradient(circle, rgba(255, 220, 100, 0.7) 0%, transparent 100%)',
                          boxShadow: '0 0 6px 2px rgba(255, 200, 50, 0.4)',
                        }}
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scale: [0.7, 1.1, 0.7],
                        }}
                        transition={{
                          duration: 0.2 + i * 0.02,
                          delay: i * 0.03,
                          repeat: Infinity,
                        }}
                      />
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* Box Image - z-index 1 */}
            <div className="relative w-full h-full" style={{ zIndex: 1 }}>
              <Image
                src={`/box-frames/box-${currentFrame}.png`}
                alt="Mystery Box"
                fill
                className="object-contain"
                style={{
                  filter: isHovered 
                    ? 'drop-shadow(0 0 30px rgba(255, 200, 50, 0.5)) drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                    : 'drop-shadow(0 0 20px rgba(255, 200, 50, 0.3)) drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                }}
                priority
              />
            </div>

            {/* FRONT half of ring - z-index 10, in front of the box */}
            {state === 'shaking' && (
              <motion.div
                className="absolute inset-[-50%] pointer-events-none"
                style={{ 
                  zIndex: 10,
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    transformStyle: 'preserve-3d',
                    rotateX: 72,
                  }}
                  animate={{ rotateZ: [0, 360] }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                >
                  {/* Outer glow ring - front */}
                  <div 
                    className="absolute inset-[15%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderTop: '10px solid rgba(255, 200, 50, 0.25)',
                      borderLeft: '10px solid rgba(255, 180, 0, 0.12)',
                      borderRight: '10px solid rgba(255, 180, 0, 0.12)',
                      borderBottom: '10px solid transparent',
                      filter: 'blur(3px)',
                    }}
                  />
                  {/* Main ring - front */}
                  <div 
                    className="absolute inset-[18%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderTop: '6px solid rgba(255, 220, 100, 0.8)',
                      borderLeft: '6px solid rgba(255, 200, 50, 0.4)',
                      borderRight: '6px solid rgba(255, 200, 50, 0.4)',
                      borderBottom: '6px solid transparent',
                      boxShadow: '0 0 35px 10px rgba(255, 200, 50, 0.35), 0 0 15px 5px rgba(255, 220, 100, 0.2)',
                    }}
                  />
                  {/* Secondary ring - front */}
                  <div 
                    className="absolute inset-[21%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderTop: '3px solid rgba(255, 255, 255, 0.7)',
                      borderLeft: '3px solid rgba(255, 220, 100, 0.35)',
                      borderRight: '3px solid rgba(255, 220, 100, 0.35)',
                      borderBottom: '3px solid transparent',
                      boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.25)',
                    }}
                  />
                  {/* Inner fine ring - front */}
                  <div 
                    className="absolute inset-[24%] rounded-full"
                    style={{
                      background: 'transparent',
                      borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                      borderBottom: '1px solid transparent',
                    }}
                  />
                  {/* Front sparkles - brighter and more */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (-20 + i * 20) * (Math.PI / 180);
                    const radius = 30 + (i % 4) * 3;
                    const size = 5 + (i % 3) * 3;
                    return (
                      <motion.div
                        key={`front-${i}`}
                        className="absolute rounded-full"
                        style={{
                          width: size,
                          height: size,
                          left: `${50 + Math.cos(angle) * radius}%`,
                          top: `${50 + Math.sin(angle) * radius}%`,
                          transform: 'translate(-50%, -50%)',
                          background: i % 3 === 0 
                            ? 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 30%, transparent 100%)'
                            : 'radial-gradient(circle, rgba(255, 240, 150, 1) 0%, rgba(255, 200, 50, 0.8) 40%, transparent 100%)',
                          boxShadow: i % 3 === 0 
                            ? '0 0 15px 5px rgba(255, 255, 255, 0.9)'
                            : '0 0 12px 4px rgba(255, 220, 100, 0.7)',
                        }}
                        animate={{
                          opacity: [0.6, 1, 0.6],
                          scale: [0.8, 1.5, 0.8],
                        }}
                        transition={{
                          duration: 0.15 + (i % 3) * 0.05,
                          delay: i * 0.025,
                          repeat: Infinity,
                        }}
                      />
                    );
                  })}
                  {/* Extra bright star sparkles */}
                  {[0, 60, 120].map((baseAngle, i) => {
                    const angle = baseAngle * (Math.PI / 180);
                    return (
                      <motion.div
                        key={`star-${i}`}
                        className="absolute"
                        style={{
                          width: 12,
                          height: 12,
                          left: `${50 + Math.cos(angle) * 33}%`,
                          top: `${50 + Math.sin(angle) * 33}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        animate={{
                          opacity: [0.7, 1, 0.7],
                          scale: [0.9, 1.3, 0.9],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 0.3,
                          delay: i * 0.1,
                          repeat: Infinity,
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path
                            d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
                            fill="rgba(255, 255, 255, 0.95)"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(255, 220, 100, 1))' }}
                          />
                        </svg>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Center glow during spin */}
                <motion.div
                  className="absolute left-1/2 top-1/2 w-[40%] h-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 220, 100, 0.5) 0%, rgba(255, 180, 0, 0.2) 50%, transparent 70%)',
                    filter: 'blur(12px)',
                    zIndex: -1,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            )}


            {/* Edge glow on hover */}
            {isHovered && state === 'idle' && (
              <motion.div
                className="absolute inset-[15%] rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  boxShadow: 'inset 0 0 30px rgba(255, 200, 50, 0.3)',
                }}
              />
            )}

          </motion.div>
        ) : (
          /* Coupon Reveal */
          <motion.div
            key="coupon"
            className="w-full h-full flex items-center justify-center pt-8"
            initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <CouponCard coupon={coupon} onClose={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti explosion */}
      {showConfetti && boxRef.current && (
        <Confetti
          isActive={showConfetti}
          originX={(boxRef.current.getBoundingClientRect().left + boxRef.current.getBoundingClientRect().width / 2) / window.innerWidth}
          originY={(boxRef.current.getBoundingClientRect().top + boxRef.current.getBoundingClientRect().height * 0.4) / window.innerHeight}
          particleCount={350}
          onComplete={() => setShowConfetti(false)}
        />
      )}
    </div>
  );
}
