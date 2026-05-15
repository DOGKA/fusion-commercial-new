/**
 * Admin Kargo Timer API
 * GET  /api/admin/marketing/kargo-timer — settings + holiday list (birleşik)
 * PUT  /api/admin/marketing/kargo-timer — settings güncelle (cut-off, toggle'lar)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 }) };
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 }) };
  }
  return { session };
}

async function getOrCreateSettings() {
  let settings = await prisma.shippingSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.shippingSettings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const settings = await getOrCreateSettings();
    const holidays = await prisma.shippingHoliday.findMany({
      orderBy: [{ startDate: "asc" }],
    });

    return NextResponse.json({
      settings: {
        timerEnabled: settings.timerEnabled,
        weekdayCutoffHour: settings.weekdayCutoffHour,
        weekdayCutoffMinute: settings.weekdayCutoffMinute,
        saturdayEnabled: settings.saturdayEnabled,
        saturdayCutoffHour: settings.saturdayCutoffHour,
        saturdayCutoffMinute: settings.saturdayCutoffMinute,
      },
      holidays: holidays.map((h) => ({
        id: h.id,
        startDate: h.startDate.toISOString().slice(0, 10),
        endDate: h.endDate.toISOString().slice(0, 10),
        name: h.name,
        description: h.description,
        isActive: h.isActive,
        isRecurring: h.isRecurring,
      })),
    });
  } catch (error) {
    console.error("Kargo timer GET error:", error);
    return NextResponse.json({ error: "Veriler alınamadı" }, { status: 500 });
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  if (i < min) return min;
  if (i > max) return max;
  return i;
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const data = {
      timerEnabled: typeof body.timerEnabled === "boolean" ? body.timerEnabled : undefined,
      weekdayCutoffHour:
        body.weekdayCutoffHour !== undefined ? clampInt(body.weekdayCutoffHour, 0, 23, 14) : undefined,
      weekdayCutoffMinute:
        body.weekdayCutoffMinute !== undefined ? clampInt(body.weekdayCutoffMinute, 0, 59, 0) : undefined,
      saturdayEnabled:
        typeof body.saturdayEnabled === "boolean" ? body.saturdayEnabled : undefined,
      saturdayCutoffHour:
        body.saturdayCutoffHour !== undefined ? clampInt(body.saturdayCutoffHour, 0, 23, 13) : undefined,
      saturdayCutoffMinute:
        body.saturdayCutoffMinute !== undefined ? clampInt(body.saturdayCutoffMinute, 0, 59, 0) : undefined,
    };

    const settings = await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });

    return NextResponse.json({
      timerEnabled: settings.timerEnabled,
      weekdayCutoffHour: settings.weekdayCutoffHour,
      weekdayCutoffMinute: settings.weekdayCutoffMinute,
      saturdayEnabled: settings.saturdayEnabled,
      saturdayCutoffHour: settings.saturdayCutoffHour,
      saturdayCutoffMinute: settings.saturdayCutoffMinute,
    });
  } catch (error) {
    console.error("Kargo timer PUT error:", error);
    return NextResponse.json({ error: "Ayarlar kaydedilemedi" }, { status: 500 });
  }
}
