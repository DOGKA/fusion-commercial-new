import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER EXTERNAL PACKAGES (iyzipay için gerekli)
  // ═══════════════════════════════════════════════════════════════════════════
  serverExternalPackages: ["iyzipay"],

  // ═══════════════════════════════════════════════════════════════════════════
  // MONOREPO: Allow importing from fusionmarkt emails
  // ═══════════════════════════════════════════════════════════════════════════
  transpilePackages: ["fusionmarkt"],
  
  webpack: (config) => {
    // Add alias for email templates
    config.resolve.alias["@emails"] = path.resolve(__dirname, "../fusionmarkt/src/emails");
    return config;
  },

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
      // AWS S3 - Secondary bucket (mybucketajax)
      {
        protocol: "https",
        hostname: "mybucketajax.s3.eu-north-1.amazonaws.com",
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
