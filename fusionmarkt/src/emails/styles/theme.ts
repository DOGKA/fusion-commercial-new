/**
 * Email Theme - FusionMarkt
 * Glassmorphism + Minimal + Corporate
 * 
 * Design Principles:
 * - Dark theme with subtle transparency
 * - Minimal color palette
 * - Mobile-first responsive
 * - shadcn/ui inspired spacing and typography
 */

export const theme = {
  // Colors
  colors: {
    // Brand
    primary: "#10b981",      // Emerald - main accent
    secondary: "#6b7280",    // Gray
    
    // Logo colors (for reference)
    logoRed: "#dd0000",
    logoYellow: "#ffcc00",
    logoWhite: "#ffffff",
    
    // Backgrounds
    bgDark: "#030303",
    bgCard: "rgba(10, 10, 10, 0.95)",
    bgGlass: "rgba(255, 255, 255, 0.03)",
    bgGlassHover: "rgba(255, 255, 255, 0.05)",
    
    // Borders
    border: "rgba(255, 255, 255, 0.06)",
    borderLight: "rgba(255, 255, 255, 0.08)",
    borderAccent: "rgba(16, 185, 129, 0.3)",
    
    // Text
    text: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.7)",
    textFaded: "rgba(255, 255, 255, 0.5)",
    textDim: "rgba(255, 255, 255, 0.3)",
    
    // Status colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    purple: "#8b5cf6",
  },
  
  // Typography (shadcn-inspired)
  fonts: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  
  fontSizes: {
    xs: "11px",
    sm: "13px",
    base: "14px",
    md: "15px",
    lg: "18px",
    xl: "22px",
    "2xl": "28px",
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Spacing (4px base)
  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
  
  // Border radius
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  
  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
  
  // Layout
  layout: {
    maxWidth: "560px",
    contentPadding: "40px",
    contentPaddingMobile: "24px",
  },
} as const;

// Common styles for reuse
export const commonStyles = {
  // Container
  container: {
    backgroundColor: theme.colors.bgDark,
    fontFamily: theme.fonts.sans,
    margin: "0",
    padding: "0",
  },
  
  // Main card with glassmorphism
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.xl,
  },
  
  // Glass panel
  glassPanel: {
    backgroundColor: theme.colors.bgGlass,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
  },
  
  // Text styles
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: theme.lineHeights.tight,
    margin: "0",
  },
  
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: theme.lineHeights.normal,
    margin: "0",
  },
  
  textSmall: {
    color: theme.colors.textFaded,
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.lineHeights.normal,
    margin: "0",
  },
  
  label: {
    color: theme.colors.textFaded,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0",
  },
  
  // Primary button
  button: {
    backgroundColor: theme.colors.primary,
    color: "#ffffff",
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: theme.radius.md,
    textDecoration: "none",
    display: "inline-block",
  },
  
  // Secondary button (outline)
  buttonSecondary: {
    backgroundColor: "transparent",
    color: theme.colors.text,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.medium,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    textDecoration: "none",
    display: "inline-block",
  },
  
  // Divider
  divider: {
    borderTop: `1px solid ${theme.colors.border}`,
    margin: `${theme.spacing[6]} 0`,
  },
  
  // Monospace text (for codes, order numbers)
  mono: {
    fontFamily: theme.fonts.mono,
    letterSpacing: "1px",
  },
} as const;

export default theme;

