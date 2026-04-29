import "server-only";

import Script from "next/script";
import { unstable_cache } from "next/cache";
import { prisma } from "@repo/db";

// Read the GTM ID from the singleton SiteSettings row. Cached for 5 minutes
// across requests so we don't hit the database on every page render. The
// /api/public/settings endpoint already uses the same TTL for the client.
const getGtmId = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        select: { googleTagManagerId: true },
      });
      return settings?.googleTagManagerId || null;
    } catch {
      return null;
    }
  },
  ["site-settings:gtm-id"],
  { revalidate: 300, tags: ["site-settings"] }
);

export async function GoogleTagManagerScript() {
  const gtmId = await getGtmId();
  if (!gtmId) return null;

  return (
    <Script
      id="gtm-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
      }}
    />
  );
}

export async function GoogleTagManagerNoScript() {
  const gtmId = await getGtmId();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
