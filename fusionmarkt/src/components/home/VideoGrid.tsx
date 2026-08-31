"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";
import { useCarouselScroll } from "@/hooks/useCarouselScroll";

function ImagePlaceholderIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function YouTubePlayButton() {
  return (
    <svg width="68" height="48" viewBox="0 0 68 48">
      <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00" />
      <path d="M 45,24 27,14 27,34" fill="#fff" />
    </svg>
  );
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match ? match[1] : null;
}

/**
 * Panelde linke eklenen oynatıcı ayarları buradan geçiyor; altyazı ve başlangıç
 * saniyesi gibi tercihler yönetim panelinden belirlenebiliyor. Liste kapalı
 * tutuluyor ki `list` gibi parametreler gömme davranışını bozmasın.
 */
const FORWARDED_PLAYER_PARAMS = new Set([
  "cc_load_policy",
  "cc_lang_pref",
  "hl",
  "start",
  "end",
  "controls",
  "modestbranding",
  "iv_load_policy",
  "color",
  "fs",
  "disablekb",
]);

function buildEmbedUrl(youtubeUrl: string, videoId: string): string {
  const params = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0" });

  try {
    const source = new URL(youtubeUrl, "https://www.youtube.com");
    source.searchParams.forEach((value, key) => {
      if (FORWARDED_PLAYER_PARAMS.has(key)) params.set(key, value);
    });
  } catch {
    // Bozuk adreste varsayılan ayarlarla oynatılır.
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

interface VideoData {
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnail: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

/** wrapperStyle'daki kart arası boşluk; kaydırma adımı hesabında kullanılıyor. */
const CARD_GAP = 16;
const AUTO_SCROLL_INTERVAL_MS = 4500;

const MOCK_VIDEOS: VideoData[] = [
  { title: "İnceleme Videosu 1", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 2", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 3", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 4", youtubeUrl: "", thumbnail: null },
];

function VideoCard({
  video,
  onPlay,
}: {
  video: VideoData;
  onPlay: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(video.youtubeUrl);

  const thumb = video.thumbnail
    || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);

  const handlePlay = () => {
    if (ytId) {
      onPlay();
      setPlaying(true);
    }
  };

  return (
    <div className="video-grid-card">
      <div className="video-grid-thumbnail">
        {playing && ytId ? (
          <iframe
            src={buildEmbedUrl(video.youtubeUrl, ytId)}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="video-grid-iframe"
            title={video.title}
          />
        ) : (
          <>
            {thumb && (
              <Image
                src={thumb}
                // Başlık hemen altında h3 olarak görünüyor
                alt=""
                fill
                sizes="(max-width: 1023px) calc(100vw - 32px), 600px"
                className="video-grid-thumb-img"
              />
            )}

            {!thumb && (
              <>
                <ImagePlaceholderIcon size={36} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground-muted)" }}>16:9</span>
                <span style={{ fontSize: "10px", color: "var(--foreground-disabled)" }}>Video Thumbnail Eklenecek</span>
              </>
            )}

            <button
              className="video-grid-play"
              aria-label="Videoyu Oynat"
              type="button"
              onClick={handlePlay}
            >
              <YouTubePlayButton />
            </button>

            <div className="video-grid-overlay">
              <h3 className="video-grid-video-title">{video.title}</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface VideoGridProps {
  /** SSR'dan gelen videolar (page.tsx). undefined = SSR verisi yok, client fetch yapılır */
  initialVideos?: VideoData[];
}

function VideoCarouselRow({ title, videos }: { title: string; videos: VideoData[] }) {
  const {
    containerRef,
    wrapperRef,
    containerStyle,
    wrapperStyle,
    handlers,
    scrollBy,
  } = useCarouselScroll({ friction: 0.92 });

  const autoScrollStoppedRef = useRef(false);

  const stopAutoScroll = useCallback(() => {
    autoScrollStoppedRef.current = true;
  }, []);

  const getScrollStep = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    const slot = container.querySelector<HTMLElement>(".video-grid-slot");
    return slot
      ? slot.getBoundingClientRect().width + CARD_GAP
      : container.clientWidth;
  }, [containerRef]);

  const handleNavScroll = useCallback(
    (amount: number, smooth = true) => {
      stopAutoScroll();
      const step = getScrollStep();
      if (step > 0) scrollBy(amount > 0 ? step : -step, smooth);
    },
    [getScrollStep, scrollBy, stopAutoScroll]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || videos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    observer.observe(container);

    const timer = window.setInterval(() => {
      if (!isVisible || document.hidden || autoScrollStoppedRef.current) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 1) return;

      if (container.scrollLeft >= maxScroll - 2) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      container.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [containerRef, getScrollStep, videos.length]);

  return (
    <div className="video-grid-group">
      <div className="video-grid-header">
        <h2 className="video-grid-title">{title}</h2>
        {videos.length > 1 && (
          <CarouselNavButtons scrollBy={handleNavScroll} theme="neutral" />
        )}
      </div>

      <div
        ref={containerRef}
        style={containerStyle}
        aria-label={`${title} videoları`}
        onPointerDown={stopAutoScroll}
        onTouchStart={stopAutoScroll}
        onWheel={stopAutoScroll}
        onKeyDown={stopAutoScroll}
      >
        <div
          ref={wrapperRef}
          style={{ ...wrapperStyle, width: "100%" }}
          {...handlers}
          className="video-grid-track"
        >
          {videos.map((video, idx) => (
            <div key={video.id || idx} className="video-grid-slot">
              <VideoCard video={video} onPlay={stopAutoScroll} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VideoGrid({ initialVideos }: VideoGridProps) {
  const hasInitialData = initialVideos !== undefined;
  const [videos, setVideos] = useState<VideoData[]>(
    hasInitialData && initialVideos.length > 0 ? initialVideos : MOCK_VIDEOS
  );

  useEffect(() => {
    if (hasInitialData) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/homepage/videos");
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setVideos(data.items);
          }
        }
      } catch { /* fallback to mock */ }
    };
    fetchData();
  }, [hasInitialData]);

  const groups = Array.from(
    videos.reduce((grouped, video) => {
      const key = video.category?.id || "uncategorized";
      const existing = grouped.get(key);
      if (existing) {
        existing.videos.push(video);
      } else {
        grouped.set(key, {
          title: video.category?.name || "Sizden Gelenler",
          videos: [video],
        });
      }
      return grouped;
    }, new Map<string, { title: string; videos: VideoData[] }>())
  );

  return (
    <section className="video-grid-section">
      <div className="container">
        {groups.map(([categoryId, group]) => (
          <VideoCarouselRow key={categoryId} title={group.title} videos={group.videos} />
        ))}
      </div>
    </section>
  );
}
