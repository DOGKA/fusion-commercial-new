import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET: Public settings (sadece tracking ID'ler)
// Bu endpoint cache'lenir ve frontend tarafından kullanılır
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        siteTitle: true,
        siteDescription: true,
        keywords: true,
        ogImage: true,
        twitterHandle: true,
        googleAnalyticsId: true,
        googleTagManagerId: true,
        facebookPixelId: true,
        cookieBannerEnabled: true,
        cookieBannerPosition: true,
        cookieBannerText: true,
        cookieDefaultAnalytics: true,
        cookieDefaultMarketing: true,
        cookieDefaultPreferences: true,
        // NOT: Service account bilgileri public'e açık değil!
      },
    });

    if (!settings) {
      return NextResponse.json({
        siteTitle: "FusionMarkt",
        siteDescription: "",
        keywords: "",
        ogImage: null,
        twitterHandle: null,
        googleAnalyticsId: null,
        googleTagManagerId: null,
        facebookPixelId: null,
        cookieBannerEnabled: true,
        cookieBannerPosition: "bottom",
        cookieBannerText: "Bu web sitesi deneyiminizi geliştirmek için çerezler kullanmaktadır.",
        cookieDefaultAnalytics: true,
        cookieDefaultMarketing: false,
        cookieDefaultPreferences: true,
      });
    }

    return NextResponse.json(settings, {
      headers: {
        // 5 dakika cache (revalidate için)
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

