"use client";

import { useState, useEffect } from "react";

interface VideoBannerData {
  videoType: string;
  videoUrl: string | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match ? match[1] : null;
}

export default function VideoBanner() {
  const [data, setData] = useState<VideoBannerData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
  }, []);

  if (!loaded || !data?.videoUrl) {
    return null;
  }

  const ytId = data.videoType === "youtube" ? getYouTubeId(data.videoUrl) : null;

  return (
    <section className="py-6 lg:py-8">
      <div className="container">
        <div className="video-banner-wrapper">
          {ytId ? (
            <div className="video-banner-yt-container">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&showinfo=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&fs=0&vq=hd1080`}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
                className="video-banner-yt-iframe"
                title="Video Banner"
              />
            </div>
          ) : (
            <video autoPlay muted loop playsInline>
              <source src={data.videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </section>
  );
}
