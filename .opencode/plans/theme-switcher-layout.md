# Theme Switcher & Layout Verification

## Issues Found

### 1. Missing `color-scheme` CSS property
- `:root` (dark theme) — needs `color-scheme: dark;`
- `[data-theme="light"]` — needs `color-scheme: light;`
- **File:** `app/globals.css:20` and `:165`
- **Impact:** Browser scrollbar, form controls, and default UI elements won't match the active theme (dark scrollbar on light theme, etc.)

### 2. Unguarded hydration in mobile theme toggle
- Mobile menu theme button at `components/layout/Navbar.tsx:547` reads `theme === 'dark'` without a `mounted` guard
- Desktop toggle at line 320 is properly guarded with `mounted &&`
- **File:** `components/layout/Navbar.tsx:547`
- **Impact:** Potential hydration mismatch — `theme` is `undefined` on first server render, so `aria-label` shows "Switch to dark mode" then flashes to correct value

## Fix Plan

### File 1: `app/globals.css`

**Line 20** — after `:root {`, add:
```css
color-scheme: dark;
```

**Line 165** — after `[data-theme="light"] {`, add:
```css
color-scheme: light;
```

### File 2: `components/layout/Navbar.tsx`

**Line 546-547** — change:
```tsx
className="p-2 rounded-button text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
```
To:
```tsx
className="p-2 rounded-button text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
aria-label={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
```

## Verification
After applying, run:
```
npx tsc --noEmit
npx next build
```
