"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

// Hydration-safe mounted check
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className="w-4 h-4 rounded-full bg-foreground/10" />
        <div className="w-10 h-5 rounded-full bg-emerald-500/30" />
        <div className="w-4 h-4 rounded-full bg-foreground/10" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      className={cn("inline-flex items-center gap-2 group", className)}
    >
      {/* Sun icon - left side - fixed size, only color changes */}
      <Sun 
        className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
        style={{
          color: isDark ? "rgba(255,255,255,0.3)" : "#f59e0b"
        }}
      />

      {/* Toggle Track - Always emerald/teal */}
      <span
        className="relative w-10 h-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex-shrink-0"
        style={{
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
      >
        {/* Toggle Thumb */}
        <span
          className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ease-out"
          style={{ 
            left: isDark ? "calc(100% - 18px)" : "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
          }}
        />
      </span>

      {/* Moon icon - right side - fixed size, only color changes */}
      <Moon 
        className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
        style={{
          color: isDark ? "#60a5fa" : "rgba(156,163,175,0.5)"
        }}
      />

      {showLabel && (
        <span className="text-sm font-medium text-foreground ml-1">
          {isDark ? "Koyu" : "Açık"}
        </span>
      )}
    </button>
  );
}

// Compact version for mobile menu - fixed icon sizes, only colors change
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className={cn("flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl", className)}>
        <div className="w-[18px] h-[18px] rounded-full bg-foreground/10 flex-shrink-0" />
        <div className="w-11 h-6 rounded-full bg-emerald-500/30 flex-shrink-0" />
        <div className="w-[18px] h-[18px] rounded-full bg-foreground/10 flex-shrink-0" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      className={cn(
        "flex items-center justify-center gap-2.5 px-5 py-3",
        "rounded-xl border transition-colors duration-200",
        isDark 
          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]" 
          : "border-gray-200 bg-gray-50 hover:bg-gray-100",
        className
      )}
    >
      {/* Sun icon - fixed size 18px, only color changes */}
      <Sun 
        className="flex-shrink-0 transition-colors duration-200"
        style={{
          width: "18px",
          height: "18px",
          color: isDark ? "rgba(255,255,255,0.3)" : "#f59e0b"
        }}
      />

      {/* Toggle Track - Always emerald/teal, fixed size */}
      <span
        className="relative rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 flex-shrink-0"
        style={{
          width: "44px",
          height: "24px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.25)"
        }}
      >
        {/* Toggle Thumb - fixed size */}
        <span
          className="absolute rounded-full bg-white shadow-md transition-all duration-200 ease-out"
          style={{ 
            top: "3px",
            width: "18px",
            height: "18px",
            left: isDark ? "23px" : "3px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
          }}
        />
      </span>

      {/* Moon icon - fixed size 18px, only color changes */}
      <Moon 
        className="flex-shrink-0 transition-colors duration-200"
        style={{
          width: "18px",
          height: "18px",
          color: isDark ? "#60a5fa" : "rgba(156,163,175,0.5)"
        }}
      />
    </button>
  );
}
