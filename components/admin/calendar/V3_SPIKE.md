# HeroUI v3 Calendar spike — decision (2026-05)

## Current stack

- `@heroui/react` **^2.8.5** (HeroUI v2)
- `tailwindcss` **^3.4.16**
- `react` / `react-dom` **18.3.1**

## v3 compound Calendar requirements (docs: beta.heroui.com)

- HeroUI **v3** Calendar / RangeCalendar is built for **Tailwind v4** and a newer React line than this repo’s locked v2 admin stack.
- Prior work in this repository attempted a broader v3 + Tailwind 4 migration and was **rolled back** due to widespread import / theme breakage.

## Go / no-go

**NO-GO** for isolated v3 `Calendar.Header` / `Calendar.Grid` inside the current admin app **without** a coordinated upgrade of:

- Tailwind 3 → 4
- HeroUI v2 → v3 across admin surfaces (or a formally supported dual-theme strategy, which is high risk)

## Recommended path

- Ship premium UI on **HeroUI v2** + existing `components/admin/calendar/*` primitives (month/week/day grids, pills, sticky headers).
- Revisit v3 only as a **planned platform upgrade** with its own migration checklist (not a calendar-only import).
