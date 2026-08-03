import { cn } from "@/lib/utils";

interface AccountSectionHeaderProps {
  title: string;
  description?: string;
  /** Sağ taraf: buton(lar), sayaç, "Tümünü gör" linki */
  action?: React.ReactNode;
  /** Kabuğun h1'iyle çakışmasın diye h2'den başlar */
  as?: "h2" | "h3";
  className?: string;
}

export default function AccountSectionHeader({
  title,
  description,
  action,
  as: Heading = "h2",
  className,
}: AccountSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-3 border-b border-border",
        className
      )}
    >
      <div className="min-w-0">
        <Heading className="text-[17px] font-medium text-foreground truncate">
          {title}
        </Heading>
        {description && (
          <p className="text-[13px] text-foreground-muted mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
