/**
 * FusionMarkt Robots.txt
 * Arama motorları için crawl kuralları
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/hesabim/",
          "/checkout/",
          "/favori/",
          "/order-confirmation/",
          "/resetpassword/",
          "/sifremi-unuttum/",
          "/_next/",
          "/storage/",
        ],
      },
      // Googlebot için özel kurallar
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/hesabim/",
          "/checkout/",
          "/favori/",
          "/order-confirmation/",
          "/resetpassword/",
          "/sifremi-unuttum/",
        ],
      },
      // Googlebot-Image için
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/media/", "/storage/users/"],
        disallow: ["/storage/invoices/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

