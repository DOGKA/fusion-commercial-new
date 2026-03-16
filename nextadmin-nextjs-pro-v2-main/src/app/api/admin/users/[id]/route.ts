/**
 * Admin Single User API
 * GET /api/admin/users/[id] - Kullanıcı detayı
 * PATCH /api/admin/users/[id] - Rol değiştir
 * DELETE /api/admin/users/[id] - Kullanıcı sil
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Kullanıcı detayı
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ [USER API] Get error:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgisi alınamadı" },
      { status: 500 }
    );
  }
}

// PATCH - Rol değiştir
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    // Sadece SUPER_ADMIN rol değiştirebilir
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Rol belirtilmeli" },
        { status: 400 }
      );
    }

    // Geçerli roller
    const validRoles = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      );
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kendini değiştiremez
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Kendi rolünüzü değiştiremezsiniz" },
        { status: 400 }
      );
    }

    // Güncelle
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`✅ Role changed: ${updated.email} -> ${role}`);

    return NextResponse.json({
      success: true,
      user: updated,
      message: `${updated.name || updated.email} kullanıcısının rolü ${role} olarak güncellendi`,
    });
  } catch (error) {
    console.error("❌ [USER API] Patch error:", error);
    return NextResponse.json(
      { error: "Rol güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kullanıcı sil
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    // Sadece SUPER_ADMIN silebilir
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kendini silemez
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Kendinizi silemezsiniz" },
        { status: 400 }
      );
    }

    // SUPER_ADMIN silinemez (en az 1 tane olmalı)
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Son SUPER_ADMIN silinemez" },
          { status: 400 }
        );
      }
    }

    // Siparişleri varsa uyar
    if (user._count.orders > 0) {
      return NextResponse.json(
        { 
          error: `Bu kullanıcının ${user._count.orders} siparişi var. Önce siparişleri başka kullanıcıya aktarın veya silin.`,
          hasOrders: true,
          orderCount: user._count.orders,
        },
        { status: 400 }
      );
    }

    // Sil
    await prisma.user.delete({
      where: { id },
    });

    console.log(`🗑️ User deleted: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: `${user.name || user.email} silindi`,
    });
  } catch (error) {
    console.error("❌ [USER API] Delete error:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinemedi" },
      { status: 500 }
    );
  }
}
