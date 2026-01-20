'use client';

import { useEffect, useRef } from 'react';
import { gsap } from './hooks/useGSAP';

const galleryImages = [
  '/sh4000/sh4000-camp-scene.png',
  '/sh4000/sh4000-caravan-scene.png',
  '/sh4000/sh4000-chicken-scene.png',
  '/sh4000/sh4000-yatch-scene.png',
];

const galleryAlts = [
  'SH4000 kamp kullanım sahnesi',
  'SH4000 karavan kullanım sahnesi',
  'SH4000 çiftlik kullanım sahnesi',
  'SH4000 yat kullanım sahnesi',
];

export default function UseGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();
      let tween: gsap.core.Tween | null = null;

      const setupLoop = () => {
        const singleWidth = track.scrollWidth / 2;
        if (!singleWidth) return;

        const wrapX = gsap.utils.wrap(-singleWidth, 0);
        tween?.kill();
        gsap.set(track, { x: 0 });
        tween = gsap.to(track, {
          x: -singleWidth,
          duration: 18,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: (x) => `${wrapX(parseFloat(x))}px`,
          },
        });
      };

      mm.add('(max-width: 767px)', () => {
        setupLoop();
        const observer = new ResizeObserver(() => setupLoop());
        observer.observe(track);

        return () => {
          observer.disconnect();
          tween?.kill();
          tween = null;
        };
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background py-12 md:py-16 overflow-hidden"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
    >
      <div className="px-6">
        {/* Mobile - auto horizontal loop */}
        <div
          ref={trackRef}
          className="use-gallery-mobile flex flex-nowrap items-center gap-6 md:hidden"
          style={{ willChange: 'transform' }}
        >
          {[...galleryImages, ...galleryImages].map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="shrink-0 w-[160px] sm:w-[200px] aspect-[9/16] rounded-[24px] overflow-hidden bg-background-secondary/50 shadow-lg"
            >
              <img
                src={src}
                alt={galleryAlts[index % galleryAlts.length]}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Desktop - static centered */}
        <div className="use-gallery-desktop hidden md:flex items-center justify-center gap-8">
          {galleryImages.map((src, index) => (
            <div
              key={src}
              className="shrink-0 w-[230px] lg:w-[260px] aspect-[9/16] rounded-[24px] overflow-hidden bg-background-secondary/50 shadow-lg"
            >
              <img
                src={src}
                alt={galleryAlts[index]}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 768px) {
          .use-gallery-mobile {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .use-gallery-desktop {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
