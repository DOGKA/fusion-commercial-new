"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useCookieConsent } from "@/context/CookieConsentContext";

interface TrackingSettings {
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<TrackingSettings | null>(null);
  const { canUseMarketing } = useCookieConsent();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/public/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            googleAnalyticsId: data.googleAnalyticsId,
            facebookPixelId: data.facebookPixelId,
          });
        }
      } catch (error) {
        console.error("Failed to fetch tracking settings:", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings?.googleAnalyticsId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", settings.googleAnalyticsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, settings?.googleAnalyticsId]);

  if (!settings) return null;

  const { googleAnalyticsId, facebookPixelId } = settings;

  return (
    <>
      {/* GA4 — Consent Mode v2 defaults are set in layout.tsx, safe to load always */}
      {googleAnalyticsId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                if(!window.gtag){function gtag(){dataLayer.push(arguments);} window.gtag = gtag;}
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel — marketing consent required */}
      {facebookPixelId && canUseMarketing && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}
