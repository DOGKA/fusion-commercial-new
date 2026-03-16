import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@repo/db";

// GET: Ayarları getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Singleton pattern - "default" ID ile tek kayıt
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    // Eğer kayıt yoksa, varsayılan değerlerle oluştur
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST: Ayarları güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Güvenlik: Sadece izin verilen alanları güncelle
    const allowedFields = [
      "siteTitle",
      "siteDescription",
      "keywords",
      "ogImage",
      "twitterHandle",
      "googleAnalyticsId",
      "googleTagManagerId",
      "facebookPixelId",
      "cookieBannerEnabled",
      "cookieBannerPosition",
      "cookieBannerText",
      "cookieDefaultAnalytics",
      "cookieDefaultMarketing",
      "cookieDefaultPreferences",
      "gaPropertyId",
      "gaServiceAccountEmail",
      "gaServiceAccountKey",
      "gscSiteUrl",
      "gscServiceAccountEmail",
      "gscServiceAccountKey",
      "robotsTxt",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        // Boş string'leri null'a çevir
        updateData[field] = body[field] === "" ? null : body[field];
      }
    }

    // Upsert: Varsa güncelle, yoksa oluştur
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ayarlar kaydedildi",
      settings,
    });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

