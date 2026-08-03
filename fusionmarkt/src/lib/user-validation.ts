/**
 * Kullanıcı profili alan doğrulamaları
 *
 * PUT /api/user/profile bugüne kadar hiçbir doğrulama yapmıyordu; gelen değer
 * ne olursa olsun trim edilip kaydediliyordu. Bu dosya o boşluğu kapatır.
 */

export type Gender = "FEMALE" | "MALE" | "UNSPECIFIED";

const GENDERS: readonly Gender[] = ["FEMALE", "MALE", "UNSPECIFIED"];

export interface FieldError {
  error: string;
  field: string;
}

export function isGender(value: unknown): value is Gender {
  return typeof value === "string" && (GENDERS as readonly string[]).includes(value);
}

/**
 * Telefonu `5XXXXXXXXX` (10 hane) biçimine indirger.
 *
 * Kullanıcılar `0555…`, `+90555…`, `0090555…` ve boşluklu/tireli biçimlerde
 * yazıyor. Tek biçimde saklamak, numaranın eşitlik karşılaştırmasını ve ileride
 * SMS entegrasyonunu mümkün kılar. Geçersizse null döner.
 *
 * DİKKAT: Yalnızca yeni yazımlar normalize edilir. Veritabanındaki eski kayıtlar
 * karışık biçimde kalır; toplu normalizasyon ayrı bir bakım işidir.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let local = digits;
  if (local.startsWith("0090")) local = local.slice(4);
  else if (local.startsWith("90") && local.length === 12) local = local.slice(2);
  else if (local.startsWith("0")) local = local.slice(1);

  return /^5\d{9}$/.test(local) ? local : null;
}

/** `5XXXXXXXXX` → `5XX XXX XX XX`. Beklenmeyen biçimde girdiyi olduğu gibi döner. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

export function validateName(raw: string): FieldError | null {
  const trimmed = raw.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { error: "Ad ve soyad 2-100 karakter olmalıdır", field: "name" };
  }
  return null;
}

/**
 * `YYYY-MM-DD` biçimi + gerçekten var olan bir tarih + 13-120 yaş aralığı.
 *
 * Alan şemada `String?` olarak kalıyor (tip değişimi geriye uyumluluğu bozardı),
 * bu yüzden biçim güvencesi tamamen buradaki kontrole dayanıyor.
 */
export function validateBirthDate(raw: string): FieldError | null {
  const invalid = { error: "Geçerli bir doğum tarihi giriniz", field: "birthDate" };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return invalid;

  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date, 31 Şubat gibi girdileri sessizce kaydırır; geri okuyup karşılaştırmak
  // takvimde gerçekten var olmayan tarihleri yakalar.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return invalid;
  }

  const now = new Date();
  let age = now.getUTCFullYear() - year;
  const beforeBirthday =
    now.getUTCMonth() < month - 1 ||
    (now.getUTCMonth() === month - 1 && now.getUTCDate() < day);
  if (beforeBirthday) age -= 1;

  if (age < 13 || age > 120) return invalid;

  return null;
}
