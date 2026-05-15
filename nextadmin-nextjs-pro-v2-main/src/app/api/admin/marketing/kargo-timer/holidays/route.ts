/**
 * Admin Kargo Timer Holidays API
 * POST /api/admin/marketing/kargo-timer/holidays — yeni tatil ekle (tek gün veya aralık)
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

/**
 * "YYYY-MM-DD" string'ini @db.Date alanı için güvenli (UTC midnight) Date'e çevirir.
 * Saat dilimi kaymasını önler — kullanıcı 2026-05-19 girdi, DB'ye 2026-05-19 yazılır.
 */
function parseIsoDate(input: unknown): Date | null {
  if (typeof input !== "string") return null;
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return new Date(Date.UTC(y, mo - 1, d));
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const startDate = parseIsoDate(body.startDate);
    if (!startDate) {
      return NextResponse.json({ error: "Geçerli bir başlangıç tarihi girin" }, { status: 400 });
    }
    const endDate = body.endDate ? parseIsoDate(body.endDate) : startDate;
    if (!endDate) {
      return NextResponse.json({ error: "Geçerli bir bitiş tarihi girin" }, { status: 400 });
    }
    if (endDate.getTime() < startDate.getTime()) {
      return NextResponse.json({ error: "Bitiş tarihi başlangıçtan önce olamaz" }, { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Tatil ismi gerekli" }, { status: 400 });
    }
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const isRecurring = typeof body.isRecurring === "boolean" ? body.isRecurring : false;

    const holiday = await prisma.shippingHoliday.create({
      data: {
        startDate,
        endDate,
        name,
        description: description || null,
        isRecurring,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: holiday.id,
      startDate: holiday.startDate.toISOString().slice(0, 10),
      endDate: holiday.endDate.toISOString().slice(0, 10),
      name: holiday.name,
      description: holiday.description,
      isActive: holiday.isActive,
      isRecurring: holiday.isRecurring,
    });
  } catch (error) {
    console.error("Holiday POST error:", error);
    return NextResponse.json({ error: "Tatil eklenemedi" }, { status: 500 });
  }
}
