/**
 * User Address API (Single)
 * PUT /api/user/addresses/[id] - Update address
 * DELETE /api/user/addresses/[id] - Delete address
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";

interface UpdateAddressBody {
  title?: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  isDefault?: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: addressId } = await params;
    const body: UpdateAddressBody = await request.json();

    // Check ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          id: { not: addressId }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        title: body.title?.trim(),
        phone: body.phone?.trim(),
        city: body.city?.trim(),
        district: body.district?.trim(),
        address: body.address?.trim(),
        isDefault: body.isDefault,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Adres güncellendi",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { error: "Adres güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: addressId } = await params;

    // Check ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return NextResponse.json({
      success: true,
      message: "Adres silindi",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Adres silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
