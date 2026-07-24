"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface VideoBannerData {
  videoType: string;
  videoUrl: string | null;
  title: string | null;
  subtitle: string | null;
  btnText: string | null;
  btnLink: string | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match ? match[1] : null;
}

interface VideoBannerProps {
  /** SSR'dan gelen veri (page.tsx). undefined = SSR verisi yok, client fetch yapılır */
  initialItem?: VideoBannerData | null;
}

export default function VideoBanner({ initialItem }: VideoBannerProps) {
  const hasInitialData = initialItem !== undefined;
  const [data, setData] = useState<VideoBannerData | null>(initialItem ?? null);
  const [loaded, setLoaded] = useState(hasInitialData);

  // YouTube iframe/video ağır olduğu için sayfa açılışında yüklenmez;
  // banner viewport'a yaklaşınca mount edilir (INP/ana thread optimizasyonu).
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (hasInitialData) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/video-banner");
        if (res.ok) {
          const json = await res.json();
          if (json.item) setData(json.item);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    };
    fetchData();
  }, [hasInitialData]);

  const hasVideo = loaded && !!data?.videoUrl;

  useEffect(() => {
    if (!hasVideo || isInView) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasVideo, isInView]);

  if (!hasVideo || !data?.videoUrl) {
    return null;
  }

  const ytId = data.videoType === "youtube" ? getYouTubeId(data.videoUrl) : null;
  const hasOverlay = data.title || data.subtitle || data.btnText;

  return (
    <section ref={sectionRef} className="py-6 lg:py-8">
      <div className="container">
        <div className="video-banner-wrapper">
          {ytId ? (
            <div className="video-banner-yt-container">
              {isInView ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&showinfo=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&fs=0&vq=hd1080`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  className="video-banner-yt-iframe"
                  title="Video Banner"
                />
              ) : (
                // Facade: iframe mount edilene kadar video kapak görseli
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
                  alt={data.title || "Video Banner"}
                  loading="lazy"
                  decoding="async"
                  className="video-banner-yt-iframe"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          ) : (
            isInView ? (
              <video autoPlay muted loop playsInline>
                <source src={data.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div style={{ width: "100%", aspectRatio: "16 / 9", backgroundColor: "var(--background-tertiary)" }} />
            )
          )}

          {hasOverlay && (
            <div className="video-banner-overlay">
              <div className="video-banner-overlay-content">
                {data.title && <h2 className="video-banner-title">{data.title}</h2>}
                {data.subtitle && <p className="video-banner-subtitle">{data.subtitle}</p>}
                {data.btnText && data.btnLink && (
                  <Link href={data.btnLink} className="video-banner-btn">
                    {data.btnText}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
