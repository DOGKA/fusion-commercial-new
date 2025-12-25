import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
