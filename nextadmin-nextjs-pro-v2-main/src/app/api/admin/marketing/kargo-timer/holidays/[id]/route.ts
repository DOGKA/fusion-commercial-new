/**
 * Admin Kargo Timer Holiday item API
 * PATCH  /api/admin/marketing/kargo-timer/holidays/[id] — güncelle / toggle isActive
 * DELETE /api/admin/marketing/kargo-timer/holidays/[id] — sil
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.startDate !== undefined) {
      const d = parseIsoDate(body.startDate);
      if (!d) return NextResponse.json({ error: "Geçersiz başlangıç tarihi" }, { status: 400 });
      data.startDate = d;
    }
    if (body.endDate !== undefined) {
      const d = parseIsoDate(body.endDate);
      if (!d) return NextResponse.json({ error: "Geçersiz bitiş tarihi" }, { status: 400 });
      data.endDate = d;
    }
    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (!trimmed) return NextResponse.json({ error: "Tatil ismi boş olamaz" }, { status: 400 });
      data.name = trimmed;
    }
    if (body.description !== undefined) {
      data.description = typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    }
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.isRecurring === "boolean") data.isRecurring = body.isRecurring;

    // startDate + endDate ikisi de varsa sıralamayı doğrula
    if (data.startDate instanceof Date && data.endDate instanceof Date) {
      if ((data.endDate as Date).getTime() < (data.startDate as Date).getTime()) {
        return NextResponse.json({ error: "Bitiş tarihi başlangıçtan önce olamaz" }, { status: 400 });
      }
    } else if (data.startDate || data.endDate) {
      // Yalnız biri değişiyorsa mevcut kayıtla karşılaştır
      const current = await prisma.shippingHoliday.findUnique({ where: { id } });
      if (!current) return NextResponse.json({ error: "Tatil bulunamadı" }, { status: 404 });
      const newStart = (data.startDate as Date | undefined) ?? current.startDate;
      const newEnd = (data.endDate as Date | undefined) ?? current.endDate;
      if (newEnd.getTime() < newStart.getTime()) {
        return NextResponse.json({ error: "Bitiş tarihi başlangıçtan önce olamaz" }, { status: 400 });
      }
    }

    const updated = await prisma.shippingHoliday.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      startDate: updated.startDate.toISOString().slice(0, 10),
      endDate: updated.endDate.toISOString().slice(0, 10),
      name: updated.name,
      description: updated.description,
      isActive: updated.isActive,
      isRecurring: updated.isRecurring,
    });
  } catch (error) {
    console.error("Holiday PATCH error:", error);
    return NextResponse.json({ error: "Tatil güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await context.params;
    await prisma.shippingHoliday.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Holiday DELETE error:", error);
    return NextResponse.json({ error: "Tatil silinemedi" }, { status: 500 });
  }
}
