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

