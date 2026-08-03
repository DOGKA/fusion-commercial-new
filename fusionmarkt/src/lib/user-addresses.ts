/**
 * Adreslerim listesi sorgusu — tek kaynak.
 *
 * Hem `GET /api/user/addresses` hem de sayfanın sunucu tarafı ilk render'ı
 * (F2-45) bunu kullanıyor. Yazma işlemleri (POST/PUT/DELETE) route
 * handler'larında kalıyor; burada yalnızca okuma var.
 *
 * Yanıt şekli bilerek Prisma kaydıyla uyumlu tutuluyor — ödeme akışı aynı
 * uçtan besleniyor, alan eklemek serbest ama kaldırmak değil.
 */

import { prisma } from "@repo/db";
import type { UserAddress } from "@/app/hesabim/adresler/_lib/types";

function joinName(firstName: string | null, lastName: string | null): string | null {
  const joined = [firstName, lastName].filter(Boolean).join(" ").trim();
  return joined || null;
}

/**
 * Kullanıcının yumuşak silinmemiş adresleri.
 *
 * Dönüş tipi istemci sözleşmesi (`UserAddress`): SSR yolunda yalnızca arayüzün
 * okuduğu alanlar geçiyor. Prisma'nın ekstra kolonları (createdAt vb.) API
 * yolunda JSON ile gidiyordu ama istemci onları kullanmıyor.
 */
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const rows = await prisma.address.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      fullName: true,
      // Ödeme akışında kaydedilen adresler `fullName` yerine bu ikisini
      // dolduruyor; alıcı adı boş görünmesin diye aşağıda birleştiriliyor.
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      district: true,
      address: true,
      addressLine1: true,
      postalCode: true,
      isDefault: true,
      type: true,
      addressCategory: true,
      invoiceType: true,
      company: true,
      taxNumber: true,
      taxOffice: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    fullName: row.fullName || joinName(row.firstName, row.lastName),
    phone: row.phone,
    city: row.city,
    district: row.district,
    address: row.address,
    addressLine1: row.addressLine1,
    postalCode: row.postalCode,
    isDefault: row.isDefault,
    type: row.type,
    addressCategory: row.addressCategory,
    invoiceType: row.invoiceType,
    company: row.company,
    taxNumber: row.taxNumber,
    taxOffice: row.taxOffice,
  }));
}
