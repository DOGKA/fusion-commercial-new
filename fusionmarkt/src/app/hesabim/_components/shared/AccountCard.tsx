import { cn } from "@/lib/utils";
import AccountSectionHeader from "./AccountSectionHeader";

interface AccountCardProps {
  children: React.ReactNode;
  /** Kart üst başlığı; verilirse AccountSectionHeader basılır */
  title?: string;
  description?: string;
  /** Başlığın sağındaki aksiyon alanı */
  action?: React.ReactNode;
  /** "default" → .account-content-card · "flat" → kenarlıksız (kart içi alt bölüm) */
  variant?: "default" | "flat";
  className?: string;
  /** Kart içi padding'i kaldırır (tam genişlik liste/tablo için) */
  noPadding?: boolean;
}

/**
 * Hesap sayfalarının en dış sarmalayıcısı.
 *
 * Sınıf dizisi page.tsx'teki mevcut içerik kartının aynısıdır; tek fark
 * sabit `height: 780px` inline stilinin olmaması (plan 01 §6.2).
 * Bilinçli olarak yükseklik prop'u almaz.
 */
export default function AccountCard({
  children,
  title,
  description,
  action,
  variant = "default",
  className,
  noPadding,
}: AccountCardProps) {
  return (
    <div
      className={cn(
        variant === "default" &&
          "account-content-card bg-background border border-border rounded-2xl",
        variant === "default" && (noPadding ? "p-0" : "p-6"),
        variant === "flat" && !noPadding && "py-4",
        className
      )}
    >
      {title && (
        <AccountSectionHeader
          title={title}
          description={description}
          action={action}
          className={noPadding ? "px-6 pt-6" : undefined}
        />
      )}
      {children}
    </div>
  );
}
