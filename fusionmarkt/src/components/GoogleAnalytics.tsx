"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
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

  // Tracks the last page_path/search combo for which we already fired a page_view,
  // so we never send duplicates for the same URL within a session.
  const lastSentUrlRef = useRef<string | null>(null);
  // Tracks the last analytics consent state we observed via cookieConsentUpdated.
  // Used to detect denied -> granted transitions and re-fire the current page_view.
  const lastAnalyticsConsentRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        const res = await fetch("/api/public/settings");
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
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
    return () => {
      mounted = false;
    };
  }, []);

  // Seed the analytics-consent ref from localStorage so the first
  // cookieConsentUpdated event after acceptance is recognised as a transition.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("fusionmarkt-cookie-consent");
      if (stored) {
        const parsed = JSON.parse(stored) as { analytics?: boolean };
        lastAnalyticsConsentRef.current = !!parsed.analytics;
      }
    } catch {
      // ignore – default to false (denied)
    }
  }, []);

  const sendPageView = useCallback(() => {
    if (!settings?.googleAnalyticsId) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastSentUrlRef.current === url) return;

    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: typeof document !== "undefined" ? document.title : undefined,
      send_to: settings.googleAnalyticsId,
    });
    lastSentUrlRef.current = url;
  }, [settings, pathname, searchParams]);

  // Manual page_view on initial settings load and on every route change.
  // The inline gtag config below uses send_page_view:false so this is
  // the single source of truth for page_view events.
  useEffect(() => {
    sendPageView();
  }, [sendPageView]);

  // Re-fire page_view exactly once when analytics consent goes denied -> granted,
  // so the visit is captured even if the GA script was already loaded under denied.
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handler(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { analytics?: boolean }
        | undefined;
      const nowGranted = !!detail?.analytics;
      const wasGranted = lastAnalyticsConsentRef.current;
      lastAnalyticsConsentRef.current = nowGranted;
      if (!wasGranted && nowGranted) {
        // Force a re-send for the current URL since the previous attempt
        // (if any) was made with analytics_storage=denied.
        lastSentUrlRef.current = null;
        sendPageView();
      }
    }

    window.addEventListener("cookieConsentUpdated", handler);
    return () => window.removeEventListener("cookieConsentUpdated", handler);
  }, [sendPageView]);

  if (!settings) return null;

  const { googleAnalyticsId, facebookPixelId } = settings;

  return (
    <>
      {/* GA4 - Consent Mode v2 defaults are set in layout.tsx, safe to load always.
          We disable the auto page_view emitted by gtag('config', ...) and instead
          fire page_view manually so consent transitions and route changes are
          handled deterministically. */}
      {googleAnalyticsId && (
        <>
          <Script
            id="google-analytics-src"
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
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  send_page_view: false,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel - marketing consent required */}
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
