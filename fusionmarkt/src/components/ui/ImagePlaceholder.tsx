/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ImageOff, Package, Zap, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";

type PlaceholderType = "product" | "category" | "avatar" | "hero" | "brand" | "default";

interface ImagePlaceholderProps {
  type?: PlaceholderType;
  text?: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg" | "xl";
}

const iconSizes = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const typeConfig: Record<PlaceholderType, { icon: typeof ImageOff; gradient: string }> = {
  product: {
    icon: Zap,
    gradient: "from-[var(--fusion-primary)]/20 to-[var(--fusion-secondary)]/20",
  },
  category: {
    icon: Package,
    gradient: "from-[var(--fusion-secondary)]/20 to-[var(--fusion-primary)]/20",
  },
  avatar: {
    icon: User,
    gradient: "from-[var(--fusion-primary)]/30 to-[var(--fusion-secondary)]/30",
  },
  hero: {
    icon: ImageOff,
    gradient: "from-[var(--fusion-primary)]/10 via-transparent to-[var(--fusion-secondary)]/10",
  },
  brand: {
    icon: Package,
    gradient: "from-[var(--glass-bg)] to-[var(--background-tertiary)]",
  },
  default: {
    icon: ImageOff,
    gradient: "from-[var(--glass-bg)] to-[var(--background-elevated)]",
  },
};

export default function ImagePlaceholder({ 
  type = "default", 
  text,
  className,
  iconSize = "md"
}: ImagePlaceholderProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center gap-3",
        "bg-gradient-to-br",
        config.gradient,
        className
      )}
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <Icon className={cn(iconSizes[iconSize], "text-[var(--foreground-muted)]")} />
      
      {text && (
        <span className="text-xs text-[var(--foreground-muted)] font-medium uppercase tracking-wider">
          {text}
        </span>
      )}
    </div>
  );
}

