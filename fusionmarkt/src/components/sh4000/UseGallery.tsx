'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';

const galleryImages = [
  '/sh4000/sh4000-camp-scene.webp',
  '/sh4000/sh4000-caravan-scene.webp',
  '/sh4000/sh4000-chicken-scene.webp',
  '/sh4000/sh4000-yatch-scene.webp',
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
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [isInView, setIsInView] = useState(false);

  // IntersectionObserver ile görünürlük kontrolü
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Loop pause/play kontrolü
  useEffect(() => {
    if (!tweenRef.current) return;
    if (isInView) {
      tweenRef.current.play();
    } else {
      tweenRef.current.pause();
    }
  }, [isInView]);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      const setupLoop = () => {
        const singleWidth = track.scrollWidth / 2;
        if (!singleWidth) return;

        const wrapX = gsap.utils.wrap(-singleWidth, 0);
        tweenRef.current?.kill();
        gsap.set(track, { x: 0 });
        tweenRef.current = gsap.to(track, {
          x: -singleWidth,
          duration: 18,
          ease: 'none',
          repeat: -1,
          paused: true, // Başlangıçta durdur, isInView ile kontrol et
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
          tweenRef.current?.kill();
          tweenRef.current = null;
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
              className="relative shrink-0 w-[160px] sm:w-[200px] aspect-[9/16] rounded-[24px] overflow-hidden bg-background-secondary/50 shadow-lg"
            >
              <Image
                src={src}
                alt={galleryAlts[index % galleryAlts.length]}
                fill
                sizes="(min-width: 640px) 200px, 160px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Desktop - static centered */}
        <div className="use-gallery-desktop hidden md:flex items-center justify-center gap-8">
          {galleryImages.map((src, index) => (
            <div
              key={src}
              className="relative shrink-0 w-[230px] lg:w-[260px] aspect-[9/16] rounded-[24px] overflow-hidden bg-background-secondary/50 shadow-lg"
            >
              <Image
                src={src}
                alt={galleryAlts[index]}
                fill
                sizes="(min-width: 1024px) 260px, 230px"
                className="object-cover"
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
