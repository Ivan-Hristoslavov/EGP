# EGP Aesthetics — Agent Instructions

Use **`.cursor/skills/`** for detailed conventions. Skills are loaded by context:

| Skill | Use when |
|-------|----------|
| egp-typography | Headings, sections, layout, responsive design |
| egp-api-routes | API handlers, requireAdmin, Supabase |
| egp-admin-pages | Admin panel, forms, Toast, HeroUI |
| egp-components | Components, HeroUI, phone resolution |
| egp-database | Migrations, tables, queries |

Invoke the **egp-developer** subagent for EGP-specific tasks: `/egp-developer` or "use egp-developer".

## Core conventions

- **UI:** HeroUI (`@heroui/*`), lucide-react, Tailwind
- **Database:** Supabase, `supabaseAdmin` in API routes
- **Auth:** `requireAdmin()` for admin mutations
- **Contact:** Never hardcode phone — use DB → env → siteConfig chain
- **No:** NextUI, `admin_areas_cover`, `[...new Set()]`

## Vercel

- **`vercel.json`** matches [Serenity](https://github.com/Ivan-Hristoslavov/serenity): `framework` + default npm `build` / `dev` / `install` commands only.
- **Dashboard `403 Forbidden`:** Almost always account or project settings—not app code. When it happens, capture the **full browser URL** (e.g. Analytics tab vs team settings vs opening a deployment URL). Check: correct **team**, your **role**, **Deployment Protection** on previews/production, Git repo link, and Web Analytics enabled for **this** project.
- **Serenity vs EGP (code):** Serenity uses Next **15** + `next.config.ts` with **security headers** (`X-Frame-Options`, `X-Content-Type-Options`, etc.) and **no** blanket HTML `Cache-Control: no-store`. EGP uses Next **16** + [`next.config.js`](next.config.js) with aggressive **no-store** on document routes and Supabase `remotePatterns`. Neither repo uses root **`middleware`** for global blocks.
- **Vercel Web Analytics package:** Serenity lists `@vercel/analytics` in `package.json` but does **not** render `<Analytics />` anywhere (Speed Insights + GA only). EGP intentionally includes `<Analytics />` from `@vercel/analytics/next` in [`app/layout.tsx`](app/layout.tsx).
