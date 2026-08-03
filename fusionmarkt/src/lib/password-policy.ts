/**
 * Şifre uzunluk kuralının TEK kaynağı (F2-74).
 *
 * Neden ayrı bir dosya: kural altı ayrı yerde elle yazılmıştı ve zamanla
 * birbirinden ayrılmıştı — kayıt 8, şifre sıfırlama 6, sipariş sonrası şifre
 * kurma 6, şifre değiştirme ise 8 + büyük/küçük harf + rakam istiyordu. Sonuç:
 * 8 karakterle üye olan biri "şifremi unuttum" akışından geçip 6 karaktere
 * inebiliyordu, yani en sıkı kural kaçış yolu olduğu için pratikte
 * uygulanmıyordu.
 *
 * Bu dosya hem sunucu uçlarından hem istemci formlarından import edilir; sunucuya
 * özel bir bağımlılığı olmamalı ki arayüz sunucudan daha gevşek kalmasın
 * (gevşek kalırsa buton aktif olur ama istek 400 döner).
 *
 * Uzunluk dışında kural YOK — büyük harf/rakam zorunluluğu kullanıcı kararıyla
 * kaldırıldı (31 Tem).
 */

export const MIN_PASSWORD_LENGTH = 8;

/** Form altındaki ipucu ve `placeholder` metinleri için. */
export const PASSWORD_HINT = `En az ${MIN_PASSWORD_LENGTH} karakter`;

/** Uçların 400 gövdesinde ve istemci alan hatalarında kullanılan tek metin. */
export const PASSWORD_TOO_SHORT_ERROR = `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır`;

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
