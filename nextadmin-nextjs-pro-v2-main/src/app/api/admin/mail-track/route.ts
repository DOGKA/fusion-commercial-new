/**
 * Mail Track API Endpoint
 * 
 * E-posta takip verilerini listeler.
 * Filtreleme, sayfalama ve istatistik desteği.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// EmailLog model types
const emailLog = prisma.emailLog;

// GET - E-posta loglarını listele
export async function GET(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Query parametreleri
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // Email tipi filtresi
    const status = searchParams.get("status"); // Durum filtresi
    const search = searchParams.get("search"); // E-posta adresi araması
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Where koşulları
    const where: {
      type?: string;
      status?: string;
      OR?: { to?: { contains: string; mode: string }; subject?: { contains: string; mode: string } }[];
      sentAt?: { gte?: Date; lte?: Date };
    } = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { to: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) {
        where.sentAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.sentAt.lte = new Date(endDate);
      }
    }

    // Toplam sayı
    const total = await emailLog.count({ where });

    // E-postalar
    const emails = await emailLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // İstatistikler (tüm kayıtlar için)
    const stats = await emailLog.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Tip bazlı istatistikler
    const typeStats = await emailLog.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    // İstatistikleri düzenle
    const statusCounts = {
      total: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      failed: 0,
    };

    stats.forEach((stat: { status: string; _count: { id: number } }) => {
      const count = stat._count.id;
      statusCounts.total += count;
      
      switch (stat.status) {
        case "SENT":
          statusCounts.sent = count;
          break;
        case "DELIVERED":
          statusCounts.delivered = count;
          break;
        case "OPENED":
          statusCounts.opened = count;
          break;
        case "CLICKED":
          statusCounts.clicked = count;
          break;
        case "BOUNCED":
          statusCounts.bounced = count;
          break;
        case "COMPLAINED":
          statusCounts.complained = count;
          break;
        case "FAILED":
          statusCounts.failed = count;
          break;
      }
    });

    // Açılma oranı hesapla
    const deliveredAndOpened = statusCounts.delivered + statusCounts.opened + statusCounts.clicked;
    const openRate = deliveredAndOpened > 0 
      ? Math.round(((statusCounts.opened + statusCounts.clicked) / deliveredAndOpened) * 100)
      : 0;

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        ...statusCounts,
        openRate,
      },
      typeStats: typeStats.reduce((acc: Record<string, number>, stat: { type: string; _count: { id: number } }) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
    });

  } catch (error) {
    console.error("❌ Mail track API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}

// DELETE - Eski logları temizle (opsiyonel)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get("olderThanDays") || "90");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await emailLog.deleteMany({
      where: {
        sentAt: { lt: cutoffDate },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `${result.count} email logs older than ${olderThanDays} days deleted`,
    });

  } catch (error) {
    console.error("❌ Delete email logs error:", error);
    return NextResponse.json(
      { error: "Failed to delete email logs" },
      { status: 500 }
    );
  }
}

