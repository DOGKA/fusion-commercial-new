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
    minimumCacheTTL: 86400,
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
      // YouTube thumbnails
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
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
      // AI SEO Bot tarafından eklenen redirect'ler (2026-03-17)
      {
        source: "/urunler",
        destination: "/magaza",
        permanent: true,
      },

      // www -> non-www canonical
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.fusionmarkt.com" }],
        destination: "https://fusionmarkt.com/:path*",
        permanent: true,
      },

      // Eski kategori slug'lari -> aktif slug'lar
      {
        source: "/kategori/solar-panel",
        destination: "/kategori/gunes-panelleri",
        permanent: true,
      },
      {
        source: "/kategori/is-guvenligi-eldiveni",
        destination: "/kategori/endustriyel-eldivenler",
        permanent: true,
      },
      {
        source: "/kategori/yalitkan-merdiven",
        destination: "/kategori/teleskopik-merdivenler",
        permanent: true,
      },

      // 404 veren eski icerik sayfalari -> ilgili aktif sayfalar
      {
        source: "/ups-sistemleri",
        destination: "/kategori/tasinabilir-guc-kaynaklari",
        permanent: true,
      },
      {
        source: "/surdurulebilir-enerji",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/ev-yedekleme-sistemleri",
        destination: "/kategori/tasinabilir-guc-kaynaklari",
        permanent: true,
      },
      {
        source: "/lifepo4-batarya",
        destination: "/kategori/tasinabilir-guc-kaynaklari",
        permanent: true,
      },
      {
        source: "/gunes-paneli",
        destination: "/kategori/gunes-panelleri",
        permanent: true,
      },
      {
        source: "/sp200-gunes-paneli",
        destination: "/kategori/gunes-panelleri",
        permanent: true,
      },
      {
        source: "/gunes-enerjisi-sistemleri",
        destination: "/kategori/gunes-panelleri",
        permanent: true,
      },
      {
        source: "/kamp-ekipmanlari",
        destination: "/magaza",
        permanent: true,
      },

      // Eski urun URL'leri -> aktif sayfalar
      {
        source: "/urun/5120wh-tasinabilir-elektrik-guc-kaynagi",
        destination: "/sh4000",
        permanent: true,
      },
      {
        source: "/urun/1008wh-tasinabilir-guc-istasyonu",
        destination: "/magaza",
        permanent: true,
      },
      {
        source: "/urun/1920wh-tasinabilir-guc-kaynagi",
        destination: "/magaza",
        permanent: true,
      },
      {
        source: "/urun/katlanabilir-tasinabilir-gunes-panelleri-100w-sarj-paneli",
        destination: "/kategori/gunes-panelleri",
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
