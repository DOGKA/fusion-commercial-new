"use client";

/**
 * Footer'daki "Çerez Ayarları" satırı. Ayrı dosyada olması Footer'ın sunucu
 * bileşeni kalmasını sağlıyor: tüm footer'ı istemciye taşıyan tek şey bu
 * butonun onClick'iydi.
 *
 * Olay CookieConsent tarafından dinleniyor; banner tembel yüklendiği için
 * doğrudan çağrı yerine window olayı kullanılıyor.
 */
export default function CookieSettingsButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("openCookieSettings"))}
      className={className}
    >
      {label}
    </button>
  );
}
