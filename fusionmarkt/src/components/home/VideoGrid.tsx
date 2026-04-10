"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

interface VideoData {
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnail: string | null;
}

const MOCK_VIDEOS: VideoData[] = [
  { title: "İnceleme Videosu 1", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 2", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 3", youtubeUrl: "", thumbnail: null },
  { title: "İnceleme Videosu 4", youtubeUrl: "", thumbnail: null },
];

function VideoCard({ video }: { video: VideoData }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(video.youtubeUrl);

  const thumb = video.thumbnail
    || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);

  const handlePlay = () => {
    if (ytId) setPlaying(true);
  };

  return (
    <div className="video-grid-card">
      <div className="video-grid-thumbnail">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0`}
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
                alt={video.title}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="video-grid-thumb-img"
              />
            )}

            {!thumb && (
              <>
                <ImagePlaceholderIcon size={36} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground-muted)" }}>310 x 550 px</span>
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

export default function VideoGrid() {
  const [videos, setVideos] = useState<VideoData[]>(MOCK_VIDEOS);

  useEffect(() => {
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
  }, []);

  return (
    <section className="video-grid-section">
      <div className="container">
        <h2 className="video-grid-title">Sizlerden Gelenler</h2>

        <div className="video-grid-layout">
          {videos.map((video, idx) => (
            <VideoCard key={video.id || idx} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}
