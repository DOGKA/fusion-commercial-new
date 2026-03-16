/**
 * User Profile API
 * GET /api/user/profile - Get profile
 * PUT /api/user/profile - Update profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  birthDate?: string;
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Profil bilgileri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body: UpdateProfileBody = await request.json();
    const { name, phone, birthDate } = body;

    // Update user - sadece gönderilen alanları güncelle
    const updateData: Record<string, string | null> = {};
    
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }
    if (birthDate !== undefined) {
      updateData.birthDate = birthDate || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
