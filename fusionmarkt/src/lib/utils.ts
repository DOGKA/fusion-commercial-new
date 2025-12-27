import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fiyatı Türkçe formatında göster (örn: ₺29.999)
 * Binlik ayracı nokta, ondalık yok, ₺ simgesi ile
 */
export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  return `₺${formatted}`;
}

/**
 * Email validasyonu
 * - @ işareti kontrolü
 * - Geçerli domain uzantısı (.com, .com.tr, .net, .org, .edu.tr, vb.)
 * - Boşluk ve geçersiz karakter kontrolü
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  
  const trimmed = email.trim().toLowerCase();
  
  // Temel kontroller
  if (trimmed.length < 5) return false; // en az a@b.c
  if (trimmed.includes(" ")) return false; // boşluk olamaz
  
  // RFC 5322 uyumlu regex (basitleştirilmiş ama kapsamlı)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(trimmed)) return false;
  
  // Domain kısmını kontrol et
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Local part kontrolü
  if (localPart.length === 0 || localPart.length > 64) return false;
  
  // Domain kontrolü
  if (domain.length < 3) return false; // en az a.b
  
  // Geçerli TLD kontrolü (yaygın uzantılar)
  const validTLDs = [
    ".com", ".com.tr", ".net", ".net.tr", ".org", ".org.tr", 
    ".edu", ".edu.tr", ".gov", ".gov.tr", ".mil", ".mil.tr",
    ".co", ".co.uk", ".io", ".app", ".dev", ".ai", ".me", 
    ".info", ".biz", ".xyz", ".online", ".site", ".tech",
    ".tr", ".de", ".fr", ".es", ".it", ".nl", ".be", ".at", ".ch",
    ".ru", ".jp", ".cn", ".kr", ".in", ".au", ".nz", ".br", ".mx",
    ".eu", ".uk", ".us", ".ca"
  ];
  
  const hasValidTLD = validTLDs.some(tld => domain.endsWith(tld));
  if (!hasValidTLD) return false;
  
  return true;
}

/**
 * Email validasyon hatası mesajı döndür
 */
export function getEmailError(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return "E-posta adresi gerekli";
  }
  
  const trimmed = email.trim();
  
  if (!trimmed.includes("@")) {
    return "Geçerli bir e-posta adresi girin (@ işareti eksik)";
  }
  
  if (trimmed.includes(" ")) {
    return "E-posta adresinde boşluk olamaz";
  }
  
  const parts = trimmed.split("@");
  if (parts.length !== 2 || parts[1].length === 0) {
    return "Geçerli bir e-posta adresi girin";
  }
  
  const domain = parts[1];
  if (!domain.includes(".")) {
    return "Geçersiz domain (örn: gmail.com)";
  }
  
  if (!isValidEmail(trimmed)) {
    return "Geçerli bir e-posta adresi girin (örn: ornek@gmail.com)";
  }
  
  return null;
}

