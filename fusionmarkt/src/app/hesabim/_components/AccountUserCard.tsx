"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials } from "../_lib/format";

interface AccountUserCardProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image?: string | null;
  /** "sidebar" → dikey ortalı (masaüstü) · "mobile" → yatay satır (mobil menü başı) */
  variant?: "sidebar" | "mobile";
}

export default function AccountUserCard({
  name,
  email,
  image,
  variant = "sidebar",
}: AccountUserCardProps) {
  const initials = getInitials(name);

  const avatar = image ? (
    <Image
      src={image}
      alt=""
      width={variant === "sidebar" ? 56 : 44}
      height={variant === "sidebar" ? 56 : 44}
      className="rounded-full object-cover shrink-0"
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "acc-chip-accent inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        variant === "sidebar" ? "w-14 h-14 text-[18px]" : "w-11 h-11 text-[15px]"
      )}
    >
      {initials}
    </span>
  );

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-3 py-2">
        {avatar}
        <div className="min-w-0 flex-1">
          <span className="text-[16px] font-semibold text-foreground truncate block">
            {name || "Kullanıcı"}
          </span>
          <p className="text-[13px] text-foreground-muted truncate">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-b border-border">
      <div className="flex flex-col items-center text-center gap-3">
        {avatar}
        <div className="w-full min-w-0">
          <span className="text-[19px] font-semibold text-foreground truncate w-full block">
            {name || "Kullanıcı"}
          </span>
          <p className="text-[15px] text-foreground-muted truncate w-full mt-0.5">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}
