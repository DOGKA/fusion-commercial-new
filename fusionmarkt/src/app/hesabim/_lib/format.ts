/**
 * Hesabım — biçimlendirme yardımcıları
 *
 * `formatPrice` ve `formatDate` page.tsx'ten birebir taşındı (plan 01 §5.10);
 * daha önce üç ayrı yerde tekrar eden Intl blokları tek noktaya indirildi.
 */

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Saat göstermeyen kısa biçim. */
export const formatDateShort = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Sipariş numarası kimliksel döner: `FM-2026-12345` olduğu gibi gösterilir.
 * Referansın 3'erli gruplaması uygulanmaz; biçim ileride değişirse tek nokta olsun diye var.
 */
export const formatOrderNumber = (orderNumber: string) => orderNumber;

/**
 * Telefonun ortasını maskeler: `05551234567` → `0555*****67`.
 * Son 2 ve ilk 4 hane açık kalır. Beklenmeyen uzunlukta girdi olduğu gibi döner.
 */
export const maskPhone = (phone: string | null | undefined) => {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  const head = digits.slice(0, 4);
  const tail = digits.slice(-2);
  return `${head}${"*".repeat(digits.length - 6)}${tail}`;
};

/**
 * Ad soyadın baş harfleri. Türkçe `i → İ` dönüşümü için `tr-TR` locale'i kullanılır.
 * İsim yoksa marka baş harfleri döner.
 */
export const getInitials = (name: string | null | undefined) => {
  if (!name || !name.trim()) return "FM";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0].toLocaleUpperCase("tr-TR")).join("");
};
