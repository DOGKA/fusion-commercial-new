/**
 * Adreslerim tipleri
 *
 * `GET /api/user/addresses` Prisma kaydını olduğu gibi döndürüyor; burada
 * yalnızca arayüzün okuduğu alanlar tanımlı. Ödeme akışı aynı uçtan besleniyor,
 * o yüzden yanıt şekli değiştirilmedi — alanlar eklendi.
 */

export type AddressUsage = "SHIPPING" | "BILLING" | "BOTH";
export type AddressCategory = "HOME" | "WORK" | "OTHER";
export type InvoiceType = "INDIVIDUAL" | "CORPORATE";

export interface UserAddress {
  id: string;
  title: string | null;
  fullName: string | null;
  phone: string;
  city: string;
  district: string | null;
  address: string | null;
  addressLine1: string | null;
  postalCode: string | null;
  isDefault: boolean;
  type: AddressUsage;
  addressCategory: AddressCategory | null;
  invoiceType: InvoiceType | null;
  company: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
}

/** Yeni kategori alanı eklenmeden önce kaydedilmiş adreslere güvenli karşılık. */
export function effectiveAddressCategory(
  address: Pick<UserAddress, "addressCategory" | "title">
): AddressCategory {
  if (address.addressCategory) return address.addressCategory;

  const title = address.title?.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
  if (title === "EV" || title === "EVİM" || title === "HOME") return "HOME";
  if (title === "İŞ" || title === "İŞ YERİ" || title === "OFİS" || title === "WORK") {
    return "WORK";
  }
  return "OTHER";
}

/** Formun tuttuğu değerler — hepsi string, kaydetmeden önce API'ye çevrilir. */
export interface AddressFormValues {
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  type: AddressUsage;
  addressCategory: AddressCategory | "";
  invoiceType: InvoiceType;
  company: string;
  taxNumber: string;
  taxOffice: string;
  isDefault: boolean;
}

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  title: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  postalCode: "",
  type: "BOTH",
  addressCategory: "OTHER",
  invoiceType: "INDIVIDUAL",
  company: "",
  taxNumber: "",
  taxOffice: "",
  isDefault: false,
};

export function toFormValues(address: UserAddress): AddressFormValues {
  return {
    title: address.title ?? "",
    fullName: address.fullName ?? "",
    phone: address.phone ?? "",
    city: address.city ?? "",
    district: address.district ?? "",
    address: address.addressLine1 || address.address || "",
    postalCode: address.postalCode ?? "",
    type: address.type ?? "BOTH",
    addressCategory: effectiveAddressCategory(address),
    invoiceType: address.invoiceType ?? "INDIVIDUAL",
    company: address.company ?? "",
    taxNumber: address.taxNumber ?? "",
    taxOffice: address.taxOffice ?? "",
    isDefault: address.isDefault,
  };
}

/** Sekme filtresi: `BOTH` her iki sekmede de görünür. */
export function matchesUsage(address: UserAddress, tab: "SHIPPING" | "BILLING") {
  return address.type === tab || address.type === "BOTH";
}
