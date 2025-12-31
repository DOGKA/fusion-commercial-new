/**
 * Default Open Graph Image Generator
 * Her sayfa için otomatik OG image oluşturur
 */

import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";

export const alt = "FusionMarkt - Taşınabilir Güç Kaynakları";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            FusionMarkt
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Taşınabilir Güç Kaynakları & Enerji Çözümleri
        </div>

        {/* Brands */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 60,
            opacity: 0.6,
          }}
        >
          {["EcoFlow", "Bluetti", "Jackery"].map((brand) => (
            <div
              key={brand}
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.7)",
                padding: "8px 24px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 8,
              }}
            >
              {brand}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <span>{siteConfig.url.replace("https://", "")}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

