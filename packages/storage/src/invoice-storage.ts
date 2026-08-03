/**
 * Fatura PDF'lerinin diskteki konumu — iki uygulamanın ortak kaynağı.
 *
 * NEDEN AYRI BİR MODÜL: Bu yol bir güvenlik sınırı. Storefront okuyor, admin
 * hem yazıyor hem okuyor. Mantık iki uygulamada ayrı ayrı dursaydı biri
 * değişip diğeri kalabilirdi; sızıntı tam olarak böyle doğar.
 *
 * NEDEN `public/` DEĞİL: Next.js `public/` altındaki her dosyayı kimlik
 * doğrulaması olmadan servis eder. Faturalar 31 Tem'e kadar oradaydı ve
 * `/storage/invoices/FM-2025-08423.pdf` adresinden oturumsuz indirilebiliyordu
 * — `/api/invoices/...` ucuna koyduğumuz oturum kapısını tamamen boşa
 * çıkarıyordu (F2-70). Dosya adları sipariş numarasından türediği için
 * denemeyle de bulunabiliyorlardı.
 *
 * TEK OKUMA YOLU: `/api/invoices/[file]` — oturum + token arar (F2-61).
 */

import path from "path";
import { stat } from "fs/promises";

/**
 * Üretimde bu değişkeni **mutlak yol** olarak ayarlayın; iki uygulama da aynı
 * klasörü göstermek zorunda. Ayarlanmazsa aşağıdaki varsayılan kullanılır.
 */
export const INVOICE_STORAGE_ENV = "INVOICE_STORAGE_DIR";

/**
 * Varsayılan: monorepo kökünde `storage/invoices`.
 *
 * İki uygulama da kendi klasöründen çalıştığı için `..` her ikisinde de
 * monorepo köküne çıkar (`/var/www/fusionmarkt/storage/invoices` gibi). Admin
 * zaten `..` üzerinden storefront'un klasörüne yazıyordu, yani bu yerleşim
 * varsayımı yeni değil — sadece hedef artık `public/` dışında.
 */
function defaultInvoiceDir(): string {
  return path.join(process.cwd(), "..", "storage", "invoices");
}

/** Faturaların yazıldığı ve öncelikli olarak okunduğu klasör. */
export function getInvoiceDir(): string {
  const fromEnv = process.env[INVOICE_STORAGE_ENV];
  return fromEnv && fromEnv.trim() ? path.resolve(fromEnv.trim()) : defaultInvoiceDir();
}

/**
 * Taşınma öncesi yüklenmiş faturaların durduğu eski klasör. **Yalnızca okuma.**
 *
 * Kullanıcı kararı (31 Tem): eski dosyalar yerinde bırakılıyor, yenileri yeni
 * klasöre gidiyor. Bu yüzden okuma iki yere de bakmak zorunda. Buradaki
 * dosyalar hâlâ statik olarak da servis ediliyor; klasör boşaldığında bu geri
 * dönüş silinebilir.
 */
export function getLegacyInvoiceDir(): string {
  return path.join(process.cwd(), "public", "storage", "invoices");
}

/**
 * Dosya adını doğrular. Yol ayracı, üst dizin çıkışı ve beklenmedik karakter
 * kabul etmez — çağıran taraf adı doğrudan kullanıcıdan alıyor olabilir.
 */
export function safeInvoiceFileName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!input.endsWith(".pdf")) return null;
  if (input.includes("/") || input.includes("\\") || input.includes("..")) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(input)) return null;
  return input;
}

/**
 * Faturayı önce yeni, sonra eski klasörde arar. Bulamazsa `null`.
 *
 * Dosya adının `safeInvoiceFileName`'den geçmiş olması beklenir.
 */
export async function findInvoiceFile(fileName: string): Promise<string | null> {
  for (const dir of [getInvoiceDir(), getLegacyInvoiceDir()]) {
    const candidate = path.join(dir, fileName);
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // sıradaki klasöre bak
    }
  }
  return null;
}
