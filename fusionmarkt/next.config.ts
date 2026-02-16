import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT FILE TRACING ROOT (Fix monorepo lockfile warning)
  // ═══════════════════════════════════════════════════════════════════════════
  outputFileTracingRoot: path.join(__dirname, "../"),

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER EXTERNAL PACKAGES
  // ═══════════════════════════════════════════════════════════════════════════
  // Packages that should not be bundled by webpack (run on server only)
  serverExternalPackages: ["iyzipay"],

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  images: {
    // Disable image optimization in development if S3 images timeout
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // AWS S3 - Frankfurt (eu-central-1)
      {
        protocol: "https",
        hostname: "fusionmarkt.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
      // AWS S3 - Stockholm (eu-north-1) - mybucketajax
      {
        protocol: "https",
        hostname: "mybucketajax.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      // Cloudflare CDN (if using Cloudflare Images or R2)
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
        pathname: "/**",
      },
      // Same domain
      {
        protocol: "https",
        hostname: "fusionmarkt.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.fusionmarkt.com",
        pathname: "/**",
      },
      // IEETek product images
      {
        protocol: "https",
        hostname: "ieetek.com",
        pathname: "/**",
      },
    ],
    // Next.js 16+ için özel kalite değerleri (next/image quality prop)
    // RelatedProductCard gibi yerlerde quality={85} kullanıyoruz.
    qualities: [60, 75, 85, 90],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY & CACHE HEADERS
  // ═══════════════════════════════════════════════════════════════════════════
  async headers() {
    return [
      // Security headers - tüm sayfalar
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // ═══════════════════════════════════════════════════════════════════════
      // CACHE HEADERS - Cloudflare & Browser Caching
      // ═══════════════════════════════════════════════════════════════════════
      // Public API endpoints - 1 saat CDN cache, 24 saat stale-while-revalidate
      {
        source: "/api/public/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Ürün detay API - 30 dakika cache
      {
        source: "/api/public/products/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        ],
      },
      // Kategori API - 1 saat cache
      {
        source: "/api/public/categories/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Banner/Slider API - 2 saat cache
      {
        source: "/api/public/banners",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=7200, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/public/sliders",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=7200, stale-while-revalidate=86400",
          },
        ],
      },
      // Settings API - 6 saat cache
      {
        source: "/api/public/settings",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      },
      // Statik dosyalar (fonts, icons) - 1 yıl cache
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Next.js static assets - 1 yıl cache
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // SEO: Trailing slash & URL normalization
  // ═══════════════════════════════════════════════════════════════════════════
  trailingSlash: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // SEO: Redirects (www → non-www canonical)
  // ═══════════════════════════════════════════════════════════════════════════
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.fusionmarkt.com" }],
        destination: "https://fusionmarkt.com/:path*",
        permanent: true,
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  // Disable CSS optimization that causes preload warnings
  experimental: {
    optimizeCss: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBPACK CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  webpack: (config, { isServer }) => {
    // Fix for CSS preload warnings - disable preload hints for CSS
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Combine all CSS into fewer chunks to reduce preload issues
          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            enforce: true,
            priority: 20,
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
