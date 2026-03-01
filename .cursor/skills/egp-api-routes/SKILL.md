---
name: egp-api-routes
description: API route patterns for EGP. Use when creating or editing app/api/** handlers, auth, Supabase queries, or error handling.
---

# EGP API Routes

## Structure

- `app/api/[resource]/route.ts` — GET list, POST create
- `app/api/[resource]/[id]/route.ts` — GET one, PUT, PATCH, DELETE
- Use `supabaseAdmin` from `lib/supabase.ts` (bypasses RLS)
- Admin mutation routes: call `requireAdmin()` at top; return 401/403 on denial

## Patterns

- Export named: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Return JSON; use pagination for list GETs
- Wrap in try/catch; return appropriate status codes
