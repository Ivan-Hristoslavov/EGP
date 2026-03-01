---
name: egp-admin-pages
description: Admin panel patterns for EGP. Use when editing app/admin/** pages, modals, forms, or toast notifications.
---

# EGP Admin Pages

## Conventions

- All admin pages: `"use client"`
- HeroUI components (Modal, Card, Input, Select, Button, Chip)
- Toast via `useToast()` from `@/components/Toast`
- Confirmation modals via `useConfirmation()` hook
- Forms: controlled inputs, validate before submit, loading state, disable button during submit

## Form Layout

- Use `formLayout` from `config/design-system.ts`: modalBody, sectionGap, gridFields, fullWidth
- Use `inputClassNames` for consistent input styling
