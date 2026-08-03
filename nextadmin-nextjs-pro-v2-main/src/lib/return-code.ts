import { randomInt } from "crypto";
import { prisma, type RequestType } from "@repo/db";

/**
 * İADE KODU
 *
 * Onaylanan her iade talebine tekil bir kod verilir. Müşteri kodu paketin
 * üzerine yazar / kargo görevlisine bildirir; depo geleni kodla eşleştirir.
 * Kodu olmayan koli = onaylanmamış iade, ayırt edilebilir.
 *
 * Kod insan tarafından elle yazılıp elle okunuyor. Bu yüzden:
 *   - Karışan karakterler (0/O, 1/I/L) alfabede yok.
 *   - Harfler büyük, gruplar tire ile ayrılmış: IADE-XY7K-M4RQ
 */

/** 0/O ve 1/I/L çıkarıldı; kalan 31 karakter. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const GROUP_LENGTH = 4;
const GROUP_COUNT = 2;
const PREFIX = "IADE";

/** 31^8 ≈ 852 milyar olasılık; çakışma pratikte yok, yine de kontrol ediyoruz. */
function randomCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUP_COUNT; g++) {
    let group = "";
    for (let i = 0; i < GROUP_LENGTH; i++) {
      group += ALPHABET[randomInt(ALPHABET.length)];
    }
    groups.push(group);
  }
  return [PREFIX, ...groups].join("-");
}

/**
 * Veritabanında kullanılmayan bir iade kodu üretir.
 *
 * Kod `returnCode` üzerinde unique index ile korunuyor; buradaki ön kontrol
 * yalnızca yarış durumunda atılacak hatayı azaltmak için. Asıl güvence
 * veritabanı kısıtı, o yüzden çağıran taraf unique hatasını da ele almalı
 * (bkz. approveWithReturnCode).
 */
export async function generateReturnCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await prisma.returnRequest.findUnique({
      where: { returnCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("İade kodu üretilemedi: 5 denemede de çakışma oluştu");
}

/** Kullanıcının girdiği kodu karşılaştırmaya uygun hale getirir. */
export function normalizeReturnCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Bu talep tipinde müşteri fiziksel olarak paket gönderiyor mu?
 *
 * Kod yalnızca depoya koli gelecekse anlamlı. Fatura taleplerinde gönderilecek
 * bir şey yok, kod vermek müşteriyi "ne göndereceğim?" diye şaşırtır.
 * EXTRA_ITEM listede: fazla gelen ürün geri gönderiliyor.
 */
export function requiresReturnShipment(requestType: RequestType): boolean {
  return requestType === "RETURN" || requestType === "EXTRA_ITEM";
}
