/**
 * KVKK-compliant data masking utilities
 * Masks sensitive data for email display
 */

/**
 * Mask email address
 * example@domain.com -> ex*****@do*****.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";

  const [domainName, ext] = domain.split(".");
  
  const maskedLocal = local.slice(0, 2) + "*".repeat(Math.max(local.length - 2, 3));
  const maskedDomain = domainName.slice(0, 2) + "*".repeat(Math.max(domainName.length - 2, 3));
  
  return `${maskedLocal}@${maskedDomain}.${ext}`;
}

/**
 * Mask phone number
 * 05551234567 -> 0555***4567
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 10) return "***********";
  
  return cleaned.slice(0, 4) + "***" + cleaned.slice(-4);
}

/**
 * Mask full name
 * Ahmet Yılmaz -> A**** Y*****
 */
export function maskName(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] + "*".repeat(Math.max(word.length - 1, 3)))
    .join(" ");
}

/**
 * Mask address - keeps city/district, masks street details
 * "Atatürk Mah. 123 Sk. No:45" -> "A******* Mah. *** Sk. No:**"
 */
export function maskAddress(address: string): string {
  // Mask numbers
  const masked = address.replace(/\d+/g, "**");
  
  // Mask street names but keep structure words
  const words = masked.split(" ");
  const structureWords = ["Mah.", "Mh.", "Sk.", "Sok.", "Cd.", "Cad.", "No:", "Kat:", "Daire:", "Apt.", "Blok", "Site"];
  
  return words
    .map((word) => {
      if (structureWords.some((s) => word.includes(s))) {
        return word;
      }
      if (word.length <= 2) return word;
      return word[0] + "*".repeat(word.length - 1);
    })
    .join(" ");
}

/**
 * Mask TC Kimlik number
 * 12345678901 -> 123*****901
 */
export function maskTCKN(tckn: string): string {
  const cleaned = tckn.replace(/\D/g, "");
  if (cleaned.length !== 11) return "***********";
  
  return cleaned.slice(0, 3) + "*****" + cleaned.slice(-3);
}

/**
 * Keep city and district visible, mask rest
 */
export function maskAddressKeepLocation(
  address: string,
  city: string,
  district: string
): string {
  const maskedAddress = maskAddress(address);
  return `${maskedAddress}, ${district}/${city}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

