---
name: El Talkhawy Design System
description: A production-ready bilingual design system for a premium butcher and meat storefront with dark-first luxury presentation and warm artisan light mode.

fonts:
  display:
    family: "Libre Baskerville, Georgia, serif"
    usage: "Hero headings, premium section titles, high-emphasis editorial text"
  body:
    family: "Source Sans 3, Inter, system-ui, sans-serif"
    usage: "Body copy, forms, navigation, product metadata, tables"
  arabic:
    family: "Cairo, Tajawal, sans-serif"
    usage: "Arabic UI, navigation, forms, body text, labels"
  mono:
    family: "Fira Code, ui-monospace, monospace"
    usage: "Admin metrics, technical values, order codes, internal numeric utilities"

themes:
  dark:
    background: "#0c0b0a"
    surface: "#161513"
    surface-2: "#1f1d1b"
    surface-3: "#26231f"
    foreground: "#f2eee6"
    foreground-muted: "#c4beb4"
    foreground-soft: "#9e968b"
    border: "#35302b"
    border-muted: "#272522"
    primary: "#8b1e30"
    primary-hover: "#a3253a"
    primary-active: "#6e1725"
    primary-fg: "#fff5f7"
    accent: "#c5a059"
    accent-hover: "#d4b371"
    accent-active: "#b08d4b"
    accent-fg: "#0c0b0a"
    ring: "#d4b371"
    success: "#2e8b57"
    warning: "#d19a32"
    danger: "#b42318"
    info: "#5b8def"
    fresh: "#2f8f5b"
    frozen: "#5f7fa3"
    out-of-stock: "#7a6f66"
    price: "#e0c27a"
    old-price: "#9e968b"
    sale: "#8b1e30"
    premium: "#c5a059"
    delivery: "#7fa07a"
    trust: "#bfa37a"

  light:
    background: "#faf6ef"
    surface: "#f4eee4"
    surface-2: "#ebe1d4"
    surface-3: "#e1d4c4"
    foreground: "#1c1712"
    foreground-muted: "#5f554b"
    foreground-soft: "#7a6f64"
    border: "#d4c4a8"
    border-muted: "#e7dac7"
    primary: "#8b1e30"
    primary-hover: "#a3253a"
    primary-active: "#6e1725"
    primary-fg: "#fff7f8"
    accent: "#b7924d"
    accent-hover: "#c4a867"
    accent-active: "#9d7c3f"
    accent-fg: "#16120d"
    ring: "#b7924d"
    success: "#2f7d4f"
    warning: "#b5811f"
    danger: "#a3342c"
    info: "#3c6ed9"
    fresh: "#2f7d4f"
    frozen: "#6982a0"
    out-of-stock: "#9a8f84"
    price: "#9d7c3f"
    old-price: "#8a7d70"
    sale: "#8b1e30"
    premium: "#b7924d"
    delivery: "#58795f"
    trust: "#8f6f3b"

radius:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"

spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"

motion:
  duration-fast: "180ms"
  duration-base: "250ms"
  easing-standard: "cubic-bezier(0.22, 1, 0.36, 1)"

semantic:
  background: "{themes.dark.background}"
  foreground: "{themes.dark.foreground}"
  card: "{themes.dark.surface}"
  card-raised: "{themes.dark.surface-2}"
  card-hover: "{themes.dark.surface-3}"
  muted: "{themes.dark.foreground-muted}"
  soft: "{themes.dark.foreground-soft}"
  border: "{themes.dark.border}"
  border-muted: "{themes.dark.border-muted}"
  primary: "{themes.dark.primary}"
  primary-foreground: "{themes.dark.primary-fg}"
  accent: "{themes.dark.accent}"
  accent-foreground: "{themes.dark.accent-fg}"
  ring: "{themes.dark.ring}"
  success: "{themes.dark.success}"
  warning: "{themes.dark.warning}"
  danger: "{themes.dark.danger}"
  info: "{themes.dark.info}"
  price: "{themes.dark.price}"
  old-price: "{themes.dark.old-price}"
  sale: "{themes.dark.sale}"
  premium: "{themes.dark.premium}"
  fresh: "{themes.dark.fresh}"
  frozen: "{themes.dark.frozen}"
  out-of-stock: "{themes.dark.out-of-stock}"
  delivery: "{themes.dark.delivery}"
  trust: "{themes.dark.trust}"

ecommerce:
  price:
    color: "{semantic.price}"
    fontWeight: 700
  old-price:
    color: "{semantic.old-price}"
    textDecoration: "line-through"
  sale-badge:
    background: "{semantic.sale}"
    color: "{semantic.primary-foreground}"
  premium-badge:
    background: "{semantic.premium}"
    color: "{themes.dark.accent-fg}"
  stock-fresh:
    background: "color-mix(in srgb, {semantic.fresh} 18%, transparent)"
    color: "{semantic.fresh}"
  stock-frozen:
    background: "color-mix(in srgb, {semantic.frozen} 18%, transparent)"
    color: "{semantic.frozen}"
  stock-out:
    background: "color-mix(in srgb, {semantic.out-of-stock} 18%, transparent)"
    color: "{semantic.out-of-stock}"
  delivery-pill:
    background: "color-mix(in srgb, {semantic.delivery} 18%, transparent)"
    color: "{semantic.delivery}"
  trust-pill:
    background: "color-mix(in srgb, {semantic.trust} 18%, transparent)"
    color: "{semantic.trust}"

typography:
  display:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  h1:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.12
  h2:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: "Source Sans 3, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Source Sans 3, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.002em"
  body-sm:
    fontFamily: "Source Sans 3, Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Source Sans 3, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.04em"
  arabic-body:
    fontFamily: "Cairo, Tajawal, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.85
  arabic-label:
    fontFamily: "Cairo, Tajawal, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.6
  mono:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500

implementation:
  cssVariables:
    root:
      --background: "#faf6ef"
      --foreground: "#1c1712"
      --card: "#f4eee4"
      --card-raised: "#ebe1d4"
      --muted: "#5f554b"
      --soft: "#7a6f64"
      --border: "#d4c4a8"
      --border-muted: "#e7dac7"
      --primary: "#8b1e30"
      --primary-foreground: "#fff7f8"
      --accent: "#b7924d"
      --accent-foreground: "#16120d"
      --ring: "#b7924d"
      --price: "#9d7c3f"
      --old-price: "#8a7d70"
      --sale: "#8b1e30"
      --premium: "#b7924d"
      --fresh: "#2f7d4f"
      --frozen: "#6982a0"
      --out-of-stock: "#9a8f84"
      --delivery: "#58795f"
      --trust: "#8f6f3b"

    dark:
      --background: "#0c0b0a"
      --foreground: "#f2eee6"
      --card: "#161513"
      --card-raised: "#1f1d1b"
      --muted: "#c4beb4"
      --soft: "#9e968b"
      --border: "#35302b"
      --border-muted: "#272522"
      --primary: "#8b1e30"
      --primary-foreground: "#fff5f7"
      --accent: "#c5a059"
      --accent-foreground: "#0c0b0a"
      --ring: "#d4b371"
      --price: "#e0c27a"
      --old-price: "#9e968b"
      --sale: "#8b1e30"
      --premium: "#c5a059"
      --fresh: "#2f8f5b"
      --frozen: "#5f7fa3"
      --out-of-stock: "#7a6f66"
      --delivery: "#7fa07a"
      --trust: "#bfa37a"

rules:
  - Gold is a premium accent and should remain rare.
  - Dark mode is the default storefront presentation.
  - Body text must maintain at least 4.5:1 contrast ratio.
  - Arabic UI should render slightly larger and looser than English UI.
  - Product prices should use semantic price tokens, not hardcoded gold hex values.
  - Stock, sale, delivery, and trust states must use semantic tokens, not arbitrary colors.
  - Do not use cartoonish radius values above 16px on cards.
  - Do not use generic SaaS grays or bright grocery-style colors.
---