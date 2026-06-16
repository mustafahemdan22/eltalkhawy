<!-- convex-ai-start -->

## Convex Context

This project uses [Convex](https://convex.dev) as its backend.

When working on any Convex code, always read `convex/_generated/ai/guidelines.md` first.
This file contains project-specific Convex rules and patterns that override general assumptions.

If Convex AI support files are missing, install them with:

```bash
npx convex ai-files install
```

<!-- convex-ai-end -->

## Design Context

This project uses the **impeccable** design system.

- **Register**: `brand`
- **Product Type**: Premium consumer-facing storefront
- **Brand Personality**: Luxury Steakhouse & Artisan Butcher
- **Visual Direction**:
  - Dark-first premium UI
  - Burgundy and gold accents
  - Elegant, warm, cinematic presentation
  - Typography led by Libre Baskerville and Cairo
- **Reference Files**:
  - `./PRODUCT.md` — Strategic goals, target users, and product principles
  - `./DESIGN.md` — Color palette, type hierarchy, component states, elevation rules, and design do's and don'ts

## Implementation Rules

- Follow `PRODUCT.md` for product priorities and user experience direction.
- Follow `DESIGN.md` for visual system decisions and component styling rules.
- Do not introduce UI that conflicts with the premium butcher brand.
- Do not use generic grocery-store styling.
- Preserve dark-first luxury presentation unless a task explicitly requires otherwise.
- Ensure all work remains responsive, accessible, bilingual-ready, and production-ready.