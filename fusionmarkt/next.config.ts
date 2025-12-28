import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER EXTERNAL PACKAGES
  // ═══════════════════════════════════════════════════════════════════════════
  // Packages that should not be bundled by webpack (run on server only)
  serverExternalPackages: ["iyzipay"],

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  images: {
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
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY HEADERS
  // ═══════════════════════════════════════════════════════════════════════════
  async headers() {
    return [
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
