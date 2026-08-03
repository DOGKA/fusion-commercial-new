import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

interface AccountEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyAction;
  /** "card" → kesikli kenarlıklı blok (mevcut desen) · "bare" → sadece metin+CTA */
  variant?: "card" | "bare";
  className?: string;
}

/** Görsel desen page.tsx'teki mevcut boş durum bloğundan alındı. */
export default function AccountEmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "card",
  className,
}: AccountEmptyStateProps) {
  const cta = action ? (
    "href" in action && action.href ? (
      <Link href={action.href} className="account-btn account-empty-state__cta">
        {action.label}
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    ) : (
      <button
        type="button"
        onClick={action.onClick}
        className="account-btn account-empty-state__cta"
      >
        {action.label}
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    )
  ) : null;

  return (
    <div
      className={cn(
        "flex items-center justify-center text-center",
        variant === "card" &&
          "account-inset rounded-xl border border-dashed border-border px-4 py-8",
        variant === "bare" && "py-6",
        className
      )}
    >
      <div>
        {Icon && (
          <Icon
            size={28}
            className="mx-auto mb-3 text-foreground-muted"
            aria-hidden="true"
          />
        )}
        <p className="text-[15px] text-foreground-muted">{title}</p>
        {description && (
          <p className="text-[13px] text-foreground-muted/80 mt-1">
            {description}
          </p>
        )}
        {cta && <div className="mt-5">{cta}</div>}
      </div>
    </div>
  );
}
