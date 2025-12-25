/**
 * User Addresses API
 * GET /api/user/addresses - Get all addresses
 * POST /api/user/addresses - Create address
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";

interface CreateAddressBody {
  title: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isDefault?: boolean;
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "Adresler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Kullanıcının veritabanında var olup olmadığını kontrol et
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ 
        error: "Kullanıcı bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın." 
      }, { status: 401 });
    }

    const body: CreateAddressBody = await request.json();
    const { title, phone, city, district, address, isDefault } = body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    const newAddress = await (prisma.address.create as any)({
      data: {
        userId: session.user.id,
        title: title?.trim() || "Adres",
        fullName: session.user.name || "",
        phone: phone?.trim() || "",
        city: city?.trim() || "",
        district: district?.trim() || "",
        address: address?.trim() || "",
        addressLine1: address?.trim() || "",
        country: "TR",
        isDefault: isDefault || false,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Adres eklendi",
      address: newAddress,
    });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      { error: "Adres eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
