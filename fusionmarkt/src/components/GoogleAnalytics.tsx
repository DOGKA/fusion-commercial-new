"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface TrackingSettings {
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
}

// Consent durumunu localStorage'dan oku
function getConsentState() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("cookie_consent");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return null;
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<TrackingSettings | null>(null);
  const [consent, setConsent] = useState<{
    analytics: boolean;
    marketing: boolean;
  } | null>(null);

  // Settings'i API'den çek
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/public/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            googleAnalyticsId: data.googleAnalyticsId,
            googleTagManagerId: data.googleTagManagerId,
            facebookPixelId: data.facebookPixelId,
          });
        }
      } catch (error) {
        console.error("Failed to fetch tracking settings:", error);
      }
    }
    fetchSettings();
  }, []);

  // Consent durumunu dinle
  useEffect(() => {
    const checkConsent = () => {
      const stored = getConsentState();
      setConsent(stored);
    };

    checkConsent();

    // Storage değişikliklerini dinle
    window.addEventListener("storage", checkConsent);
    // Custom event dinle (aynı tab için)
    window.addEventListener("cookieConsentUpdated", checkConsent);

    return () => {
      window.removeEventListener("storage", checkConsent);
      window.removeEventListener("cookieConsentUpdated", checkConsent);
    };
  }, []);

  // Sayfa değişikliklerinde pageview gönder
  useEffect(() => {
    if (!settings?.googleAnalyticsId || !consent?.analytics) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // GA4 pageview
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", settings.googleAnalyticsId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, settings?.googleAnalyticsId, consent?.analytics]);

  // Settings yüklenmediyse veya ID yoksa hiçbir şey render etme
  if (!settings) return null;

  const { googleAnalyticsId, googleTagManagerId, facebookPixelId } = settings;
  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasMarketingConsent = consent?.marketing ?? false;

  return (
    <>
      {/* Google Analytics 4 */}
      {googleAnalyticsId && hasAnalyticsConsent && (
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
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('consent', 'default', {
                  'ad_storage': '${hasMarketingConsent ? "granted" : "denied"}',
                  'analytics_storage': 'granted',
                  'functionality_storage': 'granted',
                  'personalization_storage': '${hasMarketingConsent ? "granted" : "denied"}',
                  'security_storage': 'granted'
                });
                
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      {googleTagManagerId && hasAnalyticsConsent && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${googleTagManagerId}');
              `,
            }}
          />
          {/* GTM noscript - body içine eklenir */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && hasMarketingConsent && (
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

// Suspense wrapper for useSearchParams
export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}
