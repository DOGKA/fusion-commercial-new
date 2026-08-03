"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Mobil footer akordeonu — Footer'ın istemcide kalan TEK parçası.
 *
 * Bölüm içerikleri `content` olarak, yani sunucuda render edilmiş hâlde
 * geliyor. Bu bilinçli: footer'ın DOM'unun neredeyse tamamı bu bağlantı
 * listeleri ve bunları istemci bileşeninin İÇİNDE üretmek 19 bağlantıyı da
 * her sayfada hidrasyona sokardı. Burada sadece açık/kapalı durumu yaşıyor.
 *
 * Tek-açık davranışı korundu (bir bölüm açılınca diğeri kapanır); bu yüzden
 * durum tek tek bölümlerde değil, ortak ebeveynde tutuluyor.
 */
export default function FooterAccordion({
  sections,
}: {
  sections: { key: string; title: string; content: ReactNode }[];
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="divide-y divide-[var(--glass-border)]">
      {sections.map(({ key, title, content }) => (
        <div key={key}>
          <button
            onClick={() => setOpenSection(openSection === key ? null : key)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
            aria-expanded={openSection === key}
          >
            <span className="text-[15px] font-semibold text-foreground">{title}</span>
            <ChevronDown
              className={`w-5 h-5 text-[var(--foreground-tertiary)] transition-transform duration-200 ${
                openSection === key ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openSection === key ? "max-h-[400px] pb-4" : "max-h-0"
            }`}
          >
            {content}
          </div>
        </div>
      ))}
    </div>
  );
}
