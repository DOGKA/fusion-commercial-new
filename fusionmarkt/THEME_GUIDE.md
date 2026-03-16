# 🎨 FusionMarkt Theme System Guide

## Genel Bakış

FusionMarkt, `next-themes` tabanlı light/dark tema sistemi kullanır. Tema tercihi `localStorage`'da saklanır ve sistem teması da desteklenir.

## Temel Kurallar

### ✅ DOĞRU Yaklaşımlar

#### 1. CSS Variables (Temel renkler için)
```tsx
// Background
className="bg-background"           // Ana arka plan
className="bg-background-secondary" // İkincil arka plan

// Foreground (text)
className="text-foreground"         // Ana metin
className="text-foreground-secondary" // İkincil metin
className="text-foreground-muted"   // Soluk metin

// Border
className="border-border"           // Standart border
className="border-glass-border"     // Glass efekt border

// Glass efektleri
className="bg-glass-bg"             // Glass background
className="bg-glass-bg-hover"       // Glass hover
```

#### 2. Dark Prefix (Gradient/Glow için)
```tsx
// Gradient'ler CSS variable'da tanımlanamaz, dark: prefix kullan
className="bg-white dark:bg-gradient-to-b dark:from-[#0d0d0d] dark:to-[#080808]"

// Ring/Glow efektleri
className="ring-white dark:ring-[#0d0d0d]"
```

#### 3. Inline Style'larda CSS Variable
```tsx
style={{
  backgroundColor: "var(--background)",
  border: "1px solid var(--glass-border)"
}}
```

### ❌ YANLIŞ Yaklaşımlar (Kullanma!)

```tsx
// ❌ Hardcoded hex - YASAK
className="bg-[#0a0a0a]"
className="text-white"

// ❌ Hardcoded rgba - YASAK
style={{ backgroundColor: "#0a0a0a" }}
style={{ color: "rgba(255,255,255,0.5)" }}
```

## Mevcut Token'lar

### Background
| Token | Light | Dark |
|-------|-------|------|
| `--background` | #FFFFFF | #0A0A0A |
| `--background-secondary` | #F8F9FA | #111111 |
| `--background-tertiary` | #F1F3F5 | #171717 |
| `--background-elevated` | #FFFFFF | #1F1F1F |
| `--background-hover` | #E9ECEF | #262626 |

### Foreground
| Token | Light | Dark |
|-------|-------|------|
| `--foreground` | #0A0A0A | #FAFAFA |
| `--foreground-secondary` | rgba(10,10,10,0.75) | rgba(250,250,250,0.75) |
| `--foreground-tertiary` | rgba(10,10,10,0.55) | rgba(250,250,250,0.55) |
| `--foreground-muted` | rgba(10,10,10,0.4) | rgba(250,250,250,0.4) |

### Glass
| Token | Light | Dark |
|-------|-------|------|
| `--glass-bg` | rgba(255,255,255,0.7) | rgba(255,255,255,0.03) |
| `--glass-border` | rgba(0,0,0,0.06) | rgba(255,255,255,0.06) |

## Tema Toggle Kullanımı

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

// Header'da
<ThemeToggle />

// Mobil menüde (label ile)
<ThemeToggleCompact />
```

## Dosya Yapısı

```
src/
├── components/
│   ├── ThemeProvider.tsx    # next-themes wrapper
│   └── ThemeToggle.tsx      # Toggle butonları
├── styles/
│   ├── variables.css        # CSS token tanımları
│   ├── base.css            # Global stiller
│   └── globals.css         # Tailwind + imports
└── app/
    └── layout.tsx          # ThemeProvider wrap
```

## Yeni Bileşen Oluştururken

1. Hardcoded renk kullanma
2. CSS variable veya `dark:` prefix kullan
3. Glassmorphism için `--glass-*` token'larını kullan
4. Focus state için `focus-visible:ring-2 focus-visible:ring-primary` kullan

---

Son güncelleme: Ocak 2026

