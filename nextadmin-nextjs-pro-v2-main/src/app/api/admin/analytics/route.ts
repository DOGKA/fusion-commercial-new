import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

// GET: Analytics verileri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // Tarih hesaplamaları
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Google Analytics & Search Console ayarlarını al
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    const gaConnected = !!(
      settings?.gaPropertyId &&
      settings?.gaServiceAccountEmail &&
      settings?.gaServiceAccountKey
    );

    // GSC alanlarını dinamik olarak kontrol et (Prisma henüz güncellemediyse)
    const settingsAny = settings as Record<string, unknown> | null;
    const gscSiteUrl = settingsAny?.gscSiteUrl as string | null;
    const gscServiceAccountEmail = (settingsAny?.gscServiceAccountEmail || settings?.gaServiceAccountEmail) as string | null;
    const gscServiceAccountKey = (settingsAny?.gscServiceAccountKey || settings?.gaServiceAccountKey) as string | null;

    const gscConnected = !!(
      gscSiteUrl &&
      gscServiceAccountEmail &&
      gscServiceAccountKey
    );

    console.log("Analytics settings check:", {
      gaConnected,
      gscConnected,
      hasGaPropertyId: !!settings?.gaPropertyId,
      hasGaEmail: !!settings?.gaServiceAccountEmail,
      hasGaKey: !!settings?.gaServiceAccountKey,
      hasGscUrl: !!gscSiteUrl,
    });

    // Kupon istatistikleri
    const [
      activeCoupons,
      totalCouponUsage,
      couponStats,
      topUsedCoupons,
    ] = await Promise.all([
      // Aktif kupon sayısı
      prisma.coupon.count({
        where: {
          isActive: true,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      // Toplam kupon kullanımı
      prisma.coupon.aggregate({
        _sum: { usageCount: true },
      }),
      // Kuponlarla yapılan toplam indirim
      prisma.order.aggregate({
        where: {
          couponId: { not: null },
          status: { not: "CANCELLED" },
        },
        _sum: { discount: true },
        _count: true,
      }),
      // En çok kullanılan kuponlar (veya tüm aktif kuponlar)
      prisma.coupon.findMany({
        where: {
          isActive: true,
        },
        orderBy: { usageCount: "desc" },
        take: 10,
        select: {
          id: true,
          code: true,
          description: true,
          discountType: true,
          discountValue: true,
          usageCount: true,
          usageLimit: true,
          isActive: true,
          startDate: true,
          endDate: true,
        },
      }),
    ]);

    // GA verilerini çek (eğer yapılandırılmışsa)
    let gaData = null;
    if (gaConnected) {
      try {
        console.log("Fetching GA data for property:", settings!.gaPropertyId);
        gaData = await fetchGoogleAnalyticsData(
          settings!.gaPropertyId!,
          settings!.gaServiceAccountEmail!,
          settings!.gaServiceAccountKey!,
          period
        );
        console.log("GA data result:", gaData ? "SUCCESS" : "NULL", gaData ? { visitors: gaData.visitors, pageViews: gaData.pageViews } : null);
      } catch (error) {
        console.error("GA Data API error:", error);
      }
    }

    // GSC verilerini çek (eğer yapılandırılmışsa)
    let gscData = null;
    if (gscConnected && gscSiteUrl && gscServiceAccountEmail && gscServiceAccountKey) {
      try {
        gscData = await fetchSearchConsoleData(
          gscSiteUrl,
          gscServiceAccountEmail,
          gscServiceAccountKey,
          period
        );
      } catch (error) {
        console.error("GSC Data API error:", error);
      }
    }

    return NextResponse.json({
      // GA verileri
      gaConnected,
      ...(gaData || {}),
      // GSC verileri
      gscConnected,
      gscData: gscData || null,
      // Kupon istatistikleri
      couponStats: {
        activeCoupons,
        totalUsage: totalCouponUsage._sum.usageCount || 0,
        ordersWithCoupon: couponStats._count || 0,
        totalDiscount: Number(couponStats._sum.discount || 0),
        topCoupons: topUsedCoupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          type: c.discountType,
          value: Number(c.discountValue),
          usageCount: c.usageCount,
          usageLimit: c.usageLimit,
          isActive: c.isActive,
          isExpired: c.endDate ? new Date(c.endDate) < now : false,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// Google Analytics Data API çağrısı
async function fetchGoogleAnalyticsData(
  propertyId: string,
  serviceAccountEmail: string,
  serviceAccountKey: string,
  period: string
) {
  try {
    // JWT oluştur
    const jwt = await createGoogleJWT(
      serviceAccountEmail,
      serviceAccountKey,
      "https://www.googleapis.com/auth/analytics.readonly"
    );
    if (!jwt) return null;

    // Access token al
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Failed to get access token:", await tokenRes.text());
      return null;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Tarih aralığı
    const endDate = "today";
    let startDate = "7daysAgo";
    if (period === "today") startDate = "today";
    else if (period === "month") startDate = "30daysAgo";

    // 1. Genel metrikler ve cihaz dağılımı
    const [metricsRes, topPagesRes, trafficSourcesRes] = await Promise.all([
      // Genel metrikler + cihaz dağılımı
      fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [
              { name: "activeUsers" },
              { name: "screenPageViews" },
              { name: "sessions" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
          }),
        }
      ),
      // En çok ziyaret edilen sayfalar
      fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 10,
          }),
        }
      ),
      // Trafik kaynakları
      fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }, { name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 8,
          }),
        }
      ),
    ]);

    if (!metricsRes.ok) {
      console.error("GA metrics error:", await metricsRes.text());
      return null;
    }

    const metricsData = await metricsRes.json();
    const topPagesData = topPagesRes.ok ? await topPagesRes.json() : null;
    const trafficData = trafficSourcesRes.ok ? await trafficSourcesRes.json() : null;

    // Metrikleri parse et
    let totalVisitors = 0;
    let totalPageViews = 0;
    let totalSessions = 0;
    let avgSessionDuration = 0;
    let bounceRate = 0;
    const deviceBreakdown: { device: string; sessions: number; percentage: number }[] = [];

    if (metricsData.rows) {
      for (const row of metricsData.rows) {
        const device = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value) || 0;
        const views = parseInt(row.metricValues[1].value) || 0;
        const sessions = parseInt(row.metricValues[2].value) || 0;
        const duration = parseFloat(row.metricValues[3].value) || 0;
        const bounce = parseFloat(row.metricValues[4].value) || 0;

        totalVisitors += users;
        totalPageViews += views;
        totalSessions += sessions;
        avgSessionDuration += duration * sessions;
        bounceRate += bounce * sessions;

        deviceBreakdown.push({
          device,
          sessions,
          percentage: 0, // Sonra hesaplanacak
        });
      }

      // Ortalama ve yüzdeleri hesapla
      if (totalSessions > 0) {
        avgSessionDuration = avgSessionDuration / totalSessions;
        bounceRate = bounceRate / totalSessions;

        for (const item of deviceBreakdown) {
          item.percentage = Math.round((item.sessions / totalSessions) * 100);
        }
      }
    }

    // Top pages parse et
    const topPages: { page: string; views: number; users: number }[] = [];
    if (topPagesData?.rows) {
      for (const row of topPagesData.rows) {
        topPages.push({
          page: row.dimensionValues[0].value,
          views: parseInt(row.metricValues[0].value) || 0,
          users: parseInt(row.metricValues[1].value) || 0,
        });
      }
    }

    // Traffic sources parse et
    const trafficSources: { source: string; sessions: number; users: number; percentage: number }[] = [];
    if (trafficData?.rows) {
      const totalTrafficSessions = trafficData.rows.reduce(
        (sum: number, row: any) => sum + (parseInt(row.metricValues[0].value) || 0),
        0
      );

      for (const row of trafficData.rows) {
        const sessions = parseInt(row.metricValues[0].value) || 0;
        trafficSources.push({
          source: row.dimensionValues[0].value,
          sessions,
          users: parseInt(row.metricValues[1].value) || 0,
          percentage: totalTrafficSessions > 0 ? Math.round((sessions / totalTrafficSessions) * 100) : 0,
        });
      }
    }

    return {
      visitors: totalVisitors,
      pageViews: totalPageViews,
      sessions: totalSessions,
      avgSessionDuration: Math.round(avgSessionDuration),
      bounceRate: Math.round(bounceRate * 100) / 100,
      deviceBreakdown,
      topPages,
      trafficSources,
    };
  } catch (error) {
    console.error("GA fetch error:", error);
    return null;
  }
}

// Google Search Console Data API çağrısı
async function fetchSearchConsoleData(
  siteUrl: string,
  serviceAccountEmail: string,
  serviceAccountKey: string,
  period: string
) {
  try {
    // JWT oluştur
    const jwt = await createGoogleJWT(
      serviceAccountEmail,
      serviceAccountKey,
      "https://www.googleapis.com/auth/webmasters.readonly"
    );
    if (!jwt) return null;

    // Access token al
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      console.error("GSC Failed to get access token:", await tokenRes.text());
      return null;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Tarih aralığı hesapla
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 2); // GSC verileri 2 gün gecikmeli
    
    const startDate = new Date(endDate);
    if (period === "today") {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // 1. Genel metrikler
    const [overviewRes, queriesRes, pagesRes] = await Promise.all([
      // Genel metrikler
      fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: [],
          }),
        }
      ),
      // Top arama sorguları
      fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ["query"],
            rowLimit: 10,
          }),
        }
      ),
      // Top sayfalar
      fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ["page"],
            rowLimit: 10,
          }),
        }
      ),
    ]);

    if (!overviewRes.ok) {
      const errorText = await overviewRes.text();
      console.error("GSC overview error:", errorText);
      return null;
    }

    const overviewData = await overviewRes.json();
    const queriesData = queriesRes.ok ? await queriesRes.json() : null;
    const pagesData = pagesRes.ok ? await pagesRes.json() : null;

    // Overview metrikleri
    const overview = overviewData.rows?.[0] || {};
    const impressions = Math.round(overview.impressions || 0);
    const clicks = Math.round(overview.clicks || 0);
    const ctr = Math.round((overview.ctr || 0) * 10000) / 100; // %XX.XX formatı
    const position = Math.round((overview.position || 0) * 10) / 10;

    // Top queries
    const topQueries = (queriesData?.rows || []).map((row: any) => ({
      query: row.keys[0],
      impressions: Math.round(row.impressions || 0),
      clicks: Math.round(row.clicks || 0),
      ctr: Math.round((row.ctr || 0) * 10000) / 100,
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    // Top pages
    const topSeoPages = (pagesData?.rows || []).map((row: any) => ({
      page: row.keys[0].replace(siteUrl.replace("sc-domain:", "https://"), ""),
      impressions: Math.round(row.impressions || 0),
      clicks: Math.round(row.clicks || 0),
      ctr: Math.round((row.ctr || 0) * 10000) / 100,
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    return {
      impressions,
      clicks,
      ctr,
      position,
      topQueries,
      topPages: topSeoPages,
    };
  } catch (error) {
    console.error("GSC fetch error:", error);
    return null;
  }
}

// Google JWT oluştur (Service Account için)
async function createGoogleJWT(
  serviceAccountEmail: string,
  serviceAccountKeyJson: string,
  scope: string
): Promise<string | null> {
  try {
    let privateKey: string;

    // JSON veya direkt key
    try {
      const parsed = JSON.parse(serviceAccountKeyJson);
      privateKey = parsed.private_key;
    } catch {
      privateKey = serviceAccountKeyJson;
    }

    if (!privateKey) return null;

    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const payload = {
      iss: serviceAccountEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    // Base64URL encode
    const base64UrlEncode = (obj: object) => {
      return Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // Node.js crypto ile imzala
    const crypto = await import("crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signatureInput);
    const signature = sign
      .sign(privateKey, "base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `${signatureInput}.${signature}`;
  } catch (error) {
    console.error("JWT creation error:", error);
    return null;
  }
}
