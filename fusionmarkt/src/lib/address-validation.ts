/**
 * Adres alan doğrulamaları
 *
 * POST/PUT /api/user/addresses bugüne kadar hiçbir doğrulama yapmıyordu:
 * `title?.trim() || "Adres"` deseniyle boş gövde bile kabul ediliyor, telefon
 * ne gelirse kaydediliyordu. Bu dosya o boşluğu kapatır ve yeni alanların
 * (`type`, `postalCode`, `addressCategory`) izinli değerlerini tanımlar.
 *
 * Şehir/ilçe bilinçli olarak beyaz listeye karşı doğrulanmıyor: veritabanındaki
 * eski kayıtlarda `lib/turkey-cities.ts` listesiyle birebir tutmayan yazımlar
 * var ve beyaz liste, kullanıcının o adresi düzenlemesini tamamen bloke ederdi.
 * Yalnızca boş olmama ve uzunluk sınırı uygulanıyor.
 */

import { normalizePhone, type FieldError } from "./user-validation";

export const ADDRESS_TYPES = ["SHIPPING", "BILLING", "BOTH"] as const;
export const ADDRESS_CATEGORIES = ["HOME", "WORK", "OTHER"] as const;
export const INVOICE_TYPES = ["INDIVIDUAL", "CORPORATE"] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number];
export type AddressCategory = (typeof ADDRESS_CATEGORIES)[number];
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export function isAddressType(value: unknown): value is AddressType {
  return typeof value === "string" && (ADDRESS_TYPES as readonly string[]).includes(value);
}

export function isAddressCategory(value: unknown): value is AddressCategory {
  return (
    typeof value === "string" && (ADDRESS_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isInvoiceType(value: unknown): value is InvoiceType {
  return typeof value === "string" && (INVOICE_TYPES as readonly string[]).includes(value);
}

/**
 * Ödeme sayfası fatura tipini `"person"` / `"company"` olarak taşıyor, şema ise
 * `INDIVIDUAL` / `CORPORATE` enum'u kullanıyor. Eşleme tek yerde durmalı ki iki
 * taraf birbirinden habersiz sapmasın.
 */
export function invoiceTypeFromCheckout(value: unknown): InvoiceType | null {
  if (value === "company") return "CORPORATE";
  if (value === "person") return "INDIVIDUAL";
  return null;
}

export function invoiceTypeToCheckout(value: InvoiceType | null | undefined): "person" | "company" {
  return value === "CORPORATE" ? "company" : "person";
}

/** Vergi kimlik no 10 hane, TCKN ile fatura kesiliyorsa 11 hane olabiliyor. */
export function isValidTaxNumber(raw: string): boolean {
  return /^\d{10,11}$/.test(raw);
}

export interface AddressPayload {
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  postalCode: string | null;
  type: AddressType;
  addressCategory: AddressCategory | null;
  isDefault: boolean;
  invoiceType: InvoiceType | null;
  company: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
}

export interface AddressInputBody {
  title?: unknown;
  fullName?: unknown;
  phone?: unknown;
  city?: unknown;
  district?: unknown;
  address?: unknown;
  postalCode?: unknown;
  type?: unknown;
  addressCategory?: unknown;
  isDefault?: unknown;
  invoiceType?: unknown;
  company?: unknown;
  taxNumber?: unknown;
  taxOffice?: unknown;
}

type Result =
  | { ok: true; data: AddressPayload }
  | { ok: false; error: FieldError };

const fail = (error: string, field: string): Result => ({
  ok: false,
  error: { error, field },
});

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Tam gövde doğrulaması. PUT de bunu kullanıyor: adres formu her zaman tüm
 * alanları gönderdiği için kısmi güncelleme desteklemek, yarım kaydedilmiş
 * adreslere kapı açardı. Tek istisna `isDefault`-only istekleri — onlar
 * ayrı yolda ele alınıyor (`isDefaultOnly`).
 */
export function validateAddress(body: AddressInputBody): Result {
  const title = str(body.title);
  if (title.length < 2 || title.length > 50) {
    return fail("Adres başlığı 2-50 karakter olmalıdır", "title");
  }

  // İki kelime şartı keyfi değil: ödeme sayfası bu alanı boşluktan bölerek
  // ad ve soyad üretiyor (`checkout/page.tsx`). Tek kelime girilirse soyad boş
  // kalır ve fatura/kargo bilgisi eksik çıkar.
  const fullName = str(body.fullName);
  if (fullName.length < 3 || fullName.length > 100) {
    return fail("Ad soyad 3-100 karakter olmalıdır", "fullName");
  }
  if (!/\s/.test(fullName)) {
    return fail("Ad ve soyadı birlikte giriniz", "fullName");
  }

  // Cep telefonu şartı kargo teslimatı için: kurye teslimatta bu numaradan
  // arıyor. SMS gönderimi projede aktif değil, o yüzden mesaj bilgilendirme
  // vaat etmiyor.
  const phone = normalizePhone(str(body.phone));
  if (!phone) {
    return fail(
      "Geçerli bir cep telefonu giriniz (örn. 0555 555 55 55). Kurye teslimatta bu numaradan ulaşır.",
      "phone"
    );
  }

  const city = str(body.city);
  if (city.length < 2 || city.length > 60) {
    return fail("İl seçiniz", "city");
  }

  const district = str(body.district);
  if (district.length < 2 || district.length > 60) {
    return fail("İlçe seçiniz", "district");
  }

  const address = str(body.address);
  if (address.length < 10 || address.length > 500) {
    return fail("Açık adres 10-500 karakter olmalıdır", "address");
  }

  const rawPostal = str(body.postalCode);
  if (rawPostal && !/^\d{5}$/.test(rawPostal)) {
    return fail("Posta kodu 5 haneli olmalıdır", "postalCode");
  }

  const type = body.type === undefined ? "BOTH" : body.type;
  if (!isAddressType(type)) {
    return fail("Geçersiz adres kullanım tipi", "type");
  }

  const rawCategory = body.addressCategory;
  if (rawCategory != null && rawCategory !== "" && !isAddressCategory(rawCategory)) {
    return fail("Geçersiz adres türü", "addressCategory");
  }

  // Fatura bilgisi yalnızca adres fatura adresi olarak da kullanılabiliyorsa
  // anlamlı. Sadece teslimat adresinde gelirse sessizce düşürülür.
  const usableForBilling = type === "BILLING" || type === "BOTH";
  const rawInvoiceType = body.invoiceType;
  if (
    rawInvoiceType != null &&
    rawInvoiceType !== "" &&
    !isInvoiceType(rawInvoiceType)
  ) {
    return fail("Geçersiz fatura tipi", "invoiceType");
  }
  const invoiceType =
    usableForBilling && isInvoiceType(rawInvoiceType) ? rawInvoiceType : null;

  let company: string | null = null;
  let taxNumber: string | null = null;
  let taxOffice: string | null = null;

  if (invoiceType === "CORPORATE") {
    company = str(body.company);
    if (company.length < 2 || company.length > 200) {
      return fail("Firma adı 2-200 karakter olmalıdır", "company");
    }

    const rawTaxNumber = str(body.taxNumber);
    if (!isValidTaxNumber(rawTaxNumber)) {
      return fail("Vergi kimlik numarası 10 veya 11 haneli olmalıdır", "taxNumber");
    }
    taxNumber = rawTaxNumber;

    taxOffice = str(body.taxOffice);
    if (taxOffice.length < 2 || taxOffice.length > 100) {
      return fail("Vergi dairesi giriniz", "taxOffice");
    }
  }

  return {
    ok: true,
    data: {
      title,
      fullName,
      phone,
      city,
      district,
      address,
      postalCode: rawPostal || null,
      type,
      addressCategory: isAddressCategory(rawCategory) ? rawCategory : null,
      isDefault: body.isDefault === true,
      invoiceType,
      company,
      taxNumber,
      taxOffice,
    },
  };
}

/**
 * "Varsayılan yap" isteği yalnızca `{ isDefault: true }` gönderir; kartın
 * yıldız butonu adresin diğer alanlarını bilmiyor. Bu şekli tam doğrulamadan
 * geçirmek onu 400'e düşürürdü.
 */
export function isDefaultOnly(body: AddressInputBody): boolean {
  const keys = Object.keys(body);
  return keys.length === 1 && keys[0] === "isDefault";
}
