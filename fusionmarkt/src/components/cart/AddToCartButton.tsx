"use client";

import { useState, useCallback } from "react";
import { ShoppingBag, Check, Loader2, AlertCircle } from "lucide-react";
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
            ? "Stokta Yok"
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
          disabled && "cursor-not-allowed opacity-50",
          buttonState === "success" && "animate-cart-success",
          className
        )}
        style={{
          width: config.icon.width,
          height: config.icon.height,
          borderRadius: SQUIRCLE.lg,
          backgroundColor:
            buttonState === "success"
              ? "rgba(16, 185, 129, 0.95)"
              : buttonState === "error"
              ? "rgba(239, 68, 68, 0.95)"
              : "rgba(255, 255, 255, 0.1)",
          backdropFilter: disabled ? "none" : "blur(16px)",
          WebkitBackdropFilter: disabled ? "none" : "blur(16px)",
          border:
            buttonState === "success"
              ? "1px solid rgba(16, 185, 129, 0.6)"
              : buttonState === "error"
              ? "1px solid rgba(239, 68, 68, 0.6)"
              : "1px solid rgba(255, 255, 255, 0.15)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow:
            buttonState === "success"
              ? "0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)"
              : buttonState === "error"
              ? "0 8px 32px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.2)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          transform: buttonState === "success" || buttonState === "error" ? "scale(1.05)" : "scale(1)",
        }}
      >
        {/* Icon Container with rotation */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            buttonState === "loading" && "animate-spin"
          )}
        >
          {buttonState === "idle" && (
            <ShoppingBag size={config.icon.iconSize} strokeWidth={2.5} />
          )}
          {buttonState === "loading" && (
            <Loader2 size={config.icon.iconSize} strokeWidth={2.5} />
          )}
          {buttonState === "success" && (
            <Check
              size={config.icon.iconSize}
              strokeWidth={3}
              className="animate-pop-in"
            />
          )}
          {buttonState === "error" && (
            <AlertCircle
              size={config.icon.iconSize}
              strokeWidth={2.5}
              className="animate-pop-in"
            />
          )}
        </div>

        {/* Success ripple effect */}
        {buttonState === "success" && (
          <span className="absolute inset-0 rounded-[16px] animate-ping bg-emerald-500/30" />
        )}
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
      className={cn(
        "relative overflow-hidden group",
        "transition-all duration-300 ease-out",
        disabled && "cursor-not-allowed opacity-50",
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
        backgroundColor:
          buttonState === "success"
            ? "rgba(16, 185, 129, 0.15)"
            : buttonState === "error"
            ? "rgba(239, 68, 68, 0.15)"
            : "rgba(255, 255, 255, 0.08)",
        border:
          buttonState === "success"
            ? "1px solid rgba(16, 185, 129, 0.4)"
            : buttonState === "error"
            ? "1px solid rgba(239, 68, 68, 0.4)"
            : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: SQUIRCLE.md, // 14px squircle
        color: buttonState === "success" ? "#34d399" : buttonState === "error" ? "#f87171" : "white",
        fontSize: config.text.fontSize,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: "110px",
        transform: buttonState === "success" || buttonState === "error" ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Icon */}
      <span
        className={cn(
          "flex items-center justify-center transition-all duration-300",
          buttonState === "loading" && "animate-spin"
        )}
      >
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
      </span>

      {/* Text */}
      <span className="transition-all duration-200">
        {buttonState === "idle" && "Sepete Ekle"}
        {buttonState === "loading" && "Ekleniyor..."}
        {buttonState === "success" && "Eklendi!"}
        {buttonState === "error" && "Varyant Seçiniz"}
      </span>

      {/* Hover shine effect */}
      <span
        className={cn(
          "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent"
        )}
      />
    </button>
  );
}
