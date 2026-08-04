/**
 * FusionMarkt Robots.txt
 * Arama motorları ve yapay zekâ erişim botları için crawl kuralları
 */

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const privatePaths = [
  "/api/",
  "/checkout/",
  "/favori/",
  "/hesabim/",
  "/order-confirmation",
  "/resetpassword",
  "/sifremi-unuttum",
  "/sozlesmeler/",
  "/storage/invoices/",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        // Arama ve kullanıcı isteğiyle çalışan LLM erişim botları.
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/llms.txt"],
        disallow: privatePaths,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/media/", "/storage/users/", "/_next/image"],
        disallow: ["/storage/invoices/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
