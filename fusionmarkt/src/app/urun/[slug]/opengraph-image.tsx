/**
 * Product Open Graph Image Generator
 * Her ürün için dinamik OG image oluşturur
 */

import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = "Ürün - FusionMarkt";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  // Ürün bilgisini al
  let productName = "Ürün Detayı";
  let brandName = "FusionMarkt";
  let price = "";
  let comparePrice = "";
  let hasDiscount = false;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (product) {
      productName = product.name || "Ürün Detayı";
      // Brand name from product's brand field if available
      brandName = (product as { brand?: string }).brand || "FusionMarkt";
      const priceNum = product.price ? Number(product.price) : null;
      const comparePriceNum = product.comparePrice ? Number(product.comparePrice) : null;
      price = priceNum ? `₺${priceNum.toLocaleString("tr-TR")}` : "";
      comparePrice = comparePriceNum ? `₺${comparePriceNum.toLocaleString("tr-TR")}` : "";
      hasDiscount = !!(comparePriceNum && priceNum && comparePriceNum > priceNum);
    }
  } catch (e) {
    // Prisma edge runtime'da çalışmayabilir, fallback
    console.error("OG Image product fetch error:", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
          padding: 60,
        }}
      >
        {/* Top: Brand & Site */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#8B5CF6",
              fontWeight: 600,
            }}
          >
            {brandName}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            {siteConfig.url.replace("https://", "")}
          </div>
        </div>

        {/* Center: Product Name */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {productName.length > 60 ? productName.slice(0, 60) + "..." : productName}
          </div>
        </div>

        {/* Bottom: Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {price && (
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {price}
            </div>
          )}
          {hasDiscount && comparePrice && (
            <div
              style={{
                fontSize: 28,
                color: "rgba(255, 255, 255, 0.4)",
                textDecoration: "line-through",
              }}
            >
              {comparePrice}
            </div>
          )}
        </div>

        {/* Badge */}
        {hasDiscount && (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 40,
              backgroundColor: "#EF4444",
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 8,
            }}
          >
            İNDİRİM
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}

