/**
 * Hesabım kabuğunun tamamında paylaşılan buton sınıf reçeteleri.
 *
 * Sipariş yüzeyine özel reçeteler (`ACTION_PILL`, `sheetPrimary` …) hâlâ
 * `siparisler/_lib/action-classes.ts` içinde; burada yalnızca her alt sayfanın
 * ihtiyaç duyduğu ortak parçalar var.
 */

/**
 * Pasif buton/alan paleti.
 *
 * `opacity` KULLANILMIYOR. Opaklığı düşürmek metni ve zemini aynı oranda
 * soldurur; renkli bir çipte (`acc-chip-accent`) bu, zaten 4.8:1 olan metni
 * `opacity-50`'de ~2:1'e indiriyordu — pasif "Sorgula" ve "Güncelle"
 * butonlarının okunamamasının sebebi buydu. Yerine ayrı bir pasif paleti:
 * nötr zemin + `--foreground-tertiary` metin, iki temada da AA'nın epey
 * üstünde ve "bu buton şu an çalışmıyor" bilgisini renk yerine tonla veriyor.
 *
 * KAPSAM: burası çip OLMAYAN öğeler için — `<select>`, ikon butonları, nötr
 * zeminli butonlar. `acc-chip-*` taşıyan butonların pasif görünümü CSS'ten
 * geliyor (`account.css`, `.acc-chip-*:disabled`), buradan gelemez: çip
 * renkleri katmansız bir stil dosyasında tanımlı ve katmansız bildirimler
 * Tailwind'in `utilities` katmanındaki `disabled:` varyantlarını yeniyor.
 * İkisi birlikte kullanılınca çakışmıyorlar, aynı paleti yazıyorlar.
 */
export const DISABLED_TONE =
  "disabled:cursor-not-allowed disabled:border-border disabled:bg-glass-bg disabled:text-foreground-tertiary disabled:shadow-none";
