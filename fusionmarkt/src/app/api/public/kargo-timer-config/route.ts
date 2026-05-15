import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * Public Kargo Timer config
 * - Frontend (KargoTimer.tsx) bu endpoint'i okuyup geri sayım davranışını şekillendirir.
 * - 90 günlük tatil penceresi döner; range'ler tek tek YYYY-MM-DD listesine açılır.
 * - isRecurring kayıtlar, bugünün yılına ve gerekiyorsa bir sonraki yıla projekte edilir.
 */

const TZ = "Europe/Istanbul";
const WINDOW_DAYS = 90;

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIsoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Bir aralığı (start, end dahil) YYYY-MM-DD listesine açar — UTC tabanlı, @db.Date için güvenli. */
function expandRange(start: Date, end: Date): string[] {
  const out: string[] = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const stop = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cur.getTime() <= stop.getTime()) {
    out.push(toIsoDate(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** Tek bir tatili (range veya recurring) bugünden +WINDOW_DAYS penceresine projekte ederek genişletir. */
function projectHoliday(
  startDate: Date,
  endDate: Date,
  isRecurring: boolean,
  windowStart: Date,
  windowEnd: Date,
): string[] {
  if (!isRecurring) {
    // Tek seferlik tatil: doğrudan aralığı pencereyle kesiştir
    if (endDate.getTime() < windowStart.getTime()) return [];
    if (startDate.getTime() > windowEnd.getTime()) return [];
    const clampedStart = startDate.getTime() < windowStart.getTime() ? windowStart : startDate;
    const clampedEnd = endDate.getTime() > windowEnd.getTime() ? windowEnd : endDate;
    return expandRange(clampedStart, clampedEnd);
  }
  // Recurring: her yıl tekrar — bugünün yılı ve bir sonraki yıla projekte et
  const out: string[] = [];
  const baseYears = [windowStart.getUTCFullYear(), windowStart.getUTCFullYear() + 1];
  const startMonth = startDate.getUTCMonth();
  const startDay = startDate.getUTCDate();
  const endMonth = endDate.getUTCMonth();
  const endDay = endDate.getUTCDate();
  for (const year of baseYears) {
    const projStart = new Date(Date.UTC(year, startMonth, startDay));
    const projEnd = new Date(Date.UTC(year, endMonth, endDay));
    // Aralığı pencereyle kesiştir
    if (projEnd.getTime() < windowStart.getTime()) continue;
    if (projStart.getTime() > windowEnd.getTime()) continue;
    const clampedStart = projStart.getTime() < windowStart.getTime() ? windowStart : projStart;
    const clampedEnd = projEnd.getTime() > windowEnd.getTime() ? windowEnd : projEnd;
    out.push(...expandRange(clampedStart, clampedEnd));
  }
  return out;
}

export async function GET() {
  try {
    const settings = await prisma.shippingSettings.findUnique({
      where: { id: "default" },
      select: {
        timerEnabled: true,
        weekdayCutoffHour: true,
        weekdayCutoffMinute: true,
        saturdayEnabled: true,
        saturdayCutoffHour: true,
        saturdayCutoffMinute: true,
      },
    });

    // Pencere: bugün (UTC) → +90 gün
    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const windowEnd = new Date(windowStart.getTime());
    windowEnd.setUTCDate(windowEnd.getUTCDate() + WINDOW_DAYS);

    // İlgili tatilleri çek (aktif olanlar):
    // - Tek seferlik: aralığı pencereyle kesişen
    // - Recurring: hepsi (downstream'de yıl projeksiyonu yapılacak)
    const holidays = await prisma.shippingHoliday.findMany({
      where: {
        isActive: true,
        OR: [
          { isRecurring: true },
          {
            isRecurring: false,
            startDate: { lte: windowEnd },
            endDate: { gte: windowStart },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
        isRecurring: true,
      },
    });

    const dateSet = new Set<string>();
    for (const h of holidays) {
      for (const iso of projectHoliday(h.startDate, h.endDate, h.isRecurring, windowStart, windowEnd)) {
        dateSet.add(iso);
      }
    }
    const dates = Array.from(dateSet).sort();

    return NextResponse.json(
      {
        enabled: settings?.timerEnabled ?? true,
        timezone: TZ,
        weekdayCutoff: {
          hour: settings?.weekdayCutoffHour ?? 14,
          minute: settings?.weekdayCutoffMinute ?? 0,
        },
        saturdayEnabled: settings?.saturdayEnabled ?? false,
        saturdayCutoff: {
          hour: settings?.saturdayCutoffHour ?? 13,
          minute: settings?.saturdayCutoffMinute ?? 0,
        },
        holidays: dates,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Public kargo-timer-config error:", error);
    // Fallback config — frontend her zaman çalışsın
    return NextResponse.json(
      {
        enabled: true,
        timezone: TZ,
        weekdayCutoff: { hour: 14, minute: 0 },
        saturdayEnabled: false,
        saturdayCutoff: { hour: 13, minute: 0 },
        holidays: [],
      },
      { status: 200 },
    );
  }
}
