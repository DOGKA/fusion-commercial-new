'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface UseGSAPOptions {
  scope?: React.RefObject<HTMLElement | null>;
  dependencies?: unknown[];
}

/**
 * Custom hook for GSAP animations with proper cleanup
 * Handles ScrollTrigger refresh and cleanup automatically
 */
export function useGSAP(
  callback: (context: gsap.Context) => void,
  options: UseGSAPOptions = {}
) {
  const { scope, dependencies = [] } = options;
  const contextRef = useRef<gsap.Context | null>(null);

  useIsomorphicLayoutEffect(() => {
    // Create GSAP context for cleanup
    const ctx = gsap.context(() => {
      callback(gsap.context(() => {}));
    }, scope?.current || undefined);

    contextRef.current = ctx;

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    return () => {
      ctx.revert(); // Cleanup all GSAP animations
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return contextRef;
}

/**
 * Hook to sync Lenis with ScrollTrigger
 */
export function useLenisScrollTrigger() {
  useEffect(() => {
    // Lenis integration will be added when Lenis is initialized
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

export { gsap, ScrollTrigger };
