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

    // Sipariş verileri
    const [
      totalOrders,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueData,
      revenueTodayData,
      revenueWeekData,
      revenueMonthData,
    ] = await Promise.all([
      // Toplam sipariş
      prisma.order.count({
        where: { status: { not: "CANCELLED" } },
      }),
      // Bugünkü siparişler
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart },
          status: { not: "CANCELLED" },
        },
      }),
      // Bu haftaki siparişler
      prisma.order.count({
        where: {
          createdAt: { gte: weekStart },
          status: { not: "CANCELLED" },
        },
      }),
      // Bu ayki siparişler
      prisma.order.count({
        where: {
          createdAt: { gte: monthStart },
          status: { not: "CANCELLED" },
        },
      }),
      // Toplam gelir
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      // Bugünkü gelir
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: todayStart },
          status: { not: "CANCELLED" },
        },
      }),
      // Bu haftaki gelir
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: weekStart },
          status: { not: "CANCELLED" },
        },
      }),
      // Bu ayki gelir
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: monthStart },
          status: { not: "CANCELLED" },
        },
      }),
    ]);

    const totalRevenue = revenueData._sum.total || 0;
    const revenueToday = revenueTodayData._sum.total || 0;
    const revenueThisWeek = revenueWeekData._sum.total || 0;
    const revenueThisMonth = revenueMonthData._sum.total || 0;

    // Ortalama sipariş değeri
    const averageOrderValue = totalOrders > 0 ? Number(totalRevenue) / totalOrders : 0;

    // Google Analytics Data API kontrolü
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        gaPropertyId: true,
        gaServiceAccountEmail: true,
        gaServiceAccountKey: true,
      },
    });

    const gaConnected = !!(
      settings?.gaPropertyId &&
      settings?.gaServiceAccountEmail &&
      settings?.gaServiceAccountKey
    );

    // GA verilerini çek (eğer yapılandırılmışsa)
    let gaData = null;
    if (gaConnected) {
      try {
        gaData = await fetchGoogleAnalyticsData(
          settings!.gaPropertyId!,
          settings!.gaServiceAccountEmail!,
          settings!.gaServiceAccountKey!,
          period
        );
      } catch (error) {
        console.error("GA Data API error:", error);
        // GA hatasında bile devam et, sadece veritabanı verilerini göster
      }
    }

    return NextResponse.json({
      // Sipariş verileri
      totalOrders,
      totalRevenue: Number(totalRevenue),
      averageOrderValue,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueToday: Number(revenueToday),
      revenueThisWeek: Number(revenueThisWeek),
      revenueThisMonth: Number(revenueThisMonth),
      // GA verileri
      gaConnected,
      ...(gaData || {}),
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
    const jwt = await createGoogleJWT(serviceAccountEmail, serviceAccountKey);
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
      console.error("Failed to get access token");
      return null;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Tarih aralığı
    const endDate = "today";
    let startDate = "7daysAgo";
    if (period === "today") startDate = "today";
    else if (period === "month") startDate = "30daysAgo";

    // GA4 Data API çağrısı
    const gaRes = await fetch(
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
          ],
        }),
      }
    );

    if (!gaRes.ok) {
      console.error("GA API error:", await gaRes.text());
      return null;
    }

    const gaData = await gaRes.json();

    // Verileri parse et
    let visitors = 0;
    let pageViews = 0;
    const deviceBreakdown: { device: string; percentage: number }[] = [];

    if (gaData.rows) {
      let totalSessions = 0;
      for (const row of gaData.rows) {
        const device = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value) || 0;
        const views = parseInt(row.metricValues[1].value) || 0;
        const sessions = parseInt(row.metricValues[2].value) || 0;

        visitors += users;
        pageViews += views;
        totalSessions += sessions;

        deviceBreakdown.push({
          device,
          percentage: 0, // Sonra hesaplanacak
        });
      }

      // Yüzdeleri hesapla
      for (const item of deviceBreakdown) {
        item.percentage = totalSessions > 0
          ? Math.round((gaData.rows.find((r: any) => r.dimensionValues[0].value === item.device)?.metricValues[2]?.value || 0) / totalSessions * 100)
          : 0;
      }
    }

    return {
      visitors: {
        today: period === "today" ? visitors : 0,
        thisWeek: period === "week" ? visitors : 0,
        thisMonth: period === "month" ? visitors : 0,
      },
      pageViews: {
        today: period === "today" ? pageViews : 0,
        thisWeek: period === "week" ? pageViews : 0,
        thisMonth: period === "month" ? pageViews : 0,
      },
      deviceBreakdown,
      topPages: [], // Ek API çağrısı gerekir
      trafficSources: [], // Ek API çağrısı gerekir
    };
  } catch (error) {
    console.error("GA fetch error:", error);
    return null;
  }
}

// Google JWT oluştur (Service Account için)
async function createGoogleJWT(
  serviceAccountEmail: string,
  serviceAccountKeyJson: string
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
      scope: "https://www.googleapis.com/auth/analytics.readonly",
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

