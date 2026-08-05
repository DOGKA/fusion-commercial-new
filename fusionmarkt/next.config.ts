import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT FILE TRACING ROOT (Fix monorepo lockfile warning)
  // ═══════════════════════════════════════════════════════════════════════════
  outputFileTracingRoot: path.join(__dirname, "../"),

  // Opsiyonel: dev server'ın .next klasörünü bozmadan yan build alabilmek için
  // (ör. NEXT_DIST_DIR=.next-perf npm run build)
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER EXTERNAL PACKAGES
  // ═══════════════════════════════════════════════════════════════════════════
  // Packages that should not be bundled by webpack (run on server only)
  serverExternalPackages: ["iyzipay"],

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  images: {
    // Disable image optimization in development if CDN images timeout
    unoptimized: process.env.NODE_ENV === 'development',
    minimumCacheTTL: 2592000,
    remotePatterns: [
      // Cloudflare R2 CDN (birincil medya kaynağı)
      {
        protocol: "https",
        hostname: "cdn.fusionmarkt.com",
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
          // HSTS - HTTPS zorunluluğu (Cloudflare "Domains without HSTS" bulgusu).
          // NOT: `includeSubDomains` ve `preload` BİLEREK eklenmedi. mail/webmail
          // alt alan adlarının TLS'i düzeldikten sonra bunlar Cloudflare SSL/TLS
          // > Edge Certificates > HSTS bölümünden açılmalı. Aksi halde tarayıcı
          // tüm alt alan adlarına HTTPS zorlar ve webmail erişimi kırılabilir.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          // Origin isolation. `same-origin` yerine `-allow-popups`: iyzico 3DS ve
          // olası OAuth popup akışlarının window.opener bağını koparmamak için.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // CSP - yalnızca script dışı direktifler zorunlu kılınıyor.
          // NOT: `script-src` BİLEREK yok. Next.js RSC payload'ını satır içi
          // <script> ile stream ediyor; bunu engellememek için ya 'unsafe-inline'
          // (CSP'yi anlamsız kılar) ya da nonce gerekir. Nonce middleware'de
          // üretilir ve layout'ta headers() okumak tüm sayfaları dinamik render'a
          // düşürerek ISR'ı (revalidate = 60) iptal eder. Aşağıdaki direktifler
          // ISR'ı bozmadan base-tag injection, plugin ve clickjacking'i kapatır.
          {
            key: "Content-Security-Policy",
            value: [
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
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
      // Pazaryeri logoları - 30 gün. Dosya adları sabit ve içerikleri yılda bir
      // bile değişmiyor; Cloudflare varsayılanı bunlara 1 gün veriyordu ve
      // Lighthouse "efficient cache lifetimes" bulgusu buradan geliyordu.
      // Cloudflare tarafında Browser Cache TTL "Respect Existing Headers"
      // olmadıkça bu başlık ezilir.
      {
        source: "/pazaryerleri/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
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
      // Slider görselleri - içerik değişirse dosya adı da değişiyor, 30 gün güvenli
      {
        source: "/sliders/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Barrel dosyalarını tek tek modüllere çevirir; aksi halde kullanılmayan
  // export'lar ortak chunk'a girebilir.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
    ],

    /**
     * İstemci Router Cache ömrü. Next 15'te dinamik segmentlerin varsayılanı 0,
     * yani `/hesabim/*` gibi force-dynamic sayfalarda saniyeler önce açılmış bir
     * sekmeye dönmek bile bütün sorguları yeniden çalıştırıyordu.
     *
     * 30 sn sadece TEK OTURUM içindeki istemci gezinmesini etkiler; sayfa
     * yenilemesi ve `router.refresh()` (form kaydetmelerinden sonra çağrılıyor)
     * önbelleği atlar. Sipariş/adres gibi veriler bu pencerede eskiyebilir,
     * karşılığında sekmeler arası ileri-geri gezinme anında oluyor.
     */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // SEO: Trailing slash & URL normalization
  // ═══════════════════════════════════════════════════════════════════════════
  trailingSlash: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // GÜVENLİK: Eski fatura yolunun kapatılması (F2-70)
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // `public/storage/invoices/` içindeki fatura PDF'leri Next tarafından kimlik
  // doğrulaması olmadan servis ediliyordu; bu, `/api/invoices/...` ucundaki
  // oturum + token kapısını (F2-61) tamamen boşa çıkarıyordu.
  //
  // `beforeFiles` bilinçli: yeniden yazım **dosya sistemi kontrolünden önce**
  // çalışan tek aşama. Aynı yolu karşılayan bir route dosyası denendi ve işe
  // yaramadı, çünkü `public/` içindeki dosya route eşleşmesinden önce servis
  // ediliyor.
  //
  // Yeni faturalar `public/` dışına yazılıyor. Eski dosyalar diskte duruyor
  // ama bu kanca yollarını kapatıyor; diskten silindiklerinde bu blok da
  // kaldırılabilir.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/storage/invoices/:file*",
          destination: "/api/legacy-invoice-blocked",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEO: Redirects (www → non-www canonical)
  // ═══════════════════════════════════════════════════════════════════════════
  async redirects() {
    return [
      // ReviewReminderEmail bu adrese link veriyor ama route hiç var olmadı —
      // e-postadaki buton bugüne kadar 404 dönüyordu. Şablona dokunmadan onarım.
      // 307 (permanent: false) bilinçli: 301 tarayıcıda kalıcı önbelleğe girer
      // ve ileride bu slug'ı kullanmak istersek geri alamayız.
      {
        source: "/hesabim/siparislerim",
        destination: "/hesabim/siparisler",
        permanent: false,
      },

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
  // CSS / BUNDLER
  // ═══════════════════════════════════════════════════════════════════════════
  // Note: The previous custom `webpack.splitChunks.cacheGroups.styles` rule
  // (with enforce:true) was the source of "preloaded but not used" warnings
  // for /_next/static/css/*.css. It forced all CSS into a single chunk that
  // Next.js 15's automatic route-level CSS loader then preloaded but never
  // actually used at runtime on certain pages. Letting Next.js handle CSS
  // chunking automatically is the correct fix.
};

export default nextConfig;
