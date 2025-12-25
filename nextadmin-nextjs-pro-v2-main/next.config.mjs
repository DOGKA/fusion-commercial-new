/** @type {import("next").NextConfig} */
const nextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  images: {
    remotePatterns: [
      // AWS S3 - Primary storage
      {
        protocol: "https",
        hostname: "fusionmarkt.s3.eu-central-1.amazonaws.com",
        port: "",
      },
      // Google SSO avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      // GitHub avatars (if using GitHub SSO)
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      // Cloudflare
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
        port: "",
      },
      // Main domain
      {
        protocol: "https",
        hostname: "fusionmarkt.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "admin.fusionmarkt.com",
        port: "",
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
  // PERFORMANCE & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
