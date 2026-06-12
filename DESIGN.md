---
name: El Talkhawy Design System
description: A premium bilingual design system evoking a luxury steakhouse and artisan butchery.
colors:
  primary: "#8b1e30"
  primary-hover: "#a3253a"
  primary-active: "#6e1725"
  primary-fg: "#fff5f7"
  gold: "#c5a059"
  gold-hover: "#d4b371"
  gold-active: "#b08d4b"
  gold-fg: "#0c0b0a"
  neutral-bg: "#0c0b0a"
  neutral-surface: "#161513"
  neutral-surface-raised: "#1f1d1b"
  neutral-text: "#f2eee6"
  neutral-text-secondary: "#c4beb4"
  border-default: "#35302b"
  border-muted: "#272522"
typography:
  display:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.005em"
  mono:
    fontFamily: "Fira Code, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
  arabic:
    fontFamily: "Cairo, Tajawal, sans-serif"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  card: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  sm: "1.5rem"
  md: "2rem"
  lg: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-fg}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-gold-hover:
    backgroundColor: "{colors.gold-hover}"
---

# Design System: El Talkhawy

## 1. Overview

**Creative North Star: "The Upscale Steakhouse"**

El Talkhawy's design system evokes the sensory, theatrical experience of an upscale, premium steakhouse. Visual layouts utilize dark, high-contrast, atmospheric surfaces combined with warm, glowing gold details and deep culinary burgundy (maroon) brand accents. The styling relies on absolute visual premiumness, rejecting the flat, gray, low-contrast conventions of modern SaaS layouts. 

The system implements visual duality. The default is a dark luxury theme simulating a sophisticated culinary space. An alternative light theme simulates organic, premium artisan butcher paper, replacing pure whites with a warm cream base and deep charcoal typography. Responsive grids are mobile-first, and every interaction features tactile micro-animations.

**Key Characteristics:**
- High contrast and dark-mode default for a premium aesthetic.
- Restrained, intentional usage of culinary gold and burgundy.
- Bilingual typographic hierarchy tailored for both English (Libre Baskerville serif) and Arabic (Cairo sans-serif).
- Rigid corner rounding constraints to avoid a childish or cartoonish look.

---

## 2. Colors

The color palette is built on rich, warm tones that suggest culinary quality, heat, and authenticity.

### Primary
- **Culinary Burgundy** (#8b1e30): The signature brand color representing rich culinary heritage. Used as the main color for key actions, brand logos, active states, and premium badge backgrounds.

### Secondary
- **Warm Premium Gold** (#c5a059): Accent color representing premium quality. Reserved strictly for stars, discounts, pricing highlights, active filters, and interactive focus indicators.

### Neutral
- **Steakhouse Charcoal** (#0c0b0a): The default dark base background color, providing depth and contrast.
- **Warm Cream** (#f2eee6): The primary typography ink in dark mode, ensuring high legibility and contrast against dark surfaces.
- **Artisan Paper** (#faf6ef): The base background color for the light theme, mirroring high-quality butcher paper.
- **Deep Espresso** (#1c1712): The primary typography ink in light mode.
- **Soot Border** (#35302b): The default border color for dividers and card strokes, framing components subtly.

**The Golden Rarity Rule.** The premium gold color (`#c5a059`) is used on less than 10% of any given screen. Its effectiveness depends on its rarity; overuse degrades the premium feel of the storefront.

**The Contrast Safety Rule.** Body text must always meet a minimum contrast ratio of 4.5:1 against the background surface. Text must never fade into muted grays.

---

## 3. Typography

The design features a high-contrast serif and sans-serif pairing, representing a blend of classic culinary craftsmanship and modern digital efficiency.

**Display Font:** Libre Baskerville (with Georgia, serif fallback)
**Body Font:** Nunito Sans (with system-ui, sans-serif fallback)
**Arabic Font:** Cairo (with Tajawal, sans-serif fallback)
**Mono Font:** Fira Code (for prices and metrics)

**Character:** Libre Baskerville brings historical weight, elegance, and premium branding to hero display text. Nunito Sans provides a clean, open, highly legible canvas for descriptions and tables. In Arabic mode, Cairo provides clean, geometric readability that scales beautifully.

### Hierarchy
- **Display** (Bold (700), clamp(2.25rem, 5vw, 4.5rem), 1.1 line-height): Used exclusively for primary hero section titles and main landing headings.
- **Headline** (Bold (700), 1.875rem, 1.2 line-height): Used for section headers (H2).
- **Title** (Semi-Bold (600), 1.25rem, 1.3 line-height): Used for card titles and component headers (H3).
- **Body** (Regular (400), 1rem, 1.6 line-height): Used for all descriptive text, paragraphs, and specifications. Max line-length capped at 75ch.
- **Label** (Semi-Bold (600), 0.875rem, tracking 0.05em): Used for form labels, tags, buttons, and short navigational items.

**The Bilingual Parity Rule.** Arabic text using Cairo is rendered 10% larger than its English Nunito counterpart to maintain matching visual weight and layout heights across both languages.

---

## 4. Elevation

The system is flat by default to maintain clean lines, relying on background tone transitions and borders for separation. Elevated states are reserved strictly for user-triggered events (e.g., hover, focus, active).

### Shadow Vocabulary
- **Card Rest shadow** (`0 2px 16px rgba(0, 0, 0, 0.45)`): Subtle background depth separation for cards on dark bases.
- **Card Hover lift** (`0 8px 32px rgba(0, 0, 0, 0.6)`): Applied when hovering over product cards or interactive links, accompanied by a -3px Y-axis translate.
- **Gold Glow** (`0 0 12px rgba(197, 160, 89, 0.12)`): Subtle golden backlight behind primary gold buttons or banners.

**The Elevation Response Rule.** Elevation is interactive. Component surfaces remain flat at rest and lift only upon user hover or focus, reinforcing clickability.

---

## 5. Components

Components are styled to look solid, well-crafted, and responsive.

### Buttons
- **Shape:** Rounded-button (6px border-radius).
- **Primary:** Culinary Burgundy background (#8b1e30) with Warm Cream text (#fff5f7) and 0.75rem 1.5rem padding.
- **Gold Button:** Warm Gold background (#c5a059) with Dark Charcoal text (#0c0b0a) and 0.75rem 1.5rem padding.
- **Hover / Focus:** Transits using a cubic-bezier(0.22, 1, 0.36, 1) timing function over 250ms. Focus displays a gold outline ring.

### Cards / Containers
- **Corner Style:** Rounded-card (10px border-radius).
- **Background:** Raised Surface (#161513 in dark mode, #f4eee4 in light mode).
- **Border:** Subtle 1px solid border (#35302b in dark mode, #d4c4a8 in light mode).
- **Internal Padding:** Generous padding (1.5rem to 2rem) to avoid cluttered information layouts.

### Inputs / Fields
- **Style:** 1px solid border (#35302b), Rounded-button (6px) corner style, and raised surface background (#1f1d1b).
- **Focus:** Border transitions to Warm Gold (#c5a059) with an offset-free 2px gold focus ring.

### Navigation
- **Style:** Semi-transparent base background (#0c0b0a with 93% opacity) with a 14px backdrop filter blur and 1px bottom border stroke.

---

## 6. Do's and Don'ts

### Do:
- **Do** respect the bilingual Cairo/Libre Baskerville pairing rules, ensuring line heights are adjusted appropriately.
- **Do** preserve the Dark default theme unless the user explicitly switches to Light mode.
- **Do** ensure every interactive button, input, or link has a visible, high-contrast `:focus-visible` ring.
- **Do** cap container widths at 1280px (`--max-content`) to keep layouts structured on ultra-wide screens.

### Don't:
- **Don't** use flat gray gradients or low-contrast text that makes the interface look like a generic SaaS dashboard.
- **Don't** use card rounding values above 16px (no 24px, 32px, or 40px card corners) to prevent a cartoonish appearance.
- **Don't** use side-stripe borders (e.g., vertical left-side borders) as decorative accents on cards or alerts.
- **Don't** use gradient text or backdrop blurs (glassmorphism) as a default layout styling.
- **Don't** use sketchy doodles, hand-drawn icons, or amateurish vector paths; rely on clean typography and rich photographic content.
