"use client";

import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface TextShimmerProps {
  children: string;
  className?: string;
  shimmerWidth?: number;
}

export function TextShimmer({
  children,
  className,
  shimmerWidth = 100,
}: TextShimmerProps) {
  return (
    <p
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
        "animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-white to-transparent",
        className
      )}
    >
      {children}
    </p>
  );
}

