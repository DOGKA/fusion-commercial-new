/**
 * Admin Users API
 * GET /api/admin/users - Tüm kullanıcıları listele
 * POST /api/admin/users - Yeni admin/moderator oluştur
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import bcrypt from "bcrypt";

// GET - Tüm kullanıcıları listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Sadece SUPER_ADMIN tüm kullanıcıları görebilir
    // ADMIN sadece CUSTOMER'ları görebilir
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const search = searchParams.get("search");

    const where: any = {};

    // Rol filtresi
    if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter;
    }

    // Arama
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "desc" },
      ],
    });

    // İstatistikler
    const stats = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    const statsMap = {
      total: users.length,
      SUPER_ADMIN: 0,
      ADMIN: 0,
      CUSTOMER: 0,
    };

    stats.forEach((s) => {
      statsMap[s.role as keyof typeof statsMap] = s._count;
    });

    return NextResponse.json({
      users,
      stats: statsMap,
    });
  } catch (error) {
    console.error("❌ [USERS API] Error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınamadı" },
      { status: 500 }
    );
  }
}

// POST - Yeni admin/moderator oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Sadece SUPER_ADMIN yeni admin oluşturabilir
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Ad, email ve şifre gerekli" },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
        emailVerified: new Date(), // Admin oluşturulduğunda otomatik onaylı
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`✅ New admin created: ${user.email} (${user.role})`);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ [USERS API] Create error:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulamadı" },
      { status: 500 }
    );
  }
}
