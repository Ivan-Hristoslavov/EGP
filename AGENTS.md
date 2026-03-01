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
