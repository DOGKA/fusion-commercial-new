"use client";

import { useState, useCallback } from "react";
import { ShoppingBag, Check, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// ADD TO CART BUTTON
// Two variants: icon-only and with text
// ═══════════════════════════════════════════════════════════════════════════

type ButtonState = "idle" | "loading" | "success" | "error";

interface AddToCartButtonProps {
  product: Omit<CartItem, "id" | "quantity"> & { quantity?: number };
  variant?: "icon" | "text";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  requiresVariant?: boolean; // If true, product.variant must be set
  onNeedsVariant?: () => void; // Callback when variant is needed but not selected
}

function CartPlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8.75 16.25C8.75 15.9048 8.47018 15.625 8.125 15.625M8.75 16.25C8.75 16.5952 8.47018 16.875 8.125 16.875M8.75 16.25H7.5M8.125 15.625C7.77982 15.625 7.5 15.9048 7.5 16.25M8.125 15.625V16.875M7.5 16.25C7.5 16.5952 7.77982 16.875 8.125 16.875M15 16.25C15 15.9048 14.7202 15.625 14.375 15.625M15 16.25C15 16.5952 14.7202 16.875 14.375 16.875M15 16.25H13.75M14.375 15.625C14.0298 15.625 13.75 15.9048 13.75 16.25M14.375 15.625V16.875M13.75 16.25C13.75 16.5952 14.0298 16.875 14.375 16.875M3.125 3.125H3.58252C4.17932 3.125 4.69287 3.54687 4.80874 4.13231L6.09375 10.625M6.09375 10.625L6.38918 12.1177C6.50505 12.7031 7.0186 13.125 7.61539 13.125H15M6.09375 10.625H14.649C15.2226 10.625 15.7226 10.2346 15.8617 9.67817L16.8377 7.17817C17.0349 6.38924 16.4382 5.625 15.625 5.625M10.625 3.4375V5.625M10.625 5.625V7.8125M10.625 5.625H12.8125M10.625 5.625H8.4375"
        stroke="currentColor"
        strokeWidth="1.38"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExclamationIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M12 4v10" />
      <path d="M12 20h.01" />
    </svg>
  );
}

// iOS-style Squircle border-radius (güncellenmiş değerler)
const SQUIRCLE = {
  sm: "12px",
  md: "14px",
  lg: "16px", // True squircle - not pill
};

export default function AddToCartButton({
  product,
  variant = "icon",
  disabled = false,
  className,
  size = "md",
  requiresVariant = false,
  onNeedsVariant,
}: AddToCartButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const { addItem } = useCart();

  // Check if variant is required but not selected
  const needsVariant = requiresVariant && !product.variant;

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || buttonState !== "idle") return;

      // Check if variant is required
      if (needsVariant) {
        setButtonState("error");
        // Notify parent component that variant selection is needed
        if (onNeedsVariant) {
          onNeedsVariant();
        }
        setTimeout(() => {
          setButtonState("idle");
        }, 2500);
        return;
      }

      setButtonState("loading");

      try {
        const { quantity, ...productData } = product;
        await addItem({ ...productData, quantity: quantity || 1 });
        setButtonState("success");

        // Reset to idle after showing success
        setTimeout(() => {
          setButtonState("idle");
        }, 1500);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        setButtonState("idle");
      }
    },
    [addItem, product, disabled, buttonState, needsVariant, onNeedsVariant]
  );

  // Size configurations - sm height matches favorite button (40px)
  const sizeConfig = {
    sm: {
      icon: { width: 40, height: 40, iconSize: 16 },
      text: { padding: "16px 16px", height: 40, iconSize: 14, fontSize: "12px" },
    },
    md: {
      icon: { width: 46, height: 46, iconSize: 18 },
      text: { padding: "20px 20px", height: 46, iconSize: 14, fontSize: "13px" },
    },
    lg: {
      icon: { width: 52, height: 52, iconSize: 20 },
      text: { padding: "24px 24px", height: 52, iconSize: 16, fontSize: "14px" },
    },
  };

  const config = sizeConfig[size];

  // ─────────────────────────────────────────────────────────────────────────
  // ICON VARIANT
  // ─────────────────────────────────────────────────────────────────────────
  if (variant === "icon") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        title={
          disabled
            ? "Yakında stoklarda"
            : buttonState === "loading"
            ? "Ekleniyor..."
            : buttonState === "success"
            ? "Eklendi!"
            : buttonState === "error"
            ? "Varyant seçiniz"
            : needsVariant
            ? "Varyant seçiniz"
            : "Sepete Ekle"
        }
        className={cn(
          "relative overflow-hidden",
          "transition-all duration-300 ease-out",
          disabled && "cursor-not-allowed",
          !disabled && "card-glass-button-strong",
          className
        )}
        style={{
          width: config.icon.width,
          height: config.icon.height,
          borderRadius: SQUIRCLE.lg,
          backgroundColor: disabled
            ? "rgba(251, 191, 36, 0.12)"
            : "var(--glass-bg)",
          border: disabled
            ? "1px solid rgba(251, 191, 36, 0.55)"
            : "1px solid transparent",
          color: "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled
            ? "0 2px 10px rgba(251, 191, 36, 0.20)"
            : "none",
          transform: "scale(1)",
        }}
      >
        {/* Icon Container with rotation */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            buttonState === "loading" && !disabled && "animate-spin"
          )}
        >
          {disabled ? (
            <ExclamationIcon size={config.icon.iconSize} />
          ) : (
            <>
              {buttonState === "idle" && (
                <CartPlusIcon size={config.icon.iconSize + 6} />
              )}
              {buttonState === "loading" && (
                <Loader2 size={config.icon.iconSize} strokeWidth={2.5} />
              )}
              {buttonState === "success" && (
                <span
                  className="animate-cart-check flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: "rgba(16, 185, 129, 0.95)",
                    color: "#FFFFFF",
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                </span>
              )}
              {buttonState === "error" && (
                <span
                  className="animate-cart-check flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: "rgba(239, 68, 68, 0.95)",
                    color: "#FFFFFF",
                  }}
                >
                  <AlertCircle size={18} strokeWidth={2.5} />
                </span>
              )}
            </>
          )}
        </div>
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEXT VARIANT
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      title={disabled ? "Yakında stoklarda" : undefined}
      className={cn(
        "relative overflow-hidden group",
        "transition-all duration-300 ease-out",
        disabled && "cursor-not-allowed",
        buttonState === "success" && "animate-cart-success",
        className
      )}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: config.text.padding,
        height: `${config.text.height}px`,
        backgroundColor: disabled
          ? "rgba(251, 191, 36, 0.12)"
          : buttonState === "success"
          ? "rgba(16, 185, 129, 0.15)"
          : buttonState === "error"
          ? "rgba(239, 68, 68, 0.15)"
          : "var(--glass-bg)",
        border: disabled
          ? "1px solid rgba(251, 191, 36, 0.55)"
          : buttonState === "success"
          ? "1px solid rgba(16, 185, 129, 0.4)"
          : buttonState === "error"
          ? "1px solid rgba(239, 68, 68, 0.4)"
          : "1px solid var(--glass-border)",
        borderRadius: SQUIRCLE.md, // 14px squircle
        color: disabled
          ? "var(--foreground)"
          : buttonState === "success"
          ? "#34d399"
          : buttonState === "error"
          ? "#f87171"
          : "var(--foreground)",
        fontSize: config.text.fontSize,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: "110px",
        boxShadow: disabled ? "0 2px 10px rgba(251, 191, 36, 0.20)" : undefined,
        transform: buttonState === "success" || buttonState === "error" ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Icon */}
      <span
        className={cn(
          "flex items-center justify-center transition-all duration-300",
          buttonState === "loading" && !disabled && "animate-spin"
        )}
      >
        {disabled ? (
          <AlertTriangle size={config.text.iconSize} strokeWidth={2.5} />
        ) : (
          <>
            {buttonState === "idle" && (
              <ShoppingBag size={config.text.iconSize} />
            )}
            {buttonState === "loading" && (
              <Loader2 size={config.text.iconSize} />
            )}
            {buttonState === "success" && (
              <Check
                size={config.text.iconSize}
                strokeWidth={3}
                className="animate-pop-in"
              />
            )}
            {buttonState === "error" && (
              <AlertCircle
                size={config.text.iconSize}
                strokeWidth={2.5}
                className="animate-pop-in"
              />
            )}
          </>
        )}
      </span>

      {/* Text */}
      <span className="transition-all duration-200">
        {disabled
          ? "Yakında stoklarda"
          : buttonState === "idle"
          ? "Sepete Ekle"
          : buttonState === "loading"
          ? "Ekleniyor..."
          : buttonState === "success"
          ? "Eklendi!"
          : "Varyant Seçiniz"}
      </span>

      {/* Hover shine effect */}
      {!disabled && (
        <span
          className={cn(
            "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent"
          )}
        />
      )}
    </button>
  );
}
