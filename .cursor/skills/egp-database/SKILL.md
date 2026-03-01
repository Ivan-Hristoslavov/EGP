---
name: egp-database
description: Database and Supabase conventions for EGP. Use when writing migrations, queries, or schema.
---

# EGP Database

## Client Usage

- Use `supabaseAdmin` for API routes (bypasses RLS)
- Hooks fetch from `/api/*` only — no direct Supabase from client

## Tables

- bookings, customers, payments, services, pricing_cards, gallery, admin_profile, admin_settings, reviews, blog_posts, team, working_hours, discount_codes, faq, conditions
- Bookings: total_amount, amount_paid, remaining_amount, payment_type, payment_method

## Don'ts

- **Do NOT query `admin_areas_cover`** — table does not exist. API returns `[]` or 503.

## Migrations

- Path: `supabase/migrations/`
- Format: `YYYYMMDD_description.sql`
