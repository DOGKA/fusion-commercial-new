import { cn } from "@/lib/utils";

export type AccountSkeletonVariant =
  | "page"
  | "shell"
  | "card"
  | "orderRow"
  | "productCard"
  | "form"
  | "text";

interface AccountSkeletonProps {
  variant?: AccountSkeletonVariant;
  /** Kaç tekrar (liste iskeletleri için) */
  count?: number;
  /** variant="text" için satır sayısı */
  lines?: number;
  className?: string;
}

const Block = ({ className }: { className?: string }) => (
  <span className={cn("account-skeleton block", className)} aria-hidden="true" />
);

function Variant({
  variant,
  lines,
}: {
  variant: AccountSkeletonVariant;
  lines: number;
}) {
  switch (variant) {
    case "shell":
      return (
        <div className="account-page-layout flex gap-6">
          <div className="account-sidebar-desktop w-[300px] flex-shrink-0">
            <Block className="h-[420px] rounded-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <Block className="h-8 w-48 mb-5 rounded-lg" />
            <Block className="h-[480px] rounded-2xl" />
          </div>
        </div>
      );

    case "page":
      return (
        <div>
          <Block className="h-8 w-48 mb-5 rounded-lg" />
          <Block className="h-[480px] rounded-2xl" />
        </div>
      );

    case "card":
      return <Block className="h-40 rounded-2xl" />;

    case "orderRow":
      return (
        <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
          <div className="flex gap-2 flex-shrink-0">
            <Block className="h-14 w-14 rounded-lg" />
            <Block className="h-14 w-14 rounded-lg" />
            <Block className="h-14 w-14 rounded-lg" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Block className="h-3 w-32 rounded" />
            <Block className="h-3 w-24 rounded" />
          </div>
          <div className="space-y-2 text-right flex-shrink-0">
            <Block className="h-3 w-24 rounded" />
            <Block className="h-4 w-20 rounded" />
          </div>
        </div>
      );

    case "productCard":
      return (
        <div className="flex gap-4 p-4 border border-border rounded-xl">
          <Block className="h-20 w-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Block className="h-3 w-3/4 rounded" />
            <Block className="h-3 w-1/2 rounded" />
            <Block className="h-4 w-28 rounded" />
          </div>
        </div>
      );

    case "form":
      return (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Block className="h-3 w-24 rounded" />
              <Block className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      );

    case "text":
    default:
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Block
              key={i}
              className={cn("h-3 rounded", i === lines - 1 ? "w-2/3" : "w-full")}
            />
          ))}
        </div>
      );
  }
}

export default function AccountSkeleton({
  variant = "text",
  count = 1,
  lines = 3,
  className,
}: AccountSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(count > 1 && "space-y-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Variant key={i} variant={variant} lines={lines} />
      ))}
      <span className="sr-only">Yükleniyor</span>
    </div>
  );
}
