/**
 * Blog Open Graph Image Generator
 *
 * Yazılarda kapak görseli kullanılmadığı için paylaşım kartı başlıktan
 * üretilir; aksi halde her yazı aynı jenerik site görselini paylaşırdı.
 */

import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import { categoryHue } from "@/lib/blog/accent";
import { calculateReadingTime } from "@/lib/blog/content";

export const runtime = "nodejs";
export const alt = "FusionMarkt Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let title = "FusionMarkt Blog";
  let category = "Blog";
  let readingTime = 0;
  let publishedAt = "";

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { title: true, category: true, content: true, publishedAt: true },
    });

    if (post) {
      title = post.title;
      category = post.category || "Blog";
      readingTime = calculateReadingTime(post.content);
      publishedAt = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
    }
  } catch (error) {
    console.error("OG Image blog fetch error:", error);
  }

  const hue = categoryHue(category);
  const accent = `hsl(${hue}, 72%, 62%)`;
  const displayTitle = title.length > 110 ? `${title.slice(0, 110)}…` : title;
  const fontSize = displayTitle.length > 70 ? 52 : displayTitle.length > 40 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          backgroundImage: `radial-gradient(circle at 12% 8%, hsla(${hue}, 70%, 45%, 0.35) 0%, transparent 55%), radial-gradient(circle at 92% 96%, rgba(227, 30, 36, 0.28) 0%, transparent 50%)`,
          padding: 72,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 8,
            backgroundColor: accent,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: accent,
              border: `2px solid ${accent}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: -1.5,
            }}
          >
            {displayTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#ffffff" }}>
            {siteConfig.url.replace("https://", "")}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(255, 255, 255, 0.55)" }}>
            {[publishedAt, readingTime ? `${readingTime} dk okuma` : ""]
              .filter(Boolean)
              .join("  ·  ")}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
