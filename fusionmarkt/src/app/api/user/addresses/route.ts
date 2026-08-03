/**
 * User Addresses API
 * GET /api/user/addresses - Get all addresses
 * POST /api/user/addresses - Create address
 *
 * Dilim 11 değişiklikleri:
 *  - GET yumuşak silinmiş kayıtları (`deletedAt`) gizler. Yanıt şekli aynı
 *    kaldı, yalnızca yeni alanlar eklendi ⇒ ödeme akışı etkilenmiyor.
 *  - POST artık doğrulama yapıyor ve `type` / `postalCode` / `addressCategory`
 *    kabul ediyor. Posta kodu bilhassa önemli: ödeme sayfası kayıtlı adresten
 *    `postalCode` okuyup formu dolduruyor (`checkout/page.tsx:370`), yani alan
 *    burada dolduğunda ödemede bir daha sorulmuyor.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { validateAddress } from "@/lib/address-validation";
import { getUserAddresses } from "@/lib/user-addresses";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Liste sorgusu `lib/user-addresses.ts`'te — sayfanın SSR'ı da onu kullanıyor
    // (F2-45). Yanıt şekli aynı kaldı; ödeme akışı etkilenmiyor.
    return NextResponse.json({
      addresses: await getUserAddresses(session.user.id),
    });
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

    const body = await request.json();
    const result = validateAddress(body);
    if (!result.ok) {
      return NextResponse.json(result.error, { status: 400 });
    }
    const data = result.data;

    // Her kullanım türü kendi varsayılan adresini taşır. İlgili türdeki ilk
    // adres açıkça istenmese de varsayılan olur.
    const existingCount = await prisma.address.count({
      where: {
        userId: session.user.id,
        type: data.type,
        deletedAt: null,
      },
    });
    const isDefault = data.isDefault || existingCount === 0;

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: data.type,
        },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        title: data.title,
        // Alıcı adı artık formdan geliyor; hesap adına eşit olmak zorunda değil
        // (hediye gönderimi, iş yeri teslimatı).
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
        country: "TR",
        isDefault,
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
