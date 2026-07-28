/**
 * OG kartını tarayıcı/DB olmadan PNG'ye basar; paylaşım görselinin
 * görsel revizyonlarını deploy beklemeden kontrol etmek için.
 *
 * Kullanım: node scripts/og-preview.mjs
 */

import { writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const size = { width: 1200, height: 630 };

const sample = {
  title: "Solar Kablo ve Konnektör Rehberi: MC4, XT60, Anderson ve Kablo Kesiti",
  category: "Solar",
  publishedAt: "27 Temmuz 2026",
  readingTime: 9,
  siteUrl: "fusionmarkt.com",
};

const hue = 220;
const accent = `hsl(${hue}, 72%, 62%)`;
const displayTitle =
  sample.title.length > 110 ? `${sample.title.slice(0, 110)}…` : sample.title;
const fontSize =
  displayTitle.length > 70 ? 52 : displayTitle.length > 40 ? 62 : 72;

const tree = h(
  "div",
  {
    style: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#0a0a0a",
      backgroundImage: `radial-gradient(circle at 12% 8%, hsla(${hue}, 70%, 45%, 0.35) 0%, transparent 55%), radial-gradient(circle at 92% 96%, rgba(227, 30, 36, 0.28) 0%, transparent 50%)`,
      padding: 72,
      position: "relative",
    },
  },
  h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 16 } },
    h(
      "div",
      {
        style: {
          display: "flex",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#ffffff",
          border: `2px solid ${accent}`,
          borderRadius: 999,
          padding: "8px 20px",
        },
      },
      sample.category
    )
  ),
  h(
    "div",
    { style: { flex: 1, display: "flex", alignItems: "center" } },
    h(
      "div",
      {
        style: {
          fontSize,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.15,
          letterSpacing: -1.5,
        },
      },
      displayTitle
    )
  ),
  h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(255, 255, 255, 0.14)",
        paddingTop: 28,
      },
    },
    h(
      "div",
      { style: { display: "flex", fontSize: 26, fontWeight: 600, color: "#ffffff" } },
      sample.siteUrl
    ),
    h(
      "div",
      { style: { display: "flex", fontSize: 24, color: "rgba(255, 255, 255, 0.55)" } },
      `${sample.publishedAt}  ·  ${sample.readingTime} dk okuma`
    )
  )
);

const response = new ImageResponse(tree, { ...size });
const buffer = Buffer.from(await response.arrayBuffer());
await writeFile(new URL("./og-preview.png", import.meta.url), buffer);
console.log("OG preview written:", buffer.length, "bytes");
