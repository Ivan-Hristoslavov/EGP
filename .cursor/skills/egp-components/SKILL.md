---
name: egp-components
description: Component and UI conventions for EGP. Use when creating or editing components, using HeroUI, or handling contact/phone data.
---

# EGP Components

## UI Stack

- **HeroUI** (`@heroui/react`, `@heroui/input`, etc.) — NOT NextUI
- **Icons:** lucide-react
- **Styling:** Tailwind + design tokens from config/

## Contact / Phone

- Resolve phone via: `useAdminProfile().profile.phone` → `siteConfig.contact.phone`
- Never hardcode a specific phone number as fallback
- WhatsApp: `adminProfile.whatsapp` → `adminProfile.phone` → `siteConfig.contact.whatsapp`

## Naming

- Components: PascalCase (e.g. `HeaderAesthetics.tsx`)
- Prefix: `Section`, `Admin`, `Button`, `Card` as appropriate

## Don'ts

- No NextUI imports
- No conditional DOM structure on client-only state (causes hydration errors) — use `hidden` or same structure
- No `[...new Set()]` — use `Array.from(new Set())`
