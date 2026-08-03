/**
 * User Address API (Single)
 * PUT /api/user/addresses/[id] - Update address
 * DELETE /api/user/addresses/[id] - Soft delete address
 *
 * Dilim 11 değişiklikleri:
 *  - PUT doğrulamadan geçiyor ve `addressLine1`'i `address` ile birlikte
 *    güncelliyor. Öncesinde yalnızca `address` yazılıyordu; ödeme sayfası
 *    `addressLine1 || address` sırasıyla okuduğu için düzenlenen adres
 *    ödemede ESKİ haliyle görünüyordu.
 *  - DELETE artık yumuşak siliyor. Gerçek DELETE, `Order.shippingAddressId`
 *    opsiyonel ilişki olduğu için geçmiş siparişlerin adres bağını
 *    sessizce NULL'a çekiyordu.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { isDefaultOnly, validateAddress } from "@/lib/address-validation";

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
    const body = await request.json();

    // Check ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (
      !existingAddress ||
      existingAddress.userId !== session.user.id ||
      existingAddress.deletedAt !== null
    ) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    // Her kullanım türünün kendi varsayılanı vardır. Böylece teslimat adresini
    // varsayılan yapmak, varsayılan fatura adresini değiştirmez (ve tersi).
    // BOTH adresler de kendi kullanım grubunda tutulur.
    if (isDefaultOnly(body)) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: existingAddress.type,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
      const updated = await prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
      return NextResponse.json({
        success: true,
        message: "Varsayılan adres güncellendi",
        address: updated,
      });
    }

    const result = validateAddress(body);
    if (!result.ok) {
      return NextResponse.json(result.error, { status: 400 });
    }
    const data = result.data;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: data.type,
          id: { not: addressId }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        title: data.title,
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        district: data.district,
        address: data.address,
        addressLine1: data.address,
        postalCode: data.postalCode,
        type: data.type,
        addressCategory: data.addressCategory,
        invoiceType: data.invoiceType,
        company: data.company,
        taxNumber: data.taxNumber,
        taxOffice: data.taxOffice,
        // Tek adres kalmışsa varsayılanlığı kaldırmaya izin verilmiyor:
        // ödeme sayfasının varsayılan seçme yolu boşta kalırdı.
        isDefault: data.isDefault || existingAddress.isDefault,
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
  _request: NextRequest,
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

    if (
      !existingAddress ||
      existingAddress.userId !== session.user.id ||
      existingAddress.deletedAt !== null
    ) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    await prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date(), isDefault: false },
    });

    // Varsayılan adres silindiyse yerine en yeni adres geçer; aksi halde
    // ödeme sayfası hiçbir adresi ön-seçili bulamaz.
    if (existingAddress.isDefault) {
      const replacement = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          type: existingAddress.type,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (replacement) {
        await prisma.address.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }

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
