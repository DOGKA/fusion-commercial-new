"use client";

import { ReactNode, useMemo } from "react";

// ============================================
// TYPES
// ============================================

export type PreviewMode = "web" | "mobile" | "wide";

export interface PreviewFrameProps {
  mode: PreviewMode;
  children: ReactNode;
  className?: string;
  showPhoneFrame?: boolean;
}

// ============================================
// CONSTANTS (from tokens.css)
// ============================================

const PREVIEW_SIZES = {
  web: {
    width: 900,
    height: 600,
    aspectRatio: "16/9",
  },
  mobile: {
    width: 320,
    height: 560,
    aspectRatio: "9/16",
  },
  wide: {
    width: 520,
    height: 220,
    aspectRatio: "3/1",
  },
} as const;

const PHONE_FRAME = {
  bezel: 12,
  notchWidth: 100,
  notchHeight: 24,
  radius: 32,
  homeButtonSize: 40,
} as const;

// ============================================
// PHONE FRAME COMPONENT
// ============================================

interface PhoneFrameWrapperProps {
  children: ReactNode;
  width: number;
  height: number;
}

function PhoneFrameWrapper({ children, width, height }: PhoneFrameWrapperProps) {
  const outerWidth = width + PHONE_FRAME.bezel * 2;
  const outerHeight = height + PHONE_FRAME.bezel * 2 + PHONE_FRAME.notchHeight;

  return (
    <div
      className="relative bg-[#1a1a1a] shadow-2xl"
      style={{
        width: outerWidth,
        height: outerHeight,
        borderRadius: PHONE_FRAME.radius,
        padding: PHONE_FRAME.bezel,
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-[32px] pointer-events-none"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      />

      {/* Dynamic Island / Notch */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] z-10 flex items-center justify-center"
        style={{
          top: PHONE_FRAME.bezel - 2,
          width: PHONE_FRAME.notchWidth,
          height: PHONE_FRAME.notchHeight,
          borderRadius: "0 0 16px 16px",
        }}
      >
        {/* Camera */}
        <div className="w-3 h-3 rounded-full bg-[#2a2a2a] border border-[#3a3a3a]" />
      </div>

      {/* Screen */}
      <div
        className="relative bg-white dark:bg-dark overflow-hidden"
        style={{
          width,
          height,
          borderRadius: PHONE_FRAME.radius - PHONE_FRAME.bezel,
          marginTop: PHONE_FRAME.notchHeight - PHONE_FRAME.bezel,
        }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-black/5 dark:bg-white/5 flex items-center justify-between px-4 z-10">
          <span className="text-[10px] font-medium text-dark/70 dark:text-white/70">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-dark/70 dark:text-white/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1s-1-.45-1-1V4c0-.55.45-1 1-1z" />
              <path d="M16.5 8c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1s-1-.45-1-1V9c0-.55.45-1 1-1z" />
              <path d="M7.5 10c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1z" />
            </svg>
            <svg className="w-3 h-3 text-dark/70 dark:text-white/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <div className="w-6 h-3 rounded-sm bg-dark/70 dark:bg-white/70 relative">
              <div className="absolute right-0.5 top-0.5 bottom-0.5 left-1 rounded-[2px] bg-fm-success" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 pt-6 overflow-hidden">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-dark/20 dark:bg-white/20 rounded-full" />
      </div>

      {/* Side Buttons */}
      <div
        className="absolute bg-[#2a2a2a] rounded-r-sm"
        style={{
          left: -2,
          top: 100,
          width: 3,
          height: 30,
        }}
      />
      <div
        className="absolute bg-[#2a2a2a] rounded-r-sm"
        style={{
          left: -2,
          top: 140,
          width: 3,
          height: 50,
        }}
      />
      <div
        className="absolute bg-[#2a2a2a] rounded-r-sm"
        style={{
          left: -2,
          top: 200,
          width: 3,
          height: 50,
        }}
      />
      <div
        className="absolute bg-[#2a2a2a] rounded-l-sm"
        style={{
          right: -2,
          top: 120,
          width: 3,
          height: 80,
        }}
      />
    </div>
  );
}

// ============================================
// WEB FRAME COMPONENT
// ============================================

interface WebFrameWrapperProps {
  children: ReactNode;
  width: number;
  height: number;
}

function WebFrameWrapper({ children, width, height }: WebFrameWrapperProps) {
  return (
    <div
      className="relative bg-white dark:bg-dark rounded-lg overflow-hidden shadow-lg"
      style={{ width, height }}
    >
      {/* Browser Chrome */}
      <div className="h-8 bg-gray-2 dark:bg-dark-2 flex items-center px-3 gap-2 border-b border-stroke dark:border-dark-3">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-light" />
          <div className="w-3 h-3 rounded-full bg-yellow-dark" />
          <div className="w-3 h-3 rounded-full bg-fm-success" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-4">
          <div className="h-5 bg-white dark:bg-dark-3 rounded flex items-center px-2">
            <svg className="w-3 h-3 text-gray-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] text-gray-5 truncate">fusionmarkt.com</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="overflow-hidden"
        style={{ height: height - 32 }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// WIDE FRAME COMPONENT
// ============================================

interface WideFrameWrapperProps {
  children: ReactNode;
  width: number;
  height: number;
}

function WideFrameWrapper({ children, width, height }: WideFrameWrapperProps) {
  return (
    <div
      className="relative bg-white dark:bg-dark rounded-fm-md overflow-hidden shadow-fm-card"
      style={{ width, height }}
    >
      {children}
    </div>
  );
}

// ============================================
// MAIN PREVIEW FRAME COMPONENT
// ============================================

export default function PreviewFrame({
  mode,
  children,
  className = "",
  showPhoneFrame = true,
}: PreviewFrameProps) {
  const { width, height } = PREVIEW_SIZES[mode];

  const frameContent = useMemo(() => {
    switch (mode) {
      case "mobile":
        if (showPhoneFrame) {
          return (
            <PhoneFrameWrapper width={width} height={height}>
              {children}
            </PhoneFrameWrapper>
          );
        }
        return (
          <div
            className="bg-white dark:bg-dark rounded-lg overflow-hidden shadow-lg"
            style={{ width, height }}
          >
            {children}
          </div>
        );

      case "web":
        return (
          <WebFrameWrapper width={width} height={height}>
            {children}
          </WebFrameWrapper>
        );

      case "wide":
        return (
          <WideFrameWrapper width={width} height={height}>
            {children}
          </WideFrameWrapper>
        );

      default:
        return null;
    }
  }, [mode, width, height, children, showPhoneFrame]);

  return (
    <div className={`fm-preview-container ${className}`}>
      {frameContent}
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { PREVIEW_SIZES, PHONE_FRAME };
